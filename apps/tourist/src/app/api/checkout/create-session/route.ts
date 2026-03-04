// Checkout Session API — Vualiku XP
// Creates a checkout session using the configured payment provider
// POST /api/checkout/create-session
// C2 fix: Requires authentication

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payments/provider';
import { requireAuth, rateLimit, rateLimitResponse } from '@/lib/api/auth';
import { adminDb } from '@vualiku/shared/server';


export async function POST(request: NextRequest) {
    try {
        // C2: Require authentication
        const auth = requireAuth(request);
        if (!auth.authenticated) return auth.error!;

        // H3: Rate limit checkout — max 3 sessions per minute per user (prevents double-charge)
        if (!rateLimit(`checkout:${auth.uid}`, 3, 60000)) {
            return rateLimitResponse();
        }

        const body = await request.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json(
                { error: 'Booking ID is required' },
                { status: 400 }
            );
        }

        // Fetch trusted booking data from backend (Fixing L4-C1 "Trust the Client" anti-pattern)
        const db = adminDb;
        const bookingDoc = await db.collection('allBookings').doc(bookingId).get();

        if (!bookingDoc.exists) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        const bookingData = bookingDoc.data()!;

        // Security check: ensure the booking belongs to the current user
        if (bookingData.userId !== auth.uid) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        if (bookingData.paymentStatus !== 'pending') {
            return NextResponse.json(
                { error: 'Booking is already paid or cancelled' },
                { status: 400 }
            );
        }

        const baseUrl = request.nextUrl.origin;
        const provider = getPaymentProvider();

        // Subtotal (before tax)
        const subtotal = bookingData.totalFee;
        const tax = subtotal * 0.15; // 15% VAT placeholder
        const totalAmountCents = Math.round((subtotal + tax) * 100);

        // Convert backend booking items to payment provider format
        const items = [
            {
                name: bookingData.isPackage ? bookingData.packageName : "Vualiku XP Custom Itinerary",
                description: bookingData.isPackage ? "Package Journey" : `${bookingData.items.length} Activities`,
                quantity: 1,
                unitPrice: totalAmountCents, // the format expected by Stripe/Paydock via adapter
                currency: 'FJD' as const,
            }
        ];

        const successUrl = provider.name === 'windcave'
            ? `${baseUrl}/api/checkout/windcave-callback`
            : `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`;

        const cancelUrl = `${baseUrl}/booking/cancelled?booking_id=${bookingId}`;

        const session = await provider.createCheckoutSession({
            items,
            customerEmail: bookingData.email || 'guest@vualiku-xp.com',
            customerName: `${bookingData.firstName} ${bookingData.lastName}`,
            bookingId,
            successUrl,
            cancelUrl,
            metadata: {
                itemCount: String(bookingData.items?.length || 0),
            },
        });

        return NextResponse.json({
            sessionId: session.sessionId,
            checkoutUrl: session.checkoutUrl,
            provider: session.provider,
        });
    } catch (error) {
        console.error('[checkout/create-session] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
