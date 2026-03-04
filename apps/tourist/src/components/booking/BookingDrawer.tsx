'use client';

import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useBookingDrawer } from '@/hooks/use-booking-drawer';
import { useBasket } from '@/context/BasketContext';
import { masterEvents, tourCompanies } from '@vualiku/shared';
import { Calendar as CalendarIcon, Users, ArrowRight, Minus, Plus, ShoppingBasket } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { calculateDynamicPrice } from '@/lib/pricing/dynamic-pricing';
import { useActivitySocialProof } from '@/hooks/use-activity-social-proof';
import { motion, AnimatePresence } from 'framer-motion';

export function BookingDrawer() {
    const { isOpen, closeDrawer, selectedActivityId, operatorId } = useBookingDrawer();
    const { addItem, setOrigin } = useBasket();
    const router = useRouter();

    const [date, setDate] = useState<Date | undefined>(undefined);
    const [pax, setPax] = useState(2);
    const [loading, setLoading] = useState(false);

    // Find the selected activity from static data
    const activity = masterEvents.find(e => e.id === selectedActivityId) ||
        masterEvents.find(e => e.name === selectedActivityId); // Fallback to name search

    const operator = tourCompanies.find(c => c.id === (operatorId || activity?.operatorId));

    useEffect(() => {
        if (isOpen) {
            // Reset state when drawer opens
            setDate(new Date());
            setPax(2);
        } else if (!date) {
            // Initial load hydration safety
            setDate(new Date());
        }
    }, [isOpen]);

    if (!activity) return null;

    const handleAddToBasket = async (checkoutImmediately = false) => {
        if (!date) {
            toast.error('Please select a date');
            return;
        }

        setLoading(true);
        try {
            addItem({
                operatorId: activity.operatorId,
                operatorName: operator?.name || 'Unknown Operator',
                eventName: activity.name,
                date: format(date, 'yyyy-MM-dd'),
                timeSlot: 'Standard', // Default slot
                pax,
                pricePerPax: activity.price,
                totalPrice: activity.price * pax,
                duration: '4 Hours', // Default duration
            });

            toast.success(`${activity.name} added to your basket`);

            if (checkoutImmediately) {
                router.push('/checkout');
            }

            closeDrawer();
        } catch (error) {
            toast.error('Failed to add to basket');
        } finally {
            setLoading(false);
        }
    };

    const pricing = calculateDynamicPrice({
        basePrice: activity.price,
        pricingType: 'per_head',
        pax,
        bookingDate: date || new Date(),
    });

    const { bookingCount } = useActivitySocialProof(activity.id);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
            <SheetContent side="right" className="w-full sm:max-w-md bg-background border-white/10 text-white p-0 overflow-y-auto">
                {/* Header Image */}
                <div className="relative h-48 w-full">
                    <Image
                        src="/images/jungle-trekking.png" // Fallback - ideally activity specific
                        alt={activity.name}
                        fill
                        className="object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                    {/* U3: Social Proof Badge */}
                    {bookingCount >= 3 && (
                        <div className="absolute top-4 right-4 z-10">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-primary/95 text-background px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-primary/20"
                            >
                                <span className="animate-pulse">🔥</span> {bookingCount} people booked recently
                            </motion.div>
                        </div>
                    )}

                    <div className="absolute bottom-6 left-6 right-6">
                        <h2 className="text-2xl font-bold font-tahoma tracking-tight uppercase italic">{activity.name}</h2>
                        <p className="text-primary text-sm font-medium">{operator?.name}</p>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Date Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary uppercase tracking-[0.2em] text-[10px] font-bold">
                            <CalendarIcon className="w-3.5 h-3.5" /> Select Date
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border-0"
                                disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                            />
                        </div>
                    </div>

                    {/* Pax Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary uppercase tracking-[0.2em] text-[10px] font-bold">
                            <Users className="w-3.5 h-3.5" /> Number of People
                        </div>
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Adults / Children</p>
                                <p className="text-xs text-foreground/40 font-tahoma italic">Ages 4 and up</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPax(Math.max(1, pax - 1))}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="text-xl font-bold w-4 text-center">{pax}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPax(pax + 1)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* U1: Pricing Summary with Explainer */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center text-sm font-tahoma">
                            <span className="text-foreground/60">Base Price</span>
                            <span className="font-bold">${activity.price} FJD</span>
                        </div>

                        {/* Modifiers List */}
                        {pricing.modifiers.length > 0 && (
                            <div className="flex flex-wrap gap-2 py-1">
                                <AnimatePresence mode="popLayout">
                                    {pricing.modifiers.map((mod, idx) => (
                                        <motion.div
                                            key={mod.label}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.08 }}
                                            className={cn(
                                                "px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1",
                                                mod.type === 'discount' ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                                            )}
                                        >
                                            <span>{mod.emoji}</span>
                                            <span>{mod.label} ({mod.delta > 0 ? '+' : ''}{mod.delta}%)</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="h-[1px] bg-white/5" />
                        <div className="flex justify-between items-center">
                            <div className="space-y-0.5">
                                <span className="text-sm font-bold uppercase tracking-wider">Total</span>
                                <p className="text-[10px] text-foreground/40 italic">Excl. transit from Labasa/Savusavu</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold font-tahoma italic text-primary">{pricing.formattedTotal}</span>
                                {pricing.savings > 0 && (
                                    <p className="text-[10px] text-green-400 font-bold mt-1">You're saving FJD {pricing.savings} 🎉</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-background border-t border-white/10 p-6 space-y-3">
                    <Button
                        onClick={() => handleAddToBasket(false)}
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2 group"
                    >
                        <ShoppingBasket className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Add to Basket
                    </Button>
                    <Button
                        onClick={() => handleAddToBasket(true)}
                        disabled={loading}
                        className="w-full h-14 bg-primary text-background font-bold rounded-2xl hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 group"
                    >
                        Quick Checkout
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
