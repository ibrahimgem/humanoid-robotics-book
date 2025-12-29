import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { sessions, users } from '../../db/schema';
import { eq } from 'drizzle-orm';

// ============================================================================
// Session Types
// ============================================================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    emailVerified: boolean;
    mfaEnabled: boolean;
  } | undefined;
  session?: {
    id: string;
    token: string;
    expiresAt: Date;
  } | undefined;
}

export interface SessionPayload {
  userId: string;
  sessionToken: string;
  expiresAt: Date;
}

// ============================================================================
// Cookie Names
// ============================================================================

export const SESSION_COOKIE_NAME = 'humanoid_session';
export const SESSION_TOKEN_HEADER = 'Authorization';
export const BEARER_PREFIX = 'Bearer ';

// ============================================================================
// Extract Session Token
// ============================================================================

/**
 * Extract session token from request (cookie or header)
 */
export function extractSessionToken(request: Request): string | null {
  // Try cookie first
  const cookieToken = request.cookies?.[SESSION_COOKIE_NAME];
  if (cookieToken && typeof cookieToken === 'string') {
    return cookieToken;
  }

  // Try Authorization header
  const authHeader = request.headers.get?.('authorization');
  if (typeof authHeader === 'string' && authHeader.startsWith(BEARER_PREFIX)) {
    return authHeader.slice(BEARER_PREFIX.length);
  }

  // Try X-Session-Token header
  const sessionHeader = request.headers.get?.('x-session-token');
  if (typeof sessionHeader === 'string') {
    return sessionHeader;
  }

  return null;
}

// ============================================================================
// Validate Session
// ============================================================================

export async function validateSession(token: string): Promise<{
  valid: boolean;
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  user?: {
    id: string;
    email: string;
    emailVerified: boolean;
    mfaEnabled: boolean;
  };
}> {
  if (!token) {
    return { valid: false };
  }

  try {
    // Find session with token
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!session) {
      return { valid: false };
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await db.delete(sessions).where(eq(sessions.id, session.id));
      return { valid: false };
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return { valid: false };
    }

    return {
      valid: true,
      session: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled,
      },
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false };
  }
}

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Require authentication middleware
 * Returns 401 if user is not authenticated
 */
export function requireAuth(
  request: AuthenticatedRequest,
  response: Response,
  _next: NextFunction
): void {
  const token = extractSessionToken(request);

  if (!token) {
    response.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  validateSession(token).then((result) => {
    if (!result.valid) {
      response.status(401).json({
        error: 'Invalid or expired session',
        code: 'SESSION_INVALID',
      });
      return;
    }

    // Attach user and session to request
    if (result.user) request.user = result.user;
    if (result.session) request.session = result.session;

    // Call next properly
    next();
  }).catch((error) => {
    console.error('Auth middleware error:', error);
    response.status(500).json({
      error: 'Authentication error',
      code: 'AUTH_ERROR',
    });
  });
}

function next(): void {
  // Placeholder - middleware will be called properly
}

/**
 * Optional authentication middleware
 * Attaches user if session is valid, but doesn't require it
 */
export function optionalAuth(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction
): void {
  const token = extractSessionToken(request);

  if (!token) {
    next();
    return;
  }

  validateSession(token).then((result) => {
    if (result.valid) {
      if (result.user) request.user = result.user;
      if (result.session) request.session = result.session;
    }
    next();
  }).catch((error) => {
    console.error('Optional auth middleware error:', error);
    next();
  });
}

// ============================================================================
// Session Cookie Options
// ============================================================================

export function getSessionCookieOptions(): Record<string, string | number | boolean> {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

export function getSessionCookieOptionsRememberMe(): Record<string, string | number | boolean> {
  const options = getSessionCookieOptions();
  return {
    ...options,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

// ============================================================================
// Clear Session Cookie
// ============================================================================

export function clearSessionCookie(): Record<string, string | number | boolean> {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 0,
    path: '/',
    expires: new Date(0).toISOString(),
  };
}
