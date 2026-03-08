'use client';

import { useState } from 'react';
import { usePromos, PromoCode } from '@/lib/hooks/usePromos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Ticket, Megaphone, Plus, Link, PaintRoller, Trash2, Edit2, Loader2, Save } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function PromotionsPage() {
    const { promoCodes, banner, loading, addPromo, editPromo, removePromo, updateBanner } = usePromos();

    // Banner UI State
    const [bannerText, setBannerText] = useState('');
    const [bannerLink, setBannerLink] = useState('');
    const [bannerLinkText, setBannerLinkText] = useState('');
    const [bannerColor, setBannerColor] = useState('bg-primary');
    const [savingBanner, setSavingBanner] = useState(false);

    // Initial load sync
    useState(() => {
        if (banner) {
            setBannerText(banner.text);
            setBannerLink(banner.linkUrl || '');
            setBannerLinkText(banner.linkText || '');
            setBannerColor(banner.backgroundColor);
        }
    });

    const handleSaveBanner = async () => {
        setSavingBanner(true);
        try {
            await updateBanner({
                text: bannerText,
                linkUrl: bannerLink,
                linkText: bannerLinkText,
                backgroundColor: bannerColor
            });
        } finally {
            setSavingBanner(false);
        }
    };

    const [isPromoOpen, setIsPromoOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [promoForm, setPromoForm] = useState({
        code: '',
        discountType: 'percentage' as 'percentage' | 'flat',
        discountValue: '',
        maxUses: '',
        expiryDate: ''
    });

    const handleOpenPromo = (op?: PromoCode) => {
        if (op) {
            setEditingPromo(op);
            setPromoForm({
                code: op.code,
                discountType: op.discountType,
                discountValue: op.discountValue.toString(),
                maxUses: op.maxUses?.toString() || '',
                expiryDate: op.expiryDate || ''
            });
        } else {
            setEditingPromo(null);
            setPromoForm({
                code: '',
                discountType: 'percentage',
                discountValue: '',
                maxUses: '',
                expiryDate: ''
            });
        }
        setIsPromoOpen(true);
    };

    const handleSavePromo = async () => {
        if (!promoForm.code || !promoForm.discountValue) return;

        const data = {
            code: promoForm.code,
            discountType: promoForm.discountType,
            discountValue: parseFloat(promoForm.discountValue),
            maxUses: promoForm.maxUses ? parseInt(promoForm.maxUses) : undefined,
            expiryDate: promoForm.expiryDate || undefined,
            active: editingPromo ? editingPromo.active : true
        };

        if (editingPromo) {
            await editPromo(editingPromo.id, data);
        } else {
            await addPromo(data);
        }
        setIsPromoOpen(false);
    };

    if (loading || !banner) {
        return (
            <main className="p-8 max-w-[1600px] mx-auto flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </main>
        );
    }

    return (
        <main className="p-8 max-w-[1600px] mx-auto space-y-12 pb-24">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Meridian Node Epsilon
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Promotions
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Global Banners &amp; Marketing Codes
                    </p>
                </div>
            </header>

            {/* Global Banner Module */}
            <section className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-tahoma text-white uppercase italic tracking-tight">Global Announcement Banner</h2>
                            <p className="text-sm text-slate-500">The banner displayed at the absolute top of the tourist site.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</Label>
                        <Switch
                            checked={banner.active}
                            onCheckedChange={(val) => updateBanner({ active: val })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2 lg:col-span-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Banner Text</Label>
                        <Input
                            value={bannerText || banner.text}
                            onChange={(e) => setBannerText(e.target.value)}
                            placeholder="e.g. Summer Sale! Get 20% off all bookings."
                            className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><Link className="w-3 h-3" /> Target URL (Optional)</Label>
                        <Input
                            value={bannerLink || banner.linkUrl || ''}
                            onChange={(e) => setBannerLink(e.target.value)}
                            placeholder="/booking or https://..."
                            className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Button Text (Optional)</Label>
                        <Input
                            value={bannerLinkText || banner.linkText || ''}
                            onChange={(e) => setBannerLinkText(e.target.value)}
                            placeholder="e.g. Book Now"
                            className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <PaintRoller className="w-4 h-4 text-slate-500" />
                        <div className="flex gap-2">
                            {['bg-primary', 'bg-blue-500', 'bg-purple-500', 'bg-red-500'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setBannerColor(color)}
                                    className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", color, color === bannerColor ? "border-white" : "border-transparent opacity-50")}
                                />
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={handleSaveBanner}
                        disabled={savingBanner}
                        className="bg-primary text-slate-950 hover:bg-primary/90 font-bold uppercase tracking-wider text-xs px-8 h-10 rounded-xl"
                    >
                        {savingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Publish Changes</>}
                    </Button>
                </div>
            </section>

            {/* Promo Codes Module */}
            <section className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-tahoma text-white uppercase italic tracking-tight">Voucher &amp; Promo Codes</h2>
                            <p className="text-sm text-slate-500">Manage discount codes for checkout.</p>
                        </div>
                    </div>

                    <Dialog open={isPromoOpen} onOpenChange={setIsPromoOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenPromo()} className="bg-amber-500 text-slate-950 hover:bg-amber-400 gap-2 h-11 px-6 rounded-xl font-bold uppercase tracking-wider text-xs">
                                <Plus className="w-4 h-4" /> Issue New Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white p-8 rounded-3xl">
                            <DialogHeader className="mb-6">
                                <DialogTitle className="text-xl font-black font-tahoma uppercase italic tracking-wider flex items-center gap-3">
                                    <Ticket className="w-5 h-5 text-amber-500" />
                                    {editingPromo ? 'Edit Promo Code' : 'Issue Promo Code'}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Code (e.g. BULA20)</Label>
                                    <Input
                                        value={promoForm.code}
                                        onChange={e => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                        className="bg-slate-950 border-slate-800 rounded-xl uppercase font-mono tracking-widest h-12"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</Label>
                                        <select
                                            value={promoForm.discountType}
                                            onChange={e => setPromoForm(p => ({ ...p, discountType: e.target.value as any }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl h-12 px-3 text-sm focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="percentage">% Percentage</option>
                                            <option value="flat">$ Flat Amount</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Value</Label>
                                        <Input
                                            type="number"
                                            value={promoForm.discountValue}
                                            onChange={e => setPromoForm(p => ({ ...p, discountValue: e.target.value }))}
                                            className="bg-slate-950 border-slate-800 rounded-xl h-12"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Uses (Optional)</Label>
                                        <Input
                                            type="number"
                                            value={promoForm.maxUses}
                                            onChange={e => setPromoForm(p => ({ ...p, maxUses: e.target.value }))}
                                            className="bg-slate-950 border-slate-800 rounded-xl h-12"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expiry (Optional)</Label>
                                        <Input
                                            type="date"
                                            value={promoForm.expiryDate}
                                            onChange={e => setPromoForm(p => ({ ...p, expiryDate: e.target.value }))}
                                            className="bg-slate-950 border-slate-800 rounded-xl h-12"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSavePromo}
                                    disabled={!promoForm.code || !promoForm.discountValue}
                                    className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold uppercase tracking-wider text-xs h-12 rounded-xl"
                                >
                                    {editingPromo ? 'Update Code' : 'Create Code'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/30">
                    <Table>
                        <TableHeader className="bg-slate-950">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Code</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Discount</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Uses</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Expiry</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promoCodes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                        No active promo codes.
                                    </TableCell>
                                </TableRow>
                            ) : promoCodes.map((promo) => (
                                <TableRow key={promo.id} className="border-slate-800 hover:bg-slate-900/50">
                                    <TableCell className="font-mono font-bold text-amber-500 tracking-widest">{promo.code}</TableCell>
                                    <TableCell className="font-medium text-slate-300">
                                        {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} FLAT`}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={promo.active}
                                                onCheckedChange={(val) => editPromo(promo.id, { active: val })}
                                                className="scale-75 origin-left"
                                            />
                                            <span className={cn("text-xs font-bold uppercase", promo.active ? "text-green-400" : "text-slate-500")}>
                                                {promo.active ? 'Live' : 'Paused'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-400">
                                        {promo.currentUses} {promo.maxUses ? `/ ${promo.maxUses}` : ''}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-400">
                                        {promo.expiryDate ? format(parseISO(promo.expiryDate), 'MMM d, yyyy') : 'Never'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenPromo(promo)} className="h-8 w-8 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => removePromo(promo.id)} className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>
        </main>
    );
}
