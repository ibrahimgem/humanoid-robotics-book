import crypto from 'crypto';

// ============================================================================
// AES-256-GCM Encryption Utilities
// ============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Test key for unit testing (not used in production)
const TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

/**
 * Get encryption key from environment or derive from secret
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || TEST_KEY;

  // If key is exactly 32 bytes (64 hex chars), use directly
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }

  // Otherwise, derive a key using SHA-256
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param text - Plaintext to encrypt
 * @returns - Base64 encoded encrypted string (iv:authTag:ciphertext)
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty text');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Combine IV + AuthTag + Encrypted data
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64'),
  ]);

  return combined.toString('base64');
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param encrypted - Base64 encoded encrypted string
 * @returns - Decrypted plaintext
 */
export function decrypt(encrypted: string): string {
  if (!encrypted) {
    throw new Error('Cannot decrypt empty string');
  }

  const key = getEncryptionKey();

  try {
    const combined = Buffer.from(encrypted, 'base64');

    // Extract IV, AuthTag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedData = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: invalid or tampered data');
  }
}

// ============================================================================
// Hash Token Utility (for storage)
// ============================================================================

/**
 * Hash a token for secure storage using SHA-256
 * @param token - Plaintext token
 * @returns - SHA-256 hash
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against its hash
 * @param token - Plaintext token to verify
 * @param hash - Stored hash to compare against
 * @returns - True if token matches hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const computedHash = hashToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(hash)
  );
}

// ============================================================================
// Secure Random String Generator
// ============================================================================

/**
 * Generate a cryptographically secure random string
 * @param length - Length of the string
 * @param characters - Character set to use
 * @returns - Random string
 */
export function generateSecureString(
  length: number = 32,
  characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  const randomValues = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters[randomValues[i] % characters.length];
  }

  return result;
}

/**
 * Generate a secure URL-safe token
 * @param length - Length of the token (default 32)
 * @returns - URL-safe token
 */
export function generateToken(length: number = 32): string {
  return generateSecureString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_');
}

/**
 * Generate numeric OTP code
 * @param length - Length of the OTP (default 6)
 * @returns - Numeric OTP string
 */
export function generateOtp(length: number = 6): string {
  const randomValues = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += (randomValues[i] % 10).toString();
  }

  return result;
}
