'use client';

import { Search } from 'lucide-react';
import { useSearchBox, type UseSearchBoxProps } from 'react-instantsearch';
import { cn } from '@/lib/utils';

export function SearchBar(props: UseSearchBoxProps) {
    const { query, refine } = useSearchBox(props);

    return (
        <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50 pointer-events-none" />
            <input
                type="search"
                value={query}
                onChange={(e) => refine(e.target.value)}
                placeholder="Search adventures... (e.g. snorkeling, trekking, island)"
                className={cn(
                    'w-full h-14 pl-12 pr-6 rounded-2xl',
                    'bg-white/5 border border-white/10 backdrop-blur-md',
                    'text-white placeholder:text-white/30',
                    'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50',
                    'transition-all duration-200',
                    'text-lg'
                )}
                autoComplete="off"
            />
        </div>
    );
}
