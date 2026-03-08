'use client';

import { useState } from 'react';
import { useOperators } from '@/lib/hooks/useOperators';
import { usePackages } from '@/lib/hooks/usePackages';
import { usePricing, PricingConfig, PricingRule } from '@/lib/hooks/usePricing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Save, Loader2, ToggleLeft, ToggleRight, Percent, Users, Zap, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PricingPage() {
    const { operators, editOperator } = useOperators();
    const { packages, editPackage } = usePackages();
    const { config, loading, saveConfig } = usePricing();
    const [localConfig, setLocalConfig] = useState<PricingConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});

    const currentConfig = localConfig || config;

    const handleSaveConfig = async () => {
        if (!currentConfig) return;
        setSaving(true);
        try {
            await saveConfig(currentConfig);
            setLocalConfig(null);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save pricing config:', err);
        } finally {
            setSaving(false);
        }
    };

    const updateRule = (index: number, updates: Partial<PricingRule>) => {
        const rules = [...currentConfig.dynamicRules];
        rules[index] = { ...rules[index], ...updates };
        setLocalConfig({ ...currentConfig, dynamicRules: rules });
    };

    const handleOperatorPriceSave = async (opId: string) => {
        const price = parseFloat(editingPrices[opId]);
        if (isNaN(price)) return;
        try {
            await editOperator(opId, { basePrice: price });
            setEditingPrices(prev => { const copy = { ...prev }; delete copy[opId]; return copy; });
        } catch (err) {
            console.error('Failed to update operator price:', err);
        }
    };

    const handlePackagePriceSave = async (pkgId: string) => {
        const price = parseFloat(editingPrices[pkgId]);
        if (isNaN(price)) return;
        try {
            await editPackage(pkgId, { pricePerHead: price });
            setEditingPrices(prev => { const copy = { ...prev }; delete copy[pkgId]; return copy; });
        } catch (err) {
            console.error('Failed to update package price:', err);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-8 space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary" /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Pricing Control</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Revenue Optimisation Engine</p>
                    </div>
                </div>
                {localConfig && (
                    <Button onClick={handleSaveConfig} disabled={saving} className="bg-primary text-slate-950 hover:bg-primary/90 h-12 px-6 font-bold uppercase tracking-widest text-xs">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {saved ? 'SAVED ✓' : 'SAVE CHANGES'}
                    </Button>
                )}
            </div>

            {/* Platform Fee */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary"><Percent className="w-5 h-5" /><h2 className="text-sm font-bold uppercase tracking-widest">Platform Commission</h2></div>
                <div className="flex items-center gap-4">
                    <Input type="number" className="bg-slate-950 border-slate-800 h-12 w-32" value={currentConfig.platformFeePercent}
                        onChange={e => setLocalConfig({ ...currentConfig, platformFeePercent: parseFloat(e.target.value) || 0 })} />
                    <span className="text-sm text-slate-400">% applied to all bookings</span>
                </div>
            </div>

            {/* Operator Prices */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary"><Users className="w-5 h-5" /><h2 className="text-sm font-bold uppercase tracking-widest">Operator Base Prices</h2></div>
                <div className="space-y-2">
                    {operators.map(op => (
                        <div key={op.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-800/50 transition-colors">
                            <span className="text-sm font-medium">{op.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">FJD</span>
                                <Input type="number" className="bg-slate-950 border-slate-800 h-9 w-28 text-right text-primary font-bold"
                                    value={editingPrices[op.id] ?? op.basePrice?.toString() ?? '0'}
                                    onChange={e => setEditingPrices({ ...editingPrices, [op.id]: e.target.value })}
                                    onBlur={() => editingPrices[op.id] !== undefined && handleOperatorPriceSave(op.id)}
                                    onKeyDown={e => e.key === 'Enter' && handleOperatorPriceSave(op.id)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Package Prices */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary"><DollarSign className="w-5 h-5" /><h2 className="text-sm font-bold uppercase tracking-widest">Package Prices</h2></div>
                <div className="space-y-2">
                    {packages.map(pkg => (
                        <div key={pkg.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-800/50 transition-colors">
                            <span className="text-sm font-medium">{pkg.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">FJD / head</span>
                                <Input type="number" className="bg-slate-950 border-slate-800 h-9 w-28 text-right text-primary font-bold"
                                    value={editingPrices[pkg.id] ?? pkg.pricePerHead?.toString() ?? '0'}
                                    onChange={e => setEditingPrices({ ...editingPrices, [pkg.id]: e.target.value })}
                                    onBlur={() => editingPrices[pkg.id] !== undefined && handlePackagePriceSave(pkg.id)}
                                    onKeyDown={e => e.key === 'Enter' && handlePackagePriceSave(pkg.id)} />
                            </div>
                        </div>
                    ))}
                    {packages.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">No packages configured yet</p>}
                </div>
            </div>

            {/* Dynamic Pricing Rules */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary"><Zap className="w-5 h-5" /><h2 className="text-sm font-bold uppercase tracking-widest">Dynamic Pricing Rules</h2></div>
                <div className="space-y-3">
                    {currentConfig.dynamicRules.map((rule, i) => (
                        <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-950/50 border border-slate-800/50">
                            <div className="flex items-center gap-4">
                                <button onClick={() => updateRule(i, { enabled: !rule.enabled })} className="text-slate-400 hover:text-white transition-colors">
                                    {rule.enabled ? <ToggleRight className="w-6 h-6 text-green-400" /> : <ToggleLeft className="w-6 h-6" />}
                                </button>
                                <div>
                                    <p className={cn("text-sm font-bold", !rule.enabled && "text-slate-500")}>{rule.name}</p>
                                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                                        {rule.type === 'peak' || rule.type === 'offpeak' ? `${rule.startDate} → ${rule.endDate}` : `${rule.daysThreshold} days threshold`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input type="number" step="0.01" className="bg-slate-950 border-slate-800 h-9 w-20 text-right text-sm"
                                    value={rule.multiplier} onChange={e => updateRule(i, { multiplier: parseFloat(e.target.value) || 1 })} />
                                <span className="text-xs text-slate-500 w-8">{rule.multiplier >= 1 ? `+${Math.round((rule.multiplier - 1) * 100)}%` : `${Math.round((rule.multiplier - 1) * 100)}%`}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Operator Pricing Overrides */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-tight">
                    <Zap className="w-5 h-5" />
                    <h2 className="text-sm">Operator Pricing Overrides</h2>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Set specific prices for holiday dates or peak events</p>

                <div className="space-y-6">
                    {operators.map(op => (
                        <div key={op.id} className="border border-slate-800 rounded-xl p-4 bg-slate-950/20 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-200">{op.name}</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const date = prompt('Enter date (YYYY-MM-DD):');
                                        const price = prompt('Enter price (FJD):');
                                        if (date && price) {
                                            const newOverrides = [...(op.pricingOverrides || []), { date, price: parseFloat(price) }];
                                            editOperator(op.id, { pricingOverrides: newOverrides });
                                        }
                                    }}
                                    className="h-8 text-[10px] border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 uppercase tracking-widest font-bold"
                                >
                                    Add Override
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {op.pricingOverrides?.map((ov, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-lg group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-primary font-bold">{ov.date}</span>
                                            <span className="text-xs font-black text-white">FJD ${ov.price}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                const filtered = op.pricingOverrides?.filter((_, i) => i !== idx);
                                                editOperator(op.id, { pricingOverrides: filtered });
                                            }}
                                            className="h-7 w-7 text-slate-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                                {(!op.pricingOverrides || op.pricingOverrides.length === 0) && (
                                    <div className="col-span-full py-4 text-center border border-dashed border-slate-800 rounded-lg">
                                        <p className="text-[10px] text-slate-600 uppercase tracking-widest">No overrides active</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Group Discounts */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Group Discounts</h2>
                <div className="space-y-2">
                    {currentConfig.groupDiscounts.map((gd, i) => (
                        <div key={i} className="flex items-center gap-4 py-2">
                            <Input type="number" className="bg-slate-950 border-slate-800 h-9 w-20" value={gd.minPax}
                                onChange={e => { const arr = [...currentConfig.groupDiscounts]; arr[i] = { ...arr[i], minPax: parseInt(e.target.value) || 0 }; setLocalConfig({ ...currentConfig, groupDiscounts: arr }); }} />
                            <span className="text-xs text-slate-500">+ guests →</span>
                            <Input type="number" className="bg-slate-950 border-slate-800 h-9 w-20" value={gd.discountPercent}
                                onChange={e => { const arr = [...currentConfig.groupDiscounts]; arr[i] = { ...arr[i], discountPercent: parseFloat(e.target.value) || 0 }; setLocalConfig({ ...currentConfig, groupDiscounts: arr }); }} />
                            <span className="text-xs text-slate-500">% off</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
