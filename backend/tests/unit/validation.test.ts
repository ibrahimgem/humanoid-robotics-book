import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  signinSchema,
  passwordSchema,
  validateRegisterInput,
  validateSigninInput,
} from '../../src/auth/schemas/user';

describe('Validation Schemas', () => {
  describe('Password Validation', () => {
    it('should accept valid password', () => {
      const result = passwordSchema.safeParse('SecurePass123');
      expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
      const result = passwordSchema.safeParse('weak');
      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('lowercase123');
      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('should reject password without lowercase', () => {
      const result = passwordSchema.safeParse('UPPERCASE123');
      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should reject password without number', () => {
      const result = passwordSchema.safeParse('NoNumbersHere');
      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error.issues[0].message).toContain('number');
      }
    });
  });

  describe('Registration Validation', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'invalid-email',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass456',
      });
      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });

    it('should normalize email to lowercase', () => {
      const result = registerSchema.safeParse({
        email: 'USER@EXAMPLE.COM',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      });
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('Signin Validation', () => {
    it('should accept valid signin data', () => {
      const result = signinSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass123',
      });
      expect(result.success).toBe(true);
    });

    it('should accept signin with rememberMe', () => {
      const result = signinSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass123',
        rememberMe: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBe(true);
      }
    });

    it('should reject empty email', () => {
      const result = signinSchema.safeParse({
        email: '',
        password: 'SecurePass123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateRegisterInput helper', () => {
    it('should return success for valid input', () => {
      const result = validateRegisterInput({
        email: 'user@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return errors for invalid input', () => {
      const result = validateRegisterInput({
        email: 'invalid',
        password: 'weak',
        confirmPassword: 'weak',
      });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateSigninInput helper', () => {
    it('should return success for valid input', () => {
      const result = validateSigninInput({
        email: 'user@example.com',
        password: 'SecurePass123',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return errors for invalid input', () => {
      const result = validateSigninInput({
        email: 'invalid',
        password: '',
      });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
