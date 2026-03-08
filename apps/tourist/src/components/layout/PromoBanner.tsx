'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MoveRight } from 'lucide-react';

interface PromoBannerData {
    active: boolean;
    text: string;
    linkUrl?: string;
    linkText?: string;
    backgroundColor: string;
}

export function PromoBanner() {
    const { features } = useFeatureFlags();
    const [banner, setBanner] = useState<PromoBannerData | null>(null);

    // Only render if the 'promo_codes_enabled' feature flag is specifically enabled.
    const promosEnabled = features.promo_codes_enabled;

    useEffect(() => {
        if (!promosEnabled) return;

        const unsubscribe = onSnapshot(doc(db, 'platformConfig', 'banner'), (snap) => {
            if (snap.exists()) {
                setBanner(snap.data() as PromoBannerData);
            }
        });

        return () => unsubscribe();
    }, [promosEnabled]);

    if (!promosEnabled || !banner || !banner.active || !banner.text) return null;

    return (
        <div className={cn(
            "w-full px-4 py-2.5 flex items-center justify-center text-center transition-all z-50 relative",
            banner.backgroundColor || "bg-primary"
        )}>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm font-bold tracking-wide">
                <span className={cn(
                    "uppercase",
                    banner.backgroundColor === 'bg-primary' ? 'text-slate-950' : 'text-white'
                )}>
                    {banner.text}
                </span>

                {banner.linkUrl && (
                    <Link
                        href={banner.linkUrl}
                        className={cn(
                            "flex items-center gap-1 hover:underline underline-offset-4 font-black uppercase tracking-widest",
                            banner.backgroundColor === 'bg-primary' ? 'text-slate-950' : 'text-white'
                        )}
                    >
                        {banner.linkText || 'Learn More'}
                        <MoveRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    );
}
