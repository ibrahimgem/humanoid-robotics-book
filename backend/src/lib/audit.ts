import { db } from '../db';
import { authLogs } from '../db/schema';

// ============================================================================
// Auth Event Types
// ============================================================================

export type AuthEventType =
  | 'signup'
  | 'signup_failure'
  | 'signin'
  | 'signin_failure'
  | 'signout'
  | 'email_verification'
  | 'email_verification_failure'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'password_reset_failure'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'mfa_verification_success'
  | 'mfa_verification_failure'
  | 'oauth_link'
  | 'oauth_unlink'
  | 'account_deletion_request'
  | 'account_deletion_cancel'
  | 'account_deletion_executed'
  | 'profile_update';

// ============================================================================
// Log Auth Event
// ============================================================================

export interface LogAuthEventParams {
  userId?: string;
  eventType: AuthEventType;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Log an authentication event to the audit trail
 */
export async function logAuthEvent(params: LogAuthEventParams): Promise<void> {
  try {
    await db.insert(authLogs).values({
      userId: params.userId || null,
      eventType: params.eventType,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent || null,
      success: params.success,
      createdAt: new Date(),
    });
  } catch (error) {
    // Log to console but don't fail the operation
    console.error('Failed to log auth event:', error);
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

export async function logSignup(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    eventType: 'signup',
    ipAddress,
    userAgent,
    success: true,
  });
}

export async function logSignupFailure(
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAuthEvent({
    eventType: 'signup_failure',
    ipAddress,
    userAgent,
    success: false,
  });
}

export async function logSignin(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    eventType: 'signin',
    ipAddress,
    userAgent,
    success: true,
  });
}

export async function logSigninFailure(
  userId: string | undefined,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    eventType: 'signin_failure',
    ipAddress,
    userAgent,
    success: false,
  });
}

export async function logSignout(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    eventType: 'signout',
    ipAddress,
    userAgent,
    success: true,
  });
}

export async function logPasswordResetRequest(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    eventType: 'password_reset_request',
    ipAddress,
    userAgent,
    success: true,
  });
}

export async function logPasswordResetSuccess(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    eventType: 'password_reset_success',
    ipAddress,
    userAgent,
    success: true,
  });
}

export async function logMfaEnabled(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    eventType: 'mfa_enabled',
    ipAddress,
    userAgent,
    success: true,
  });
}

export async function logMfaDisabled(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    eventType: 'mfa_disabled',
    ipAddress,
    userAgent,
    success: true,
  });
}

// ============================================================================
// Query Auth Logs
// ============================================================================

import { gte, eq, desc, and } from 'drizzle-orm';

/**
 * Get recent auth events for a user
 */
export async function getUserAuthEvents(
  userId: string,
  since?: Date
) {
  const sinceDate = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

  return await db
    .select()
    .from(authLogs)
    .where(
      and(
        eq(authLogs.userId, userId),
        gte(authLogs.createdAt, sinceDate)
      )
    )
    .orderBy(desc(authLogs.createdAt))
    .limit(100);
}

/**
 * Get recent signin events for a user (for security monitoring)
 */
export async function getRecentSignins(
  userId: string,
  limit: number = 10
) {
  return await db
    .select({
      id: authLogs.id,
      ipAddress: authLogs.ipAddress,
      userAgent: authLogs.userAgent,
      createdAt: authLogs.createdAt,
    })
    .from(authLogs)
    .where(
      and(
        eq(authLogs.userId, userId),
        eq(authLogs.eventType, 'signin'),
        eq(authLogs.success, true)
      )
    )
    .orderBy(desc(authLogs.createdAt))
    .limit(limit);
}

/**
 * Check for suspicious activity
 */
export async function checkSuspiciousActivity(
  userId: string,
  windowMs: number = 60 * 60 * 1000 // 1 hour
) {
  const windowStart = new Date(Date.now() - windowMs);

  const [failedAttempts] = await db
    .select({ count: authLogs.id })
    .from(authLogs)
    .where(
      and(
        eq(authLogs.userId, userId),
        eq(authLogs.success, false),
        gte(authLogs.createdAt, windowStart)
      )
    );

  const [recentSignins] = await db
    .select({ count: authLogs.id })
    .from(authLogs)
    .where(
      and(
        eq(authLogs.userId, userId),
        eq(authLogs.eventType, 'signin'),
        eq(authLogs.success, true),
        gte(authLogs.createdAt, windowStart)
      )
    );

  return {
    failedAttempts: Number(failedAttempts.count),
    recentSignins: Number(recentSignins.count),
    isSuspicious: Number(failedAttempts.count) >= 5,
  };
}
