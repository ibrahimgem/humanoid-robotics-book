import { db } from '../db';
import { authLogs } from '../db/schema';
import { eq, gte, and, desc, sql } from 'drizzle-orm';
import { logAuthEvent } from './audit';

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  blockDurationMs: number; // Block duration after exceeding limit
}

const DEFAULT_SIGNIN_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,      // 15 minutes
  maxRequests: 5,                 // 5 attempts
  blockDurationMs: 15 * 60 * 1000, // 15 minutes block
};

const DEFAULT_SIGNUP_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,      // 1 hour
  maxRequests: 3,                 // 3 attempts per hour
  blockDurationMs: 60 * 60 * 1000, // 1 hour block
};

const DEFAULT_GENERAL_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,           // 1 minute
  maxRequests: 60,                // 60 requests per minute
  blockDurationMs: 60 * 1000,     // 1 minute block
};

// ============================================================================
// Rate Limit Result
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // Seconds until retry is allowed
}

// ============================================================================
// Get Client Identifier
// ============================================================================

export function getClientIdentifier(request: Request): string {
  // Check for forwarded IP (behind proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (original client)
    return forwardedFor.split(',')[0].trim();
  }

  // Check for real IP header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to empty string (will be logged as "unknown")
  return 'unknown';
}

// ============================================================================
// Check Rate Limit
// ============================================================================

export async function checkRateLimit(
  identifier: string,
  action: 'signin' | 'signup' | 'general' = 'general',
  customConfig?: Partial<RateLimitConfig>
): Promise<RateLimitResult> {
  const config = { ...DEFAULT_SIGNIN_CONFIG, ...customConfig };

  switch (action) {
    case 'signin':
      Object.assign(config, DEFAULT_SIGNIN_CONFIG);
      break;
    case 'signup':
      Object.assign(config, DEFAULT_SIGNUP_CONFIG);
      break;
    default:
      Object.assign(config, DEFAULT_GENERAL_CONFIG);
  }

  const windowStart = new Date(Date.now() - config.windowMs);

  // Count recent failed attempts
  const recentAttempts = await db
    .select({ count: sql<number>`count(*)` })
    .from(authLogs)
    .where(
      and(
        eq(authLogs.ipAddress, identifier),
        eq(authLogs.eventType, `${action}_failure`),
        gte(authLogs.createdAt, windowStart)
      )
    );

  const attemptCount = Number(recentAttempts[0]?.count || 0);

  if (attemptCount >= config.maxRequests) {
    // Calculate when the block expires
    const oldestAttempt = await db
      .select()
      .from(authLogs)
      .where(
        and(
          eq(authLogs.ipAddress, identifier),
          eq(authLogs.eventType, `${action}_failure`),
          gte(authLogs.createdAt, windowStart)
        )
      )
      .orderBy(desc(authLogs.createdAt))
      .limit(1);

    const blockExpiresAt = oldestAttempt[0]?.createdAt
      ? new Date(oldestAttempt[0].createdAt.getTime() + config.blockDurationMs)
      : new Date(Date.now() + config.blockDurationMs);

    const retryAfter = Math.ceil((blockExpiresAt.getTime() - Date.now()) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt: blockExpiresAt,
      retryAfter: Math.max(0, retryAfter),
    };
  }

  const resetAt = new Date(Date.now() + config.windowMs);

  return {
    allowed: true,
    remaining: config.maxRequests - attemptCount,
    resetAt,
  };
}

// ============================================================================
// Exponential Backoff Calculator
// ============================================================================

export interface BackoffConfig {
  baseDelay: number;    // Base delay in ms (30s)
  maxDelay: number;     // Maximum delay in ms (120s)
  factor: number;       // Backoff factor (2x)
}

const DEFAULT_BACKOFF: BackoffConfig = {
  baseDelay: 30000,     // 30 seconds
  maxDelay: 120000,     // 2 minutes
  factor: 2,
};

/**
 * Calculate exponential backoff delay based on failed attempts
 */
export function calculateBackoff(attemptCount: number, config: BackoffConfig = DEFAULT_BACKOFF): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.factor, attemptCount - 1),
    config.maxDelay
  );

  // Add jitter (0-30% of delay)
  const jitter = delay * Math.random() * 0.3;

  return Math.floor(delay + jitter);
}

/**
 * Get recommended retry delay based on rate limit status
 */
export async function getRetryDelay(
  request: Request,
  action: 'signin' | 'signup' | 'general' = 'general'
): Promise<number> {
  const identifier = getClientIdentifier(request);
  const result = await checkRateLimit(identifier, action);

  if (result.retryAfter) {
    return result.retryAfter * 1000; // Convert to milliseconds
  }

  // Calculate based on failed attempts
  const windowStart = new Date(Date.now() - 15 * 60 * 1000); // 15 min window
  const recentAttempts = await db
    .select({ count: sql<number>`count(*)` })
    .from(authLogs)
    .where(
      and(
        eq(authLogs.ipAddress, identifier),
        eq(authLogs.eventType, `${action}_failure`),
        gte(authLogs.createdAt, windowStart)
      )
    );

  const attemptCount = Number(recentAttempts[0]?.count || 0);
  return calculateBackoff(attemptCount);
}

// ============================================================================
// Rate Limit Headers for Response
// ============================================================================

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(DEFAULT_SIGNIN_CONFIG.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt.getTime() / 1000)),
    ...(result.retryAfter && {
      'Retry-After': String(result.retryAfter),
    }),
  };
}
