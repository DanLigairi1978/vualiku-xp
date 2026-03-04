// i18n Configuration — Vualiku XP
// Client-side locale management via React Context
// Uses next-intl's NextIntlClientProvider for translations

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { NextIntlClientProvider, useTranslations as useNextIntlTranslations } from 'next-intl';

import enMessages from '@/messages/en.json';
import fjMessages from '@/messages/fj.json';

export type Locale = 'en' | 'fj';

const messages: Record<Locale, typeof enMessages> = {
    en: enMessages,
    fj: fjMessages,
};

interface LocaleContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue>({
    locale: 'en',
    setLocale: () => { },
    toggleLocale: () => { },
});

export function useLocale() {
    return useContext(LocaleContext);
}

// Re-export useTranslations for convenience
export const useTranslations = useNextIntlTranslations;

interface LocaleProviderProps {
    children: ReactNode;
    defaultLocale?: Locale;
}

export function LocaleProvider({ children, defaultLocale = 'en' }: LocaleProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(() => {
        // Check localStorage for saved preference
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('vualiku-locale');
            if (saved === 'en' || saved === 'fj') return saved;
        }
        return defaultLocale;
    });

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        if (typeof window !== 'undefined') {
            localStorage.setItem('vualiku-locale', newLocale);
            // Update html lang attribute
            document.documentElement.lang = newLocale === 'fj' ? 'fj' : 'en';
        }
    }, []);

    const toggleLocale = useCallback(() => {
        setLocale(locale === 'en' ? 'fj' : 'en');
    }, [locale, setLocale]);

    return (
        <LocaleContext.Provider value={{ locale, setLocale, toggleLocale }}>
            <NextIntlClientProvider locale={locale} messages={messages[locale]}>
                {children}
            </NextIntlClientProvider>
        </LocaleContext.Provider>
    );
}
