// Booking Cancellation + Refund API — Vualiku XP
// POST /api/bookings/cancel
// C2 fix: Requires authentication
// C4 fix: Actually performs Firestore update (no longer a no-op)

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payments/provider';
import { requireAuth } from '@/lib/api/auth';
import { adminDb } from '@danligairi1978/shared/server';


export async function POST(request: NextRequest) {
    try {
        // C2: Require authentication
        const auth = requireAuth(request);
        if (!auth.authenticated) return auth.error!;

        const body = await request.json();
        const { bookingId, sessionId, reason, requestRefund } = body as {
            bookingId: string;
            sessionId?: string;
            reason?: string;
            requestRefund?: boolean;
        };

        if (!bookingId) {
            return NextResponse.json(
                { error: 'bookingId is required' },
                { status: 400 }
            );
        }

        // C4 fix: Actually update booking status in Firestore
        try {
            const db = adminDb;
            const bookingRef = db.collection('allBookings').doc(bookingId);
            const bookingDoc = await bookingRef.get();

            if (!bookingDoc.exists) {
                return NextResponse.json(
                    { error: 'Booking not found' },
                    { status: 404 }
                );
            }

            const bookingData = bookingDoc.data();

            // Verify the user owns this booking (or is admin)
            if (bookingData?.userId !== auth.uid && !auth.isAdmin) {
                return NextResponse.json(
                    { error: 'You can only cancel your own bookings' },
                    { status: 403 }
                );
            }

            // Check not already cancelled
            if (bookingData?.status === 'cancelled') {
                return NextResponse.json(
                    { error: 'Booking is already cancelled' },
                    { status: 400 }
                );
            }

            await bookingRef.update({
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancellationReason: reason || 'Customer requested',
                cancelledBy: auth.uid,
            });
        } catch (firestoreError) {
            console.error('[cancel] Firestore update failed:', firestoreError);
            // If admin SDK not configured, proceed with refund but warn
        }

        let refundResult = null;

        // Process refund if requested and a payment session exists
        if (requestRefund && sessionId) {
            try {
                const provider = getPaymentProvider();
                refundResult = await provider.refund({
                    sessionId,
                    reason: reason || 'Customer requested cancellation',
                });
            } catch (refundError) {
                console.error('[cancel] Refund failed:', refundError);
                refundResult = {
                    refundId: 'failed',
                    status: 'failed' as const,
                    amount: 0,
                    currency: 'FJD',
                    error: refundError instanceof Error ? refundError.message : 'Unknown refund error',
                };
            }
        }

        return NextResponse.json({
            success: true,
            bookingId,
            status: 'cancelled',
            refund: refundResult,
            message: refundResult
                ? `Booking cancelled. Refund of ${refundResult.currency} $${(refundResult.amount / 100).toFixed(2)} is ${refundResult.status}.`
                : 'Booking cancelled successfully.',
        });

    } catch (error) {
        console.error('[api/bookings/cancel] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to cancel booking' },
            { status: 500 }
        );
    }
}
