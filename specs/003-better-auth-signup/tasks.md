# Implementation Tasks: Better Auth Signup/Signin System

**Feature Branch**: `003-better-auth-signup`
**Generated**: 2025-12-28
**Plan**: [plan.md](plan.md)
**Spec**: [spec.md](spec.md)

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 78 |
| Parallelizable Tasks | 32 |
| User Stories | 5 (US1-P1, US2-P1, US3-P2, US4-P3, US5-P3) |

## Task Count by User Story

| User Story | Priority | Tasks | Independent Test |
|------------|----------|-------|------------------|
| US1: Email/Password Signup | P1 | 28 | Create account + complete onboarding + receive recommendations |
| US2: Returning User Signin | P1 | 18 | Sign out, sign back in, access preferences |
| US3: Social Authentication | P2 | 12 | Sign in via Google/GitHub, account linking |
| US4: MFA Setup | P3 | 10 | Enable MFA, verify TOTP, use backup code |
| US5: Profile & GDPR | P3 | 10 | Update profile, export data, delete account |

## Dependencies Graph

```
Phase 1 (Setup) ──────────────────────────────────────────────┐
       │                                                       │
       ▼                                                       │
Phase 2 (Foundational) ───────────────────────────────────────┤
       │                                                       │
       ├───────────────────────────────────────────────────────┼────────────────────┐
       │                                                       │                    │
       ▼                                                       ▼                    ▼
Phase 3 (US1) ───────────────────────────────────────────► Phase 4 (US2) ──► Phase 5 (US3)
       │
       ▼
Phase 6 (US4)
       │
       ▼
Phase 7 (US5)
       │
       ▼
Phase 8 (Polish)
```

## Parallel Execution Opportunities

| Stories | Parallel Tasks |
|---------|----------------|
| US1 + US2 | Database schema, email service, rate limiting, encryption utils |
| US3 | Can run after US1 database schema (accounts table) |
| US4 | Can run after US1-US2 (users table, auth logs) |
| US5 | Can run after US1 (user_profiles table) |

---

# Phase 1: Setup

**Goal**: Initialize project structure and dependencies

**Independent Test**: N/A (setup phase)

- [ ] T001 Create project directory structure at `backend/src/auth/` and `backend/src/onboarding/`
- [ ] T002 [P] Install core dependencies in `backend/package.json`:
  - `better-auth`, `@better-auth/react`, `drizzle-orm`, `drizzle-kit`, `pg`
  - `zod`, `bcryptjs`, `jsonwebtoken`, `otpauth`, `nodemailer`
- [ ] T003 Create environment configuration file at `backend/.env.example`
- [ ] T004 [P] Configure TypeScript in `backend/tsconfig.json` for strict mode

---

# Phase 2: Foundational

**Goal**: Create shared infrastructure used by all user stories

**Independent Test**: N/A (foundational phase - must complete before user stories)

- [ ] T005 Create database schema at `backend/src/db/schema.ts`:
  - `users` table with email, passwordHash, emailVerified, mfaEnabled, timestamps
  - `sessions` table with token, expiresAt, lastUsedAt, ipAddress, userAgent
  - `accounts` table for OAuth linkages
  - `auth_logs` table for audit trail
  - `passwordResetTokens` table
  - `emailVerificationTokens` table
  - `mfaConfigurations` table
  - `userProfiles` table with JSONB data column
- [ ] T006 [P] Create database migrations at `backend/src/db/migrations/`:
  - Run `npx drizzle-kit generate` to create migration files
  - Apply migrations to development database
- [ ] T007 Create encryption utilities at `backend/src/lib/encryption.ts`:
  - AES-256 encryption for sensitive tokens
  - `encrypt(text: string): string` function
  - `decrypt(encrypted: string): string` function
- [ ] T008 Create rate limiting middleware at `backend/src/lib/rate-limit.ts`:
  - `checkRateLimit(identifier: string, config: RateLimitConfig)` function
  - Database-backed implementation using auth_logs table
  - Exponential backoff configuration (30s, 60s, 120s)
- [ ] T009 Create email service at `backend/src/lib/email.ts`:
  - `sendVerificationEmail(email: string, token: string)` function
  - `sendPasswordResetEmail(email: string, token: string)` function
  - `sendSecurityAlertEmail(email: string, event: string)` function
- [ ] T010 Create authentication middleware at `backend/src/auth/middleware/auth-guard.ts`:
  - `requireAuth(request: Request)` function
  - `getSession(request: Request)` function
  - HTTP-only cookie parsing for session tokens

---

# Phase 3: User Story 1 - Email/Password Signup with Profile Creation

**Goal**: Enable new users to create accounts and complete onboarding questionnaire

**Independent Test**: Create a new account with email/password, complete onboarding, verify personalized content recommendations appear

**Acceptance Criteria**:
- Account created with email/password
- Email verification sent and works
- Onboarding questionnaire (4 steps) completes successfully
- Profile saved to database
- Content recommendations generated based on profile

### Models

- [ ] T011 [P] [US1] Create user model service at `backend/src/auth/models/user-service.ts`:
  - `createUser(email: string, passwordHash: string)` function
  - `findUserByEmail(email: string)` function
  - `findUserById(id: string)` function
  - `updateUser(id: string, data: Partial<User>)` function
- [ ] T012 [P] [US1] Create session model service at `backend/src/auth/models/session-service.ts`:
  - `createSession(userId: string, request: Request)` function
  - `validateSession(token: string)` function
  - `revokeSession(token: string)` function
  - `revokeAllUserSessions(userId: string)` function

### Schemas & Validation

- [ ] T013 [P] [US1] Create Zod validation schema at `backend/src/auth/schemas/user.ts`:
  - `registerSchema` with email, password (min 8 chars, complexity requirements), confirmPassword
  - `signinSchema` with email, password, rememberMe
- [ ] T014 [P] [US1] Create onboarding profile schema at `backend/src/onboarding/schemas/profile.ts`:
  - `profileSchema` with softwareSkills, hardwareExperience, mlBackground, interests, learningStyle
  - Validation requiring at least 3 responses completed

### API Endpoints

- [ ] T015 [US1] Create signup endpoint at `backend/src/auth/routes/signup.ts`:
  - POST `/api/auth/signup`
  - Validates input using `registerSchema`
  - Checks for duplicate email
  - Hashes password with bcrypt (cost factor 12)
  - Creates user in database
  - Generates email verification token
  - Sends verification email
  - Returns success with userId
- [ ] T016 [US1] Create email verification endpoint at `backend/src/auth/routes/verify-email.ts`:
  - POST `/api/auth/verify-email`
  - Validates token against database
  - Updates user.emailVerified to true
  - Returns success message
- [ ] T017 [P] [US1] Create onboarding status endpoint at `backend/src/onboarding/routes/status.ts`:
  - GET `/api/onboarding/status`
  - Returns `completed`, `currentStep`, `totalSteps`, `lastCompletedAt`
- [ ] T018 [P] [US1] Create onboarding step endpoint at `backend/src/onboarding/routes/step.ts`:
  - POST `/api/onboarding/step/{stepNumber}`
  - Validates step data against schema
  - Saves progress to localStorage draft (frontend) and database
  - Returns next step number and progress percentage
- [ ] T019 [US1] Create onboarding completion endpoint at `backend/src/onboarding/routes/complete.ts`:
  - POST `/api/onboarding/complete`
  - Validates final profile data
  - Saves complete profile to `user_profiles` table
  - Generates content recommendations
  - Returns success with recommendations list

### Onboarding Components

- [ ] T020 [P] [US1] Create onboarding wizard container at `backend/src/onboarding/components/Wizard.tsx`:
  - Multi-step form with progress indicator
  - Step navigation (Next/Back)
  - LocalStorage draft saving/loading
  - Completion redirect to dashboard
- [ ] T021 [P] [US1] Create StepSoftware component at `backend/src/onboarding/components/StepSoftware.tsx`:
  - Level selectors for Python, JavaScript, C++
  - Options: none, beginner, intermediate, advanced, expert
- [ ] T022 [P] [US1] Create StepHardware component at `backend/src/onboarding/components/StepHardware.tsx`:
  - Robot experience checkbox
  - ROS experience level selector
  - Robot platforms multi-select (TurtleBot, Fetch, UR5, etc.)
- [ ] T023 [P] [US1] Create StepAI component at `backend/src/onboarding/components/StepAI.tsx`:
  - ML proficiency level selector
  - LLM experience checkbox
  - Computer vision experience checkbox
- [ ] T024 [P] [US1] Create StepInterests component at `backend/src/onboarding/components/StepInterests.tsx`:
  - Interests multi-select (HealthTech, Cybersecurity, AI, Robotics, etc.)
  - Learning style radio (theory, hands-on, mixed)

### Profile Service

- [ ] T025 [P] [US1] Create profile service at `backend/src/onboarding/service.ts`:
  - `saveProfile(userId: string, data: ProfileData)` function
  - `getProfile(userId: string)` function
  - `generateRecommendations(profile: ProfileData)` function
- [ ] T026 [P] [US1] Create recommendation engine at `backend/src/onboarding/recommendations.ts`:
  - Rule-based matching algorithm
  - Returns 5 content recommendations with match scores
  - Considers software skills, hardware experience, ML background, interests

### US1 Tests

- [ ] T027 [P] [US1] Create unit tests for validation at `backend/tests/unit/validation.test.ts`:
  - Test valid/invalid email formats
  - Test password complexity requirements
  - Test password confirmation matching
- [ ] T028 [P] [US1] Create unit tests for profile schema at `backend/tests/unit/profile-schema.test.ts`:
  - Test at-least-3-responses validation
  - Test all profile field types
- [ ] T029 [US1] Create integration test for signup flow at `backend/tests/integration/signup.test.ts`:
  - POST to /auth/signup with valid data
  - Verify user created in database
  - Verify email verification token created
- [ ] T030 [US1] Create E2E test for signup journey at `backend/tests/e2e/signup-journey.spec.ts`:
  - Navigate to signup page
  - Fill email, password, confirm password
  - Complete all 4 onboarding steps
  - Verify redirect to dashboard with recommendations

---

# Phase 4: User Story 2 - Returning User Signin

**Goal**: Enable authenticated users to sign in and maintain sessions

**Independent Test**: Create account, sign out, sign back in, verify session persists and preferences accessible

**Acceptance Criteria**:
- Signin with correct credentials succeeds in under 2 seconds
- Rate limiting blocks brute force attempts
- Password reset flow works with 1-hour expiry token
- Session expires after 7 days inactivity (or 30 days with Remember Me)
- Authentication events logged to audit trail

### API Endpoints

- [ ] T031 [US2] Create signin endpoint at `backend/src/auth/routes/signin.ts`:
  - POST `/api/auth/signin`
  - Validates credentials against database
  - Checks email verification status
  - Applies rate limiting
  - Creates session with appropriate expiry
  - Returns user object and session token
- [ ] T032 [US2] Create signout endpoint at `backend/src/auth/routes/signout.ts`:
  - POST `/api/auth/signout`
  - Revokes current session
  - Logs signout event
  - Returns success
- [ ] T033 [P] [US2] Create password reset request endpoint at `backend/src/auth/routes/password-reset-request.ts`:
  - POST `/api/auth/password/reset`
  - Finds user by email (or returns generic success)
  - Generates password reset token
  - Sends reset email with 1-hour expiry
- [ ] T034 [US2] Create password reset confirm endpoint at `backend/src/auth/routes/password-reset-confirm.ts`:
  - POST `/api/auth/password/reset/confirm`
  - Validates reset token against database
  - Hashes new password with bcrypt
  - Updates user password
  - Revokes all user sessions for security
  - Returns success

### Session Management

- [ ] T035 [P] [US2] Create session refresh endpoint at `backend/src/auth/routes/session-refresh.ts`:
  - POST `/api/auth/session/refresh`
  - Extends session expiry on activity
  - Updates lastUsedAt timestamp

### US2 Tests

- [ ] T036 [P] [US2] Create unit tests for password hashing at `backend/tests/unit/password.test.ts`:
  - Test bcrypt hashing and comparison
  - Test password strength validation
- [ ] T037 [P] [US2] Create unit tests for session service at `backend/tests/unit/session.test.ts`:
  - Test session creation with expiry
  - Test session validation
  - Test session revocation
- [ ] T038 [US2] Create integration test for signin flow at `backend/tests/integration/signin.test.ts`:
  - POST to /auth/signin with valid credentials
  - Verify session created in database
  - Verify rate limiting triggered on invalid attempts
- [ ] T039 [US2] Create integration test for password reset at `backend/tests/integration/password-reset.test.ts`:
  - Request password reset
  - Verify token created in database
  - Confirm reset with valid token
  - Verify password updated and sessions revoked
- [ ] T040 [US2] Create E2E test for signin journey at `backend/tests/e2e/signin-journey.spec.ts`:
  - Sign up new account
  - Verify email
  - Sign out
  - Sign back in
  - Verify Remember Me extends session

---

# Phase 5: User Story 3 - Social Authentication (P2)

**Goal**: Enable OAuth sign-in with Google and GitHub

**Independent Test**: Sign in via Google/GitHub, verify account created/linked, complete onboarding if new user

**Acceptance Criteria**:
- OAuth flow completes successfully for Google and GitHub
- Existing email-based accounts can be linked to social providers
- New users prompted for onboarding after OAuth
- OAuth errors handled gracefully with fallback options

### API Endpoints

- [ ] T041 [P] [US3] Create OAuth initialization endpoint at `backend/src/auth/routes/oauth-init.ts`:
  - GET `/api/auth/oauth/{provider}` (google | github)
  - Generates OAuth state parameter for CSRF protection
  - Redirects to provider authorization URL
- [ ] T042 [US3] Create OAuth callback endpoint at `backend/src/auth/routes/oauth-callback.ts`:
  - GET `/api/auth/oauth/{provider}/callback`
  - Validates state parameter
  - Exchanges code for access token
  - Fetches user info from provider
  - Creates or links user account
  - Creates session and redirects to onboarding or dashboard
- [ ] T043 [P] [US3] Create OAuth unlink endpoint at `backend/src/auth/routes/oauth-unlink.ts`:
  - POST `/api/auth/oauth/{provider}/unlink`
  - Removes social account linkage
  - Requires email/password authentication first

### US3 Tests

- [ ] T044 [P] [US3] Create unit tests for OAuth state at `backend/tests/unit/oauth-state.test.ts`:
  - Test state generation and validation
  - Test CSRF protection
- [ ] T045 [US3] Create integration test for OAuth flow at `backend/tests/integration/oauth.test.ts`:
  - Mock OAuth provider responses
  - Test account creation via OAuth
  - Test account linking for existing users
- [ ] T046 [P] [US3] Create E2E test for OAuth journey at `backend/tests/e2e/oauth-journey.spec.ts`:
  - Click "Sign in with Google"
  - Complete OAuth consent
  - Verify signin success
  - Verify onboarding prompted for new users

---

# Phase 6: User Story 4 - MFA Setup (P3)

**Goal**: Enable optional multi-factor authentication with TOTP

**Independent Test**: Enable MFA, scan QR code with authenticator app, verify TOTP code works, test backup code recovery

**Acceptance Criteria**:
- MFA setup displays QR code and backup codes
- TOTP verification works with 6-digit codes
- Backup codes marked as used after single use
- MFA reset requires email verification

### API Endpoints

- [ ] T047 [US4] Create MFA setup initiation endpoint at `backend/src/auth/routes/mfa-setup.ts`:
  - POST `/api/auth/mfa/setup`
  - Generates TOTP secret using otpauth library
  - Creates QR code data URL
  - Generates 10 backup codes (hashed)
  - Returns secret, QR code, and backup codes
- [ ] T048 [US4] Create MFA verification endpoint at `backend/src/auth/routes/mfa-verify.ts`:
  - POST `/api/auth/mfa/verify`
  - Validates TOTP code against secret
  - Or validates backup code against hashed codes
  - Returns success/failure with attempts remaining
- [ ] T049 [P] [US4] Create MFA confirmation endpoint at `backend/src/auth/routes/mfa-confirm.ts`:
  - POST `/api/auth/mfa/confirm`
  - Confirms MFA setup after successful code verification
  - Updates user.mfaEnabled to true
  - Stores MFA configuration in database
- [ ] T050 [P] [US4] Create MFA disable endpoint at `backend/src/auth/routes/mfa-disable.ts`:
  - POST `/api/auth/mfa/disable`
  - Requires current password and valid TOTP code
  - Clears MFA configuration
  - Updates user.mfaEnabled to false

### US4 Tests

- [ ] T051 [P] [US4] Create unit tests for TOTP generation at `backend/tests/unit/totp.test.ts`:
  - Test secret generation
  - Test code verification
  - Test time window validation
- [ ] T052 [P] [US4] Create unit tests for backup codes at `backend/tests/unit/backup-codes.test.ts`:
  - Test code generation
  - Test code hashing
  - Test single-use validation
- [ ] T053 [US4] Create integration test for MFA flow at `backend/tests/integration/mfa.test.ts`:
  - Setup MFA and verify initial configuration
  - Test valid TOTP code acceptance
  - Test invalid code rejection
  - Test backup code usage
- [ ] T054 [US4] Create E2E test for MFA journey at `backend/tests/e2e/mfa-journey.spec.ts`:
  - Enable MFA in account settings
  - Scan QR code with authenticator app
  - Verify TOTP code during signin
  - Test backup code recovery

---

# Phase 7: User Story 5 - Profile Updates and Data Management (P3)

**Goal**: Enable profile management and GDPR compliance (data export, account deletion)

**Independent Test**: Update profile, request data export, verify JSON download, test account deletion with 30-day grace period

**Acceptance Criteria**:
- Profile updates saved and recommendations refresh
- Data export returns complete user data in JSON within 24 hours
- Account deletion scheduled with 30-day grace period
- Deletion can be cancelled within grace period

### API Endpoints

- [ ] T055 [P] [US5] Create profile GET endpoint at `backend/src/onboarding/routes/profile.ts`:
  - GET `/api/profile`
  - Returns complete user profile including questionnaire responses
- [ ] T056 [US5] Create profile PATCH endpoint at `backend/src/onboarding/routes/profile-update.ts`:
  - PATCH `/api/profile`
  - Updates profile questionnaire responses
  - Triggers recommendation refresh
  - Returns updated recommendations
- [ ] T057 [US5] Create data export request endpoint at `backend/src/onboarding/routes/export-request.ts`:
  - POST `/api/profile/export`
  - Generates export ID
  - Schedules async data compilation
  - Returns download URL with expiration
- [ ] T058 [P] [US5] Create data export download endpoint at `backend/src/onboarding/routes/export-download.ts`:
  - GET `/api/profile/export/download?token={token}`
  - Returns JSON file with all user data
  - Includes users, profiles, sessions, auth_logs, preferences
- [ ] T059 [US5] Create account deletion request endpoint at `backend/src/onboarding/routes/delete-request.ts`:
  - POST `/api/profile/delete`
  - Requires email confirmation
  - Schedules deletion for 30 days in future
  - Sends confirmation email
  - Returns cancel URL with token
- [ ] T060 [P] [US5] Create account deletion cancel endpoint at `backend/src/onboarding/routes/delete-cancel.ts`:
  - POST `/api/profile/delete/cancel`
  - Validates cancel token
  - Cancels scheduled deletion
  - Restores account to active status
- [ ] T061 [P] [US5] Create account deletion executor at `backend/src/onboarding/lib/delete-executor.ts`:
  - Scheduled job to process expired deletions
  - Anonymizes user data (GDPR compliance)
  - Removes all personal data within 30-day window

### US5 Tests

- [ ] T062 [P] [US5] Create unit tests for profile validation at `backend/tests/unit/profile-update.test.ts`:
  - Test profile update schema
  - Test recommendation refresh logic
- [ ] T063 [US5] Create integration test for GDPR endpoints at `backend/tests/integration/gdpr.test.ts`:
  - Request data export
  - Verify export includes all user data
  - Request account deletion
  - Cancel deletion within grace period
- [ ] T064 [P] [US5] Create E2E test for GDPR journey at `backend/tests/e2e/gdpr-journey.spec.ts`:
  - Update profile questionnaire
  - Request and download data export
  - Request account deletion
  - Cancel deletion and restore account

---

# Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Security hardening, performance optimization, documentation completion

- [ ] T065 [P] Run comprehensive security audit at `backend/tests/security/audit.md`:
  - Verify OWASP Top 10 compliance
  - Check for authentication bypass vulnerabilities
  - Validate session management security
  - Review rate limiting effectiveness
- [ ] T066 [P] Run performance benchmarks at `backend/tests/performance/benchmarks.ts`:
  - Signin response time < 2 seconds p95
  - Signup flow completion < 3 minutes
  - Session creation < 100ms
  - Profile recommendations < 5 seconds
- [ ] T067 [P] Create API documentation at `backend/docs/api-auth.md`:
  - Document all authentication endpoints
  - Include request/response examples
  - Document error codes and messages
- [ ] T068 [P] Create deployment checklist at `backend/docs/deployment-checklist.md`:
  - Environment variables documentation
  - Database migration procedures
  - Email service configuration
  - OAuth credential setup
- [ ] T069 [P] Update README with authentication features at `backend/README.md`:
  - Quick start guide
  - Feature list
  - Configuration examples
- [ ] T070 [P] Run full test suite and verify coverage at `backend/tests/coverage/`:
  - Ensure >90% unit test coverage
  - Verify all integration tests pass
  - Verify all E2E tests pass
- [ ] T071 [P] Create production configuration at `backend/.env.production.example`:
  - Secure cookie settings
  - Session expiry configuration
  - Rate limiting thresholds
- [ ] T072 [P] Document database schema at `backend/docs/schema.md`:
  - Entity relationship diagrams
  - Column descriptions
  - Index recommendations

---

# Implementation Strategy

## MVP Scope (User Stories 1 & 2)

For a minimal viable product within the 1-week timeline, prioritize:

1. **Phase 1**: Setup (T001-T004)
2. **Phase 2**: Foundational (T005-T010)
3. **Phase 3**: US1 Tasks T011-T026 (signup, verification, onboarding)
4. **Phase 4**: US2 Tasks T031-T040 (signin, password reset)
5. **Phase 8**: Polish T065-T072

This delivers core functionality: email/password signup/signin with onboarding questionnaire and content recommendations.

## Incremental Delivery

| Increment | Stories | Deliverable |
|-----------|---------|-------------|
| MVP | US1 + US2 | Core auth with onboarding |
| v1.1 | US3 | Social OAuth (Google/GitHub) |
| v1.2 | US4 | MFA security feature |
| v1.3 | US5 | GDPR compliance |

## File Path Reference

| Layer | Path Pattern |
|-------|-------------|
| Auth Routes | `backend/src/auth/routes/{endpoint}.ts` |
| Auth Models | `backend/src/auth/models/{service}.ts` |
| Auth Schemas | `backend/src/auth/schemas/{schema}.ts` |
| Onboarding Routes | `backend/src/onboarding/routes/{endpoint}.ts` |
| Onboarding Components | `backend/src/onboarding/components/{Component}.ts`` |
| Onboarding Schemas | `backend/src/onboarding/schemas/{schema}.ts` |
| Database | `backend/src/db/{schema,migrations}/` |
| Utilities | `backend/src/lib/{encryption,rate-limit,email}.ts` |
| Unit Tests | `backend/tests/unit/{test}.test.ts` |
| Integration Tests | `backend/tests/integration/{test}.test.ts` |
| E2E Tests | `backend/tests/e2e/{journey}.spec.ts` |
| Security Tests | `backend/tests/security/` |
| Performance Tests | `backend/tests/performance/` |

---

**Next Step**: Begin implementation with Phase 1 (Setup) tasks T001-T004.
