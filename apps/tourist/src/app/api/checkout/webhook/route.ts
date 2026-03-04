// Checkout Webhook API — Vualiku XP
// Handles payment provider webhook events
// POST /api/checkout/webhook

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payments/provider';
import { adminDb } from '@vualiku/shared/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const provider = getPaymentProvider();
        const event = await provider.parseWebhookEvent(body, request.headers);

        switch (event.type) {
            case 'payment.completed': {
                console.log(`[webhook] Payment completed for booking: ${event.bookingId}`);

                const bookingRef = adminDb.collection('allBookings').doc(event.bookingId);
                await bookingRef.update({
                    paymentStatus: 'paid',
                    paymentSessionId: event.sessionId,
                    paymentProvider: event.provider,
                    amountPaid: event.amountPaid / 100,
                    paidAt: new Date().toISOString(),
                });

                // In production, you would trigger a confirmation email here
                // await fetch(`${request.nextUrl.origin}/api/email/send-confirmation`, {
                //   method: 'POST',
                //   body: JSON.stringify({ bookingId: event.bookingId }),
                // });

                break;
            }

            case 'payment.failed': {
                console.log(`[webhook] Payment failed for booking: ${event.bookingId}`);

                const bookingRef = adminDb.collection('allBookings').doc(event.bookingId);
                await bookingRef.update({
                    paymentStatus: 'failed',
                });

                break;
            }

            case 'payment.refunded': {
                console.log(`[webhook] Payment refunded for booking: ${event.bookingId}`);

                const bookingRef = adminDb.collection('allBookings').doc(event.bookingId);
                await bookingRef.update({
                    paymentStatus: 'refunded',
                    refundedAt: new Date().toISOString(),
                });

                break;
            }

            default:
                console.log(`[webhook] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[webhook] Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 400 }
        );
    }
}
