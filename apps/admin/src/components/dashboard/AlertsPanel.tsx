'use client';

import { Bell, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const alerts = [
    { id: 1, type: 'critical', message: 'Payment failure streak detected: Windcave (Node 2)', time: '2 mins ago' },
    { id: 2, type: 'info', message: 'Operator "Drawa Eco Retreat" updated pricing rules', time: '14 mins ago' },
    { id: 3, type: 'success', message: 'System maintenance complete. All services operational.', time: '1 hour ago' },
    { id: 4, type: 'warning', message: 'High traffic volume from NAN region', time: '2 hours ago' },
];

export function AlertsPanel() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-tahoma uppercase tracking-tight text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    System Alerts
                </h2>
                <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    4 Active
                </span>
            </div>

            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div key={alert.id} className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all group">
                        <div className="flex gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                alert.type === 'critical' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                    alert.type === 'warning' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                                        alert.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                            "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            )}>
                                {alert.type === 'critical' ? <AlertCircle className="w-5 h-5" /> :
                                    alert.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                                        alert.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                            <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm text-slate-300 leading-tight group-hover:text-white transition-colors">
                                    {alert.message}
                                </p>
                                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                                    {alert.time}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest">
                Clear All Notifications
            </button>
        </div>
    );
}
