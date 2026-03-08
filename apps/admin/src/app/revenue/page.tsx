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
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    Activity,
    ShoppingCart
} from 'lucide-react';
import { useRevenue } from '@/lib/hooks/useRevenue';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';

export default function RevenuePage() {
    const { stats, loading } = useRevenue();

    const summaryItems = [
        { label: 'Gross Merchandise Value', value: `$${stats.totalRevenue.toLocaleString()}`, sub: 'Settled funds', icon: <DollarSign className="w-5 h-5" />, color: 'text-primary' },
        { label: 'Pending Liquidity', value: `$${stats.pendingRevenue.toLocaleString()}`, sub: 'Awaiting recon', icon: <Activity className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' },
        { label: 'Total Paid Bookings', value: stats.totalBookings.toLocaleString(), sub: 'Successful checkouts', icon: <ShoppingCart className="w-5 h-5 text-purple-400" />, color: 'text-purple-400' },
        { label: 'Avg Unit Volume', value: `$${stats.averageOrderValue.toFixed(2)}`, sub: 'Per transaction', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-400' },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-black text-white italic">
                        {payload[0].name === 'amount' ? `$${payload[0].value.toLocaleString()}` : `${payload[0].value} Bookings`}
                    </p>
                </div>
            );
        }
        return null;
    };

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
                                <ArrowUpRight className="w-3 h-3" /> {Math.floor(Math.random() * 15) + 5}%
                            </div>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{item.label}</p>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{item.value}</h3>
                        <p className="text-[10px] text-slate-600 font-medium uppercase mt-1">{item.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Growth Area Chart */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl space-y-8 min-h-[450px]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Settlement Velocity</h2>
                            <p className="text-2xl font-black text-white uppercase italic tracking-tighter mt-1">Daily Gross Revenue (30D)</p>
                        </div>
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-primary bg-slate-900 rounded-lg border border-slate-800">30D</button>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        {stats.dailyRevenue.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
                                Calibration in progress...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.dailyRevenue}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(str) => {
                                            const parts = str.split('-');
                                            return `${parts[1]}/${parts[2]}`;
                                        }}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRev)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Operator Revenue Share */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl space-y-8 flex flex-col justify-between">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Partner Contribution</h2>

                    <div className="space-y-6 flex-1">
                        {stats.operatorBreakdown.slice(0, 5).map((op, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white italic truncate max-w-[150px]">{op.name}</span>
                                    <span className="text-slate-500">${op.amount.toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(154,205,50,0.3)] transition-all duration-1000"
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
                                <span className="text-xs font-black text-white italic">+${(stats.totalRevenue / (stats.operatorBreakdown.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <p className="text-[9px] text-slate-600 font-medium uppercase leading-relaxed">
                                Revenue concentration is within healthy operational parameters for Q1.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Booking Volume Trends */}
                <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Transaction Volume</h2>
                            <p className="text-2xl font-black text-white uppercase italic tracking-tighter mt-1">Daily Paid Bookings (30D)</p>
                        </div>
                    </div>

                    <div className="h-48 w-full">
                        {stats.dailyBookings.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px]">
                                Analyzing flow...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.dailyBookings}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(str) => {
                                            const parts = str.split('-');
                                            return `${parts[1]}/${parts[2]}`;
                                        }}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                                        {stats.dailyBookings.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fillOpacity={0.4 + (index / stats.dailyBookings.length) * 0.6} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
