// WhatsApp Notifications via Twilio — Vualiku XP
// Sends templated WhatsApp messages for booking lifecycle events
// Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER

let _twilioClient: unknown = null;

function getTwilioClient() {
    if (!_twilioClient) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (!accountSid || !authToken) {
            throw new Error(
                'Twilio credentials not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env.local'
            );
        }

        // Dynamic require to avoid bundling when not used
        const twilio = require('twilio');
        _twilioClient = twilio(accountSid, authToken);
    }
    return _twilioClient as {
        messages: {
            create: (params: {
                from: string;
                to: string;
                body: string;
            }) => Promise<{ sid: string; status: string }>;
        };
    };
}

const WHATSAPP_FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`;

/**
 * Send a WhatsApp message to a customer
 */
async function sendWhatsApp(to: string, body: string): Promise<{ sid: string; status: string }> {
    if (process.env.WHATSAPP_ENABLED !== 'true') {
        console.log('[whatsapp] WHATSAPP_ENABLED is not true — skipping message');
        return { sid: 'skipped', status: 'skipped' };
    }

    const client = getTwilioClient();
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const message = await client.messages.create({
        from: WHATSAPP_FROM,
        to: formattedTo,
        body,
    });

    console.log(`[whatsapp] Sent to ${to}: ${message.sid} (${message.status})`);
    return { sid: message.sid, status: message.status };
}

// ─── Notification Templates ──────────────────────────────────────

/**
 * 📦 Booking Confirmed — sent after successful payment
 */
export async function sendBookingConfirmedWhatsApp(data: {
    phone: string;
    customerName: string;
    eventName: string;
    date: string;
    timeSlot: string;
    pax: number;
    bookingId: string;
    totalAmount: number;
}) {
    const body =
        `🌿 *Booking Confirmed — Vualiku XP*\n\n` +
        `Bula, ${data.customerName}! Your adventure is booked! ✓\n\n` +
        `📍 *${data.eventName}*\n` +
        `📅 ${data.date} at ${data.timeSlot}\n` +
        `👥 ${data.pax} guest${data.pax > 1 ? 's' : ''}\n` +
        `💰 FJD $${data.totalAmount.toFixed(2)}\n\n` +
        `🎫 Booking ID: ${data.bookingId}\n\n` +
        `Show your QR code at check-in. Vinaka vakalevu! 🌺`;

    return sendWhatsApp(data.phone, body);
}

/**
 * ⏰ 24-Hour Reminder — sent day before activity
 */
export async function sendReminderWhatsApp(data: {
    phone: string;
    customerName: string;
    eventName: string;
    date: string;
    timeSlot: string;
    meetupLocation?: string;
}) {
    const body =
        `⏰ *Reminder — Your Adventure is Tomorrow!*\n\n` +
        `Bula, ${data.customerName}!\n\n` +
        `📍 *${data.eventName}*\n` +
        `📅 ${data.date} at ${data.timeSlot}\n` +
        `${data.meetupLocation ? `🗺️ Meet at: ${data.meetupLocation}\n` : ''}` +
        `\n🎒 Don't forget:\n` +
        `• Sunscreen 🧴\n` +
        `• Water bottle 💧\n` +
        `• Comfortable shoes 🩴\n` +
        `• Charged phone 📱\n\n` +
        `See you tomorrow! 🌿`;

    return sendWhatsApp(data.phone, body);
}

/**
 * ❌ Booking Cancelled — sent after cancellation
 */
export async function sendCancellationWhatsApp(data: {
    phone: string;
    customerName: string;
    eventName: string;
    bookingId: string;
    refundAmount?: number;
}) {
    const refundLine = data.refundAmount
        ? `\n💸 Refund of FJD $${data.refundAmount.toFixed(2)} is being processed (5-10 business days).`
        : '';

    const body =
        `❌ *Booking Cancelled — Vualiku XP*\n\n` +
        `Bula, ${data.customerName}.\n\n` +
        `Your booking for *${data.eventName}* (${data.bookingId}) has been cancelled.${refundLine}\n\n` +
        `We hope to see you on a future adventure! 🌿\n` +
        `Browse more: vualiku-xp.web.app/directory`;

    return sendWhatsApp(data.phone, body);
}

/**
 * ⭐ Review Request — sent 2 days after trip
 */
export async function sendReviewRequestWhatsApp(data: {
    phone: string;
    customerName: string;
    eventName: string;
    bookingId: string;
}) {
    const body =
        `⭐ *How Was Your Adventure?*\n\n` +
        `Bula, ${data.customerName}!\n\n` +
        `We hope you loved *${data.eventName}*! 🌺\n\n` +
        `Your review helps the local community and future travellers. It only takes 2 minutes:\n\n` +
        `👉 vualiku-xp.web.app/review/${data.bookingId}\n\n` +
        `Vinaka vakalevu! 🌿`;

    return sendWhatsApp(data.phone, body);
}
