import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api/v1-auth';
import { masterEvents } from '@vualiku/shared';
import { adminDb } from '@vualiku/shared/server';
import { parseISO, isValid, format } from 'date-fns';


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
    const auth = requireApiKey(request);
    if (!auth.authenticated) return auth.error!;

    const { date } = await params;
    const requestedDate = parseISO(date);

    if (!isValid(requestedDate)) {
        return NextResponse.json(
            { error: 'Invalid date format. Use YYYY-MM-DD.' },
            { status: 400 }
        );
    }

    const formattedDate = format(requestedDate, 'yyyy-MM-dd');
    const db = adminDb;

    // Calculate booked pax per event
    const bookedPaxPerEvent: Record<string, number> = {};

    try {
        const bookingsSnapshot = await db.collection('allBookings')
            .where('status', 'in', ['confirmed', 'unconfirmed', 'completed'])
            .get();

        bookingsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.items && Array.isArray(data.items)) {
                for (const item of data.items) {
                    if (item.date && item.date.startsWith(formattedDate) && item.eventName) {
                        const key = `${item.operatorId}_${item.eventName}`;
                        bookedPaxPerEvent[key] = (bookedPaxPerEvent[key] || 0) + (item.pax || 0);
                    }
                }
            }
        });
    } catch {
        // If DB read fails, we can just proceed with 0 booked pax
    }

    const DEFAULT_CAPACITY = 20;

    const availability = masterEvents.map((evt) => {
        const key = `${evt.operatorId}_${evt.name}`;
        const booked = bookedPaxPerEvent[key] || 0;
        const available = Math.max(0, DEFAULT_CAPACITY - booked);

        return {
            eventId: evt.id,
            operatorId: evt.operatorId,
            eventName: evt.name,
            date: formattedDate,
            totalCapacity: DEFAULT_CAPACITY,
            bookedPax: booked,
            availableSpots: available,
            isAvailable: available > 0,
        };
    });

    return NextResponse.json({
        success: true,
        date: formattedDate,
        data: availability,
    });
}
