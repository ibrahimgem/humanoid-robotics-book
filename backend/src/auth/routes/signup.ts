import { Request, Response } from 'express';
import { db } from '../../db';
import { users, emailVerificationTokens } from '../../db/schema';
import { registerSchema, AUTH_ERROR_MESSAGES } from '../schemas/user';
import {
  createUser,
  findUserByEmail,
  toPublicUser,
} from '../models/user-service';
import { createSession } from '../models/session-service';
import {
  generateVerificationTokenData,
  sendVerificationEmail,
} from '../../lib/email';
import { encrypt, hashToken } from '../../lib/encryption';
import { logAuthEvent } from '../../lib/audit';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from '../../lib/rate-limit';
import {
  requireAuth,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from '../middleware/auth-guard';

// ============================================================================
// Signup Endpoint
// ============================================================================

export async function signupHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    // Validate input
    const parseResult = registerSchema.safeParse(request.body);

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

    // Check rate limiting
    const clientIp = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(clientIp, 'signup');

    if (!rateLimit.allowed) {
      response.set(getRateLimitHeaders(rateLimit));
      response.status(429).json({
        error: AUTH_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: rateLimit.retryAfter,
      });
      return;
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      await logAuthEvent({
        eventType: 'signup_failure',
        ipAddress: clientIp,
        userAgent: request.headers.get?.('user-agent'),
        success: false,
      });

      // Use generic message to prevent email enumeration
      response.status(400).json({
        error: 'An account with this email may already exist',
        code: 'EMAIL_POSSIBLY_REGISTERED',
      });
      return;
    }

    // Create user
    const user = await createUser({ email, password });

    // Generate email verification token
    const tokenData = generateVerificationTokenData(email);

    // Store encrypted/hashed token
    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      tokenHash: hashToken(tokenData.token),
      expiresAt: tokenData.expiresAt,
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email: user.email,
        token: tokenData.token,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail signup, but log the error
    }

    // Log signup event
    await logAuthEvent({
      userId: user.id,
      eventType: 'signup',
      ipAddress: clientIp,
      userAgent: request.headers.get?.('user-agent'),
      success: true,
    });

    // Create session for immediate signin
    const session = await createSession({
      userId: user.id,
      ipAddress: clientIp,
      userAgent: request.headers.get?.('user-agent') || undefined,
      rememberMe,
    });

    // Set session cookie
    const cookieOptions = rememberMe
      ? getSessionCookieOptions()
      : getSessionCookieOptions();

    response.set('Set-Cookie', `${SESSION_COOKIE_NAME}=${session.token}; ${Object.entries(cookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`);

    // Return success with user info (but not full user object until email verified)
    response.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error('Signup error:', error);
    response.status(500).json({
      error: 'An error occurred during signup',
      code: 'INTERNAL_ERROR',
    });
  }
}

// ============================================================================
// Verify Email Endpoint
// ============================================================================

export async function verifyEmailHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { token } = request.body;

    if (!token) {
      response.status(400).json({
        error: 'Verification token is required',
        code: 'TOKEN_REQUIRED',
      });
      return;
    }

    // Find valid verification token
    const tokenHash = hashToken(token);
    const now = new Date();

    const verificationToken = await db.query.emailVerificationTokens.findFirst({
      where: (tokens, { and, eq, gt }) =>
        and(
          eq(tokens.tokenHash, tokenHash),
          eq(tokens.verified, false),
          gt(tokens.expiresAt, now)
        ),
    });

    if (!verificationToken) {
      response.status(400).json({
        error: AUTH_ERROR_MESSAGES.TOKEN_INVALID,
        code: 'TOKEN_INVALID',
      });
      return;
    }

    // Verify user's email
    await db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, verificationToken.userId));

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ verified: true })
      .where(eq(emailVerificationTokens.id, verificationToken.id));

    // Get updated user
    const user = await db.query.users.findFirst({
      where: eq(users.id, verificationToken.userId),
    });

    if (!user) {
      response.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    // Log verification event
    await logAuthEvent({
      userId: user.id,
      eventType: 'email_verification',
      ipAddress: getClientIdentifier(request),
      userAgent: request.headers.get?.('user-agent'),
      success: true,
    });

    response.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Email verification error:', error);
    response.status(500).json({
      error: 'An error occurred during email verification',
      code: 'INTERNAL_ERROR',
    });
  }
}
