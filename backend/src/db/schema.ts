import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Users Table
// ============================================================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastSigninAt: timestamp('last_signin_at'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ============================================================================
// Sessions Table
// ============================================================================
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// ============================================================================
// Accounts Table (OAuth linkages)
// ============================================================================
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'google' | 'github'
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'), // encrypted
  refreshToken: text('refresh_token'), // encrypted
  linkedAt: timestamp('linked_at').notNull().defaultNow(),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

// ============================================================================
// MFA Configurations Table
// ============================================================================
export const mfaConfigurations = pgTable('mfa_configurations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  secret: text('secret').notNull(), // encrypted TOTP secret
  backupCodesHash: text('backup_codes_hash').notNull(), // JSON array, hashed
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
});

export type MfaConfiguration = typeof mfaConfigurations.$inferSelect;
export type NewMfaConfiguration = typeof mfaConfigurations.$inferInsert;

// ============================================================================
// User Profiles Table (JSONB flexible storage)
// ============================================================================
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  data: jsonb('data').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

// JSONB Profile Data Structure
export interface UserProfileData {
  softwareSkills?: {
    python?: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
    javascript?: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
    cpp?: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
    [key: string]: string | undefined;
  };
  hardwareExperience?: {
    hasRobotExperience: boolean;
    roboticsPlatforms: string[];
    rosExperience: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  mlBackground?: {
    mlLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
    hasLlmExperience: boolean;
    hasCvExperience: boolean;
  };
  interests?: string[]; // 'healthtech' | 'cybersecurity' | 'ai' | 'robotics' | etc.
  learningStyle?: 'theory' | 'hands-on' | 'mixed';
  onboardingCompleted?: boolean;
  lastCompletedStep?: number;
}

// ============================================================================
// Auth Logs Table (Audit trail)
// ============================================================================
export const authLogs = pgTable('auth_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  eventType: text('event_type').notNull(), // 'signin', 'signout', 'signup', 'password_reset', 'mfa_enabled', 'mfa_disabled'
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  success: boolean('success').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type AuthLog = typeof authLogs.$inferSelect;
export type NewAuthLog = typeof authLogs.$inferInsert;

// ============================================================================
// Password Reset Tokens Table
// ============================================================================
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// ============================================================================
// Email Verification Tokens Table
// ============================================================================
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').notNull().default(false),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

// ============================================================================
// Relations
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  mfaConfigurations: many(mfaConfigurations),
  userProfiles: many(userProfiles),
  authLogs: many(authLogs),
  passwordResetTokens: many(passwordResetTokens),
  emailVerificationTokens: many(emailVerificationTokens),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const mfaConfigurationsRelations = relations(mfaConfigurations, ({ one }) => ({
  user: one(users, {
    fields: [mfaConfigurations.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const authLogsRelations = relations(authLogs, ({ one }) => ({
  user: one(users, {
    fields: [authLogs.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationTokens.userId],
    references: [users.id],
  }),
}));
