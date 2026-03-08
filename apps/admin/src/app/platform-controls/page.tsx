'use client';

import { useState } from 'react';
import {
    ToggleLeft,
    Globe,
    ShieldAlert,
    CalendarClock,
    Zap,
    BookOpen,
    MessageCircle,
    UserPlus,
    Bot,
    Star,
    Tag,
    Gift,
    Cpu,
    Eye,
    EyeOff,
    AlertTriangle,
    Wrench,
} from 'lucide-react';
import { useSettings, PlatformConfig } from '@/lib/hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function PlatformControlsPage() {
    const { config, loading, updateConfig } = useSettings();
    const [saving, setSaving] = useState(false);

    const handleTogglePage = async (key: keyof PlatformConfig['pages'], val: boolean) => {
        if (!config) return;
        setSaving(true);
        try {
            await updateConfig({ pages: { ...config.pages, [key]: val } });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleFlag = async (key: keyof PlatformConfig['featureFlags'], val: boolean) => {
        if (!config) return;
        setSaving(true);
        try {
            await updateConfig({ featureFlags: { ...config.featureFlags, [key]: val } });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateMaintenance = async (partial: Partial<PlatformConfig['maintenance']>) => {
        if (!config) return;
        setSaving(true);
        try {
            await updateConfig({ maintenance: { ...config.maintenance, ...partial } });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateBookingWindow = async (partial: Partial<PlatformConfig['bookingWindow']>) => {
        if (!config) return;
        setSaving(true);
        try {
            await updateConfig({ bookingWindow: { ...config.bookingWindow, ...partial } });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !config) {
        return (
            <div className="p-8 flex items-center justify-center h-[50vh]">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] animate-pulse">Loading Platform Controls...</p>
            </div>
        );
    }

    const pageToggles: { id: keyof PlatformConfig['pages']; label: string; desc: string }[] = [
        { id: 'homepage', label: 'Homepage', desc: 'Main landing page with hero, stats, and mood grid' },
        { id: 'explore', label: 'Explore', desc: 'Browse all tours and experiences by category' },
        { id: 'packages', label: 'Packages', desc: 'Pre-built multi-day itinerary packages' },
        { id: 'directory', label: 'Directory', desc: 'Operator listing and search directory' },
        { id: 'map', label: 'Map', desc: 'Interactive Google Maps with operator pins' },
        { id: 'booking', label: 'Booking', desc: 'Tour booking portal and event basket' },
        { id: 'about', label: 'About', desc: 'Company story, mission, and team section' },
        { id: 'contact', label: 'Contact', desc: 'Contact form and office details' },
        { id: 'blog', label: 'Blog', desc: 'Blog posts and content articles' },
    ];

    const featureFlags: { id: keyof PlatformConfig['featureFlags']; label: string; desc: string; icon: React.ReactNode; color?: string }[] = [
        { id: 'bookings_enabled', label: 'Bookings Engine', desc: 'Enable/disable all checkout flows', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'ai_assistant_enabled', label: 'AI Assistant', desc: 'AI-powered chat support on tourist site', icon: <Bot className="w-4 h-4" /> },
        { id: 'whatsapp_chat_enabled', label: 'WhatsApp Chat', desc: 'WhatsApp integration and notifications', icon: <MessageCircle className="w-4 h-4" />, color: 'text-green-400' },
        { id: 'user_registration_enabled', label: 'User Registration', desc: 'Allow new user signups on tourist site', icon: <UserPlus className="w-4 h-4" /> },
        { id: 'operator_portal_active', label: 'Operator Portal', desc: 'External operator dashboard access', icon: <Globe className="w-4 h-4" /> },
        { id: 'dynamic_pricing_active', label: 'Dynamic Pricing', desc: 'Algorithmic price adjustments', icon: <Cpu className="w-4 h-4" /> },
        { id: 'beta_ui_enabled', label: 'Beta UI', desc: 'Experimental interface features', icon: <Zap className="w-4 h-4" /> },
        { id: 'promo_codes_enabled', label: 'Promo Codes', desc: 'Enable discount promo code entry at checkout', icon: <Tag className="w-4 h-4" /> },
        { id: 'gift_vouchers_enabled', label: 'Gift Vouchers', desc: 'Allow gift voucher purchase and redemption', icon: <Gift className="w-4 h-4" /> },
        { id: 'reviews_enabled', label: 'Reviews', desc: 'Guest review and rating submission', icon: <Star className="w-4 h-4" /> },
    ];

    return (
        <main className="p-8 max-w-[1400px] mx-auto space-y-12">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Phase 2
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Platform Controls
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Master switches for every tourist site page, feature, and system behavior.
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", saving ? "bg-yellow-400" : "bg-green-400")} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {saving ? "SYNCING..." : "LIVE SYNC"}
                    </span>
                </div>
            </header>

            {/* Maintenance Mode Banner */}
            {config.maintenance.enabled && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-red-400 uppercase tracking-wide">Maintenance Mode Active</p>
                        <p className="text-xs text-slate-400 mt-1">The tourist site is showing the maintenance message to all visitors.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">

                {/* Left: Page Toggles + Feature Flags */}
                <div className="xl:col-span-2 space-y-12">

                    {/* Page Visibility Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary">
                                <ToggleLeft className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Page Visibility</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Show or hide tourist site pages</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/50">
                            {pageToggles.map((page) => (
                                <div key={page.id} className="p-5 flex items-center justify-between group hover:bg-slate-800/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center transition-colors", config.pages[page.id] ? "text-primary" : "text-slate-700")}>
                                            {config.pages[page.id] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{page.label}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{page.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={config.pages[page.id]}
                                        onCheckedChange={(val) => handleTogglePage(page.id, val)}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="border-t border-slate-800/50" />

                    {/* Feature Flags Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Feature Flags</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Toggle site features on or off</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/50">
                            {featureFlags.map((flag) => (
                                <div key={flag.id} className="p-5 flex items-center justify-between group hover:bg-slate-800/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center transition-colors", config.featureFlags[flag.id] ? (flag.color || "text-primary") : "text-slate-700")}>
                                            {flag.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{flag.label}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{flag.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={config.featureFlags[flag.id]}
                                        onCheckedChange={(val) => handleToggleFlag(flag.id, val)}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Maintenance + Booking Window */}
                <div className="space-y-8">

                    {/* Maintenance Mode */}
                    <div className={cn("border rounded-3xl p-8 space-y-6 relative overflow-hidden", config.maintenance.enabled ? "bg-red-500/5 border-red-500/20" : "bg-slate-900 border-slate-800")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] pointer-events-none" />

                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-yellow-400" /> Maintenance Mode
                            </h3>
                            <Switch
                                checked={config.maintenance.enabled}
                                onCheckedChange={(val) => handleUpdateMaintenance({ enabled: val })}
                                className="data-[state=checked]:bg-red-500"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maintenance Message</Label>
                                <textarea
                                    value={config.maintenance.message}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateMaintenance({ message: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 min-h-[80px] rounded-xl text-sm text-white resize-none p-3 focus:outline-none focus:border-primary/50"
                                    placeholder="We are currently performing maintenance..."
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                                <div>
                                    <p className="text-xs font-bold text-white">Allow Admin Access</p>
                                    <p className="text-[10px] text-slate-500">Admins can still browse during maintenance</p>
                                </div>
                                <Switch
                                    checked={config.maintenance.allowAdmins}
                                    onCheckedChange={(val) => handleUpdateMaintenance({ allowAdmins: val })}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Booking Window */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] pointer-events-none" />

                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <CalendarClock className="w-4 h-4 text-primary" /> Booking Window
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Min Advance (Hours)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={config.bookingWindow.minAdvanceHours}
                                    onChange={(e) => handleUpdateBookingWindow({ minAdvanceHours: parseInt(e.target.value) || 0 })}
                                    className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold text-primary font-mono"
                                />
                                <p className="text-[9px] text-slate-600 font-medium">Minimum hours before event the guest must book.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Advance (Days)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={config.bookingWindow.maxAdvanceDays}
                                    onChange={(e) => handleUpdateBookingWindow({ maxAdvanceDays: parseInt(e.target.value) || 90 })}
                                    className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold text-primary font-mono"
                                />
                                <p className="text-[9px] text-slate-600 font-medium">How far in advance guests can book tours.</p>
                            </div>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Config Status</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Firestore Path</span>
                                <span className="text-primary font-mono text-[10px]">platformConfig/features</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Active Pages</span>
                                <span className="text-white font-bold">{Object.values(config.pages).filter(Boolean).length}/{Object.keys(config.pages).length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Active Features</span>
                                <span className="text-white font-bold">{Object.values(config.featureFlags).filter(Boolean).length}/{Object.keys(config.featureFlags).length}</span>
                            </div>
                            {config.updatedAt && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Last Update</span>
                                    <span className="text-slate-400 text-[10px]">{new Date(config.updatedAt.seconds * 1000).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
