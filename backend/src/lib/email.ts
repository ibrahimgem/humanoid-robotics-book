import nodemailer from 'nodemailer';
import { generateToken } from './encryption';

// ============================================================================
// Email Transporter Configuration
// ============================================================================

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function getEmailConfig(): EmailConfig {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.EMAIL_FROM || 'noreply@example.com';

  if (!host || !user || !pass) {
    throw new Error('Email configuration is incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.');
  }

  return { host, port, secure, user, pass, from };
}

// Create transporter (lazy initialization)
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const config = getEmailConfig();
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }
  return transporter;
}

// ============================================================================
// Email Templates
// ============================================================================

interface VerificationEmailData {
  email: string;
  token: string;
}

interface PasswordResetEmailData {
  email: string;
  token: string;
  expiresIn: string;
}

interface SecurityAlertData {
  email: string;
  event: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(data: VerificationEmailData): Promise<void> {
  const config = getEmailConfig();
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${data.token}`;

  await getTransporter().sendMail({
    from: config.from,
    to: data.email,
    subject: 'Verify your email address - Humanoid Robotics Book',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .button:hover { background: #5a6fd6; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Humanoid Robotics Book</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thanks for signing up! To get started, please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verifyUrl}</p>
              <p><strong>This verification link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Humanoid Robotics Book - Your Guide to Robotics Development</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Humanoid Robotics Book

Hi there,

Thanks for signing up! To get started, please verify your email address by visiting:

${verifyUrl}

This verification link will expire in 24 hours.

If you didn't create an account with us, please ignore this email.

- Humanoid Robotics Book Team
    `.trim(),
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const config = getEmailConfig();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${data.token}`;

  await getTransporter().sendMail({
    from: config.from,
    to: data.email,
    subject: 'Password Reset Request - Humanoid Robotics Book',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .button:hover { background: #e04a5a; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 12px; margin: 15px 0; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
              <div class="warning">
                <strong>Security Notice:</strong>
                <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                  <li>This link will expire in ${data.expiresIn}</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>Humanoid Robotics Book - Your Guide to Robotics Development</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Password Reset Request - Humanoid Robotics Book

Hi there,

We received a request to reset your password. Visit the link below to create a new password:

${resetUrl}

This link will expire in ${data.expiresIn}.

Security Notice:
- If you didn't request this, please ignore this email
- Never share this link with anyone

- Humanoid Robotics Book Team
    `.trim(),
  });
}

/**
 * Send security alert email
 */
export async function sendSecurityAlertEmail(data: SecurityAlertData): Promise<void> {
  const config = getEmailConfig();

  const eventDescriptions: Record<string, string> = {
    password_changed: 'Your password was successfully changed',
    mfa_enabled: 'Multi-factor authentication was enabled on your account',
    mfa_disabled: 'Multi-factor authentication was disabled on your account',
    new_device: 'A new device signed in to your account',
    account_deleted: 'Your account deletion was processed',
  };

  const description = eventDescriptions[data.event] || `Event: ${data.event}`;

  await getTransporter().sendMail({
    from: config.from,
    to: data.email,
    subject: 'Security Alert - Humanoid Robotics Book',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert-box { background: #e8f5e9; border: 1px solid #4caf50; border-radius: 4px; padding: 15px; margin: 15px 0; }
            .info-row { margin: 8px 0; }
            .label { font-weight: 600; color: #555; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Security Alert</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <div class="alert-box">
                <p style="margin: 0;"><strong>${description}</strong></p>
              </div>
              <div class="info-row">
                <span class="label">Time:</span> ${data.timestamp.toLocaleString()}
              </div>
              ${data.ipAddress ? `
              <div class="info-row">
                <span class="label">IP Address:</span> ${data.ipAddress}
              </div>
              ` : ''}
              ${data.userAgent ? `
              <div class="info-row">
                <span class="label">Device:</span> ${data.userAgent.substring(0, 100)}
              </div>
              ` : ''}
              <p style="margin-top: 20px;">If this was you, no action is needed.</p>
              <p>If you don't recognize this activity, please:</p>
              <ul>
                <li>Change your password immediately</li>
                <li>Enable multi-factor authentication if not already enabled</li>
                <li>Contact our support team</li>
              </ul>
            </div>
            <div class="footer">
              <p>Humanoid Robotics Book - Your Guide to Robotics Development</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Security Alert - Humanoid Robotics Book

Hi there,

${description}

Time: ${data.timestamp.toLocaleString()}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ''}
${data.userAgent ? `Device: ${data.userAgent.substring(0, 100)}` : ''}

If this was you, no action is needed.

If you don't recognize this activity, please:
- Change your password immediately
- Enable multi-factor authentication if not already enabled
- Contact our support team

- Humanoid Robotics Book Team
    `.trim(),
  });
}

/**
 * Generate verification token and data
 */
export function generateVerificationTokenData(email: string) {
  const plainToken = generateToken(32);
  return {
    email,
    token: plainToken,
    expiresIn: '24 hours',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

/**
 * Generate password reset token data
 */
export function generatePasswordResetTokenData(email: string) {
  const plainToken = generateToken(32);
  return {
    email,
    token: plainToken,
    expiresIn: '1 hour',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  };
}

/**
 * Verify email transporter configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
}
