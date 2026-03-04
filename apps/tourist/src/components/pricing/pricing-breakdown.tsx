'use client';

import { type PricingResult } from '@/lib/pricing/dynamic-pricing';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, Sparkles } from 'lucide-react';

interface PricingBreakdownCardProps {
    result: PricingResult;
    pax: number;
    className?: string;
}

export function PricingBreakdownCard({ result, pax, className }: PricingBreakdownCardProps) {
    const { breakdown, basePrice, finalPrice, totalPrice, savings, formattedTotal, formattedUnit } = result;

    const rows = [
        breakdown.season,
        breakdown.demand,
        breakdown.group,
        breakdown.timing,
    ];

    const hasDiscount = savings > 0;
    const hasSurge = finalPrice > basePrice;

    return (
        <div className={cn('bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4', className)}>
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Smart Pricing
                </h4>
                {hasDiscount && (
                    <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                        Save {result.savings > 0 ? `$${savings.toFixed(0)}` : ''}
                    </span>
                )}
            </div>

            {/* Multiplier rows */}
            <div className="space-y-2">
                {rows.map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-foreground/50">{row.label}</span>
                        <span className={cn(
                            'font-mono font-bold',
                            row.multiplier > 1 ? 'text-amber-400' : row.multiplier < 1 ? 'text-green-400' : 'text-foreground/30'
                        )}>
                            {row.multiplier > 1 ? <TrendingUp className="w-3 h-3 inline mr-1" /> :
                                row.multiplier < 1 ? <TrendingDown className="w-3 h-3 inline mr-1" /> :
                                    <Minus className="w-3 h-3 inline mr-1" />}
                            ×{row.multiplier.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 pt-3 space-y-1">
                <div className="flex items-baseline justify-between">
                    <span className="text-xs text-foreground/40">Unit price</span>
                    <div className="flex items-center gap-2">
                        {finalPrice !== basePrice && (
                            <span className="text-xs text-foreground/30 line-through">${basePrice.toFixed(0)}</span>
                        )}
                        <span className={cn('font-bold font-tahoma', hasSurge ? 'text-amber-400' : 'text-primary')}>
                            {formattedUnit}
                        </span>
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-xs text-foreground/40">× {pax} pax</span>
                    <span className="text-2xl font-bold text-white font-tahoma">{formattedTotal}</span>
                </div>
            </div>
        </div>
    );
}
