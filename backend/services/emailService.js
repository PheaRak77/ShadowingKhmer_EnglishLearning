import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send a 6-digit password reset OTP to the user's real email address.
 * Prioritizes HTTPS APIs (port 443) because Render Free Tier blocks outbound SMTP ports 465/587.
 *   1. Brevo HTTP API (BREVO_API_KEY) - Free 300 emails/day to ANY email, no custom domain needed
 *   2. Resend HTTP API (RESEND_API_KEY) - Free 3,000 emails/month
 *   3. Custom HTTPS Webhook (EMAIL_WEBHOOK_URL, e.g., Google Apps Script using your Gmail)
 *   4. Gmail SMTP (SMTP_EMAIL + SMTP_APP_PASSWORD) - Works locally & on VPS/paid servers
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

  // 1. Brevo HTTP API (Works 100% on Render Free over HTTPS port 443 in < 0.5s)
  const brevoKey = (process.env.BREVO_API_KEY || '').trim();
  if (brevoKey && !brevoKey.startsWith('your_')) {
    const senderEmail = (process.env.SMTP_EMAIL || 'yornpheareak168@gmail.com').trim();
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'ShadowingKhmer', email: senderEmail },
        to: [{ email: toEmail, name: username || toEmail }],
        subject,
        htmlContent: htmlBody,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Brevo API error: ${errText}`);
    }
    return { sent: true, provider: 'brevo' };
  }

  // 2. Resend HTTP API (Works 100% on Render Free over HTTPS port 443)
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
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API error: ${errText}`);
    }
    return { sent: true, provider: 'resend' };
  }

  // 3. Google Apps Script / Custom HTTPS Webhook
  const webhookUrl = (process.env.EMAIL_WEBHOOK_URL || '').trim();
  if (webhookUrl && webhookUrl.startsWith('https://')) {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toEmail, subject, html: htmlBody, code: otpCode }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      throw new Error(`Webhook email error: ${res.status}`);
    }
    return { sent: true, provider: 'webhook' };
  }

  // 4. Gmail SMTP (Works locally; note: Render Free blocks outbound SMTP ports 465/587)
  const smtpEmail = (process.env.SMTP_EMAIL || '').trim();
  const smtpPass = (process.env.SMTP_APP_PASSWORD || '').replace(/\s+/g, '');
  if (smtpEmail && smtpPass && !smtpPass.startsWith('your_')) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      family: 4,
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 8000,
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

  return { sent: false };
}
