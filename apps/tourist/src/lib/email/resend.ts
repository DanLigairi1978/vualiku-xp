// Email System — Vualiku XP
// Sends transactional emails via Resend API

import { Resend } from 'resend';
import { adminDb } from '@vualiku/shared/server';
import { DEFAULT_TEMPLATES, parseTemplateString, TemplateKey, EmailTemplateConfig } from './templates';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error(
        'RESEND_API_KEY is not configured. Add it to .env.local to enable email notifications.'
      );
    }
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_EMAIL = 'Vualiku XP <bookings@vualiku-xp.com>';

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

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  events: Array<{
    name: string;
    operatorName: string;
    date: string;
    timeSlot: string;
    pax: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  qrCodeUrl?: string;
}

/**
 * Send booking confirmation email after successful payment
 */
export async function sendBookingConfirmation(data: BookingEmailData) {
  const eventsList = data.events
    .map(
      (e) =>
        `• ${e.name} by ${e.operatorName}\n  📅 ${e.date} at ${e.timeSlot}\n  👥 ${e.pax} guests — $${e.totalPrice}`
    )
    .join('\n\n');

  const config = await getEmailConfig('bookingConfirmation');
  const vars = {
    customerName: data.customerName,
    eventName: data.events[0]?.name || 'Your Adventure',
    bookingId: data.bookingId
  };

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: parseTemplateString(config.subject, vars),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a3a2a 0%, #0d2818 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #4ade80; font-size: 28px; margin: 0 0 8px;">${parseTemplateString(config.headline, vars)}</h1>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">${parseTemplateString(config.subheadline, vars)}</p>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; margin-bottom: 8px;">${parseTemplateString(config.greeting, vars)}</p>
          <p style="color: #9ca3af; margin-bottom: 24px; line-height: 1.6;">${parseTemplateString(config.bodyIntro, vars)}</p>

          <div style="background: #1a2e1f; border: 1px solid #2d4a35; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #4ade80; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Booking ID: ${data.bookingId}</p>
            <pre style="white-space: pre-wrap; font-family: inherit; color: #d1d5db; margin: 0; font-size: 14px; line-height: 1.8;">${eventsList}</pre>
          </div>

          <div style="background: #1a2e1f; border: 1px solid #2d4a35; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Total Paid</p>
            <p style="color: #4ade80; font-size: 32px; font-weight: bold; margin: 0;">$${data.totalAmount.toFixed(2)}</p>
          </div>

          ${data.qrCodeUrl ? `
          <div style="text-align: center; margin-bottom: 24px;">
            <p style="color: #9ca3af; font-size: 14px; margin-bottom: 12px;">Show this QR code at check-in:</p>
            <img src="${data.qrCodeUrl}" alt="Check-in QR Code" style="width: 200px; height: 200px; border-radius: 12px; border: 2px solid #2d4a35;" />
          </div>
          ` : ''}

          <div style="text-align: center; padding: 20px 0;">
            <a href="https://vualiku-xp.web.app/checkout" style="background: #4ade80; color: #0a1a0f; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">${config.callToAction || 'View Your Booking'}</a>
          </div>

          <hr style="border: none; border-top: 1px solid #2d4a35; margin: 24px 0;" />

          <p style="color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
            ${parseTemplateString(config.footerText || "Vinaka vakalevu — Vualiku XP Team 🌿", vars)}
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Failed to send booking confirmation:', error);
    // H8: Handle Resend daily limit gracefully
    if (error.message?.toLowerCase().includes('limit') || error.message?.toLowerCase().includes('quota') || error.message?.includes('429')) {
      console.warn('[email] Resend daily limit reached. Email skipped gracefully.');
      return;
    }
    throw error;
  }
}

/**
 * Send 24-hour pre-trip reminder email
 */
export async function sendTripReminder(data: BookingEmailData & { meetupLocation?: string }) {
  const config = await getEmailConfig('tripReminder');
  const vars = {
    customerName: data.customerName,
    eventName: data.events[0]?.name || 'Your Adventure',
    bookingId: data.bookingId
  };

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: parseTemplateString(config.subject, vars),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a3a2a 0%, #0d2818 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #4ade80; font-size: 28px; margin: 0 0 8px;">${parseTemplateString(config.headline, vars)}</h1>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">${parseTemplateString(config.subheadline, vars)}</p>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">${parseTemplateString(config.greeting, vars)}</p>
          <p style="color: #9ca3af; line-height: 1.6;">${parseTemplateString(config.bodyIntro, vars)}</p>

          <div style="background: #1a2e1f; border: 1px solid #2d4a35; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="color: #4ade80; font-weight: bold; margin: 0 0 8px;">${data.events[0]?.name}</p>
            <p style="color: #d1d5db; margin: 0;">📅 ${data.events[0]?.date} at ${data.events[0]?.timeSlot}</p>
            <p style="color: #d1d5db; margin: 0;">👥 ${data.events[0]?.pax} guests</p>
            ${data.meetupLocation ? `<p style="color: #d1d5db; margin: 8px 0 0;">📍 Meet at: <strong>${data.meetupLocation}</strong></p>` : ''}
          </div>

          <div style="background: #1a2e1f; border: 1px solid #2d4a35; border-radius: 12px; padding: 16px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 4px;">Don't forget to bring:</p>
            <p style="color: #d1d5db; margin: 0;">🧴 Sunscreen · 💧 Water Bottle · 📱 Charged Phone · 🩴 Comfortable Shoes</p>
          </div>

          <hr style="border: none; border-top: 1px solid #2d4a35; margin: 24px 0;" />

          <p style="color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
            ${parseTemplateString(config.footerText || "Vinaka vakalevu — Vualiku XP Team 🌿", vars)}
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Failed to send trip reminder:', error);
    // H8: Handle Resend daily limit gracefully
    if (error.message?.toLowerCase().includes('limit') || error.message?.toLowerCase().includes('quota') || error.message?.includes('429')) {
      console.warn('[email] Resend daily limit reached. Email skipped gracefully.');
      return;
    }
    throw error;
  }
}

/**
 * Send post-trip review request email (2 days after trip)
 */
export async function sendReviewRequest(data: {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  eventName: string;
  operatorName: string;
}) {
  const reviewUrl = `https://vualiku-xp.web.app/review/${data.bookingId}`;

  const config = await getEmailConfig('reviewRequest');
  const vars = {
    customerName: data.customerName,
    eventName: data.eventName,
    operatorName: data.operatorName,
    bookingId: data.bookingId
  };

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: parseTemplateString(config.subject, vars),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a3a2a 0%, #0d2818 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #4ade80; font-size: 28px; margin: 0 0 8px;">${parseTemplateString(config.headline, vars)}</h1>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">${parseTemplateString(config.subheadline, vars)}</p>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">${parseTemplateString(config.greeting, vars)}</p>
          <p style="color: #9ca3af; line-height: 1.6;">${parseTemplateString(config.bodyIntro, vars)}</p>

          <div style="text-align: center; padding: 24px 0;">
            <a href="${reviewUrl}" style="background: #4ade80; color: #0a1a0f; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">${config.callToAction || 'Leave a Review ⭐'}</a>
          </div>

          <p style="color: #6b7280; font-size: 13px; text-align: center;">It only takes 2 minutes and makes a real difference for the local community.</p>

          <hr style="border: none; border-top: 1px solid #2d4a35; margin: 24px 0;" />

          <p style="color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
            ${parseTemplateString(config.footerText || "Vinaka vakalevu — Vualiku XP Team 🌿", vars)}
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Failed to send review request:', error);
    // H8: Handle Resend daily limit gracefully
    if (error.message?.toLowerCase().includes('limit') || error.message?.toLowerCase().includes('quota') || error.message?.includes('429')) {
      console.warn('[email] Resend daily limit reached. Email skipped gracefully.');
      return;
    }
    throw error;
  }
}

/**
 * Send booking cancellation email
 */
export async function sendCancellationEmail(data: {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  eventName: string;
  refundAmount?: number;
}) {
  const config = await getEmailConfig('bookingCancellation');
  const vars = {
    customerName: data.customerName,
    eventName: data.eventName,
    bookingId: data.bookingId
  };

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: parseTemplateString(config.subject, vars),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3a1a1a 0%, #280d0d 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #f87171; font-size: 28px; margin: 0 0 8px;">${parseTemplateString(config.headline, vars)}</h1>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">${parseTemplateString(config.subheadline, vars)}</p>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">${parseTemplateString(config.greeting, vars)}</p>
          <p style="color: #9ca3af; line-height: 1.6;">${parseTemplateString(config.bodyIntro, vars)}</p>

          ${data.refundAmount ? `
          <div style="background: #1a2e1f; border: 1px solid #2d4a35; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Refund Amount</p>
            <p style="color: #4ade80; font-size: 28px; font-weight: bold; margin: 0;">$${data.refundAmount.toFixed(2)}</p>
            <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0;">Refund will appear in 5-10 business days</p>
          </div>
          ` : ''}

          <div style="text-align: center; padding: 20px 0;">
            <a href="https://vualiku-xp.web.app/directory" style="background: #4ade80; color: #0a1a0f; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">${config.callToAction || 'Browse More Adventures'}</a>
          </div>

          <hr style="border: none; border-top: 1px solid #2d4a35; margin: 24px 0;" />

          <p style="color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
            ${parseTemplateString(config.footerText || "Vinaka vakalevu — Vualiku XP Team 🌿", vars)}
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Failed to send cancellation email:', error);
    // H8: Handle Resend daily limit gracefully
    if (error.message?.toLowerCase().includes('limit') || error.message?.toLowerCase().includes('quota') || error.message?.includes('429')) {
      console.warn('[email] Resend daily limit reached. Email skipped gracefully.');
      return;
    }
    throw error;
  }
}

/**
 * Send signed waiver email with PDF attachment
 */
export async function sendWaiverEmail(data: {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  pdfBuffer: Buffer;
}) {
  const config = await getEmailConfig('waiverSigned');
  const vars = {
    customerName: data.customerName,
    bookingId: data.bookingId
  };

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: parseTemplateString(config.subject, vars),
    attachments: [
      {
        filename: `Vualiku-XP-Waiver-${data.bookingId}.pdf`,
        content: data.pdfBuffer,
      },
    ],
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #e0e0e0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a3a2a 0%, #0d2818 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #4ade80; font-size: 28px; margin: 0 0 8px;">${parseTemplateString(config.headline, vars)}</h1>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">${parseTemplateString(config.subheadline, vars)}</p>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">${parseTemplateString(config.greeting, vars)}</p>
          <p style="color: #9ca3af; line-height: 1.6;">${parseTemplateString(config.bodyIntro, vars)}</p>

          <div style="background: #1a2e1f; border: 1px solid #2d4a35; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
             <p style="color: #4ade80; font-weight: bold; margin: 0;">Activity Waiver Attached</p>
             <p style="color: #9ca3af; font-size: 12px; margin-top: 4px;">Booking ID: ${data.bookingId}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #2d4a35; margin: 24px 0;" />

          <p style="color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
            ${parseTemplateString(config.footerText, vars)}
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Failed to send waiver email:', error);
    if (error.message?.toLowerCase().includes('limit') || error.message?.toLowerCase().includes('quota') || error.message?.includes('429')) {
      console.warn('[email] Resend daily limit reached. Email skipped gracefully.');
      return;
    }
    throw error;
  }
}
