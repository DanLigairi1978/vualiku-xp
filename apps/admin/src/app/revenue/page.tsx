'use client';

import {
    TrendingUp,
    DollarSign,
    Users,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Search,
    Download,
    PieChart,
    BarChart as BarChartIcon
} from 'lucide-react';
import { useRevenue } from '@/lib/hooks/useRevenue';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RevenuePage() {
    const { stats, loading } = useRevenue();

    const summaryItems = [
        { label: 'Gross Merchandise Value', value: `$${stats.totalRevenue.toLocaleString()}`, sub: 'Settled funds', icon: <DollarSign className="w-5 h-5" />, color: 'text-primary' },
        { label: 'Pending Liquidity', value: `$${stats.pendingRevenue.toLocaleString()}`, sub: 'Awaiting recon', icon: <Activity className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' },
        { label: 'Tourist Acquisition', value: stats.guestCount.toLocaleString(), sub: 'Unique pax', icon: <Users className="w-5 h-5" />, color: 'text-blue-400' },
        { label: 'Avg Unit Volume', value: `$${stats.averageOrderValue.toFixed(2)}`, sub: 'Per transaction', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-400' },
    ];

    return (
        <main className="p-8 max-w-[1600px] mx-auto space-y-10">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            FinOps Neural Node
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Revenue Analytics
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Global Yield Optimization & Financial Forensic Audit
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 border-slate-800 bg-slate-950 text-slate-500 hover:text-white uppercase text-[10px] font-bold tracking-widest px-6">
                        <Download className="w-4 h-4 mr-2" /> RECON REPORT
                    </Button>
                    <Button className="bg-primary text-slate-950 font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 px-8 h-12 rounded-xl">
                        INITIATE PAYOUTS
                    </Button>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryItems.map((item, i) => (
                    <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl group hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                {item.icon}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded-full uppercase">
                                <ArrowUpRight className="w-3 h-3" /> 12%
                            </div>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{item.label}</p>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{item.value}</h3>
                        <p className="text-[10px] text-slate-600 font-medium uppercase mt-1">{item.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Growth Chart (Simple Implementation) */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Settlement Velocity</h2>
                            <p className="text-2xl font-black text-white uppercase italic tracking-tighter mt-1">Growth Forecast: +14.2%</p>
                        </div>
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-primary bg-slate-900 rounded-lg border border-slate-800">7D</button>
                            <button className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">30D</button>
                            <button className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">90D</button>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {stats.dailyRevenue.length === 0 ? (
                            <div className="w-full flex items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
                                Calibration in progress...
                            </div>
                        ) : stats.dailyRevenue.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="text-[9px] font-black text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${day.amount.toFixed(0)}
                                </div>
                                <div
                                    className="w-full bg-slate-800 group-hover:bg-primary transition-all rounded-t-xl relative overflow-hidden"
                                    style={{ height: `${(day.amount / (Math.max(...stats.dailyRevenue.map(d => d.amount)) || 1)) * 100}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                    {day.date.split('-').slice(1).join('/')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operator Revenue Share */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl space-y-8">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Partner Contribution</h2>

                    <div className="space-y-6">
                        {stats.operatorBreakdown.map((op, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white group-hover:text-primary transition-colors italic">{op.name}</span>
                                    <span className="text-slate-500">${op.amount.toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(154,205,50,0.3)]"
                                        style={{ width: `${op.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {stats.operatorBreakdown.length === 0 && (
                            <p className="text-center text-slate-600 font-black uppercase tracking-widest text-[10px] py-12">
                                No partner data available.
                            </p>
                        )}
                    </div>

                    <div className="pt-6 border-t border-slate-800/50">
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase">Avg Yield / Partner</span>
                                <span className="text-xs font-black text-white italic">+$4.2k</span>
                            </div>
                            <p className="text-[9px] text-slate-600 font-medium uppercase leading-relaxed">
                                Revenue concentration is within healthy operational parameters for Q1.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
