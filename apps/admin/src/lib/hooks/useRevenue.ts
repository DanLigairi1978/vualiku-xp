'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { Booking } from './useBookings';

export interface RevenueStats {
    totalRevenue: number;
    pendingRevenue: number;
    guestCount: number;
    averageOrderValue: number;
    dailyRevenue: { date: string, amount: number }[];
    operatorBreakdown: { name: string, amount: number, percentage: number }[];
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
        const operatorMap: Record<string, number> = {};

        bookingsRaw.forEach((b: any) => {
            const isPaid = b.status === 'paid' || b.paymentStatus === 'paid';
            const isPending = b.status === 'pending' || b.paymentStatus === 'pending';
            const amount = b.totalAmount || b.totalFee || b.totalAmountPaid || 0;
            const pax = b.participants || b.guestCount || 0;
            const operator = b.operator || b.operatorId || 'Unknown';

            let date = 'recent';
            const ts = b.timestamp || b.createdAt;
            if (ts?.toDate) {
                date = ts.toDate().toISOString().split('T')[0];
            }

            if (isPaid) {
                total += amount;
                guests += pax;

                // Daily aggregation
                revenueMap[date] = (revenueMap[date] || 0) + amount;

                // Operator aggregation
                operatorMap[operator] = (operatorMap[operator] || 0) + amount;
            } else if (isPending) {
                pending += amount;
            }
        });

        const dailyRevenue = Object.entries(revenueMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7);

        const operatorBreakdown = Object.entries(operatorMap)
            .map(([id, amount]) => ({
                name: operatorsRaw[id] || id,
                amount,
                percentage: total > 0 ? (amount / total) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount);

        return {
            totalRevenue: total,
            pendingRevenue: pending,
            guestCount: guests,
            averageOrderValue: bookingsRaw.length > 0 ? total / bookingsRaw.length : 0,
            dailyRevenue,
            operatorBreakdown
        };
    }, [bookingsRaw, operatorsRaw]);

    return { stats, loading };
}
