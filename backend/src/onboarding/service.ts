import { db } from '../db';
import { userProfiles, UserProfileData } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateRecommendations, RecommendationsResult } from './recommendations';

// ============================================================================
// Profile Service
// ============================================================================

export interface SaveProfileParams {
  userId: string;
  data: Partial<UserProfileData>;
  completed?: boolean;
}

export interface GetProfileResult {
  exists: boolean;
  profile?: UserProfileData;
  onboardingCompleted: boolean;
  lastCompletedStep?: number;
}

/**
 * Save or update user profile
 */
export async function saveProfile(params: SaveProfileParams): Promise<void> {
  const { userId, data, completed = false } = params;

  // Get existing profile
  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  // Merge data
  const existingData = (existing?.data as UserProfileData) || {};
  const mergedData: UserProfileData = {
    ...existingData,
    ...data,
    onboardingCompleted: completed || existingData.onboardingCompleted || false,
    lastCompletedStep: data.lastCompletedStep || existingData.lastCompletedStep,
  };

  if (existing) {
    // Update existing profile
    await db
      .update(userProfiles)
      .set({
        data: mergedData as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, existing.id));
  } else {
    // Create new profile
    await db.insert(userProfiles).values({
      userId,
      data: mergedData as Record<string, unknown>,
    });
  }
}

/**
 * Get user profile
 */
export async function getProfile(userId: string): Promise<GetProfileResult> {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  if (!profile) {
    return {
      exists: false,
      profile: undefined,
      onboardingCompleted: false,
    };
  }

  const data = profile.data as UserProfileData;

  return {
    exists: true,
    profile: data,
    onboardingCompleted: data.onboardingCompleted || false,
    lastCompletedStep: data.lastCompletedStep,
  };
}

/**
 * Get onboarding status
 */
export async function getOnboardingStatus(userId: string): Promise<{
  completed: boolean;
  currentStep: number;
  totalSteps: number;
  lastCompletedAt?: Date;
}> {
  const profile = await getProfile(userId);
  const totalSteps = 4; // Fixed at 4 steps

  if (!profile.exists || !profile.profile) {
    return {
      completed: false,
      currentStep: 1,
      totalSteps,
    };
  }

  const lastCompletedStep = profile.profile.lastCompletedStep || 0;

  return {
    completed: profile.onboardingCompleted,
    currentStep: profile.onboardingCompleted ? totalSteps : lastCompletedStep + 1,
    totalSteps,
  };
}

/**
 * Complete onboarding with full profile
 */
export async function completeOnboarding(
  userId: string,
  data: UserProfileData
): Promise<{
  success: boolean;
  recommendations?: RecommendationsResult[];
}> {
  // Save the complete profile
  await saveProfile({
    userId,
    data: {
      ...data,
      onboardingCompleted: true,
      lastCompletedStep: 4,
    },
    completed: true,
  });

  // Generate recommendations
  const recommendations = generateRecommendations(data);

  return {
    success: true,
    recommendations,
  };
}

/**
 * Save step progress
 */
export async function saveStepProgress(
  userId: string,
  step: number,
  stepData: Record<string, unknown>
): Promise<{
  success: boolean;
  nextStep?: number;
  progressPercentage: number;
}> {
  const totalSteps = 4;
  const progressPercentage = Math.round((step / totalSteps) * 100);

  // Map step to profile key
  const stepKeys: Record<number, keyof UserProfileData> = {
    1: 'softwareSkills',
    2: 'hardwareExperience',
    3: 'mlBackground',
    4: 'interests',
  };

  const key = stepKeys[step];
  if (!key) {
    return { success: false, progressPercentage };
  }

  await saveProfile({
    userId,
    data: {
      [key]: stepData,
      lastCompletedStep: step,
    },
  });

  const nextStep = step < totalSteps ? step + 1 : null;

  return {
    success: true,
    nextStep,
    progressPercentage: Math.round(((step + (nextStep ? 0 : 1)) / totalSteps) * 100),
  };
}

/**
 * Update profile recommendations
 */
export async function refreshRecommendations(userId: string): Promise<RecommendationsResult[]> {
  const profile = await getProfile(userId);

  if (!profile.profile) {
    return [];
  }

  return generateRecommendations(profile.profile);
}
