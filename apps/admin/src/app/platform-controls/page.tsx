'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { toast } from 'sonner';
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
    Save,
    X
} from 'lucide-react';
import { PlatformConfig, DEFAULT_CONFIG } from '@/lib/hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PlatformControlsPage() {
    const [savedConfig, setSavedConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);
    const [localConfig, setLocalConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const checkHasChanges = () => {
        const { updatedAt: _u1, ...lConfig } = localConfig;
        const { updatedAt: _u2, ...sConfig } = savedConfig;
        return JSON.stringify(lConfig) !== JSON.stringify(sConfig);
    };
    const hasChanges = checkHasChanges();

    useEffect(() => {
        const fetchFlags = async () => {
            try {
                const snap = await getDoc(doc(db, 'platformConfig', 'features'));
                if (snap.exists()) {
                    const data = snap.data() as Partial<PlatformConfig>;
                    const merged: PlatformConfig = {
                        pages: { ...DEFAULT_CONFIG.pages, ...data.pages },
                        featureFlags: { ...DEFAULT_CONFIG.featureFlags, ...data.featureFlags },
                        maintenance: { ...DEFAULT_CONFIG.maintenance, ...data.maintenance },
                        bookingWindow: { ...DEFAULT_CONFIG.bookingWindow, ...data.bookingWindow },
                        pricingRules: { ...DEFAULT_CONFIG.pricingRules, ...data.pricingRules },
                        updatedAt: data.updatedAt,
                    };
                    setSavedConfig(merged);
                    setLocalConfig(merged);
                }
            } catch (err) {
                console.error('Failed to load platform controls', err);
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchFlags();
    }, []);

    const handleTogglePage = (key: keyof PlatformConfig['pages']) => {
        setLocalConfig(prev => ({
            ...prev,
            pages: { ...prev.pages, [key]: !prev.pages[key] }
        }));
    };

    const handleToggleFlag = (key: keyof PlatformConfig['featureFlags']) => {
        setLocalConfig(prev => ({
            ...prev,
            featureFlags: { ...prev.featureFlags, [key]: !prev.featureFlags[key] }
        }));
    };

    const handleUpdateMaintenance = (partial: Partial<PlatformConfig['maintenance']>) => {
        setLocalConfig(prev => ({
            ...prev,
            maintenance: { ...prev.maintenance, ...partial }
        }));
    };

    const handleUpdateBookingWindow = (partial: Partial<PlatformConfig['bookingWindow']>) => {
        setLocalConfig(prev => ({
            ...prev,
            bookingWindow: { ...prev.bookingWindow, ...partial }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const savePayload = { ...localConfig, updatedAt: serverTimestamp() };
            await setDoc(doc(db, 'platformConfig', 'features'), savePayload, { merge: true });

            // Re-fetch to get real serverTimestamp
            const snap = await getDoc(doc(db, 'platformConfig', 'features'));
            if (snap.exists()) {
                const refreshed = snap.data() as Partial<PlatformConfig>;
                const finalMerge: PlatformConfig = {
                    ...localConfig,
                    updatedAt: refreshed.updatedAt
                };
                setSavedConfig(finalMerge);
                setLocalConfig(finalMerge);
            } else {
                setSavedConfig(localConfig);
            }
            toast.success('Platform controls saved successfully');
        } catch (error) {
            console.error('Error saving config:', error);
            toast.error('Failed to save — please try again');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setLocalConfig(savedConfig);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-[50vh]">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] animate-pulse">Loading Platform Controls...</p>
            </div>
        );
    }

    const pageToggles: { id: keyof PlatformConfig['pages']; label: string; desc: string }[] = [
        { id: 'showHomePage', label: 'Homepage', desc: 'Main landing page with hero, stats, and mood grid' },
        { id: 'showExplorePage', label: 'Explore', desc: 'Browse all tours and experiences by category' },
        { id: 'showPackagesPage', label: 'Packages', desc: 'Pre-built multi-day itinerary packages' },
        { id: 'showDirectoryPage', label: 'Directory', desc: 'Operator listing and search directory' },
        { id: 'showMapPage', label: 'Map', desc: 'Interactive Google Maps with operator pins' },
        { id: 'showBookingPage', label: 'Booking', desc: 'Tour booking portal and event basket' },
        { id: 'showAboutPage', label: 'About', desc: 'Company story, mission, and team section' },
        { id: 'showContactPage', label: 'Contact', desc: 'Contact form and office details' },
        { id: 'showBlogPage', label: 'Blog', desc: 'Blog posts and content articles' },
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
        <main className="p-8 max-w-[1400px] mx-auto space-y-12 pb-32">
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
            </header>

            {/* Warning Banner */}
            {hasChanges && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between shadow-lg sticky top-6 z-50 backdrop-blur-xl gap-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">⚠️ You have unsaved changes</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDiscard}
                            className="text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Discard
                        </Button>
                        <Button
                            size="sm"
                            disabled={isSaving}
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold"
                        >
                            <Save className={cn("w-4 h-4 mr-2", isSaving && "animate-pulse")} />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Maintenance Mode Banner */}
            {localConfig.maintenance.enabled && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
                    <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
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
                                        <div className={cn("w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center transition-colors", localConfig.pages[page.id] ? "text-primary" : "text-slate-700")}>
                                            {localConfig.pages[page.id] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{page.label}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{page.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={localConfig.pages[page.id]}
                                        onCheckedChange={() => handleTogglePage(page.id)}
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
                                        <div className={cn("w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center transition-colors", localConfig.featureFlags[flag.id] ? (flag.color || "text-primary") : "text-slate-700")}>
                                            {flag.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{flag.label}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{flag.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={localConfig.featureFlags[flag.id]}
                                        onCheckedChange={() => handleToggleFlag(flag.id)}
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
                    <div className={cn("border rounded-3xl p-8 space-y-6 relative overflow-hidden", localConfig.maintenance.enabled ? "bg-red-500/5 border-red-500/20" : "bg-slate-900 border-slate-800")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] pointer-events-none" />

                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-yellow-400" /> Maintenance Mode
                            </h3>
                            <Switch
                                checked={localConfig.maintenance.enabled}
                                onCheckedChange={(val) => handleUpdateMaintenance({ enabled: val })}
                                className="data-[state=checked]:bg-red-500"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maintenance Message</Label>
                                <textarea
                                    value={localConfig.maintenance.message}
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
                                    checked={localConfig.maintenance.allowAdmins}
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
                                    value={localConfig.bookingWindow.minAdvanceHours}
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
                                    value={localConfig.bookingWindow.maxAdvanceDays}
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
                                <span className="text-white font-bold">{Object.values(localConfig.pages).filter(Boolean).length}/{Object.keys(localConfig.pages).length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Active Features</span>
                                <span className="text-white font-bold">{Object.values(localConfig.featureFlags).filter(Boolean).length}/{Object.keys(localConfig.featureFlags).length}</span>
                            </div>
                            {savedConfig.updatedAt && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Last Update</span>
                                    <span className="text-slate-400 text-[10px]">{new Date(savedConfig.updatedAt.seconds * 1000).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
