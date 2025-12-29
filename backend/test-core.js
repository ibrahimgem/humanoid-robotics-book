#!/usr/bin/env node
/**
 * Simple test script to verify core auth logic without database
 */

import { encrypt, decrypt, hashToken, verifyToken, generateToken } from './src/lib/encryption.js';
import { registerSchema, signinSchema } from './src/auth/schemas/user.js';
import { profileSchema } from './src/onboarding/schemas/profile.js';

console.log('🧪 Testing Authentication System\n');

// Test encryption
console.log('1. Testing Encryption Utilities');
const testText = 'Hello, World!';
const encrypted = encrypt(testText);
const decrypted = decrypt(encrypted);
console.log(`   Encrypt/Decrypt: ${testText === decrypted ? '✅ PASS' : '❌ FAIL'}`);

// Test token hashing
console.log('\n2. Testing Token Hashing');
const token = generateToken();
const hash = hashToken(token);
console.log(`   Hash consistent: ${verifyToken(token, hash) ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Wrong token rejected: ${!verifyToken('wrong-token', hash) ? '✅ PASS' : '❌ FAIL'}`);

// Test registration validation
console.log('\n3. Testing Registration Validation');
const validReg = registerSchema.safeParse({
  email: 'test@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
});
console.log(`   Valid registration: ${validReg.success ? '✅ PASS' : '❌ FAIL'}`);

const invalidReg = registerSchema.safeParse({
  email: 'invalid-email',
  password: 'weak',
  confirmPassword: 'weak',
});
console.log(`   Invalid rejected: ${!invalidReg.success ? '✅ PASS' : '❌ FAIL'}`);

// Test signin validation
console.log('\n4. Testing Signin Validation');
const validSignin = signinSchema.safeParse({
  email: 'test@example.com',
  password: 'SecurePass123',
});
console.log(`   Valid signin: ${validSignin.success ? '✅ PASS' : '❌ FAIL'}`);

// Test profile validation
console.log('\n5. Testing Profile Validation');
const validProfile = profileSchema.safeParse({
  softwareSkills: { python: 'intermediate' },
  hardwareExperience: { hasRobotExperience: true, roboticsPlatforms: ['TurtleBot'], rosExperience: 'beginner' },
  mlBackground: { mlLevel: 'beginner', hasLlmExperience: false, hasCvExperience: true },
  interests: ['robotics', 'ai'],
  learningStyle: 'hands-on',
});
console.log(`   Valid profile: ${validProfile.success ? '✅ PASS' : '❌ FAIL'}`);

const invalidProfile = profileSchema.safeParse({
  softwareSkills: {},
  hardwareExperience: { hasRobotExperience: false, roboticsPlatforms: [], rosExperience: 'none' },
  mlBackground: { mlLevel: 'none', hasLlmExperience: false, hasCvExperience: false },
  interests: [],
  learningStyle: 'mixed',
});
console.log(`   Empty profile rejected: ${!invalidProfile.success ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n✅ All core validation tests completed!');
console.log('\nNote: Database integration requires PostgreSQL connection.');
