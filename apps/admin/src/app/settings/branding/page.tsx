'use client';

import { useBranding, BrandingConfig } from '@/lib/hooks/useBranding';
import { useMedia } from '@/lib/hooks/useMedia';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Palette, ImageIcon, Type, Save, Check, RotateCcw, Image as LucideImage } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function BrandingPage() {
    const { branding, loading, updateBranding, DEFAULT_BRANDING } = useBranding();
    const { assets } = useMedia();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [localBranding, setLocalBranding] = useState(branding);
    const [showMediaPicker, setShowMediaPicker] = useState<keyof BrandingConfig['logos'] | null>(null);

    useEffect(() => {
        if (branding && !localBranding) {
            setLocalBranding(branding);
        }
    }, [branding]);

    if (loading || !localBranding) {
        return (
            <div className="p-8 flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleSave = async () => {
        if (!localBranding) return;
        setSaving(true);
        try {
            await updateBranding(localBranding);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save branding:', err);
        } finally {
            setSaving(false);
        }
    };

    const updateColor = (key: keyof BrandingConfig['colors'], val: string) => {
        if (!localBranding) return;
        setLocalBranding({
            ...localBranding,
            colors: { ...localBranding.colors, [key]: val }
        });
    };

    const updateLogo = (key: keyof BrandingConfig['logos'], val: string) => {
        if (!localBranding) return;
        setLocalBranding({
            ...localBranding,
            logos: { ...localBranding.logos, [key]: val }
        });
        setShowMediaPicker(null);
    };

    return (
        <main className="p-8 max-w-[1200px] mx-auto space-y-12 pb-24">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Aesthetics Node Alpha
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Branding Control
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Global theme orchestration & visual identity parameters
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setLocalBranding(DEFAULT_BRANDING)}
                        className="bg-transparent border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 gap-2 h-11 px-6 rounded-xl font-bold uppercase tracking-wider text-xs"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Defaults
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !localBranding}
                        className="bg-primary text-slate-950 hover:bg-primary/90 gap-2 h-11 px-6 rounded-xl font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-95"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                        {saving ? 'Syncing...' : (saved ? 'Saved✓' : 'Publish Changes')}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Colors Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Color Palette</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Chromatic engine variables</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 shadow-2xl">
                        {(Object.entries(localBranding.colors) as [keyof typeof DEFAULT_BRANDING.colors, string][]).map(([key, value]) => (
                            <div key={key} className="space-y-3 group">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                                    {key}
                                    <span className="text-slate-700 font-mono group-hover:text-primary transition-colors">{value}</span>
                                </Label>
                                <div className="flex gap-4">
                                    <div
                                        className="w-12 h-12 rounded-xl border border-slate-800 shadow-inner"
                                        style={{ backgroundColor: value }}
                                    />
                                    <Input
                                        type="color"
                                        className="bg-slate-950 border-slate-800 h-12 w-full p-2 rounded-xl cursor-pointer"
                                        value={value}
                                        onChange={(e) => updateColor(key, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Logos Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            <LucideImage className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Asset Matrix</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Visual identifier resources</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl">
                        {(Object.entries(localBranding.logos) as [keyof typeof DEFAULT_BRANDING.logos, string][]).map(([key, value]) => (
                            <div key={key} className="space-y-4">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key} Identifier</Label>
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden group relative">
                                        {value ? (
                                            <img src={value} alt={key} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-slate-800" />
                                        )}
                                        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setShowMediaPicker(key as any)}
                                                className="text-[10px] uppercase font-black tracking-widest text-primary"
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            className="bg-slate-950 border-slate-800 h-11 text-xs text-slate-400 font-mono rounded-xl focus:ring-primary focus:border-primary"
                                            value={value}
                                            onChange={(e) => updateLogo(key as any, e.target.value)}
                                            placeholder="https://..."
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowMediaPicker(key as any)}
                                            className="w-full h-10 border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800"
                                        >
                                            <ImageIcon className="w-3 h-3 mr-2" />
                                            Browse Media Library
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Typography Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <Type className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Typography Engine</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Semantic font mapping</p>
                    </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Heading Font</Label>
                        <select
                            className="bg-slate-950 border-slate-800 h-12 w-full px-4 rounded-xl text-sm font-bold text-white focus:ring-primary focus:border-primary appearance-none"
                            value={localBranding.typography.primaryFont}
                            onChange={(e) => setLocalBranding({ ...localBranding, typography: { ...localBranding.typography, primaryFont: e.target.value } })}
                        >
                            <option value="Tahoma">Tahoma (Current Vualiku Edge)</option>
                            <option value="Inter">Inter (Clean Modernist)</option>
                            <option value="Outfit">Outfit (Geometric Premium)</option>
                            <option value="Bebas Neue">Bebas Neue (Punchy Editorial)</option>
                        </select>
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secondary Body Font</Label>
                        <select
                            className="bg-slate-950 border-slate-800 h-12 w-full px-4 rounded-xl text-sm font-bold text-white focus:ring-primary focus:border-primary appearance-none"
                            value={localBranding.typography.secondaryFont}
                            onChange={(e) => setLocalBranding({ ...localBranding, typography: { ...localBranding.typography, secondaryFont: e.target.value } })}
                        >
                            <option value="Inter">Inter (Current Standard)</option>
                            <option value="Roboto">Roboto (Global Default)</option>
                            <option value="Outfit">Outfit (Premium Body)</option>
                            <option value="Source Sans Pro">Source Sans Pro</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Media Picker Overlay */}
            {showMediaPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(34,197,94,0.1)]">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">SELECT {(showMediaPicker as string).toUpperCase()} ASSET</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Select an identifier from your storage node</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowMediaPicker(null)} className="text-slate-500 hover:text-white">
                                <RotateCcw className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-8 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {assets.map(asset => (
                                <button
                                    key={asset.id}
                                    onClick={() => updateLogo(showMediaPicker as any, asset.url)}
                                    className="group space-y-2 text-left"
                                >
                                    <div className="aspect-square bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden group-hover:border-primary/50 transition-all p-2 bg-checkerboard">
                                        <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate">{asset.name}</p>
                                </button>
                            ))}
                        </div>
                        <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end">
                            <Button onClick={() => setShowMediaPicker(null)} variant="ghost" className="text-xs font-black uppercase tracking-widest">Cancel</Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
