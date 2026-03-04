'use client';

import { useLocale, type Locale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';

/**
 * Language toggle button — switches between EN and FJ (iTaukei Fijian)
 * Designed to sit in the header navigation bar
 */
export function LanguageToggle() {
    const { locale, toggleLocale } = useLocale();

    return (
        <button
            onClick={toggleLocale}
            className={cn(
                'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider',
                'border transition-all duration-300 cursor-pointer',
                'hover:shadow-[0_0_12px_rgba(34,197,94,0.2)]',
                locale === 'fj'
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:text-white'
            )}
            aria-label={`Switch language to ${locale === 'en' ? 'Fijian' : 'English'}`}
            title={locale === 'en' ? 'Vakacurumaka ki na vosa vakaviti' : 'Switch to English'}
        >
            <Languages className="w-3.5 h-3.5" />
            <span className="uppercase">{locale === 'en' ? 'FJ' : 'EN'}</span>
        </button>
    );
}
