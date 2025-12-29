# Implementation Plan: Better Auth Signup/Signin System

**Branch**: `003-better-auth-signup` | **Date**: 2025-12-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-better-auth-signup/spec.md`

## Summary

Implement a complete authentication system using Better Auth with email/password and OAuth (Google/GitHub), integrated with a multi-step onboarding questionnaire for user background profiling. The system will use PostgreSQL with Drizzle ORM for data persistence, supporting 5-7 question onboarding flow, optional MFA via TOTP, and full GDPR compliance (data export, account deletion).

**Technical Approach**:
- Phase 1: Environment setup, Better Auth configuration, database schema
- Phase 2: Authentication flows (signup, signin, password reset, email verification)
- Phase 3: Onboarding questionnaire with multi-step form design
- Phase 4: Content personalization based on profile data
- Phase 5: Testing (unit, integration, E2E, security audit)

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 14+ (App Router)
**Primary Dependencies**: Better Auth 1.x, Drizzle ORM, PostgreSQL (Neon), bcrypt, otpauth, Zod
**Storage**: PostgreSQL with Drizzle ORM - relational model with JSONB for flexible profile fields
**Testing**: Jest + React Testing Library (unit), Supertest (API integration), Playwright (E2E)
**Target Platform**: Web application (modern browsers, responsive)
**Performance Goals**: Signin < 2 seconds p95, Signup flow < 3 minutes, Session creation < 100ms
**Constraints**: GDPR compliance (data export 24h, deletion 30-day grace), OWASP Top 10 security
**Scale/Scope**: 100 concurrent users initial, 500 concurrent sessions target, 8 database tables

**Decisions Requiring Research**:
- Auth provider integrations: Email/password vs OAuth prioritization (MVP decision)
- Questionnaire design: Multi-step wizard vs single-page accordion form (user experience)
- Data storage schema: JSONB flexibility vs normalized relational tables (query patterns)
- Rate limiting strategy: In-memory vs Redis vs database-based (performance vs consistency)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| Technical Accuracy | All authentication logic follows OWASP guidelines | PASS - Better Auth handles security |
| Beginner-Friendly Clarity | Onboarding questionnaire accessible to non-technical users | PASS - Multi-step design |
| Modular Structure | Authentication, onboarding, personalization as separate modules | PASS - Phase-based approach |
| Source-Based Content | Security claims supported by OWASP, Better Auth documentation | PASS - Using established libraries |
| Consistent Terminology | Standard auth terms (session, token, MFA, OAuth) | PASS - Industry standard |

**Result**: All gates PASS - Ready for Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/003-better-auth-signup/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth.yaml        # OpenAPI 3.0 authentication endpoints
│   └── onboarding.yaml  # OpenAPI 3.0 questionnaire endpoints
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (backend integration with Docusaurus)

```text
backend/                          # FastAPI backend for auth + RAG chatbot
├── src/
│   ├── auth/                     # Authentication module
│   │   ├── config.ts             # Better Auth configuration
│   │   ├── routes/               # API routes
│   │   │   ├── signup.ts
│   │   │   ├── signin.ts
│   │   │   ├── signout.ts
│   │   │   ├── password-reset.ts
│   │   │   ├── email-verification.ts
│   │   │   └── mfa.ts
│   │   ├── schemas/              # Zod validation schemas
│   │   │   ├── user.ts
│   │   │   ├── session.ts
│   │   │   └── mfa.ts
│   │   └── middleware/           # Auth guards, session validation
│   ├── onboarding/               # Questionnaire module
│   │   ├── components/           # React components for survey
│   │   │   ├── StepSoftware.tsx
│   │   │   ├── StepHardware.tsx
│   │   │   ├── StepAI.tsx
│   │   │   ├── StepInterests.tsx
│   │   │   └── Wizard.tsx
│   │   ├── service.ts            # Profile persistence logic
│   │   └── recommendations.ts    # Content personalization engine
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   └── migrations/           # Database migrations
│   └── lib/                      # Utilities
│       ├── encryption.ts         # AES-256 encryption helpers
│       ├── rate-limit.ts         # Rate limiting logic
│       └── email.ts              # SMTP email service
└── tests/
    ├── unit/
    │   ├── auth.test.ts          # Unit tests for auth flows
    │   └── validation.test.ts    # Schema validation tests
    ├── integration/
    │   ├── signup.test.ts        # Signup flow integration
    │   ├── onboarding.test.ts    # Questionnaire integration
    │   └── personalization.test.ts
    └── e2e/
        ├── signup-journey.spec.ts
        ├── signin-journey.spec.ts
        └── mfa-journey.spec.ts
```

**Structure Decision**: Web application with FastAPI backend integrated into Docusaurus via API routes. The backend already exists (`backend/app.py`) and will be extended with authentication modules. Frontend components integrated into Docusaurus custom theme.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| AES-256 encryption for tokens | GDPR requirement for sensitive data at rest | Plain text tokens rejected - security compliance |
| 8 database tables (vs 3-4) | Full audit trail, MFA support, social accounts, GDPR compliance | Minimal tables insufficient for security/logging requirements |
| Multi-step onboarding wizard | Better user experience, higher completion rates | Single-page form has higher abandonment |

## Implementation Phases

### Phase 1: Setup (Day 1)
- Environment configuration and dependency installation
- Better Auth configuration and initialization
- Database schema creation (8 tables with Drizzle)
- SMTP/email service setup
- Basic project structure

### Phase 2: Authentication (Days 2-3)
- Email/password signup with validation
- Signin with session management
- Password reset flow
- Email verification
- Rate limiting implementation
- Authentication logging

### Phase 3: Onboarding (Days 4-5)
- Multi-step questionnaire React components
- Profile service with JSONB storage
- LocalStorage for draft saving
- Content recommendation engine
- Profile API endpoints

### Phase 4: Testing (Day 6)
- Unit tests for auth flows (Jest)
- Integration tests for signup/onboarding (Supertest)
- E2E tests for user journeys (Playwright)
- Security audit against OWASP Top 10

### Phase 5: Polish (Day 7)
- Bug fixes and edge case handling
- Performance optimization
- Documentation completion
- Deployment preparation

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | `research.md` | Architectural decisions with tradeoffs |
| Data Model | `data-model.md` | Entity definitions, schemas, validation |
| API Contracts | `contracts/auth.yaml` | OpenAPI 3.0 authentication endpoints |
| Onboarding Contracts | `contracts/onboarding.yaml` | OpenAPI 3.0 questionnaire endpoints |
| Quickstart | `quickstart.md` | Implementation guide with code samples |
| Tasks | `tasks.md` | Generated by `/sp.tasks` (not yet created) |

## Next Step

Run `/sp.tasks` to generate the detailed task breakdown with acceptance criteria.
