# Quickstart Guide: Better Auth Signup/Signin System

**Feature**: 003-better-auth-signup
**Timeline**: 1 week (iterative phases)
**Prerequisites**: Node.js 18+, PostgreSQL database, SMTP credentials

## Phase Overview

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| 1 | Day 1 | Setup | Environment, Better Auth config, DB schema |
| 2 | Days 2-3 | Authentication | Signup, Signin, Password reset, Email verification |
| 3 | Days 4-5 | Onboarding | Questionnaire UI, Profile service, Personalization |
| 4 | Day 6 | Testing | Unit, Integration, E2E tests, Security audit |
| 5 | Day 7 | Polish | Bug fixes, Documentation, Deployment prep |

## Day 1: Setup

### 1.1 Install Dependencies

```bash
# Core auth dependencies
npm install better-auth@latest
npm install @better-auth/react

# Database dependencies
npm install drizzle-orm drizzle-kit pg

# Validation and utilities
npm install zod bcryptjs jsonwebtoken
npm install otpauth @otpch/server

# Email (choose one)
npm install nodemailer          # Basic SMTP
# OR
npm install @sendgrid/mail      # SendGrid
# OR
npm install @aws-sdk/client-ses # AWS SES
```

### 1.2 Environment Configuration

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Better Auth
BETTER_AUTH_SECRET="your-32-char-secret-key-here"

# Email (SMTP or API)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@example.com"

# OAuth (optional - Phase 2)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 1.3 Database Schema Setup

```bash
# Generate migration
npx drizzle-kit generate

# Run migration
npx drizzle-kit migrate

# Or run SQL directly
psql $DATABASE_URL -f src/db/schema.sql
```

### 1.4 Better Auth Configuration

```typescript
// src/auth/config.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      minLength: 8,
      maxLength: 128,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    cookiePrefix: "humanoid-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
```

---

## Days 2-3: Authentication Flows

### 2.1 Signup Flow

```typescript
// src/auth/routes/signup.ts
import { auth } from "@/auth/config";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";
import { registerSchema } from "@/auth/schemas/user";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();

  // Validate input
  const { email, password } = registerSchema.parse(body);

  // Check existing user
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (existingUser) {
    return Response.json(
      { error: "Email already registered" },
      { status: 400 }
    );
  }

  // Create user
  const passwordHash = await hash(password, 12);
  const [user] = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    emailVerified: false,
  }).returning();

  // Generate and send verification token
  const token = generateVerificationToken();
  await db.insert(emailVerificationTokens).values({
    userId: user.id,
    tokenHash: token.hash,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  await sendVerificationEmail(email, token.plain);

  return Response.json({
    success: true,
    message: "Account created. Please check your email to verify.",
    userId: user.id,
  });
}
```

### 2.2 Signin Flow

```typescript
// src/auth/routes/signin.ts
import { auth } from "@/auth/config";
import { db } from "@/db";
import { users, authLogs } from "@/db/schema";
import { signinSchema } from "@/auth/schemas/user";
import { compare } from "bcryptjs";
import { eq, and, gte, desc } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, rememberMe } = signinSchema.parse(body);

  // Rate limiting
  const clientIp = request.headers.get("x-forwarded-for") || "unknown";
  const rateLimit = await checkRateLimit(clientIp, "signin");

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many signin attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter || 900) } }
    );
  }

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!user) {
    await logAuthEvent(null, "signin_failure", clientIp, false);
    return Response.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Verify email
  if (!user.emailVerified) {
    return Response.json(
      { error: "Please verify your email before signing in" },
      { status: 403 }
    );
  }

  // Verify password
  const validPassword = await compare(password, user.passwordHash);

  if (!validPassword) {
    await logAuthEvent(user.id, "signin_failure", clientIp, false);
    return Response.json(
      { error: "Invalid email or password", attemptsRemaining: 4 },
      { status: 401 }
    );
  }

  // Create session
  const session = await auth.api.createSession({
    body: {
      userId: user.id,
      expiresIn: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
    },
  });

  await logAuthEvent(user.id, "signin_success", clientIp, true);

  return Response.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
    },
    session: {
      token: session.token,
      expiresAt: session.expiresAt,
    },
  });
}

async function logAuthEvent(
  userId: string | null,
  eventType: string,
  ip: string,
  success: boolean
) {
  await db.insert(authLogs).values({
    userId,
    eventType,
    ipAddress: ip,
    success,
    createdAt: new Date(),
  });
}
```

### 2.3 Email Verification

```typescript
// src/auth/routes/verify-email.ts
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

export async function POST(request: Request) {
  const { token } = await request.json();

  // Find valid token
  const verificationToken = await db.query.emailVerificationTokens.findFirst({
    where: and(
      eq(emailVerificationTokens.tokenHash, hashToken(token)),
      eq(emailVerificationTokens.verified, false),
      gt(emailVerificationTokens.expiresAt, new Date())
    ),
  });

  if (!verificationToken) {
    return Response.json(
      { error: "Invalid or expired verification link" },
      { status: 400 }
    );
  }

  // Verify email
  await db.update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, verificationToken.userId));

  // Mark token as used
  await db.update(emailVerificationTokens)
    .set({ verified: true })
    .where(eq(emailVerificationTokens.id, verificationToken.id));

  return Response.json({
    success: true,
    message: "Email verified. You can now sign in.",
  });
}
```

---

## Days 4-5: Onboarding Questionnaire

### 4.1 Frontend Questionnaire Component

```typescript
// src/onboarding/components/OnboardingWizard.tsx
import { useState } from "react";
import { StepSoftware } from "./StepSoftware";
import { StepHardware } from "./StepHardware";
import { StepAI } from "./StepAI";
import { StepInterests } from "./StepInterests";

const STEPS = [
  { component: StepSoftware, title: "Programming Experience" },
  { component: StepHardware, title: "Hardware & Robotics" },
  { component: StepAI, title: "AI/ML Background" },
  { component: StepInterests, title: "Interests & Preferences" },
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleNext = async (stepData: object) => {
    const newAnswers = { ...answers, ...stepData };
    setAnswers(newAnswers);

    if (currentStep < STEPS.length - 1) {
      // Save progress
      await fetch("/api/onboarding/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: currentStep + 1, data: stepData }),
      });
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: newAnswers }),
      });
      // Redirect to dashboard
      window.location.href = "/dashboard";
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="onboarding-wizard">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <h2>{STEPS[currentStep].title}</h2>

      <CurrentStepComponent
        onNext={handleNext}
        onBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
        savedData={answers}
      />
    </div>
  );
}
```

### 4.2 Profile Service

```typescript
// src/onboarding/service.ts
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface ProfileData {
  softwareSkills: Record<string, string>;
  hardwareExperience: {
    hasRobotExperience: boolean;
    roboticsPlatforms: string[];
    rosExperience: string;
  };
  mlBackground: {
    mlLevel: string;
    hasLlmExperience: boolean;
    hasCvExperience: boolean;
  };
  interests: string[];
  learningStyle: string;
}

export async function saveProfile(userId: string, data: ProfileData) {
  await db.insert(userProfiles).values({
    userId,
    data: data as unknown as Record<string, unknown>,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: userProfiles.userId,
    set: {
      data: data as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    },
  });
}

export async function getProfile(userId: string) {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });
  return profile?.data as ProfileData | null;
}

export async function generateRecommendations(profile: ProfileData) {
  // Rule-based recommendation engine
  const recommendations = [];

  // Python skill-based
  if (profile.softwareSkills.python === "beginner") {
    recommendations.push({ id: "python-basics", title: "Python for Robotics", score: 95 });
  } else if (profile.softwareSkills.python === "intermediate") {
    recommendations.push({ id: "ros2-python", title: "ROS 2 with Python", score: 90 });
  }

  // Hardware experience
  if (profile.hardwareExperience.hasRobotExperience) {
    recommendations.push({ id: "hardware-integration", title: "Hardware Integration", score: 88 });
  }

  // AI/ML interests
  if (profile.mlBackground.mlLevel !== "none") {
    recommendations.push({ id: "ml-robotics", title: "ML for Robotics", score: 85 });
  }

  // Interest-based
  const interestScores: Record<string, number> = {
    healthtech: { id: "healthtech-robotics", title: "Healthcare Robotics", score: 92 },
    cybersecurity: { id: "robot-security", title: "Robot Security", score: 90 },
  };

  for (const interest of profile.interests) {
    if (interestScores[interest]) {
      recommendations.push(interestScores[interest]);
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
```

---

## Day 6: Testing

### 6.1 Unit Tests

```typescript
// tests/unit/validation.test.ts
import { registerSchema, signinSchema } from "@/auth/schemas/user";

describe("Registration Validation", () => {
  it("accepts valid email and password", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "SecurePass123",
      confirmPassword: "SecurePass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak password", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "weak",
      confirmPassword: "weak",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "SecurePass123",
      confirmPassword: "DifferentPass",
    });
    expect(result.success).toBe(false);
  });
});
```

### 6.2 Integration Tests

```typescript
// tests/integration/signup.test.ts
import { test, expect } from "@playwright/test";

test("user can signup and verify email", async ({ page }) => {
  await page.goto("/signup");

  // Fill signup form
  await page.fill("[name=email]", "test@example.com");
  await page.fill("[name=password]", "SecurePass123");
  await page.fill("[name=confirmPassword]", "SecurePass123");
  await page.click("button[type=submit]");

  // Verify success message
  await expect(page.locator(".success-message")).toContainText(
    "Account created"
  );
});
```

---

## Day 7: Deployment Checklist

- [ ] All unit tests passing (>90% coverage)
- [ ] All integration tests passing
- [ ] E2E tests passing for critical paths
- [ ] Security audit completed (OWASP Top 10)
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Email service tested
- [ ] Rate limiting verified
- [ ] GDPR data export tested
- [ ] Performance benchmarks met

## Next Steps

1. Run `/sp.tasks` to generate detailed task breakdown
2. Implement Phase 1 (Setup) on `003-better-auth-signup` branch
3. Test locally before pushing to remote
4. Deploy to staging for integration testing
