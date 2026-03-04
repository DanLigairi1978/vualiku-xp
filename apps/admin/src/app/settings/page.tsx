'use client';

import {
    Settings2,
    ShieldCheck,
    Zap,
    Globe,
    Lock,
    Database,
    RefreshCcw,
    Save,
    Fingerprint,
    Cpu
} from 'lucide-react';
import { useSettings, PlatformConfig } from '@/lib/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function SettingsPage() {
    const { config, loading, updateConfig } = useSettings();
    const [saving, setSaving] = useState(false);

    const handleToggleFlag = async (key: keyof PlatformConfig['featureFlags'], val: boolean) => {
        if (!config) return;
        setSaving(true);
        try {
            await updateConfig({
                featureFlags: {
                    ...config.featureFlags,
                    [key]: val
                }
            });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePricing = async (key: keyof PlatformConfig['pricingRules'], val: string) => {
        if (!config) return;
        const numVal = parseFloat(val);
        if (isNaN(numVal)) return;

        setSaving(true);
        try {
            await updateConfig({
                pricingRules: {
                    ...config.pricingRules,
                    [key]: numVal
                }
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !config) {
        return (
            <div className="p-8 flex items-center justify-center h-[50vh]">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] animate-pulse">Syncing Global Config Parameters...</p>
            </div>
        );
    }

    return (
        <main className="p-8 max-w-[1200px] mx-auto space-y-12">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Control Plane v1.0
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Platform Settings
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Global Operational Overrides & Neural Engine Tuning
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", saving ? "bg-yellow-400" : "bg-green-400")} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {saving ? "SYNCING..." : "LIVE SYNC ACTIVE"}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column: Feature Flags */}
                <div className="md:col-span-2 space-y-10">
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Operational Flux Capacitors</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Real-time gateway & portal status</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/50">
                            {[
                                { id: 'bookings_enabled', label: 'Global Booking Engine', desc: 'Toggle all transactional checkout flows.', icon: <Fingerprint className="w-4 h-4" /> },
                                { id: 'operator_portal_active', label: 'Operator Access Node', desc: 'Enable/Disable external partner dashboards.', icon: <Globe className="w-4 h-4" /> },
                                { id: 'dynamic_pricing_active', label: 'Neural Pricing Engine', desc: 'Bypass static rates for thinking algorithms.', icon: <Cpu className="w-4 h-4" /> },
                                { id: 'beta_ui_enabled', label: 'Meridian Glass UI', desc: 'Activate experimental high-fidelity interfaces.', icon: <Settings2 className="w-4 h-4" /> },
                            ].map((flag) => (
                                <div key={flag.id} className="p-6 flex items-center justify-between group hover:bg-slate-800/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-primary transition-colors">
                                            {flag.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{flag.label}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{flag.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={(config.featureFlags as any)[flag.id]}
                                        onCheckedChange={(val) => handleToggleFlag(flag.id as any, val)}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <Separator className="bg-slate-800/50" />

                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Thinking Pricing Rules</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Algorithmic Yield Modifiers</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { id: 'base_multiplier', label: 'Global Surge Index', placeholder: '1.0' },
                                { id: 'high_season_surge', label: 'Peak Season Multiplier', placeholder: '1.2' },
                                { id: 'last_minute_discount', label: 'Urgency Discount Coefficient', placeholder: '0.8' },
                            ].map((rule) => (
                                <div key={rule.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl space-y-3 group hover:border-primary/20 transition-all">
                                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{rule.label}</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            className="bg-slate-950 border-slate-800 h-12 text-sm font-black text-primary font-mono pl-4 pr-12 rounded-xl"
                                            value={(config.pricingRules as any)[rule.id]}
                                            onChange={(e) => handleUpdatePricing(rule.id as any, e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700">MOD</div>
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-medium leading-relaxed uppercase">
                                        Adjusts base rates across all {rule.label.toLowerCase()} dynamically.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Security & System */}
                <div className="space-y-8">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] pointer-events-none" />

                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-400" /> Administrative Shield
                        </h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Master Key Rotation</p>
                                <p className="text-xs font-bold text-white tracking-widest font-mono">****-****-****-XP22</p>
                                <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest h-8 text-primary hover:text-white mt-2">ROTATE SECRETS</Button>
                            </div>

                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Database Heartbeat</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-green-400 uppercase italic">
                                    <Activity className="w-3 h-3" /> Optimum
                                </div>
                                <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest h-8 text-slate-600 hover:text-white mt-2">VIEW CLOUD LOGS</Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl space-y-4">
                        <h3 className="text-xs font-black text-red-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <RefreshCcw className="w-4 h-4" /> Atomic Reset
                        </h3>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase">
                            Warning: A factory reset will wipe all neural pricing patterns and reset feature flags to defaults. This action is irreversible.
                        </p>
                        <Button variant="outline" className="w-full border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl transition-all">
                            EXECUTE PLATFORM WIPE
                        </Button>
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
