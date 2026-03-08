'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { Booking } from './useBookings';

export interface RevenueStats {
    totalRevenue: number;
    pendingRevenue: number;
    guestCount: number;
    totalBookings: number;
    averageOrderValue: number;
    dailyRevenue: { date: string, amount: number }[];
    dailyBookings: { date: string, count: number }[];
    operatorBreakdown: { name: string, amount: number, percentage: number }[];
    revenueByStatus: { name: string, value: number }[];
}

export function useRevenue() {
    const [bookingsRaw, setBookingsRaw] = useState<any[]>([]);
    const [operatorsRaw, setOperatorsRaw] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubBookings = onSnapshot(collection(db, 'allBookings'), (snapshot) => {
            setBookingsRaw(snapshot.docs.map(doc => doc.data()));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching revenue data:", error);
            setLoading(false);
        });

        const unsubOps = onSnapshot(collection(db, 'operators'), (snapshot) => {
            const map: Record<string, string> = {};
            snapshot.docs.forEach(doc => {
                map[doc.id] = (doc.data() as any).name;
            });
            setOperatorsRaw(map);
        }, (error) => {
            console.error("Error fetching operators:", error);
        });

        return () => {
            unsubBookings();
            unsubOps();
        };
    }, []);

    const stats = useMemo<RevenueStats>(() => {
        let total = 0;
        let pending = 0;
        let guests = 0;
        const revenueMap: Record<string, number> = {};
        const bookingsMap: Record<string, number> = {};
        const operatorMap: Record<string, number> = {};
        const statusMap: Record<string, number> = {
            paid: 0,
            pending: 0,
            cancelled: 0,
            failed: 0
        };

        bookingsRaw.forEach((b: any) => {
            const status = (b.status === 'paid' || b.paymentStatus === 'paid') ? 'paid' : (b.paymentStatus || b.status || 'pending');
            const amount = b.totalAmount || b.totalFee || b.totalAmountPaid || 0;
            const pax = b.participants || b.guestCount || 0;
            const operator = b.operator || b.operatorId || 'Unknown';

            let date = 'recent';
            const ts = b.timestamp || b.createdAt;
            if (ts?.toDate) {
                date = ts.toDate().toISOString().split('T')[0];
            }

            // Status tracking
            if (statusMap.hasOwnProperty(status)) {
                statusMap[status] += amount;
            } else {
                statusMap['pending'] += amount;
            }

            if (status === 'paid') {
                total += amount;
                guests += pax;

                // Daily aggregation
                revenueMap[date] = (revenueMap[date] || 0) + amount;
                bookingsMap[date] = (bookingsMap[date] || 0) + 1;

                // Operator aggregation
                operatorMap[operator] = (operatorMap[operator] || 0) + amount;
            } else if (status === 'pending') {
                pending += amount;
            }
        });

        const dailyRevenue = Object.entries(revenueMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30);

        const dailyBookings = Object.entries(bookingsMap)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30);

        const operatorBreakdown = Object.entries(operatorMap)
            .map(([id, amount]) => ({
                name: operatorsRaw[id] || id,
                amount,
                percentage: total > 0 ? (amount / total) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount);

        const revenueByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

        return {
            totalRevenue: total,
            pendingRevenue: pending,
            guestCount: guests,
            totalBookings: bookingsRaw.filter(b => (b.status === 'paid' || b.paymentStatus === 'paid')).length,
            averageOrderValue: bookingsRaw.length > 0 ? total / bookingsRaw.length : 0,
            dailyRevenue,
            dailyBookings,
            operatorBreakdown,
            revenueByStatus
        };
    }, [bookingsRaw, operatorsRaw]);

    return { stats, loading };
}
