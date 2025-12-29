import { Request, Response } from 'express';
import { saveStepProgress, getTotalSteps } from '../service';
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  STEPS_CONFIG,
} from '../schemas/profile';

// ============================================================================
// Onboarding Step Endpoint
// ============================================================================

export async function onboardingStepHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { stepNumber } = request.params;
    const step = parseInt(stepNumber, 10);

    if (isNaN(step) || step < 1 || step > STEPS_CONFIG.length) {
      response.status(400).json({
        error: 'Invalid step number',
        code: 'INVALID_STEP',
      });
      return;
    }

    const { data } = request.body;

    // Validate step data
    let validationResult;

    switch (step) {
      case 1:
        validationResult = validateStep1({ step, data });
        break;
      case 2:
        validationResult = validateStep2({ step, data });
        break;
      case 3:
        validationResult = validateStep3({ step, data });
        break;
      case 4:
        validationResult = validateStep4({ step, data });
        break;
      default:
        response.status(400).json({
          error: 'Invalid step number',
          code: 'INVALID_STEP',
        });
        return;
    }

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
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

    // Save step progress
    const result = await saveStepProgress(session.userId, step, data);

    response.status(200).json({
      success: true,
      nextStep: result.nextStep,
      progressPercentage: result.progressPercentage,
      stepTitle: STEPS_CONFIG[step - 1]?.title,
    });
  } catch (error) {
    console.error('Onboarding step error:', error);
    response.status(500).json({
      error: 'An error occurred while saving step progress',
      code: 'INTERNAL_ERROR',
    });
  }
}
