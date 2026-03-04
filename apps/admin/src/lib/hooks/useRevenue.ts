'use client';

import { useState, useEffect } from 'react';
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
    const [stats, setStats] = useState<RevenueStats>({
        totalRevenue: 0,
        pendingRevenue: 0,
        guestCount: 0,
        averageOrderValue: 0,
        dailyRevenue: [],
        operatorBreakdown: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'allBookings'), (snapshot) => {
            const bookings = snapshot.docs.map(doc => doc.data() as Booking);

            let total = 0;
            let pending = 0;
            let guests = 0;
            const revenueMap: Record<string, number> = {};
            const operatorMap: Record<string, number> = {};

            bookings.forEach(b => {
                if (b.status === 'paid') {
                    total += b.totalAmount;
                    guests += b.participants;

                    // Daily aggregation
                    const date = b.timestamp?.toDate ? b.timestamp.toDate().toISOString().split('T')[0] : 'recent';
                    revenueMap[date] = (revenueMap[date] || 0) + b.totalAmount;

                    // Operator aggregation
                    operatorMap[b.operator] = (operatorMap[b.operator] || 0) + b.totalAmount;
                } else if (b.status === 'pending') {
                    pending += b.totalAmount;
                }
            });

            const dailyRevenue = Object.entries(revenueMap)
                .map(([date, amount]) => ({ date, amount }))
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-7);

            const operatorBreakdown = Object.entries(operatorMap)
                .map(([name, amount]) => ({
                    name,
                    amount,
                    percentage: total > 0 ? (amount / total) * 100 : 0
                }))
                .sort((a, b) => b.amount - a.amount);

            setStats({
                totalRevenue: total,
                pendingRevenue: pending,
                guestCount: guests,
                averageOrderValue: bookings.length > 0 ? total / bookings.length : 0,
                dailyRevenue,
                operatorBreakdown
            });
            setLoading(false);
        }, (error) => {
            console.error("Error fetching revenue data:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { stats, loading };
}
