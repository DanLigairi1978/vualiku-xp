'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { formatFJD } from '@/lib/currency';
import {
    TrendingUp, TrendingDown, DollarSign, Users, Calendar,
    Star, BarChart3, ArrowUpRight
} from 'lucide-react';

interface BookingRecord {
    totalFee: number;
    bookingDate: string;
    participants: number;
    checkedIn?: boolean;
    createdAt?: { seconds: number };
}

interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    trend?: { value: number; label: string };
    accent?: string;
}

function StatCard({ title, value, subtitle, icon, trend, accent = 'primary' }: StatCardProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-${accent}/10 flex items-center justify-center`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.value >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <p className="text-[10px] text-primary/60 uppercase font-bold tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-bold text-white font-tahoma">{value}</p>
            <p className="text-xs text-foreground/40 mt-1">{subtitle}</p>
        </div>
    );
}

// Simple bar chart using CSS — no charting library needed
function MiniBarChart({ data, labels }: { data: number[]; labels: string[] }) {
    const max = Math.max(...data, 1);

    return (
        <div className="flex items-end gap-1.5 h-32">
            {data.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative group">
                        <div
                            className="w-full bg-primary/20 rounded-t-md transition-all group-hover:bg-primary/40 relative"
                            style={{ height: `${Math.max((val / max) * 100, 4)}%`, minHeight: '4px' }}
                        >
                            <div
                                className="absolute inset-x-0 bottom-0 bg-primary/60 rounded-t-md"
                                style={{ height: `${Math.min(100, (val / max) * 100)}%` }}
                            />
                        </div>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card text-xs text-primary font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {formatFJD(val)}
                        </div>
                    </div>
                    <span className="text-[9px] text-foreground/30 font-medium">{labels[i]}</span>
                </div>
            ))}
        </div>
    );
}

interface AnalyticsDashboardProps {
    operatorId?: string; // If undefined, shows all (admin view)
    isAdmin: boolean;
}

export function AnalyticsDashboard({ operatorId, isAdmin }: AnalyticsDashboardProps) {
    const firestore = useFirestore();
    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        const fetchBookings = async () => {
            try {
                let q;
                if (isAdmin) {
                    q = query(collection(firestore, 'allBookings'), orderBy('bookingDate', 'desc'));
                } else if (operatorId) {
                    q = query(
                        collection(firestore, 'allBookings'),
                        where('operatorId', '==', operatorId),
                        orderBy('bookingDate', 'desc')
                    );
                } else {
                    q = query(collection(firestore, 'allBookings'), orderBy('bookingDate', 'desc'));
                }

                const snapshot = await getDocs(q);
                const records = snapshot.docs.map((d) => d.data() as BookingRecord);
                setBookings(records);
            } catch (err) {
                console.error('Analytics fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [firestore, operatorId, isAdmin]);

    // Compute analytics
    const stats = useMemo(() => {
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalFee || 0), 0);
        const totalGuests = bookings.reduce((sum, b) => sum + (b.participants || 0), 0);
        const totalBookings = bookings.length;
        const checkedInCount = bookings.filter((b) => b.checkedIn).length;
        const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        // Monthly revenue for chart (last 6 months)
        const now = new Date();
        const monthLabels: string[] = [];
        const monthRevenue: number[] = [];

        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = monthDate.toLocaleDateString('en-US', { month: 'short' });
            monthLabels.push(label);

            const monthTotal = bookings
                .filter((b) => {
                    try {
                        const d = new Date(b.bookingDate);
                        return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
                    } catch {
                        return false;
                    }
                })
                .reduce((sum, b) => sum + (b.totalFee || 0), 0);

            monthRevenue.push(monthTotal);
        }

        return { totalRevenue, totalGuests, totalBookings, checkedInCount, avgBookingValue, monthLabels, monthRevenue };
    }, [bookings]);

    if (loading) {
        return (
            <div className="py-12 text-center text-foreground/40">
                <BarChart3 className="w-8 h-8 mx-auto mb-3 animate-pulse text-primary/50" />
                Loading analytics...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-tahoma flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" /> Analytics Overview
                </h2>
                <div className="flex items-center gap-2 text-xs text-foreground/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                    Last 6 months
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={formatFJD(stats.totalRevenue)}
                    subtitle={`${stats.totalBookings} bookings`}
                    icon={<DollarSign className="w-5 h-5 text-green-400" />}
                    accent="green"
                />
                <StatCard
                    title="Total Guests"
                    value={stats.totalGuests.toLocaleString()}
                    subtitle={`${stats.checkedInCount} checked in`}
                    icon={<Users className="w-5 h-5 text-blue-400" />}
                    accent="blue"
                />
                <StatCard
                    title="Bookings"
                    value={stats.totalBookings.toLocaleString()}
                    subtitle="Total bookings"
                    icon={<Calendar className="w-5 h-5 text-amber-400" />}
                    accent="amber"
                />
                <StatCard
                    title="Avg. Booking Value"
                    value={formatFJD(stats.avgBookingValue)}
                    subtitle="Per booking"
                    icon={<Star className="w-5 h-5 text-purple-400" />}
                    accent="purple"
                />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Monthly Revenue
                </h3>
                <MiniBarChart data={stats.monthRevenue} labels={stats.monthLabels} />
            </div>
        </div>
    );
}
