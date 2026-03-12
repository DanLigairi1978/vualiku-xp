// Operator Welcome Email Template — Vualiku XP
// Sent when an operator application is approved
import { adminDb } from '@danligairi1978/shared/server';
import { DEFAULT_TEMPLATES, parseTemplateString, TemplateKey, EmailTemplateConfig } from './templates';

export interface WelcomeEmailData {
  businessName: string;
  contactName: string;
  email: string;
  loginUrl?: string;
}

/**
 * Get the lazy-initialized Resend client
 */
function getResendClient() {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  // Lazy import to avoid build errors when Resend isn't configured
  const { Resend } = require('resend');
  return new Resend(RESEND_API_KEY);
}

async function getEmailConfig(key: TemplateKey): Promise<EmailTemplateConfig> {
  try {
    const docSnap = await adminDb.collection('platformConfig').doc('emailTemplates').get();
    if (docSnap.exists) {
      const data = docSnap.data() || {};
      return data[key] || DEFAULT_TEMPLATES[key];
    }
  } catch (err) {
    console.error(`[email] Failed to fetch email template config for ${key}`, err);
  }
  return DEFAULT_TEMPLATES[key];
}

export async function sendOperatorWelcomeEmail(data: WelcomeEmailData) {
  const resend = getResendClient();
  const loginUrl = data.loginUrl || 'https://vualiku-xp.web.app/operator/login';

  const config = await getEmailConfig('operatorWelcome');
  const vars = {
    operatorName: data.contactName,
    businessName: data.businessName
  };

  await resend.emails.send({
    from: 'Vualiku XP <onboarding@resend.dev>',
    to: data.email,
    subject: parseTemplateString(config.subject, vars),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a1a0f; color: #e0e0e0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .header { text-align: center; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo { font-size: 28px; font-weight: 800; color: #22c55e; letter-spacing: -0.5px; }
    .badge { display: inline-block; background: rgba(34,197,94,0.15); color: #22c55e; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
    .content { padding: 32px 0; }
    h1 { color: #ffffff; font-size: 24px; margin: 0 0 16px; }
    p { color: #a0a0a0; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .highlight { color: #22c55e; font-weight: 600; }
    .steps { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; margin: 24px 0; }
    .step { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; }
    .step-num { background: rgba(34,197,94,0.2); color: #22c55e; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .step-text { font-size: 14px; color: #c0c0c0; }
    .cta { display: block; text-align: center; background: #22c55e; color: #0a1a0f; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none; margin: 32px 0; }
    .footer { text-align: center; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #606060; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Vualiku XP</div>
      <div class="badge">🌿 Approved Operator</div>
      <h2 style="color: #4ade80; font-size: 22px; margin-top: 16px; margin-bottom: 4px;">${parseTemplateString(config.headline, vars)}</h2>
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">${parseTemplateString(config.subheadline, vars)}</p>
    </div>
    <div class="content">
      <h1>${parseTemplateString(config.greeting, vars)}</h1>
      <p>${parseTemplateString(config.bodyIntro, vars)}</p>

      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text"><strong>Log into your dashboard</strong> to manage bookings and view customer details.</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text"><strong>Set up your activities</strong> — add descriptions, photos, and pricing for each experience.</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text"><strong>Start receiving bookings</strong> — your listing is now live on the platform.</div>
        </div>
      </div>

      <a href="${loginUrl}" class="cta">${parseTemplateString(config.callToAction || 'Access Your Dashboard →', vars)}</a>

      <p>If you have any questions, reply to this email or reach out to our team. We're here to help you succeed!</p>
      <p style="color: #22c55e; font-weight: 600;">— The Vualiku XP Team</p>
    </div>
    <div class="footer">
      <p>${parseTemplateString(config.footerText || "Vualiku XP — Community-led Eco-Tourism Platform\\nVanua Levu, Fiji 🇫🇯", vars)}</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}
