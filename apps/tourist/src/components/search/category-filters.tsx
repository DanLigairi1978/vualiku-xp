'use client';

import { useRefinementList, type UseRefinementListProps } from 'react-instantsearch';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

export function CategoryFilters(props: UseRefinementListProps) {
    const { items, refine } = useRefinementList(props);

    if (items.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Categories
            </h3>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => refine(item.value)}
                        className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                            'border',
                            item.isRefined
                                ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(34,197,94,0.15)]'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                        )}
                    >
                        {item.label}
                        <span className={cn(
                            'ml-2 text-xs',
                            item.isRefined ? 'text-primary/70' : 'text-white/30'
                        )}>
                            {item.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
