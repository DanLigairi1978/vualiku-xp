import { NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/lib/whatsapp/bot-logic';
import twilio from 'twilio';

// Meta / Twilio Webhook for incoming WhatsApp messages
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const body = formData.get('Body') as string;
        const from = formData.get('From') as string;
        const accountSid = formData.get('AccountSid') as string;

        // Verify Twilio Signature
        const signature = req.headers.get('x-twilio-signature') || '';
        const authToken = process.env.TWILIO_AUTH_TOKEN || '';
        const url = req.url;
        const params = Object.fromEntries(formData.entries());

        if (process.env.NODE_ENV === 'production' && !twilio.validateRequest(authToken, signature, url, params)) {
            console.warn('[whatsapp-webhook] Invalid Twilio signature attempt');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Basic verification (optional: check accountSid against env)
        if (!body || !from) {
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        console.log(`[whatsapp-webhook] Received message from ${from}: ${body}`);

        // Process message through bot logic
        const responseText = await handleWhatsAppMessage(from, body);

        // Twilio expects TwiML XML response for direct reply
        // But for consistency and flexibility, we can also use the Twilio SDK to send
        // However, the simplest way is to return TwiML
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${responseText}</Message>
</Response>`;

        return new Response(twiml, {
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error) {
        console.error('[whatsapp-webhook] Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// GET for initial Twilio Webhook verification if needed
export async function GET() {
    return new Response('WhatsApp Webhook Active', { status: 200 });
}
