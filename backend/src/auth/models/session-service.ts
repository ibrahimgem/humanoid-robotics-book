import { db } from '../../db';
import { sessions, Session, NewSession } from '../../db/schema';
import { eq, gte, and, desc } from 'drizzle-orm';
import { generateToken } from '../../lib/encryption';
import { logSignout } from '../../lib/audit';

// ============================================================================
// Session Configuration
// ============================================================================

interface SessionConfig {
  expiresInSeconds: number; // Default: 7 days
  rememberMeExpiresInSeconds: number; // 30 days
  updateAgeSeconds: number; // 1 day
}

const DEFAULT_SESSION_CONFIG: SessionConfig = {
  expiresInSeconds: 7 * 24 * 60 * 60, // 7 days
  rememberMeExpiresInSeconds: 30 * 24 * 60 * 60, // 30 days
  updateAgeSeconds: 24 * 60 * 60, // 1 day
};

function getSessionConfig(): SessionConfig {
  return {
    expiresInSeconds: parseInt(process.env.SESSION_EXPIRY_SECONDS || '604800', 10),
    rememberMeExpiresInSeconds: parseInt(process.env.SESSION_REMEMBER_ME_EXPIRY || '2592000', 10),
    updateAgeSeconds: parseInt(process.env.SESSION_UPDATE_AGE || '86400', 10),
  };
}

// ============================================================================
// Session Service
// ============================================================================

export interface CreateSessionParams {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  rememberMe?: boolean;
}

/**
 * Create a new session
 */
export async function createSession(params: CreateSessionParams): Promise<Session> {
  const config = getSessionConfig();
  const expiresIn = params.rememberMe
    ? config.rememberMeExpiresInSeconds
    : config.expiresInSeconds;

  const token = generateToken(64);

  const [session] = await db.insert(sessions).values({
    userId: params.userId,
    token,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
  }).returning();

  return session;
}

/**
 * Validate session token
 */
export async function validateSessionToken(token: string): Promise<{
  valid: boolean;
  session?: Session;
} | null> {
  if (!token) {
    return null;
  }

  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!session) {
      return null;
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await db.delete(sessions).where(eq(sessions.id, session.id));
      return null;
    }

    return { valid: true, session };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Revoke a session
 */
export async function revokeSession(token: string): Promise<boolean> {
  try {
    const result = await db
      .delete(sessions)
      .where(eq(sessions.token, token));

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Revoke session error:', error);
    return false;
  }
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(userId: string, keepCurrent?: string): Promise<number> {
  try {
    const conditions = [eq(sessions.userId, userId)];

    // Optionally keep one session (e.g., current session)
    if (keepCurrent) {
      conditions.push(require => require.ne(sessions.token, keepCurrent));
    }

    const result = await db.delete(sessions).where(
      and(...conditions)
    );

    return result.rowCount ?? 0;
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return 0;
  }
}

/**
 * Update session last used timestamp
 */
export async function touchSession(token: string): Promise<boolean> {
  try {
    const result = await db
      .update(sessions)
      .set({
        lastUsedAt: new Date(),
      })
      .where(eq(sessions.token, token));

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Touch session error:', error);
    return false;
  }
}

/**
 * Extend session expiry if needed
 */
export async function refreshSessionIfNeeded(token: string): Promise<{
  refreshed: boolean;
  session?: Session;
}> {
  const config = getSessionConfig();
  const now = Date.now();

  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!session) {
      return { refreshed: false };
    }

    // Calculate time until expiry
    const expiresAt = session.expiresAt.getTime();
    const timeUntilExpiry = expiresAt - now;

    // If less than updateAge, extend the session
    if (timeUntilExpiry < config.updateAgeSeconds * 1000) {
      const [updated] = await db
        .update(sessions)
        .set({
          expiresAt: new Date(now + config.expiresInSeconds * 1000),
          lastUsedAt: new Date(),
        })
        .where(eq(sessions.id, session.id))
        .returning();

      return { refreshed: true, session: updated };
    }

    // Just update last used
    await touchSession(token);

    return { refreshed: true, session };
  } catch (error) {
    console.error('Refresh session error:', error);
    return { refreshed: false };
  }
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  return await db.query.sessions.findMany({
    where: eq(sessions.userId, userId),
    orderBy: [desc(sessions.createdAt)],
  });
}

/**
 * Clean up expired sessions for a user
 */
export async function cleanupExpiredSessions(userId: string): Promise<number> {
  const result = await db
    .delete(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        gte(sessions.expiresAt, new Date())
      )
    );

  return result.rowCount ?? 0;
}

/**
 * Get active session count for a user
 */
export async function getActiveSessionCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sessions.id })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        gte(sessions.expiresAt, new Date())
      )
    );

  return Number(result[0]?.count || 0);
}
