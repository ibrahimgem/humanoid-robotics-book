import { Request, Response } from 'express';
import { getOnboardingStatus } from '../service';
import { requireAuth } from '../../auth/middleware/auth-guard';

// ============================================================================
// Onboarding Status Endpoint
// ============================================================================

export async function onboardingStatusHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    // Check authentication
    const authHeader = request.headers.get?.('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      response.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    // Get user from session
    const { db } = await import('../../db');
    const { sessions, users } = await import('../../db/schema');
    const { eq } = await import('drizzle-orm');

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!session) {
      response.status(401).json({
        error: 'Invalid session',
        code: 'SESSION_INVALID',
      });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      response.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    // Get onboarding status
    const status = await getOnboardingStatus(user.id);

    response.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    response.status(500).json({
      error: 'An error occurred while fetching onboarding status',
      code: 'INTERNAL_ERROR',
    });
  }
}
