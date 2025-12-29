import { z } from 'zod';

// ============================================================================
// Password Validation
// ============================================================================

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/**
 * Validate password complexity requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z.string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ============================================================================
// Registration Schema
// ============================================================================

export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .min(1, 'Email is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
  rememberMe: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================================
// Signin Schema
// ============================================================================

export const signinSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export type SigninInput = z.infer<typeof signinSchema>;

// ============================================================================
// Password Reset Schemas
// ============================================================================

export const passwordResetRequestSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .min(1, 'Email is required'),
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;

// ============================================================================
// Email Verification Schema
// ============================================================================

export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;

// ============================================================================
// Session Refresh Schema
// ============================================================================

export const sessionRefreshSchema = z.object({
  rememberMe: z.boolean().default(false),
});

export type SessionRefreshInput = z.infer<typeof sessionRefreshSchema>;

// ============================================================================
// Error Messages
// ============================================================================

export const AUTH_ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Invalid email address',
  EMAIL_ALREADY_REGISTERED: 'Email is already registered',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_WEAK: 'Password does not meet complexity requirements',
  PASSWORD_MISMATCH: "Passwords don't match",
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email before signing in',
  ACCOUNT_LOCKED: 'Account is temporarily locked. Please try again later.',
  SESSION_EXPIRED: 'Session has expired. Please sign in again.',
  SESSION_INVALID: 'Invalid session. Please sign in again.',
  TOKEN_EXPIRED: 'Token has expired. Please request a new one.',
  TOKEN_INVALID: 'Invalid token. Please request a new one.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  MFA_REQUIRED: 'Multi-factor authentication is required',
  MFA_INVALID: 'Invalid verification code',
} as const;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate registration input
 */
export function validateRegisterInput(data: unknown): {
  success: boolean;
  data?: RegisterInput;
  errors?: Record<string, string>;
} {
  const result = registerSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }

  return { success: false, errors };
}

/**
 * Validate signin input
 */
export function validateSigninInput(data: unknown): {
  success: boolean;
  data?: SigninInput;
  errors?: Record<string, string>;
} {
  const result = signinSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }

  return { success: false, errors };
}
