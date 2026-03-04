'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function DynamicBackground() {
    const [timeState, setTimeState] = useState<'day' | 'night'>('day');

    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours();
            // 7 PM (19) to 7 AM (7) is Night
            if (hour >= 19 || hour < 7) {
                setTimeState('night');
            } else {
                setTimeState('day');
            }
        };

        updateTheme();
        const interval = setInterval(updateTheme, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Background Images */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${timeState === 'day' ? 'opacity-100' : 'opacity-0'}`}>
                <Image
                    src="/images/bg-day.jpg"
                    alt="Day in the Forest"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                />
            </div>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${timeState === 'night' ? 'opacity-100' : 'opacity-0'}`}>
                <Image
                    src="/images/bg-night.jpg"
                    alt="Night in the Forest"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                />
            </div>

            {/* Global Soft Tint Overlays */}
            {/* For Day: A warm, soft light tint */}
            <div className={`absolute inset-0 transition-opacity duration-1000 bg-[#2D4F1E]/20 mix-blend-multiply ${timeState === 'day' ? 'opacity-100' : 'opacity-0'}`} />

            {/* For Night: A deeper, atmospheric dark forest tint */}
            <div className={`absolute inset-0 transition-opacity duration-1000 bg-[#0a1a0a]/40 ${timeState === 'night' ? 'opacity-100' : 'opacity-0'}`} />

            {/* Vignette for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>
    );
}
