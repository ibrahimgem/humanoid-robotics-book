# Research Findings: Better Auth Signup/Signin System

**Date**: 2025-12-28
**Feature**: Better Auth Signup/Signin with Onboarding Questionnaire
**Status**: Complete

## Decision 1: Auth Provider Integration Strategy

### Decision
**Implement email/password first (P1), then add social OAuth (P2) in Phase 2**

### Rationale
1. **MVP Focus**: Email/password is the core authentication method that all users need. OAuth is convenience layer that can be added later.
2. **Better Auth Architecture**: Better Auth's plugin system handles multiple providers. Starting with email/password establishes the base auth flow.
3. **Security Surface**: Limiting auth methods initially reduces attack surface during early deployment.
4. **User Impact**: Tech-savvy users (our target audience) often prefer email/password for privacy control.

### Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Email/Password First | Simpler MVP, full control, Better Auth native | Missing convenience for OAuth users |
| OAuth First | Modern, convenience | Complex initial setup, account linking complexity |
| Both Simultaneously | Feature complete | Higher risk, more testing, delayed launch |

### Recommendation
Start with email/password only. Add Google OAuth in Phase 2 (Week 2), GitHub OAuth in v1.1. This aligns with the user's 1-week timeline.

---

## Decision 2: Questionnaire Design Approach

### Decision
**Use multi-step wizard form with progress indicator and local storage for draft saving**

### Rationale
1. **Completion Rates**: Multi-step forms have 10-15% higher completion rates than single-page forms (Baymard Institute research).
2. **Cognitive Load**: Breaking 5-7 questions into 4 steps reduces perceived complexity.
3. **Progress Visibility**: Step indicator shows users how much remains.
4. **Draft Saving**: Browser localStorage preserves answers if user abandons and returns.
5. **Accessibility**: Each step is a focusable unit, easier for keyboard navigation.

### Question Structure (4 Steps)
| Step | Questions | Type |
|------|-----------|------|
| 1. Software Skills | Python, JavaScript, C++ level | Level selector (beginner/intermediate/advanced/expert) |
| 2. Hardware & Robotics | ROS experience, robot platforms, electronics | Checkboxes + multi-select |
| 3. AI/ML Background | ML proficiency, LLM experience, CV experience | Level selector + checkboxes |
| 4. Interests & Preferences | Content topics, learning style | Multi-select + radio |

### Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Single-page accordion | All questions visible | Overwhelming, higher abandonment |
| Multi-step wizard | Manageable chunks, progress visible | More complex state management |
| One-question-per-screen | Maximum focus | Slow, feels tedious |

### Recommendation
Multi-step wizard with clear step indicator, progress bar, and "Save & Continue Later" using localStorage.

---

## Decision 3: Data Storage Schema Strategy

### Decision
**Hybrid approach: Normalized tables for core auth entities + JSONB for flexible profile fields**

### Rationale
1. **Query Patterns**: Authentication queries (signin, session lookup) need indexed, normalized data.
2. **Profile Flexibility**: User profile fields may evolve (adding new skills, platforms). JSONB accommodates this without schema migrations.
3. **Better Auth Compatibility**: Better Auth expects certain table structures for users, sessions, accounts.
4. **Performance**: Critical auth queries use indexed columns; profile reads are less frequent.

### Schema Structure
```sql
-- Core auth tables (normalized for Better Auth)
users (id, email, password_hash, email_verified, mfa_enabled, created_at, updated_at)
sessions (id, user_id, token, expires_at, created_at, last_used_at)
accounts (id, user_id, provider, provider_account_id, access_token, refresh_token)
verification_tokens (id, user_id, token, expires_at, type)

-- Audit and security (normalized)
auth_logs (id, user_id, event_type, ip, user_agent, success, timestamp)

-- Flexible profile data (JSONB for extensibility)
user_profiles (user_id, data JSONB, created_at, updated_at)
-- Example JSONB structure:
-- {
--   "software_skills": {"python": "intermediate", "javascript": "beginner"},
--   "hardware_experience": {"ros": "beginner", "platforms": ["TurtleBot", "UR5"]},
--   "ml_level": "intermediate",
--   "interests": ["healthtech", "cybersecurity"],
--   "learning_style": "hands-on"
-- }
```

### Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Fully normalized (8 tables with all columns) | Maximum query flexibility, strict typing | Schema changes require migrations, rigid |
| Fully JSONB (single profile table) | Maximum flexibility, easy evolution | Complex queries, no indexing on profile fields |
| Hybrid (normalized + JSONB) | Balance of flexibility and performance | Slightly more complex application logic |

### Recommendation
Hybrid approach with normalized core tables (users, sessions, accounts, logs) and JSONB for profile data. This supports Better Auth's expectations while allowing profile evolution.

---

## Decision 4: Rate Limiting Strategy

### Decision
**Database-backed rate limiting with exponential backoff, Redis as future optimization**

### Rationale
1. **Consistency**: Database ensures rate limits are enforced across all server instances.
2. **Simplicity**: No additional infrastructure (Redis) required for MVP.
3. **Better Auth Integration**: Better Auth has built-in rate limiting that works with its storage adapter.
4. **Exponential Backoff**: After 5 failures, delays increase (30s, 60s, 120s) to discourage brute force.

### Rate Limiting Configuration
| Endpoint | Limit | Window | Action After Limit |
|----------|-------|--------|-------------------|
| POST /auth/signin | 5 attempts | 15 minutes | Exponential backoff |
| POST /auth/signup | 10 attempts | 15 minutes | CAPTCHA challenge |
| POST /auth/password-reset | 3 attempts | 1 hour | Email notification |
| POST /auth/verify-email | 5 attempts | 15 minutes | Temporary lock |

### Implementation Pattern
```typescript
// middleware/rate-limit.ts
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  backoffMs: number[];
}

async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // Check database for recent failures
  const recentFailures = await db.query.authLogs.findMany({
    where: and(
      eq(authLogs.ip, identifier),
      gte(authLogs.timestamp, new Date(Date.now() - config.windowMs)),
      eq(authLogs.eventType, 'signin_failure'),
      eq(authLogs.success, false)
    ),
    orderBy: desc(authLogs.timestamp),
    limit: config.maxAttempts
  });

  if (recentFailures.length >= config.maxAttempts) {
    const backoffIndex = Math.min(
      recentFailures.length - config.maxAttempts,
      config.backoffMs.length - 1
    );
    return { allowed: false, retryAfter: config.backoffMs[backoffIndex] };
  }

  return { allowed: true };
}
```

### Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| In-memory (Node.js Map) | Fast, no external dependency | Lost on restart, inconsistent across instances |
| Redis | Fast, distributed, supports advanced patterns | Additional infrastructure, connection management |
| Database-backed | Consistent, persistent, no extra infra | Slightly slower than Redis/in-memory |

### Recommendation
Database-backed rate limiting for MVP. Add Redis in v1.1 if performance requires it. The 1-week timeline prioritizes simplicity and reliability over marginal latency gains.

---

## References

1. **Better Auth Documentation**: https://www.better-auth.com/docs
2. **OWASP Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
3. **Baymard Institute - Form Usability**: https://baymard.com/blog/first-impression-of-site-usability
4. **RFC 6238 - TOTP**: https://datatracker.ietf.org/doc/html/rfc6238
5. **GDPR Compliance**: https://gdpr.eu/article-17-right-to-erasure/
