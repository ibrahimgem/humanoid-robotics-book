import { Request, Response } from 'express';
import {
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  AUTH_ERROR_MESSAGES,
} from '../schemas/user';
import { findUserByEmail, updatePassword, toPublicUser } from '../models/user-service';
import { revokeAllUserSessions } from '../models/session-service';
import {
  generatePasswordResetTokenData,
  sendPasswordResetEmail,
} from '../../lib/email';
import { hashToken } from '../../lib/encryption';
import { db } from '../../db';
import { passwordResetTokens } from '../../db/schema';
import { logPasswordResetRequest, logPasswordResetSuccess } from '../../lib/audit';
import { getClientIdentifier } from '../../lib/rate-limit';

// ============================================================================
// Password Reset Request Endpoint
// ============================================================================

export async function passwordResetRequestHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    // Validate input
    const parseResult = passwordResetRequestSchema.safeParse(request.body);

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

    const { email } = parseResult.data;
    const clientIp = getClientIdentifier(request);

    // Find user by email (but always return success to prevent email enumeration)
    const user = await findUserByEmail(email);

    if (user) {
      // Generate reset token
      const tokenData = generatePasswordResetTokenData(email);

      // Store token (invalidate any existing tokens)
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id));

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash: hashToken(tokenData.token),
        expiresAt: tokenData.expiresAt,
      });

      // Send reset email
      try {
        await sendPasswordResetEmail({
          email: user.email,
          token: tokenData.token,
          expiresIn: tokenData.expiresIn,
        });

        await logPasswordResetRequest(user.id, clientIp);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }
    }

    // Always return success to prevent email enumeration
    response.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    response.status(500).json({
      error: 'An error occurred during password reset request',
      code: 'INTERNAL_ERROR',
    });
  }
}

// ============================================================================
// Password Reset Confirm Endpoint
// ============================================================================

export async function passwordResetConfirmHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    // Validate input
    const parseResult = passwordResetConfirmSchema.safeParse(request.body);

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

    const { token, password } = parseResult.data;
    const clientIp = getClientIdentifier(request);

    // Find valid reset token
    const tokenHash = hashToken(token);
    const now = new Date();

    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: (tokens, { and, eq, gt }) =>
        and(
          eq(tokens.tokenHash, tokenHash),
          eq(tokens.used, false),
          gt(tokens.expiresAt, now)
        ),
    });

    if (!resetToken) {
      response.status(400).json({
        error: AUTH_ERROR_MESSAGES.TOKEN_INVALID,
        code: 'TOKEN_INVALID',
      });
      return;
    }

    // Update password
    await updatePassword(resetToken.userId, password);

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Revoke all sessions for security
    await revokeAllUserSessions(resetToken.userId);

    // Log success
    await logPasswordResetSuccess(resetToken.userId, clientIp);

    // Get user
    const user = await findUserByEmail(''); // We need to find by ID instead
    // Actually, let's get user by ID
    const { users } = await import('../../db/schema');
    const { eq } = await import('drizzle-orm');

    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, resetToken.userId),
    });

    response.status(200).json({
      success: true,
      message: 'Password reset successful. Please sign in with your new password.',
      user: userRecord ? toPublicUser(userRecord) : undefined,
    });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    response.status(500).json({
      error: 'An error occurred during password reset',
      code: 'INTERNAL_ERROR',
    });
  }
}
