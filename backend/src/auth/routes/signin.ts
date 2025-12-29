import { Request, Response } from 'express';
import { signinSchema, AUTH_ERROR_MESSAGES } from '../schemas/user';
import { findUserByEmail, toPublicUser } from '../models/user-service';
import { createSession, refreshSessionIfNeeded } from '../models/session-service';
import { compare } from 'bcryptjs';
import { logSignin, logSigninFailure } from '../../lib/audit';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from '../../lib/rate-limit';
import {
  requireAuth,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  getSessionCookieOptionsRememberMe,
  extractSessionToken,
} from '../middleware/auth-guard';

// ============================================================================
// Signin Endpoint
// ============================================================================

export async function signinHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    // Validate input
    const parseResult = signinSchema.safeParse(request.body);

    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        errors[issue.path.join('.')] = issue.message;
      }

      response.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors,
      });
      return;
    }

    const { email, password, rememberMe } = parseResult.data;
    const clientIp = getClientIdentifier(request);
    const userAgent = request.headers.get?.('user-agent') || undefined;

    // Check rate limiting
    const rateLimit = await checkRateLimit(clientIp, 'signin');

    if (!rateLimit.allowed) {
      response.set(getRateLimitHeaders(rateLimit));
      response.status(429).json({
        error: AUTH_ERROR_MESSAGES.ACCOUNT_LOCKED,
        code: 'ACCOUNT_LOCKED',
        retryAfter: rateLimit.retryAfter,
      });
      return;
    }

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      await logSigninFailure(undefined, clientIp, userAgent);

      response.status(401).json({
        error: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Check email verification
    if (!user.emailVerified) {
      await logSigninFailure(user.id, clientIp, userAgent);

      response.status(403).json({
        error: AUTH_ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
        code: 'ACCOUNT_NOT_VERIFIED',
      });
      return;
    }

    // Verify password
    const validPassword = await compare(password, user.passwordHash);

    if (!validPassword) {
      await logSigninFailure(user.id, clientIp, userAgent);

      response.status(401).json({
        error: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
        code: 'INVALID_CREDENTIALS',
        attemptsRemaining: Math.max(0, rateLimit.remaining - 1),
      });
      return;
    }

    // Create session
    const session = await createSession({
      userId: user.id,
      ipAddress: clientIp,
      userAgent,
      rememberMe,
    });

    // Log successful signin
    await logSignin(user.id, clientIp, userAgent);

    // Set session cookie
    const cookieOptions = rememberMe
      ? getSessionCookieOptionsRememberMe()
      : getSessionCookieOptions();

    response.set('Set-Cookie', `${SESSION_COOKIE_NAME}=${session.token}; ${Object.entries(cookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`);

    // Return success with user info
    response.status(200).json({
      success: true,
      message: 'Signin successful',
      user: toPublicUser(user),
      session: {
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    response.status(500).json({
      error: 'An error occurred during signin',
      code: 'INTERNAL_ERROR',
    });
  }
}

// ============================================================================
// Signout Endpoint
// ============================================================================

export async function signoutHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const clientIp = getClientIdentifier(request);
    const userAgent = request.headers.get?.('user-agent') || undefined;

    // Get current session to log the event
    const token = extractSessionToken(request);

    if (token) {
      // Get user from session (we need to query the session)
      const { db } = await import('../../db');
      const { sessions, users } = await import('../../db/schema');
      const { eq } = await import('drizzle-orm');

      const session = await db.query.sessions.findFirst({
        where: eq(sessions.token, token),
      });

      if (session) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, session.userId),
        });

        if (user) {
          await logSignout(user.id, clientIp, userAgent);
        }
      }

      // Revoke session
      await db.delete(sessions).where(eq(sessions.token, token));
    }

    // Clear session cookie
    response.set('Set-Cookie', `${SESSION_COOKIE_NAME}=; ${Object.entries(clearSessionCookie()).map(([k, v]) => `${k}=${v}`).join('; ')}`);

    response.status(200).json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    console.error('Signout error:', error);
    response.status(500).json({
      error: 'An error occurred during signout',
      code: 'INTERNAL_ERROR',
    });
  }
}

function clearSessionCookie() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 0,
    path: '/',
    expires: new Date(0),
  };
}

// ============================================================================
// Session Refresh Endpoint
// ============================================================================

export async function sessionRefreshHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const clientIp = getClientIdentifier(request);
    const userAgent = request.headers.get?.('user-agent') || undefined;
    const token = extractSessionToken(request);

    if (!token) {
      response.status(401).json({
        error: AUTH_ERROR_MESSAGES.SESSION_INVALID,
        code: 'SESSION_INVALID',
      });
      return;
    }

    // Refresh session if needed
    const result = await refreshSessionIfNeeded(token);

    if (!result.session) {
      response.status(401).json({
        error: AUTH_ERROR_MESSAGES.SESSION_INVALID,
        code: 'SESSION_INVALID',
      });
      return;
    }

    // Get user
    const { db } = await import('../../db');
    const { sessions, users } = await import('../../db/schema');
    const { eq } = await import('drizzle-orm');

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!session) {
      response.status(401).json({
        error: AUTH_ERROR_MESSAGES.SESSION_INVALID,
        code: 'SESSION_INVALID',
      });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      response.status(401).json({
        error: AUTH_ERROR_MESSAGES.SESSION_INVALID,
        code: 'SESSION_INVALID',
      });
      return;
    }

    response.status(200).json({
      success: true,
      user: toPublicUser(user),
      session: {
        expiresAt: result.session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    response.status(500).json({
      error: 'An error occurred during session refresh',
      code: 'INTERNAL_ERROR',
    });
  }
}
