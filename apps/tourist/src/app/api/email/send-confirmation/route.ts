// Email Send Confirmation API — Vualiku XP
// POST /api/email/send-confirmation
// C2 fix: Requires authentication + rate limiting (H6)

import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmation } from '@/lib/email/resend';
import { requireAuth, rateLimit, rateLimitResponse } from '@/lib/api/auth';
import { adminDb } from '@danligairi1978/shared/server';


export async function POST(request: NextRequest) {
    try {
        // C2: Require authentication
        const auth = requireAuth(request);
        if (!auth.authenticated) return auth.error!;

        // H6: Rate limit — max 5 emails per minute per user
        if (!rateLimit(`email:${auth.uid}`, 5, 60000)) {
            return rateLimitResponse();
        }

        const body = await request.json();
        const { bookingId, qrCodeUrl } = body;

        if (!bookingId) {
            return NextResponse.json(
                { error: 'bookingId is required' },
                { status: 400 }
            );
        }

        // L4-H1: Fetch from Firestore instead of trusting client payload
        const db = adminDb;
        const bookingDoc = await db.collection('allBookings').doc(bookingId).get();

        if (!bookingDoc.exists) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        const booking = bookingDoc.data()!;
        const customerEmail = booking.email || booking.userEmail;
        const customerName = booking.firstName ? `${booking.firstName} ${booking.lastName || ''}`.trim() : 'Guest';

        // Map Firestore items to expected events format for the email template
        const events = booking.items ? booking.items.map((item: any) => ({
            name: item.eventName,
            date: item.date,
            time: item.timeSlot,
            pax: item.pax
        })) : [];

        await sendBookingConfirmation({
            customerName,
            customerEmail,
            bookingId,
            events,
            totalAmount: booking.totalFee || 0,
            qrCodeUrl,
        });

        return NextResponse.json({ success: true, message: 'Confirmation email sent' });
    } catch (error) {
        console.error('[api/email/send-confirmation] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send email' },
            { status: 500 }
        );
    }
}
