import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import {
  initDatabase,
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  createSession,
  findSessionByToken,
  deleteSession,
  deleteAllUserSessions,
  updateSessionLastUsed,
  createAuthLog,
  createEmailVerificationToken,
  findValidEmailVerificationTokenByHash,
  markEmailVerificationTokenUsed,
  createPasswordResetToken,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
  upsertUserProfile,
  getUserProfile,
  checkDatabaseHealth,
  closeDatabase,
} from './db/sqlite.js';
import { encrypt, decrypt, hashToken, generateToken } from './lib/encryption.js';

// ============================================================================
// App Setup
// ============================================================================

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// Middleware
// ============================================================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Request logging
app.use((req: Request, _res: Response, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// Helper Functions
// ============================================================================

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get?.('x-forwarded-for');
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get?.('x-real-ip');
  if (typeof realIp === 'string') {
    return realIp.trim();
  }
  return 'unknown';
}

function extractToken(request: Request): string | null {
  const authHeader = request.headers.get?.('authorization');
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const sessionHeader = request.headers.get?.('x-session-token');
  if (typeof sessionHeader === 'string') {
    return sessionHeader;
  }
  const cookieToken = request.cookies?.humanoid_session;
  if (typeof cookieToken === 'string') {
    return cookieToken;
  }
  return null;
}

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  const health = checkDatabaseHealth();
  res.status(health.healthy ? 200 : 503).json({
    status: health.healthy ? 'healthy' : 'unhealthy',
    type: health.type,
    timestamp: new Date().toISOString(),
  });
});

// Signup
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required', code: 'VALIDATION_ERROR' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters', code: 'WEAK_PASSWORD' });
    }

    // Check if user exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      createAuthLog(undefined, 'signup_failure', getClientIp(req), req.headers.get?.('user-agent') || undefined, false);
      return res.status(400).json({ error: 'Email already registered', code: 'EMAIL_EXISTS' });
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser(email, passwordHash);

    // Create verification token
    const token = generateToken(32);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    createEmailVerificationToken(user.id, tokenHash, expiresAt);

    // Log
    createAuthLog(user.id, 'signup', getClientIp(req), req.headers.get?.('user-agent') || undefined, true);

    // Create session
    const session = createSession(user.id, generateToken(64), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), getClientIp(req));

    // Set cookie
    res.set('Set-Cookie', `humanoid_session=${session.token}; HttpOnly; Path=/; Max-Age=604800`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      verificationToken: token, // Only for testing!
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed', code: 'INTERNAL_ERROR' });
  }
});

// Verify email
app.post('/api/auth/verify-email', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token required', code: 'TOKEN_REQUIRED' });
  }

  const tokenHash = hashToken(token);
  const foundToken = findValidEmailVerificationTokenByHash(tokenHash);

  if (!foundToken) {
    return res.status(400).json({ error: 'Invalid or expired token', code: 'TOKEN_INVALID' });
  }

  // Update user
  const user = findUserById(foundToken.userId);
  if (user) {
    updateUser(user.id, { emailVerified: true });
    markEmailVerificationTokenUsed(foundToken.id);
    createAuthLog(user.id, 'email_verification', getClientIp(req), req.headers.get?.('user-agent') || undefined, true);

    res.json({ success: true, message: 'Email verified' });
  } else {
    res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
  }
});

// Signin
app.post('/api/auth/signin', async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required', code: 'VALIDATION_ERROR' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      createAuthLog(undefined, 'signin_failure', getClientIp(req), req.headers.get?.('user-agent') || undefined, false);
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    if (!user.emailVerified) {
      createAuthLog(user.id, 'signin_failure', getClientIp(req), req.headers.get?.('user-agent') || undefined, false);
      return res.status(403).json({ error: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      createAuthLog(user.id, 'signin_failure', getClientIp(req), req.headers.get?.('user-agent') || undefined, false);
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    // Create session
    const expiresAt = rememberMe
      ? new Date(Date.now() * 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = createSession(user.id, generateToken(64), expiresAt, getClientIp(req), req.headers.get?.('user-agent') || undefined);

    // Update last signin
    updateUser(user.id, { lastSigninAt: new Date() });

    // Log
    createAuthLog(user.id, 'signin', getClientIp(req), req.headers.get?.('user-agent') || undefined, true);

    // Set cookie
    const maxAge = rememberMe ? 2592000 : 604800;
    res.set('Set-Cookie', `humanoid_session=${session.token}; HttpOnly; Path=/; Max-Age=${maxAge}`);

    res.json({
      success: true,
      message: 'Signin successful',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Signin failed', code: 'INTERNAL_ERROR' });
  }
});

// Signout
app.post('/api/auth/signout', (req: Request, res: Response) => {
  const token = extractToken(req);

  if (token) {
    const session = findSessionByToken(token);
    if (session) {
      createAuthLog(session.userId, 'signout', getClientIp(req), req.headers.get?.('user-agent') || undefined, true);
      deleteSession(token);
    }
  }

  res.set('Set-Cookie', 'humanoid_session=; HttpOnly; Path=/; Max-Age=0');
  res.json({ success: true, message: 'Signed out' });
});

// Session refresh
app.post('/api/auth/session/refresh', (req: Request, res: Response) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'No session', code: 'NO_SESSION' });
  }

  const session = findSessionByToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session', code: 'SESSION_INVALID' });
  }

  if (session.expiresAt < new Date()) {
    deleteSession(token);
    return res.status(401).json({ error: 'Session expired', code: 'SESSION_EXPIRED' });
  }

  updateSessionLastUsed(token);

  const user = findUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
    },
    session: {
      expiresAt: session.expiresAt,
    },
  });
});

// Password reset request
app.post('/api/auth/password/reset', (req: Request, res: Response) => {
  const { email } = req.body;

  const user = findUserByEmail(email);
  if (user) {
    const token = generateToken(32);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    createPasswordResetToken(user.id, tokenHash, expiresAt);
    createAuthLog(user.id, 'password_reset_request', getClientIp(req), req.headers.get?.('user-agent') || undefined, true);

    res.json({
      success: true,
      message: 'Password reset email sent',
      resetToken: token, // Only for testing!
    });
  } else {
    // Don't reveal if email exists
    res.json({ success: true, message: 'If an account exists, a reset link has been sent' });
  }
});

// Password reset confirm
app.post('/api/auth/password/reset/confirm', async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password required', code: 'VALIDATION_ERROR' });
  }

  const tokenHash = hashToken(token);
  const resetToken = findValidPasswordResetToken(tokenHash);

  if (!resetToken) {
    return res.status(400).json({ error: 'Invalid or expired token', code: 'TOKEN_INVALID' });
  }

  const newPasswordHash = await bcrypt.hash(password, 12);
  updateUser(resetToken.userId, { passwordHash: newPasswordHash });
  deleteAllUserSessions(resetToken.userId);
  markPasswordResetTokenUsed(resetToken.id);
  createAuthLog(resetToken.userId, 'password_reset_success', getClientIp(req), req.headers.get?.('user-agent') || undefined, true);

  res.json({ success: true, message: 'Password reset successful' });
});

// Onboarding status
app.get('/api/onboarding/status', (req: Request, res: Response) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
  }

  const session = findSessionByToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session', code: 'SESSION_INVALID' });
  }

  const profile = getUserProfile(session.userId);
  const completed = profile?.data?.onboardingCompleted as boolean | undefined;
  const lastStep = profile?.data?.lastCompletedStep as number | undefined;

  res.json({
    success: true,
    completed: completed || false,
    currentStep: completed ? 4 : (lastStep || 0) + 1,
    totalSteps: 4,
  });
});

// Onboarding complete
app.post('/api/onboarding/complete', (req: Request, res: Response) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
  }

  const session = findSessionByToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session', code: 'SESSION_INVALID' });
  }

  const profileData = req.body;
  profileData.onboardingCompleted = true;
  profileData.lastCompletedStep = 4;

  upsertUserProfile(session.userId, profileData);

  // Generate simple recommendations
  const recommendations: Array<{ id: string; title: string; matchScore: number; reason: string }> = [];

  if (profileData.softwareSkills?.python) {
    recommendations.push({ id: 'python-ros', title: 'ROS 2 with Python', matchScore: 85, reason: 'Based on your Python skills' });
  }
  if (profileData.hardwareExperience?.hasRobotExperience) {
    recommendations.push({ id: 'robotics-intro', title: 'Introduction to Robotics', matchScore: 90, reason: 'Based on your robotics experience' });
  }
  if (profileData.interests?.includes('ai')) {
    recommendations.push({ id: 'ml-robotics', title: 'ML for Robotics', matchScore: 88, reason: 'Based on your AI interest' });
  }

  res.json({
    success: true,
    message: 'Onboarding completed',
    recommendations: recommendations.slice(0, 5),
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

// ============================================================================
// Start Server
// ============================================================================

async function startServer() {
  try {
    // Initialize database
    initDatabase();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Humanoid Robotics Book - Auth Backend (SQLite)           ║
║                                                            ║
║   Server running on: http://localhost:${PORT}                 ║
║   Database: SQLite (./data/auth.db)                        ║
║                                                            ║
║   Endpoints:                                               ║
║   - POST /api/auth/signup                                  ║
║   - POST /api/auth/verify-email                            ║
║   - POST /api/auth/signin                                  ║
║   - POST /api/auth/signout                                 ║
║   - POST /api/auth/session/refresh                         ║
║   - POST /api/auth/password/reset                          ║
║   - POST /api/auth/password/reset/confirm                  ║
║   - GET  /api/onboarding/status                            ║
║   - POST /api/onboarding/complete                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  closeDatabase();
  process.exit(0);
});

startServer();
