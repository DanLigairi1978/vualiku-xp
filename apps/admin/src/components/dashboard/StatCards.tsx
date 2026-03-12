'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';
import { Activity, CreditCard, ShieldCheck, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
    label: string;
    value: string | number;
    icon: any;
    trend: string;
    trendType: 'up' | 'down' | 'neutral';
    color: string;
}

export function StatCards() {
    const [stats, setStats] = useState<Stat[]>([
        { label: 'Total Revenue', value: '$0', icon: CreditCard, trend: '0%', trendType: 'neutral', color: 'text-blue-400' },
        { label: 'Active Tours', value: '0', icon: Activity, trend: '0', trendType: 'neutral', color: 'text-primary' },
        { label: 'Total Bookings', value: '0', icon: ShieldCheck, trend: '0', trendType: 'neutral', color: 'text-purple-400' },
        { label: 'User Traffic', value: '0', icon: Users, trend: '0', trendType: 'neutral', color: 'text-orange-400' },
    ]);

    useEffect(() => {
        const q = query(collection(db, 'allBookings'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(doc => doc.data());

            const totalRevenue = bookings
                .filter(b => b.paymentStatus === 'paid')
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

            const activeTours = bookings.filter(b => b.status === 'confirmed').length;
            const totalBookings = bookings.length;

            setStats([
                {
                    label: 'Total Revenue',
                    value: `$${totalRevenue.toLocaleString()}`,
                    icon: CreditCard,
                    trend: '+12%',
                    trendType: 'up',
                    color: 'text-blue-400'
                },
                {
                    label: 'Active Tours',
                    value: activeTours,
                    icon: Activity,
                    trend: '+2',
                    trendType: 'up',
                    color: 'text-primary'
                },
                {
                    label: 'Total Bookings',
                    value: totalBookings,
                    icon: ShieldCheck,
                    trend: '+5',
                    trendType: 'up',
                    color: 'text-purple-400'
                },
                {
                    label: 'User Traffic',
                    value: '1.2k',
                    icon: Users,
                    trend: '+12%',
                    trendType: 'up',
                    color: 'text-orange-400'
                },
            ]);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-primary/30 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all" />

                    <div className="flex justify-between items-start relative z-10">
                        <div className={cn("p-2 rounded-xl bg-slate-950 border border-slate-800 transition-colors group-hover:border-primary/50", stat.color)}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            stat.trendType === 'up' ? "text-green-400 bg-green-400/5 border-green-400/20" :
                                stat.trendType === 'down' ? "text-red-400 bg-red-400/5 border-red-400/20" :
                                    "text-slate-400 bg-slate-400/5 border-slate-400/20"
                        )}>
                            {stat.trendType === 'up' && <TrendingUp className="w-3 h-3" />}
                            {stat.trendType === 'down' && <TrendingDown className="w-3 h-3" />}
                            {stat.trend}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white mt-1 font-tahoma">{stat.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
