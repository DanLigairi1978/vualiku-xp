import { StatCards } from '@/components/dashboard/StatCards';
import { LiveBookings } from '@/components/dashboard/LiveBookings';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { TodaysTours } from '@/components/dashboard/TodaysTours';

export default function AdminDashboard() {
    return (
        <main className="p-8 max-w-[1600px] mx-auto space-y-10">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Meridian Node Alpha
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Command Centre
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Vualiku XP Operational Oversight & Real-time Logistics
                    </p>
                </div>
                <div className="flex items-center gap-6 pb-2">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">Server Status</p>
                        <p className="text-sm font-bold text-green-400">OPERATIONAL</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>
            </header>

            <StatCards />

            <TodaysTours />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <LiveBookings />
                </div>
                <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />
                    <AlertsPanel />
                </div>
            </div>
        </main>
    );
}
