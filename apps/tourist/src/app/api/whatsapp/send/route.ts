// WhatsApp Send API — Vualiku XP
// POST /api/whatsapp/send
// C2 fix: Requires authentication + rate limiting (H7)

import { NextRequest, NextResponse } from 'next/server';
import {
    sendBookingConfirmedWhatsApp,
    sendReminderWhatsApp,
    sendCancellationWhatsApp,
    sendReviewRequestWhatsApp,
} from '@/lib/whatsapp/twilio';
import { requireAuth, rateLimit, rateLimitResponse } from '@/lib/api/auth';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side)
function getAdminFirestore() {
    if (getApps().length === 0) {
        try {
            initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp',
            });
        } catch {
            // Already initialized
        }
    }
    return getFirestore();
}

type NotificationType = 'booking_confirmed' | 'reminder' | 'cancelled' | 'review_request';

export async function POST(request: NextRequest) {
    try {
        // C2: Require authentication
        const auth = requireAuth(request);
        if (!auth.authenticated) return auth.error!;

        // H7: Rate limit — max 10 WhatsApp messages per minute per user
        if (!rateLimit(`whatsapp:${auth.uid}`, 10, 60000)) {
            return rateLimitResponse();
        }

        const body = await request.json();
        const { type, data } = body as { type: NotificationType; data: Record<string, unknown> };

        if (!type || !data) {
            return NextResponse.json(
                { error: 'type and data are required' },
                { status: 400 }
            );
        }

        if (!data.bookingId) {
            return NextResponse.json(
                { error: 'data.bookingId is required to fetch contact details' },
                { status: 400 }
            );
        }

        // L4-H2: Fetch phone number from Firestore instead of trusting client payload
        const db = getAdminFirestore();
        const bookingDoc = await db.collection('allBookings').doc(data.bookingId as string).get();

        if (!bookingDoc.exists) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        const booking = bookingDoc.data()!;

        if (!booking.phone) {
            return NextResponse.json({ success: true, message: 'Skipped - no phone number on file for this booking' });
        }

        // Override client data securely
        data.phone = booking.phone;
        data.customerName = booking.firstName ? `${booking.firstName} ${booking.lastName || ''}`.trim() : 'Guest';

        let result;

        switch (type) {
            case 'booking_confirmed':
                result = await sendBookingConfirmedWhatsApp(data as Parameters<typeof sendBookingConfirmedWhatsApp>[0]);
                break;

            case 'reminder':
                result = await sendReminderWhatsApp(data as Parameters<typeof sendReminderWhatsApp>[0]);
                break;

            case 'cancelled':
                result = await sendCancellationWhatsApp(data as Parameters<typeof sendCancellationWhatsApp>[0]);
                break;

            case 'review_request':
                result = await sendReviewRequestWhatsApp(data as Parameters<typeof sendReviewRequestWhatsApp>[0]);
                break;

            default:
                return NextResponse.json(
                    { error: `Unknown notification type: ${type}. Valid: booking_confirmed, reminder, cancelled, review_request` },
                    { status: 400 }
                );
        }

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('[api/whatsapp/send] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send WhatsApp message' },
            { status: 500 }
        );
    }
}
