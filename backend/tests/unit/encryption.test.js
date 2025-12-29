import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, hashToken, verifyToken, generateSecureString, generateToken, generateOtp, } from '../../src/lib/encryption';
describe('Encryption Utilities', () => {
    describe('encrypt/decrypt', () => {
        it('should encrypt and decrypt text correctly', () => {
            const original = 'Hello, World!';
            const encrypted = encrypt(original);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(original);
        });
        it('should produce different ciphertext for same plaintext', () => {
            const text = 'Same text';
            const encrypted1 = encrypt(text);
            const encrypted2 = encrypt(text);
            expect(encrypted1).not.toBe(encrypted2);
        });
        it('should handle long text', () => {
            const longText = 'A'.repeat(10000);
            const encrypted = encrypt(longText);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(longText);
        });
        it('should handle special characters', () => {
            const special = '!@#$%^&*()_+-=[]{}|;\':",./<>?`~\n\t';
            const encrypted = encrypt(special);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(special);
        });
        it('should handle unicode characters', () => {
            const unicode = 'Hello 世界 🌍 Привет';
            const encrypted = encrypt(unicode);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(unicode);
        });
        it('should throw for empty text', () => {
            expect(() => encrypt('')).toThrow('Cannot encrypt empty text');
        });
        it('should throw for empty encrypted string', () => {
            expect(() => decrypt('')).toThrow('Cannot decrypt empty string');
        });
        it('should throw for tampered ciphertext', () => {
            const encrypted = encrypt('Test');
            const tampered = encrypted.slice(0, -5) + 'xxxxx';
            expect(() => decrypt(tampered)).toThrow('Decryption failed');
        });
    });
    describe('hashToken', () => {
        it('should produce consistent hash for same input', () => {
            const token = 'my-secret-token';
            const hash1 = hashToken(token);
            const hash2 = hashToken(token);
            expect(hash1).toBe(hash2);
        });
        it('should produce different hash for different inputs', () => {
            const hash1 = hashToken('token1');
            const hash2 = hashToken('token2');
            expect(hash1).not.toBe(hash2);
        });
        it('should produce 64-character hex string', () => {
            const hash = hashToken('test');
            expect(hash).toMatch(/^[0-9a-f]{64}$/);
        });
    });
    describe('verifyToken', () => {
        it('should return true for matching token', () => {
            const token = 'my-secret-token';
            const hash = hashToken(token);
            expect(verifyToken(token, hash)).toBe(true);
        });
        it('should return false for non-matching token', () => {
            const token = 'my-secret-token';
            const wrongToken = 'wrong-token';
            const hash = hashToken(token);
            expect(verifyToken(wrongToken, hash)).toBe(false);
        });
        it('should use timing-safe comparison', () => {
            const token = 'my-secret-token';
            const hash = hashToken(token);
            // Should not throw even with different length
            expect(verifyToken('short', hash)).toBe(false);
        });
    });
    describe('generateSecureString', () => {
        it('should generate string of correct length', () => {
            const result = generateSecureString(32);
            expect(result).toHaveLength(32);
        });
        it('should generate string with custom characters', () => {
            const result = generateSecureString(10, 'abc');
            expect(result).toHaveLength(10);
            expect(result).toMatch(/^[abc]+$/);
        });
        it('should generate different strings each time', () => {
            const str1 = generateSecureString(32);
            const str2 = generateSecureString(32);
            expect(str1).not.toBe(str2);
        });
    });
    describe('generateToken', () => {
        it('should generate URL-safe token', () => {
            const token = generateToken();
            expect(token).toMatch(/^[A-Za-z0-9-_]+$/);
        });
        it('should default to 32 characters', () => {
            const token = generateToken();
            expect(token).toHaveLength(32);
        });
        it('should respect custom length', () => {
            const token = generateToken(16);
            expect(token).toHaveLength(16);
        });
    });
    describe('generateOtp', () => {
        it('should generate numeric OTP', () => {
            const otp = generateOtp();
            expect(otp).toMatch(/^[0-9]{6}$/);
        });
        it('should respect custom length', () => {
            const otp = generateOtp(4);
            expect(otp).toMatch(/^[0-9]{4}$/);
        });
        it('should generate different OTPs each time', () => {
            const otp1 = generateOtp();
            const otp2 = generateOtp();
            expect(otp1).not.toBe(otp2);
        });
    });
});
//# sourceMappingURL=encryption.test.js.map