import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send a 6-digit password reset OTP to the user's real email address.
 * Supports:
 *   1. Gmail SMTP (SMTP_EMAIL + SMTP_APP_PASSWORD)
 *   2. Resend HTTP API (RESEND_API_KEY)
 */
export async function sendResetOtpEmail(toEmail, username, otpCode) {
  dotenv.config({ override: true });

  const subject = `${otpCode} is your ShadowingKhmer password reset code`;
  const htmlBody = `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #FAF9F6; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 22px;">Shadowing<span style="color: #2563EB;">Khmer</span></h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Password Reset Verification</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 12px; color: #334155; font-size: 14px;">Hi <strong>${username || 'Student'}</strong>,</p>
        <p style="margin: 0 0 18px; color: #475569; font-size: 14px; line-height: 1.6;">
          Use the 6-digit OTP code below to reset your password. This code will expire in <strong>15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 22px 0;">
          <span style="display: inline-block; padding: 14px 28px; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #2563EB; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
            ${otpCode}
          </span>
        </div>
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          If you didn't request this password reset, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  // Option 1: Gmail SMTP (via nodemailer)
  const smtpEmail = (process.env.SMTP_EMAIL || '').trim();
  const smtpPass = (process.env.SMTP_APP_PASSWORD || '').replace(/\s+/g, '');
  if (smtpEmail && smtpPass && !smtpPass.startsWith('your_')) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"ShadowingKhmer" <${smtpEmail}>`,
      to: toEmail,
      subject,
      html: htmlBody,
    });

    return { sent: true, provider: 'gmail' };
  }

  // Option 2: Resend HTTP API
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendKey && !resendKey.startsWith('your_')) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'ShadowingKhmer <onboarding@resend.dev>',
        to: [toEmail],
        subject,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API error: ${errText}`);
    }

    return { sent: true, provider: 'resend' };
  }

  return { sent: false };
}
