# Feature Specification: Better Auth Signup and Signin System

**Feature Branch**: `003-better-auth-signup`
**Created**: 2025-12-28
**Status**: Draft
**Input**: User description: "Implement Signup and Signin using Better Auth with integrated onboarding questionnaire for user background collection"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Email/Password Signup with Profile Creation (Priority: P1)

A new user visits the platform, creates an account using email and password, completes an onboarding questionnaire about their technical background (5-7 questions covering software/hardware expertise), and accesses personalized content recommendations.

**Why this priority**: This is the core MVP functionality. Without basic signup and profile creation, no other features can function. This delivers immediate value by allowing users to create accounts and receive personalized content.

**Independent Test**: Can be fully tested by creating a new account with email/password, completing the onboarding flow, and verifying the user can access personalized content based on their profile responses.

**Acceptance Scenarios**:

1. **Given** user is on signup page, **When** they enter valid email, password (min 8 chars), and complete onboarding questionnaire, **Then** account is created, email verification sent, and user redirected to personalized dashboard
2. **Given** user enters weak password (< 8 chars), **When** they submit signup form, **Then** system displays password strength requirements and prevents submission
3. **Given** user enters duplicate email, **When** they submit signup form, **Then** system displays "Email already registered" error
4. **Given** user completes signup, **When** they click email verification link, **Then** account is activated and user can sign in
5. **Given** user abandons onboarding halfway, **When** they return later, **Then** system allows them to resume from last completed question

---

### User Story 2 - Returning User Signin (Priority: P1)

An existing user returns to the platform, signs in using their email and password, and accesses their personalized content without re-answering the questionnaire.

**Why this priority**: Core functionality that must work for any returning user. Essential for user retention and session management.

**Independent Test**: Can be tested by creating an account, signing out, then signing back in and verifying session persistence and access to previously saved preferences.

**Acceptance Scenarios**:

1. **Given** user has verified account, **When** they enter correct email and password, **Then** they are signed in and redirected to dashboard within 2 seconds
2. **Given** user enters incorrect password, **When** they submit signin form, **Then** system displays "Invalid credentials" error after 500ms delay (rate limiting)
3. **Given** user forgets password, **When** they click "Forgot Password", **Then** system sends password reset email with 1-hour expiry token
4. **Given** user is inactive for 7 days, **When** session expires, **Then** system prompts re-authentication on next visit
5. **Given** user checks "Remember me", **When** they close browser and return, **Then** session persists for 30 days

---

### User Story 3 - Social Authentication (Google/GitHub) (Priority: P2)

A user signs up or signs in using their Google or GitHub account, completes the onboarding questionnaire (if new user), and accesses the platform without managing a separate password.

**Why this priority**: Reduces friction for users who prefer social login, but not critical for MVP launch. Can be added after core email/password flow is stable.

**Independent Test**: Can be tested by clicking "Sign in with Google" or "Sign in with GitHub", completing OAuth flow, and verifying account creation/signin works without password management.

**Acceptance Scenarios**:

1. **Given** user clicks "Sign in with Google", **When** OAuth flow completes successfully, **Then** user account is created/linked and user is signed in
2. **Given** user's Google email matches existing account, **When** they complete Google OAuth, **Then** accounts are linked and user sees "Google account linked" confirmation
3. **Given** new user signs up via GitHub, **When** OAuth completes, **Then** system prompts for onboarding questionnaire before dashboard access
4. **Given** OAuth provider returns error, **When** user is redirected back, **Then** system displays clear error message and fallback to email/password signin
5. **Given** user revokes OAuth permissions, **When** they attempt signin, **Then** system prompts re-authorization or offers email/password alternative

---

### User Story 4 - Multi-Factor Authentication (MFA) Setup (Priority: P3)

A security-conscious user enables MFA using TOTP (Time-based One-Time Password) authenticator app, receives backup codes, and uses MFA for subsequent logins.

**Why this priority**: Important for security but not essential for initial launch. Can be offered as optional feature after core auth flows are proven stable.

**Independent Test**: Can be tested by enabling MFA in account settings, scanning QR code with authenticator app, verifying TOTP codes work for signin, and testing backup code recovery flow.

**Acceptance Scenarios**:

1. **Given** user is signed in, **When** they enable MFA in settings, **Then** system displays QR code and 10 backup codes for download
2. **Given** user has MFA enabled, **When** they sign in with correct password, **Then** system prompts for 6-digit TOTP code before granting access
3. **Given** user enters invalid TOTP code 3 times, **When** they submit, **Then** system displays "Use backup code" option
4. **Given** user uses backup code, **When** code is validated, **Then** system marks code as used and prompts user to generate new backup codes
5. **Given** user loses authenticator access, **When** they use last backup code, **Then** system forces MFA reset with email verification

---

### User Story 5 - Profile Updates and Data Management (Priority: P3)

A user updates their profile information (name, email, password), modifies onboarding questionnaire responses to refine content personalization, and exercises GDPR rights (data export, account deletion).

**Why this priority**: Important for user control and GDPR compliance but can be implemented after core auth flows. Users can function without these features initially.

**Independent Test**: Can be tested by updating profile fields, verifying changes persist, requesting data export (receives JSON file), and testing account deletion (removes all data within 30 days).

**Acceptance Scenarios**:

1. **Given** user wants to change email, **When** they update email in settings, **Then** system sends verification to new email before applying change
2. **Given** user updates onboarding responses, **When** they save changes, **Then** content recommendations refresh within 5 seconds
3. **Given** user requests data export, **When** system processes request, **Then** user receives JSON file with all profile data within 24 hours
4. **Given** user initiates account deletion, **When** they confirm action, **Then** system schedules deletion for 30 days and sends confirmation email
5. **Given** user cancels deletion within 30-day window, **When** they reactivate account, **Then** all data is restored and deletion is cancelled

---

### Edge Cases

- What happens when email verification link expires after 24 hours? System displays "Link expired" message with "Resend verification" button
- How does system handle user attempting to create account with email that has pending verification? System resends verification email and displays "Check your email" message
- What happens when OAuth provider is temporarily unavailable during signin? System displays "Service unavailable, try email/password" fallback message
- How does system handle concurrent sessions from different devices? System allows multiple sessions but displays "New signin detected from [location]" security notification
- What happens when user changes password while active on another device? System invalidates all other sessions and forces re-authentication
- How does system handle malformed onboarding questionnaire submissions (missing required fields)? System highlights missing fields and prevents progression until complete
- What happens when user's session expires mid-form submission? System saves form draft, redirects to signin, then restores draft after authentication
- How does system handle rate limiting after 5 failed signin attempts? System implements exponential backoff (30s, 60s, 120s delays) and sends security alert email
- What happens when user requests password reset for non-existent email? System displays generic "If email exists, reset link sent" message to prevent email enumeration
- How does system handle duplicate social account linkage attempts? System displays "Account already linked to another user" error and suggests unlinking first

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create accounts using email and password with minimum 8-character password requirement
- **FR-002**: System MUST validate email addresses using RFC 5322 format and verify deliverability via email verification token
- **FR-003**: System MUST hash passwords using bcrypt with cost factor 12 before storing in database
- **FR-004**: System MUST send email verification link with 24-hour expiry token after signup
- **FR-005**: System MUST prevent signin for unverified accounts and display "Please verify your email" message
- **FR-006**: System MUST support Google OAuth 2.0 authentication flow with PKCE
- **FR-007**: System MUST support GitHub OAuth 2.0 authentication flow with state parameter for CSRF protection
- **FR-008**: System MUST create user session with secure HTTP-only cookies after successful authentication
- **FR-009**: System MUST expire sessions after 7 days of inactivity (configurable)
- **FR-010**: System MUST present onboarding questionnaire (5-7 questions) to new users before dashboard access
- **FR-011**: System MUST collect user background data: software skills (Python, JavaScript, C++, etc.), hardware experience (electronics, robotics platforms), AI/ML proficiency, interests (HealthTech, cybersecurity, etc.)
- **FR-012**: System MUST allow users to skip optional questionnaire questions but require at least 3 responses before proceeding
- **FR-013**: System MUST generate personalized content recommendations based on questionnaire responses within 5 seconds
- **FR-014**: System MUST implement MFA using TOTP (RFC 6238) with 30-second time window and 6-digit codes
- **FR-015**: System MUST generate 10 single-use backup codes when user enables MFA
- **FR-016**: System MUST allow users to reset password via email link with 1-hour expiry token
- **FR-017**: System MUST implement rate limiting: max 5 failed signin attempts per IP per 15 minutes
- **FR-018**: System MUST log all authentication events (signin, signout, password reset, MFA changes) with timestamps and IP addresses
- **FR-019**: System MUST encrypt sensitive data at rest using AES-256 encryption
- **FR-020**: System MUST allow users to export all personal data in JSON format (GDPR compliance)
- **FR-021**: System MUST support account deletion with 30-day grace period before permanent removal
- **FR-022**: System MUST send email notifications for security events (new device signin, password change, MFA disabled)
- **FR-023**: System MUST link social accounts (Google/GitHub) to existing email-based accounts when email matches
- **FR-024**: System MUST display clear error messages for authentication failures without revealing whether email exists (security)
- **FR-025**: System MUST support "Remember me" option extending session duration to 30 days

### Key Entities

- **User**: Represents registered platform user with email, hashed password, email verification status, MFA enabled flag, created/updated timestamps, last signin timestamp
- **UserProfile**: Stores onboarding questionnaire responses including software skills array, hardware experience boolean, robotics platforms array, AI/ML proficiency level, interests array, learning style preference
- **Session**: Tracks active user sessions with session token, user ID reference, device fingerprint, IP address, created/expiry timestamps, last activity timestamp
- **AuthenticationLog**: Audit trail of security events with user ID reference, event type (signin/signout/password_reset/mfa_change), timestamp, IP address, device info, success/failure status
- **MFAConfiguration**: Stores MFA settings per user with secret key (encrypted), backup codes array (hashed), last used timestamp, recovery email
- **SocialAccount**: Links OAuth provider accounts with user ID reference, provider name (google/github), provider user ID, access token (encrypted), refresh token (encrypted), linked timestamp
- **PasswordResetToken**: Temporary tokens for password reset with user ID reference, token hash, expiry timestamp (1 hour), used flag
- **EmailVerificationToken**: Temporary tokens for email verification with user ID reference, token hash, expiry timestamp (24 hours), verified flag

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account creation (signup + email verification + onboarding) in under 3 minutes
- **SC-002**: Signin response time is under 2 seconds for 95% of requests under normal load (100 concurrent users)
- **SC-003**: Email verification link delivery time is under 30 seconds for 99% of signups
- **SC-004**: Password reset flow completion rate exceeds 80% (users who request reset successfully change password)
- **SC-005**: Social authentication (Google/GitHub) completion rate exceeds 90% (successful OAuth flow without errors)
- **SC-006**: Onboarding questionnaire completion rate exceeds 90% (users who start questionnaire complete all required questions)
- **SC-007**: MFA setup success rate exceeds 85% (users who initiate MFA successfully scan QR and verify first TOTP code)
- **SC-008**: Rate limiting blocks 100% of brute force attempts (> 5 failed signin attempts per IP per 15 minutes)
- **SC-009**: Zero plaintext passwords or tokens stored in database (100% compliance with encryption requirements)
- **SC-010**: GDPR data export requests fulfilled within 24 hours with 100% data completeness
- **SC-011**: Account deletion requests processed within 30-day grace period with zero data remnants after deletion
- **SC-012**: Security event notifications (new device signin, password change) delivered within 2 minutes of event
- **SC-013**: Session management handles 500 concurrent sessions without memory leaks or performance degradation
- **SC-014**: Zero authentication bypass vulnerabilities detected in security audit (OWASP Top 10 compliance)
- **SC-015**: System uptime exceeds 99.5% for authentication endpoints during 1-week evaluation period

## Assumptions

1. Users have access to email inbox for verification and password reset flows
2. Target audience includes tech-savvy users comfortable with OAuth providers (Google/GitHub)
3. PostgreSQL database is available and configured with SSL/TLS for production
4. SMTP service is configured for transactional emails with 95% deliverability rate
5. Users have access to TOTP authenticator app (Google Authenticator, Authy, etc.) for MFA setup
6. Platform will initially target English-speaking users (i18n out of scope for v1)
7. Browser support includes modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
8. Users accept cookie usage for session management (GDPR cookie consent banner exists)
9. Infrastructure supports rate limiting and DDoS protection at network level (Cloudflare or similar)
10. Development timeline of 1 week assumes full-time dedicated engineer with Better Auth experience

## Dependencies

### Internal Dependencies
- Next.js 14+ with App Router and TypeScript configuration
- Drizzle ORM with PostgreSQL adapter for database operations
- Existing Docusaurus site for content rendering and personalization
- Existing user management infrastructure (if any) for migration support

### External Dependencies
- Better Auth library (npm: better-auth@latest)
- Google OAuth 2.0 API credentials (Client ID, Client Secret)
- GitHub OAuth Apps credentials (Client ID, Client Secret)
- PostgreSQL database (Neon Serverless or similar with connection pooling)
- SMTP service (SendGrid, AWS SES, or similar for email delivery)
- bcrypt library for password hashing
- TOTP library (otpauth or similar) for MFA implementation
- Email validation service (optional: ZeroBounce, NeverBounce for advanced validation)

## Out of Scope

- Advanced ML-based content recommendation engine (v1 uses rule-based matching on questionnaire responses)
- Mobile native apps (iOS/Android) - web-only for v1
- Custom UI component library (using Shadcn UI for forms)
- Real-time collaboration features
- WebAuthn/Passkey support (biometric authentication)
- Social providers beyond Google/GitHub (Twitter, Facebook, LinkedIn deferred to v2)
- Advanced user role management (RBAC) - simple user/admin roles only
- Multi-tenancy support (single organization for v1)
- Advanced session analytics (device fingerprinting, location tracking beyond IP)
- Passwordless email magic link authentication (deferred to v2)
- Integration with third-party identity providers (Auth0, Okta) beyond OAuth
- Advanced CAPTCHA (hCaptcha, reCAPTCHA) - rate limiting sufficient for v1
- User impersonation features for admin support
- Advanced audit logging dashboard (basic logs to database only)
- Automated threat detection and account lockout policies beyond rate limiting
