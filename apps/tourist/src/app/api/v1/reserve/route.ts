import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api/v1-auth';
import { adminDb } from '@danligairi1978/shared/server';
import { FieldValue } from 'firebase-admin/firestore';
import { masterEvents } from '@danligairi1978/shared';
import { calculateDynamicPrice } from '@/lib/pricing/dynamic-pricing';
import { parseISO } from 'date-fns';


export async function POST(request: NextRequest) {
    try {
        // Authenticate with API Key
        const auth = requireApiKey(request);
        if (!auth.authenticated) return auth.error!;

        const body = await request.json();
        const {
            firstName,
            lastName,
            email,
            phone,
            origin,
            items, // Array of { eventName, operatorId, pax, date, timeSlot }
        } = body;

        // Basic validation
        if (!firstName || !lastName || !email || !items?.length) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = adminDb;

        let totalFee = 0;
        const verifiedActivities = [];

        for (const item of items) {
            const masterEvent = masterEvents.find(e => e.name === item.eventName && e.operatorId === item.operatorId);
            if (!masterEvent) {
                return NextResponse.json({ error: `Invalid activity: ${item.eventName}` }, { status: 400 });
            }

            const dateObj = parseISO(item.date);
            if (dateObj < new Date(new Date().setHours(0, 0, 0, 0))) {
                return NextResponse.json({ error: 'Booking date cannot be in the past' }, { status: 400 });
            }

            if (item.pax < 1 || item.pax > 50) {
                return NextResponse.json({ error: 'Invalid participant count' }, { status: 400 });
            }

            const pricingResult = calculateDynamicPrice({
                basePrice: masterEvent.price,
                pricingType: masterEvent.pricingType,
                pax: item.pax,
                bookingDate: dateObj,
            });

            totalFee += pricingResult.totalPrice;

            verifiedActivities.push({
                eventName: masterEvent.name,
                operatorId: masterEvent.operatorId,
                date: item.date,
                timeSlot: item.timeSlot,
                pax: item.pax,
                pricePerPax: pricingResult.finalPrice,
                totalPrice: pricingResult.totalPrice,
                pricingBreakdown: pricingResult.breakdown,
            });
        }

        if (totalFee <= 0) {
            return NextResponse.json({ error: 'Total fee must be greater than zero' }, { status: 400 });
        }

        // B2B Bookings are automatically confirmed since payment is handled out-of-band by the partner
        const bookingData = {
            firstName,
            lastName,
            email,
            phone: phone || '',
            origin: origin || '',
            items: verifiedActivities,
            totalFee,
            paymentStatus: 'partner_booking', // Indicates partner will remit payment
            status: 'confirmed', // Automatically confirmed
            createdAt: FieldValue.serverTimestamp(),
            partnerId: auth.partnerId,
            source: 'distribution_api',
        };

        const docRef = await adminDb.collection('allBookings').add(bookingData);

        return NextResponse.json({
            success: true,
            bookingId: docRef.id,
            totalFee,
            status: 'confirmed',
            message: 'Reservation created successfully.',
        });

    } catch (error) {
        console.error('[api/v1/reserve] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create reservation' },
            { status: 500 }
        );
    }
}
