import { db } from '../../db';
import { users, User, NewUser } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { logSignupFailure } from '../../lib/audit';

// ============================================================================
// User Service
// ============================================================================

export interface CreateUserParams {
  email: string;
  password: string;
}

/**
 * Create a new user with hashed password
 */
export async function createUser(params: CreateUserParams): Promise<User> {
  const { email, password } = params;

  // Hash password with bcrypt (cost factor 12)
  const passwordHash = await hash(password, 12);

  // Create user
  const [user] = await db.insert(users).values({
    email: email.toLowerCase().trim(),
    passwordHash,
    emailVerified: false,
    mfaEnabled: false,
  }).returning();

  return user;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });

  return result || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  return result || null;
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  data: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User | null> {
  const [user] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return user || null;
}

/**
 * Check if email is already registered
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return user !== null;
}

/**
 * Update last signin time
 */
export async function updateLastSignin(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      lastSigninAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Update email verification status
 */
export async function verifyEmail(userId: string): Promise<boolean> {
  const [user] = await db
    .update(users)
    .set({
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return !!user;
}

/**
 * Update password
 */
export async function updatePassword(userId: string, newPassword: string): Promise<boolean> {
  const passwordHash = await hash(newPassword, 12);

  const [user] = await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return !!user;
}

/**
 * Enable MFA
 */
export async function enableMfa(userId: string): Promise<boolean> {
  const [user] = await db
    .update(users)
    .set({
      mfaEnabled: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return !!user;
}

/**
 * Disable MFA
 */
export async function disableMfa(userId: string): Promise<boolean> {
  const [user] = await db
    .update(users)
    .set({
      mfaEnabled: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return !!user;
}

/**
 * Get public user profile (without sensitive data)
 */
export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    lastSigninAt: user.lastSigninAt,
  };
}
