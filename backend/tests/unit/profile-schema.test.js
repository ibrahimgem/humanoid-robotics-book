import { describe, it, expect } from 'vitest';
import { profileSchema, softwareSkillsSchema, hardwareExperienceSchema, mlBackgroundSchema, } from '../../src/onboarding/schemas/profile';
describe('Profile Validation Schemas', () => {
    describe('Software Skills Schema', () => {
        it('should accept valid software skills', () => {
            const result = softwareSkillsSchema.safeParse({
                python: 'intermediate',
                cpp: 'beginner',
            });
            expect(result.success).toBe(true);
        });
        it('should accept empty software skills', () => {
            const result = softwareSkillsSchema.safeParse(undefined);
            expect(result.success).toBe(true);
        });
        it('should reject invalid skill level', () => {
            const result = softwareSkillsSchema.safeParse({
                python: 'invalid-level',
            });
            expect(result.success).toBe(false);
        });
    });
    describe('Hardware Experience Schema', () => {
        it('should accept valid hardware experience', () => {
            const result = hardwareExperienceSchema.safeParse({
                hasRobotExperience: true,
                roboticsPlatforms: ['TurtleBot', 'Fetch'],
                rosExperience: 'intermediate',
            });
            expect(result.success).toBe(true);
        });
        it('should accept empty hardware experience', () => {
            const result = hardwareExperienceSchema.safeParse({});
            expect(result.success).toBe(true);
        });
    });
    describe('ML Background Schema', () => {
        it('should accept valid ML background', () => {
            const result = mlBackgroundSchema.safeParse({
                mlLevel: 'advanced',
                hasLlmExperience: true,
                hasCvExperience: false,
            });
            expect(result.success).toBe(true);
        });
        it('should accept empty ML background', () => {
            const result = mlBackgroundSchema.safeParse({});
            expect(result.success).toBe(true);
        });
    });
    describe('Full Profile Schema', () => {
        it('should accept complete valid profile', () => {
            const result = profileSchema.safeParse({
                softwareSkills: {
                    python: 'intermediate',
                    javascript: 'beginner',
                },
                hardwareExperience: {
                    hasRobotExperience: true,
                    roboticsPlatforms: ['TurtleBot'],
                    rosExperience: 'none',
                },
                mlBackground: {
                    mlLevel: 'beginner',
                    hasLlmExperience: false,
                    hasCvExperience: true,
                },
                interests: ['robotics', 'ai'],
                learningStyle: 'hands-on',
            });
            expect(result.success).toBe(true);
        });
        it('should reject profile with fewer than 3 sections', () => {
            const result = profileSchema.safeParse({
                softwareSkills: {
                    python: 'intermediate',
                },
                hardwareExperience: {
                    hasRobotExperience: false,
                    roboticsPlatforms: [],
                    rosExperience: 'none',
                },
                mlBackground: {
                    mlLevel: 'none',
                    hasLlmExperience: false,
                    hasCvExperience: false,
                },
                interests: ['robotics'], // Has 1 interest, but only 2 sections completed
                learningStyle: 'mixed',
            });
            expect(result.success).toBe(false);
            if (result.success === false) {
                // Should fail due to 3-section requirement
                const hasThreeSectionError = result.error.issues.some(issue => issue.message.includes('complete at least 3 sections'));
                expect(hasThreeSectionError).toBe(true);
            }
        });
        it('should reject empty interests', () => {
            const result = profileSchema.safeParse({
                softwareSkills: {
                    python: 'intermediate',
                },
                hardwareExperience: {
                    hasRobotExperience: true,
                    roboticsPlatforms: ['TurtleBot'],
                    rosExperience: 'beginner',
                },
                mlBackground: {
                    mlLevel: 'intermediate',
                    hasLlmExperience: true,
                    hasCvExperience: true,
                },
                interests: [],
                learningStyle: 'theory',
            });
            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error.issues[0].message).toContain('at least one interest');
            }
        });
        it('should reject more than 5 interests', () => {
            const result = profileSchema.safeParse({
                softwareSkills: {
                    python: 'intermediate',
                },
                hardwareExperience: {
                    hasRobotExperience: true,
                    roboticsPlatforms: ['TurtleBot'],
                    rosExperience: 'beginner',
                },
                mlBackground: {
                    mlLevel: 'intermediate',
                    hasLlmExperience: true,
                    hasCvExperience: true,
                },
                interests: ['robotics', 'ai', 'healthtech', 'cybersecurity', 'computer-vision', 'nlp'],
                learningStyle: 'mixed',
            });
            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error.issues[0].message).toContain('at most 5 interests');
            }
        });
        it('should accept profile with exactly 3 sections completed', () => {
            const result = profileSchema.safeParse({
                softwareSkills: {
                    python: 'intermediate',
                },
                hardwareExperience: {
                    hasRobotExperience: true, // This counts as 1
                    roboticsPlatforms: [],
                    rosExperience: 'none',
                },
                mlBackground: {
                    mlLevel: 'beginner', // This counts as 1 (not 'none')
                    hasLlmExperience: false,
                    hasCvExperience: false,
                },
                interests: ['robotics', 'ai'], // This counts as 1
                learningStyle: 'hands-on',
            });
            expect(result.success).toBe(true);
        });
    });
});
//# sourceMappingURL=profile-schema.test.js.map