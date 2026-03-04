'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatFJD, formatFJDCompact } from '@/lib/currency';
import {
    TrendingUp, Users, DollarSign, Calendar, Globe,
    BarChart3, ArrowLeft, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityStats {
    totalRevenue: number;
    totalBookings: number;
    totalGuests: number;
    activeOperators: number;
    avgBookingValue: number;
    monthLabels: string[];
    monthRevenue: number[];
}

interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string;
}

function StatCard({ title, value, subtitle, icon, colorClass }: StatCardProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <p className="text-[10px] text-primary/60 uppercase font-bold tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-bold text-white font-tahoma">{value}</p>
            <p className="text-xs text-foreground/40 mt-1">{subtitle}</p>
        </div>
    );
}

function RevenueChart({ data, labels }: { data: number[]; labels: string[] }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-3 h-40 mt-4">
            {data.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative group" style={{ height: '128px' }}>
                        <div className="absolute inset-x-0 bottom-0">
                            <div
                                className="w-full bg-primary/20 rounded-t-md group-hover:bg-primary/40 transition-all duration-300"
                                style={{ height: `${Math.max((val / max) * 100, 3)}%` }}
                            >
                                <div
                                    className="absolute inset-x-0 bottom-0 bg-primary/70 rounded-t-md"
                                    style={{ height: '50%' }}
                                />
                            </div>
                        </div>
                        {val > 0 && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-card text-xs text-primary font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {formatFJDCompact(val)}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-foreground/40 font-medium">{labels[i]}</span>
                </div>
            ))}
        </div>
    );
}

export default function CommunityDashboardPage() {
    const [stats, setStats] = useState<CommunityStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/operator/community-stats');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setStats(data.stats);
            } catch (err) {
                setError('Could not load community statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-background text-white pb-24 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            {/* Header */}
            <header className="bg-white/5 border-b border-white/10 relative z-10 pt-8 pb-6 px-6 backdrop-blur-xl">
                <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center">
                            <Globe className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-tahoma tracking-tight">Community Dashboard</h1>
                            <p className="text-foreground/50 text-sm mt-1">Aggregate impact across all Drawa Eco Retreat operators</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" className="border-white/10 text-foreground/60 hover:bg-white/5 rounded-xl">
                            <Link href="/operator/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                            </Link>
                        </Button>
                        <Button asChild className="btn-forest rounded-xl">
                            <Link href="/operator/earnings">
                                <DollarSign className="mr-2 h-4 w-4" /> My Earnings
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-5xl px-6 pt-12 relative z-10 space-y-10">

                {loading && (
                    <div className="py-24 text-center">
                        <Activity className="w-10 h-10 mx-auto mb-3 animate-pulse text-primary/50" />
                        <p className="text-foreground/40">Loading community stats…</p>
                    </div>
                )}

                {error && (
                    <div className="py-24 text-center">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {stats && !loading && (
                    <>
                        {/* Hero Banner */}
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8">
                            <p className="text-xs text-primary/60 uppercase font-bold tracking-widest mb-2">Community Impact</p>
                            <h2 className="text-4xl font-bold font-tahoma text-white mb-2">
                                {formatFJD(stats.totalRevenue)}
                            </h2>
                            <p className="text-foreground/50 text-sm">Total revenue generated across all operator activities</p>
                        </div>

                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Bookings"
                                value={stats.totalBookings.toLocaleString()}
                                subtitle="All time"
                                icon={<Calendar className="w-6 h-6 text-green-400" />}
                                colorClass="bg-green-500/10"
                            />
                            <StatCard
                                title="Total Guests"
                                value={stats.totalGuests.toLocaleString()}
                                subtitle="Experiences delivered"
                                icon={<Users className="w-6 h-6 text-blue-400" />}
                                colorClass="bg-blue-500/10"
                            />
                            <StatCard
                                title="Active Operators"
                                value={stats.activeOperators.toLocaleString()}
                                subtitle="Contributing to community"
                                icon={<Globe className="w-6 h-6 text-purple-400" />}
                                colorClass="bg-purple-500/10"
                            />
                            <StatCard
                                title="Avg. Booking Value"
                                value={formatFJD(stats.avgBookingValue)}
                                subtitle="Per booking"
                                icon={<TrendingUp className="w-6 h-6 text-amber-400" />}
                                colorClass="bg-amber-500/10"
                            />
                        </div>

                        {/* Revenue Chart */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold font-tahoma flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    Community Revenue — Last 6 Months
                                </h3>
                                <span className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold">FJD</span>
                            </div>
                            <RevenueChart data={stats.monthRevenue} labels={stats.monthLabels} />
                        </div>

                        {/* CTA */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-bold font-tahoma mb-1">View your personal earnings</h3>
                                <p className="text-sm text-foreground/50">Download monthly PDF receipts for your activities and packages.</p>
                            </div>
                            <Button asChild className="btn-forest rounded-xl flex-shrink-0">
                                <Link href="/operator/earnings">
                                    <DollarSign className="mr-2 h-4 w-4" /> My Earnings &amp; Receipts
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
