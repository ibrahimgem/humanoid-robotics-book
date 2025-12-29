import { z } from 'zod';

// ============================================================================
// Software Skills Schema
// ============================================================================

export const softwareSkillsSchema = z.object({
  python: z.enum(['none', 'beginner', 'intermediate', 'advanced', 'expert']).optional(),
  javascript: z.enum(['none', 'beginner', 'intermediate', 'advanced', 'expert']).optional(),
  cpp: z.enum(['none', 'beginner', 'intermediate', 'advanced', 'expert']).optional(),
  ros: z.enum(['none', 'beginner', 'intermediate', 'advanced', 'expert']).optional(),
  rust: z.enum(['none', 'beginner', 'intermediate', 'advanced', 'expert']).optional(),
  java: z.enum(['none', 'beginner', 'intermediate', 'advanced', 'expert']).optional(),
}).optional();

export type SoftwareSkills = z.infer<typeof softwareSkillsSchema>;

// ============================================================================
// Hardware Experience Schema
// ============================================================================

export const hardwareExperienceSchema = z.object({
  hasRobotExperience: z.boolean().default(false),
  roboticsPlatforms: z.array(z.string()).default([]),
  rosExperience: z.enum(['none', 'beginner', 'intermediate', 'advanced', 'expert']).default('none'),
  embeddedSystems: z.array(z.string()).default([]),
  sensors: z.array(z.string()).default([]),
});

export type HardwareExperience = z.infer<typeof hardwareExperienceSchema>;

// ============================================================================
// ML Background Schema
// ============================================================================

export const mlBackgroundSchema = z.object({
  mlLevel: z.enum(['none', 'beginner', 'intermediate', 'advanced', 'expert']).default('none'),
  hasLlmExperience: z.boolean().default(false),
  hasCvExperience: z.boolean().default(false),
  hasNlpcExperience: z.boolean().default(false),
  frameworks: z.array(z.string()).default([]),
});

export type MlBackground = z.infer<typeof mlBackgroundSchema>;

// ============================================================================
// Profile Schema
// ============================================================================

// Available interests
const AVAILABLE_INTERESTS = [
  'healthtech',
  'cybersecurity',
  'ai',
  'robotics',
  'computer-vision',
  'natural-language-processing',
  'reinforcement-learning',
  'industrial-automation',
  'service-robotics',
  'autonomous-vehicles',
  'humanoid-robots',
  'medical-robotics',
  'swarm-robotics',
  'ai-safety',
  'robot-ethics',
] as const;

// Learning styles
const LEARNING_STYLES = ['theory', 'hands-on', 'mixed'] as const;

export const profileSchema = z.object({
  softwareSkills: softwareSkillsSchema,
  hardwareExperience: hardwareExperienceSchema,
  mlBackground: mlBackgroundSchema,
  interests: z.array(z.enum(AVAILABLE_INTERESTS))
    .min(1, 'Select at least one interest')
    .max(5, 'Select at most 5 interests'),
  learningStyle: z.enum(LEARNING_STYLES).default('mixed'),
}).refine((data) => {
  // At least 3 responses required across all categories
  let responseCount = 0;

  // Check software skills
  if (data.softwareSkills && Object.keys(data.softwareSkills).length > 0) {
    responseCount++;
  }

  // Check hardware experience
  if (data.hardwareExperience.hasRobotExperience) {
    responseCount++;
  }

  // Check ML background
  if (data.mlBackground.mlLevel && data.mlBackground.mlLevel !== 'none') {
    responseCount++;
  }

  // Interests always count
  if (data.interests && data.interests.length > 0) {
    responseCount++;
  }

  return responseCount >= 3;
}, {
  message: 'Please complete at least 3 sections of the questionnaire',
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================================
// Step Validation Schemas
// ============================================================================

export const step1SoftwareSchema = z.object({
  step: z.literal(1),
  data: softwareSkillsSchema,
});

export const step2HardwareSchema = z.object({
  step: z.literal(2),
  data: hardwareExperienceSchema,
});

export const step3MlSchema = z.object({
  step: z.literal(3),
  data: mlBackgroundSchema,
});

export const step4InterestsSchema = z.object({
  step: z.literal(4),
  data: z.object({
    interests: z.array(z.enum(AVAILABLE_INTERESTS))
      .min(1, 'Select at least one interest')
      .max(5, 'Select at most 5 interests'),
    learningStyle: z.enum(LEARNING_STYLES).default('mixed'),
  }),
});

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateStep1(data: unknown) {
  return step1SoftwareSchema.safeParse(data);
}

export function validateStep2(data: unknown) {
  return step2HardwareSchema.safeParse(data);
}

export function validateStep3(data: unknown) {
  return step3MlSchema.safeParse(data);
}

export function validateStep4(data: unknown) {
  return step4InterestsSchema.safeParse(data);
}

// ============================================================================
// Progress Tracking
// ============================================================================

export const STEPS_CONFIG = [
  { id: 1, title: 'Programming Experience', key: 'softwareSkills' },
  { id: 2, title: 'Hardware & Robotics', key: 'hardwareExperience' },
  { id: 3, title: 'AI/ML Background', key: 'mlBackground' },
  { id: 4, title: 'Interests & Learning Style', key: 'interests' },
] as const;

export function getTotalSteps(): number {
  return STEPS_CONFIG.length;
}

export function isLastStep(step: number): boolean {
  return step === STEPS_CONFIG.length;
}

export function getNextStep(step: number): number | null {
  if (isLastStep(step)) {
    return null;
  }
  return step + 1;
}
