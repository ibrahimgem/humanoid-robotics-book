import { Request, Response } from 'express';
import { completeOnboarding } from '../service';
import { profileSchema } from '../schemas/profile';

// ============================================================================
// Onboarding Complete Endpoint
// ============================================================================

export async function onboardingCompleteHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    // Validate input
    const parseResult = profileSchema.safeParse(request.body);

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

    // Get user ID from session
    const authHeader = request.headers.get?.('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      response.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const { db } = await import('../../db');
    const { sessions } = await import('../../db/schema');
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

    // Complete onboarding
    const result = await completeOnboarding(session.userId, parseResult.data);

    if (!result.success) {
      response.status(500).json({
        error: 'Failed to complete onboarding',
        code: 'ONBOARDING_FAILED',
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    response.status(500).json({
      error: 'An error occurred while completing onboarding',
      code: 'INTERNAL_ERROR',
    });
  }
}
