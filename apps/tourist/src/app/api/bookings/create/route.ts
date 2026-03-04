import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { adminDb } from '@vualiku/shared/server';
import { FieldValue } from 'firebase-admin/firestore';
import { masterEvents } from '@vualiku/shared';
import { calculateDynamicPrice } from '@/lib/pricing/dynamic-pricing';
import { parseISO } from 'date-fns';
import { defaultPackages } from '@/lib/packages-data';


export async function POST(request: NextRequest) {
    try {
        // L4-C2: Require authentication for booking creation
        const auth = requireAuth(request);
        if (!auth.authenticated) return auth.error!;

        const body = await request.json();
        const {
            firstName,
            lastName,
            email,
            phone,
            origin,
            items, // Array of { eventName, operatorId, pax, date, timeSlot }
            packageId, // Optional package identifier
            packagePax, // Optional participant count for the whole package
        } = body;

        // Basic validation
        if (!firstName || !lastName || !email) {
            return NextResponse.json({ error: 'Missing required contact fields' }, { status: 400 });
        }

        if (!items?.length && !packageId) {
            return NextResponse.json({ error: 'Must provide either items or a packageId' }, { status: 400 });
        }

        const db = adminDb;

        let totalFee = 0;
        const verifiedActivities = [];
        let isPackage = false;
        let packageName = '';

        if (packageId) {
            // Package Processing
            const targetPackage = defaultPackages.find(p => p.id === packageId);
            if (!targetPackage || targetPackage.status !== 'active') {
                return NextResponse.json({ error: `Invalid or inactive package: ${packageId}` }, { status: 400 });
            }

            if (!packagePax || packagePax < 1 || packagePax > 50) {
                return NextResponse.json({ error: 'Invalid participant count for package' }, { status: 400 });
            }

            // For MVP packages, we take the flat package price * pax
            totalFee = targetPackage.price * packagePax;
            isPackage = true;
            packageName = targetPackage.title;

            // Expand the package itinerary into verified activities for the calendar/UI
            for (const item of targetPackage.itinerary) {
                const masterEvent = masterEvents.find(e => e.id === item.eventId);
                if (masterEvent) {
                    verifiedActivities.push({
                        eventName: item.customName || masterEvent.name,
                        operatorId: masterEvent.operatorId,
                        date: 'package_schedule', // Needs date selection in a real app
                        timeSlot: 'various',
                        pax: packagePax,
                        pricePerPax: 0, // Handled at package level
                        totalPrice: 0,
                        pricingBreakdown: { base: 0 },
                    });
                }
            }
        } else {
            // Standard Single/Multi Event Processing (L4-C1 fix)
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
        }

        if (totalFee <= 0) {
            return NextResponse.json({ error: 'Total fee must be greater than zero' }, { status: 400 });
        }

        // 3. Write securely to Firestore using Admin SDK
        const bookingData = {
            firstName,
            lastName,
            email,
            phone: phone || '',
            origin: origin || '',
            items: verifiedActivities,
            isPackage,
            packageId: packageId || null,
            packageName,
            totalFee,
            paymentStatus: 'pending',
            status: 'unconfirmed',
            createdAt: FieldValue.serverTimestamp(),
            userId: auth.uid,
            userEmail: auth.email,
            // L5-E1: Lift metadata to root for indexing
            operatorId: verifiedActivities[0]?.operatorId || null,
            bookingDate: verifiedActivities[0]?.date || 'package_no_date',
        };

        const docRef = await db.collection('allBookings').add(bookingData);

        return NextResponse.json({
            success: true,
            bookingId: docRef.id,
            totalFee,
            message: 'Booking stored securely, ready for checkout.',
        });

    } catch (error) {
        console.error('[api/bookings/create] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to save booking' },
            { status: 500 }
        );
    }
}
