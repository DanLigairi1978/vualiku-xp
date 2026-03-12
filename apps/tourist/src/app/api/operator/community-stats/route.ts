import { NextRequest, NextResponse } from 'next/server';
import { adminDb, requireAdmin } from '@danligairi1978/shared/server';

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);
        const db = adminDb;
        const snapshot = await db.collection('allBookings').get();

        // We only return aggregated metrics, not PII
        let totalRevenue = 0;
        let totalBookings = 0;
        let totalGuests = 0;
        const activeOperators = new Set();

        // For the chart
        const monthlyRevenue: Record<string, number> = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            totalBookings++;
            totalRevenue += data.totalFee || 0;

            // Handle participants correctly
            let pax = 0;
            if (data.participants) pax = data.participants;
            else if (data.packagePax) pax = data.packagePax;
            else if (data.items && data.items.length > 0 && data.items[0].pax) pax = data.items[0].pax;
            totalGuests += pax;

            // Operator tracking
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item: any) => {
                    if (item.operatorId) activeOperators.add(item.operatorId);
                });
            } else if (data.operatorId) {
                activeOperators.add(data.operatorId);
            }

            // Format YYYY-MM
            try {
                let dateStr = data.bookingDate;
                if (!dateStr && data.items && data.items.length > 0) {
                    dateStr = data.items[0].date;
                }
                if (dateStr && dateStr.includes('-')) {
                    const dateParts = dateStr.split('-');
                    if (dateParts.length >= 2) {
                        const monthKey = `${dateParts[0]}-${dateParts[1]}`;
                        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (data.totalFee || 0);
                    }
                }
            } catch (e) {
                // ignore invalid dates
            }
        });

        // Get last 6 months for chart
        const now = new Date();
        const monthLabels: string[] = [];
        const monthRevenue: number[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
            monthLabels.push(monthLabel);

            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthRevenue.push(monthlyRevenue[monthStr] || 0);
        }

        return NextResponse.json({
            stats: {
                totalRevenue,
                totalBookings,
                totalGuests,
                activeOperators: activeOperators.size,
                avgBookingValue: totalBookings > 0 ? (totalRevenue / totalBookings) : 0,
                monthLabels,
                monthRevenue
            }
        });
    } catch (error) {
        console.error("Failed to fetch community stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
