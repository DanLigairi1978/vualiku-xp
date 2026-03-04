'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
};

const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export function StarRating({
    value,
    onChange,
    readonly = false,
    size = 'md',
    showLabel = false,
}: StarRatingProps) {
    const [hovered, setHovered] = useState(0);

    const displayValue = hovered || value;

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => onChange?.(star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        onMouseLeave={() => !readonly && setHovered(0)}
                        className={cn(
                            'transition-all duration-150 focus:outline-none',
                            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125 active:scale-95'
                        )}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                'transition-colors duration-150',
                                star <= displayValue
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-transparent text-white/20'
                            )}
                        />
                    </button>
                ))}
            </div>
            {showLabel && displayValue > 0 && (
                <span className="text-sm text-foreground/50 font-medium">
                    {labels[displayValue]}
                </span>
            )}
        </div>
    );
}

/**
 * Display-only star rating with decimal support (e.g., 4.7)
 */
export function StarRatingDisplay({
    value,
    count,
    size = 'sm',
}: {
    value: number;
    count?: number;
    size?: 'sm' | 'md' | 'lg';
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                    const filled = value >= star;
                    const partial = !filled && value >= star - 0.5;

                    return (
                        <Star
                            key={star}
                            className={cn(
                                sizeClasses[size],
                                filled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : partial
                                        ? 'fill-yellow-400/50 text-yellow-400/50'
                                        : 'fill-transparent text-white/15'
                            )}
                        />
                    );
                })}
            </div>
            <span className="text-sm font-bold text-white/80">{value.toFixed(1)}</span>
            {count !== undefined && (
                <span className="text-xs text-foreground/40">({count})</span>
            )}
        </div>
    );
}
