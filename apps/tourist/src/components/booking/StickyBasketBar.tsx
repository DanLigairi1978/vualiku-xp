'use client';

import { useBasket } from '@/context/BasketContext';
import { Button } from '@/components/ui/button';
import { ShoppingBasket, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function StickyBasketBar() {
    const { items, clearBasket } = useBasket();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(items.length > 0);
    }, [items]);

    if (!isVisible) return null;

    const totalItems = items.length;
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-background/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
                {/* Basket Info */}
                <div className="flex items-center gap-4 px-6">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <ShoppingBasket className="w-6 h-6" />
                        </div>
                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-background text-[10px] font-bold flex items-center justify-center border-2 border-background">
                            {totalItems}
                        </span>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/40 mb-0.5 text-left">Your Itinerary</p>
                        <p className="text-xl font-bold font-tahoma italic text-left">${totalPrice} <span className="text-[10px] not-italic text-foreground/40 ml-1 uppercase">FJD Total</span></p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearBasket}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all"
                        title="Clear Basket"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <Button asChild className="h-14 px-8 rounded-2xl bg-primary text-background font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.3)] group transition-all">
                        <Link href="/checkout" className="flex items-center gap-2">
                            CHECKOUT
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Subtle Glow */}
            <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-2xl -z-10" />
        </div>
    );
}
