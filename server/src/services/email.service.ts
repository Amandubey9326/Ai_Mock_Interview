import { Resend } from 'resend';
import { config } from '../config';

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping email. Code:', code);
    return true; // Don't block registration if email isn't configured
  }

  try {
    await resend.emails.send({
      from: 'HireMind AI <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your HireMind AI account',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">🧠 HireMind AI</h2>
          <p style="color: #374151; font-size: 16px;">Your verification code is:</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. If you didn't create an account, ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping email. Token:', token);
    return true;
  }

  try {
    await resend.emails.send({
      from: 'HireMind AI <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your HireMind AI password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">🧠 HireMind AI</h2>
          <p style="color: #374151; font-size: 16px;">Your password reset token is:</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <code style="font-size: 14px; color: #4f46e5; word-break: break-all;">${token}</code>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This token expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}
