'use client';

import { useRange, type UseRangeProps } from 'react-instantsearch';
import { DollarSign } from 'lucide-react';

export function PriceFilter(props: UseRangeProps) {
    const { start, range, refine } = useRange(props);

    const min = range.min ?? 0;
    const max = range.max ?? 500;
    const currentMin = (start[0] !== undefined && start[0] !== -Infinity) ? start[0] : min;
    const currentMax = (start[1] !== undefined && start[1] !== Infinity) ? start[1] : max;

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Price Range
            </h3>
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/30">$</span>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        value={currentMin}
                        onChange={(e) => refine([Number(e.target.value), currentMax])}
                        className="w-full h-10 pl-7 pr-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                </div>
                <span className="text-white/30 text-sm">—</span>
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/30">$</span>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        value={currentMax}
                        onChange={(e) => refine([currentMin, Number(e.target.value)])}
                        className="w-full h-10 pl-7 pr-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                </div>
            </div>
            <div className="flex justify-between text-[10px] text-white/25 font-medium">
                <span>FJD ${min}</span>
                <span>FJD ${max}</span>
            </div>
        </div>
    );
}
