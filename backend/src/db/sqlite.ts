import Database from 'better-sqlite3';
import crypto from 'crypto';

// ============================================================================
// SQLite Database for Local Testing
// ============================================================================

const DB_PATH = process.env.DB_PATH || './data/auth.db';

let db: Database.Database | null = null;

// ============================================================================
// Initialize Database
// ============================================================================

export function initDatabase(): Database.Database {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified INTEGER NOT NULL DEFAULT 0,
      mfa_enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_signin_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_used_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      linked_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mfa_configurations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      secret TEXT NOT NULL,
      backup_codes_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event_type TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT,
      success INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_logs_ip ON auth_logs(ip_address);
  `);

  console.log(`📦 SQLite database initialized at: ${DB_PATH}`);
  return db;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

export function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// ============================================================================
// User Operations
// ============================================================================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSigninAt: Date | null;
}

export function createUser(email: string, passwordHash: string): User {
  const database = initDatabase();
  const id = generateId();
  const nowStr = now();

  database.prepare(`
    INSERT INTO users (id, email, password_hash, email_verified, mfa_enabled, created_at, updated_at)
    VALUES (?, ?, ?, 0, 0, ?, ?)
  `).run(id, email.toLowerCase(), passwordHash, nowStr, nowStr);

  return {
    id,
    email: email.toLowerCase(),
    passwordHash,
    emailVerified: false,
    mfaEnabled: false,
    createdAt: new Date(nowStr),
    updatedAt: new Date(nowStr),
    lastSigninAt: null,
  };
}

export function findUserByEmail(email: string): User | null {
  const database = initDatabase();
  const row = database.prepare(`
    SELECT * FROM users WHERE email = ?
  `).get(email.toLowerCase()) as Record<string, unknown> | undefined;

  if (!row) return null;

  return mapUserRow(row);
}

export function findUserById(id: string): User | null {
  const database = initDatabase();
  const row = database.prepare(`
    SELECT * FROM users WHERE id = ?
  `).get(id) as Record<string, unknown> | undefined;

  if (!row) return null;

  return mapUserRow(row);
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const database = initDatabase();
  const nowStr = now();

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (updates.email !== undefined) {
    setClauses.push('email = ?');
    values.push(updates.email);
  }
  if (updates.passwordHash !== undefined) {
    setClauses.push('password_hash = ?');
    values.push(updates.passwordHash);
  }
  if (updates.emailVerified !== undefined) {
    setClauses.push('email_verified = ?');
    values.push(updates.emailVerified ? 1 : 0);
  }
  if (updates.mfaEnabled !== undefined) {
    setClauses.push('mfa_enabled = ?');
    values.push(updates.mfaEnabled ? 1 : 0);
  }
  if (updates.lastSigninAt !== undefined) {
    setClauses.push('last_signin_at = ?');
    values.push(updates.lastSigninAt.toISOString());
  }

  setClauses.push('updated_at = ?');
  values.push(nowStr);
  values.push(id);

  database.prepare(`
    UPDATE users SET ${setClauses.join(', ')} WHERE id = ?
  `).run(...values);

  return findUserById(id);
}

function mapUserRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    emailVerified: (row.email_verified as number) === 1,
    mfaEnabled: (row.mfa_enabled as number) === 1,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    lastSigninAt: row.last_signin_at ? new Date(row.last_signin_at as string) : null,
  };
}

// ============================================================================
// Session Operations
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export function createSession(userId: string, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string): Session {
  const database = initDatabase();
  const id = generateId();
  const nowStr = now();

  database.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at, created_at, last_used_at, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, token, expiresAt.toISOString(), nowStr, nowStr, ipAddress || null, userAgent || null);

  return {
    id,
    userId,
    token,
    expiresAt,
    createdAt: new Date(nowStr),
    lastUsedAt: new Date(nowStr),
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  };
}

export function findSessionByToken(token: string): Session | null {
  const database = initDatabase();
  const row = database.prepare(`
    SELECT * FROM sessions WHERE token = ?
  `).get(token) as Record<string, unknown> | undefined;

  if (!row) return null;

  return mapSessionRow(row);
}

export function deleteSession(token: string): boolean {
  const database = initDatabase();
  const result = database.prepare(`
    DELETE FROM sessions WHERE token = ?
  `).run(token);

  return result.changes > 0;
}

export function deleteAllUserSessions(userId: string, keepToken?: string): number {
  const database = initDatabase();

  if (keepToken) {
    const result = database.prepare(`
      DELETE FROM sessions WHERE user_id = ? AND token != ?
    `).run(userId, keepToken);
    return result.changes;
  }

  const result = database.prepare(`
    DELETE FROM sessions WHERE user_id = ?
  `).run(userId);
  return result.changes;
}

export function updateSessionLastUsed(token: string): void {
  const database = initDatabase();
  database.prepare(`
    UPDATE sessions SET last_used_at = ? WHERE token = ?
  `).run(now(), token);
}

function mapSessionRow(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    token: row.token as string,
    expiresAt: new Date(row.expires_at as string),
    createdAt: new Date(row.created_at as string),
    lastUsedAt: new Date(row.last_used_at as string),
    ipAddress: row.ip_address as string | null,
    userAgent: row.user_agent as string | null,
  };
}

// ============================================================================
// Auth Log Operations
// ============================================================================

export interface AuthLog {
  id: string;
  userId: string | null;
  eventType: string;
  ipAddress: string;
  userAgent: string | null;
  success: boolean;
  createdAt: Date;
}

export function createAuthLog(userId: string | null, eventType: string, ipAddress: string, userAgent: string | null, success: boolean): void {
  const database = initDatabase();
  const id = generateId();

  database.prepare(`
    INSERT INTO auth_logs (id, user_id, event_type, ip_address, user_agent, success, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, eventType, ipAddress, userAgent, success ? 1 : 0, now());
}

// ============================================================================
// Verification Token Operations
// ============================================================================

export interface EmailVerificationToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  verified: boolean;
}

export function createEmailVerificationToken(userId: string, tokenHash: string, expiresAt: Date): void {
  const database = initDatabase();
  const id = generateId();

  // Invalidate existing tokens
  database.prepare(`
    DELETE FROM email_verification_tokens WHERE user_id = ?
  `).run(userId);

  database.prepare(`
    INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, verified)
    VALUES (?, ?, ?, ?, 0)
  `).run(id, userId, tokenHash, expiresAt.toISOString());
}

export function findValidEmailVerificationTokenByHash(tokenHash: string): EmailVerificationToken | null {
  const database = initDatabase();
  const row = database.prepare(`
    SELECT * FROM email_verification_tokens
    WHERE token_hash = ? AND verified = 0 AND expires_at > ?
  `).get(tokenHash, now()) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    tokenHash: row.token_hash as string,
    expiresAt: new Date(row.expires_at as string),
    verified: (row.verified as number) === 1,
  };
}

export function findValidEmailVerificationToken(userId: string, tokenHash: string): EmailVerificationToken | null {
  // For backwards compatibility
  return findValidEmailVerificationTokenByHash(tokenHash);
}

export function markEmailVerificationTokenUsed(id: string): void {
  const database = initDatabase();
  database.prepare(`
    UPDATE email_verification_tokens SET verified = 1 WHERE id = ?
  `).run(id);
}

// ============================================================================
// Password Reset Token Operations
// ============================================================================

export interface PasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
}

export function createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): void {
  const database = initDatabase();
  const id = generateId();

  // Invalidate existing tokens
  database.prepare(`
    DELETE FROM password_reset_tokens WHERE user_id = ?
  `).run(userId);

  database.prepare(`
    INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used)
    VALUES (?, ?, ?, ?, 0)
  `).run(id, userId, tokenHash, expiresAt.toISOString());
}

export function findValidPasswordResetToken(tokenHash: string): PasswordResetToken | null {
  const database = initDatabase();
  const row = database.prepare(`
    SELECT * FROM password_reset_tokens
    WHERE token_hash = ? AND used = 0 AND expires_at > ?
  `).get(tokenHash, now()) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    tokenHash: row.token_hash as string,
    expiresAt: new Date(row.expires_at as string),
    used: (row.used as number) === 1,
  };
}

export function markPasswordResetTokenUsed(id: string): void {
  const database = initDatabase();
  database.prepare(`
    UPDATE password_reset_tokens SET used = 1 WHERE id = ?
  `).run(id);
}

// ============================================================================
// User Profile Operations
// ============================================================================

export interface UserProfile {
  id: string;
  userId: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export function upsertUserProfile(userId: string, data: Record<string, unknown>): void {
  const database = initDatabase();
  const nowStr = now();
  const id = generateId();
  const dataStr = JSON.stringify(data);

  const existing = database.prepare(`
    SELECT id FROM user_profiles WHERE user_id = ?
  `).get(userId) as { id: string } | undefined;

  if (existing) {
    database.prepare(`
      UPDATE user_profiles SET data = ?, updated_at = ? WHERE user_id = ?
    `).run(dataStr, nowStr, userId);
  } else {
    database.prepare(`
      INSERT INTO user_profiles (id, user_id, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, dataStr, nowStr, nowStr);
  }
}

export function getUserProfile(userId: string): UserProfile | null {
  const database = initDatabase();
  const row = database.prepare(`
    SELECT * FROM user_profiles WHERE user_id = ?
  `).get(userId) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    data: JSON.parse(row.data as string),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

// ============================================================================
// Health Check
// ============================================================================

export function checkDatabaseHealth(): { healthy: boolean; type: string } {
  try {
    initDatabase();
    return { healthy: true, type: 'sqlite' };
  } catch (error) {
    return { healthy: false, type: 'sqlite' };
  }
}

// ============================================================================
// Close Database
// ============================================================================

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
