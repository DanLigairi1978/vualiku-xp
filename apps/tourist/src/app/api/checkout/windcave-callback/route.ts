// Windcave Callback Route — Vualiku XP
// Handles redirection from Windcave and verifies payment status
// GET /api/checkout/windcave-callback?result=...

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payments/provider';
import { adminDb } from '@danligairi1978/shared/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const result = searchParams.get('result');

    if (!result) {
        return NextResponse.redirect(new URL('/booking/cancelled?error=missing_result', request.url));
    }

    try {
        const provider = getPaymentProvider();
        const event = await provider.parseWebhookEvent(result, request.headers);

        if (event.type === 'payment.completed') {
            const bookingRef = adminDb.collection('allBookings').doc(event.bookingId);

            await bookingRef.update({
                paymentStatus: 'paid',
                paymentProvider: 'windcave',
                windcaveTransactionId: event.sessionId,
                paidAt: new Date().toISOString(),
                totalAmountPaid: event.amountPaid / 100,
            });

            // Redirect to success page
            return NextResponse.redirect(
                new URL(`/booking/success?booking_id=${event.bookingId}&txn_id=${event.sessionId}`, request.url)
            );
        } else {
            console.error('[Windcave Callback] Payment failed or incomplete:', event);
            return NextResponse.redirect(
                new URL(`/booking/cancelled?booking_id=${event.bookingId}&error=payment_failed`, request.url)
            );
        }
    } catch (error) {
        console.error('[Windcave Callback] Error:', error);
        return NextResponse.redirect(new URL('/booking/cancelled?error=processing_error', request.url));
    }
}
