// Operator Welcome Email Template — Vualiku XP
// Sent when an operator application is approved
interface WelcomeEmailData {
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

export async function sendOperatorWelcomeEmail(data: WelcomeEmailData) {
    const resend = getResendClient();
    const loginUrl = data.loginUrl || 'https://vualiku-xp.web.app/operator/login';

    await resend.emails.send({
        from: 'Vualiku XP <onboarding@resend.dev>',
        to: data.email,
        subject: `Welcome to Vualiku XP, ${data.businessName}! 🌿`,
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
    </div>
    <div class="content">
      <h1>Bula ${data.contactName}! 🎉</h1>
      <p>Great news — your operator application for <span class="highlight">${data.businessName}</span> has been <span class="highlight">approved</span>.</p>
      <p>You're now part of the Vualiku XP eco-tourism network, connecting authentic Fijian experiences with travellers from around the world.</p>

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

      <a href="${loginUrl}" class="cta">Access Your Dashboard →</a>

      <p>If you have any questions, reply to this email or reach out to our team. We're here to help you succeed!</p>
      <p style="color: #22c55e; font-weight: 600;">— The Vualiku XP Team</p>
    </div>
    <div class="footer">
      <p>Vualiku XP — Community-led Eco-Tourism Platform</p>
      <p>Vanua Levu, Fiji 🇫🇯</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    });
}
