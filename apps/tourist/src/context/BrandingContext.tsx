'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@vualiku/shared';

export interface BrandingConfig {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
    };
    logos: {
        main: string;
        white?: string;
        favicon: string;
    };
    typography: {
        primaryFont: string;
        secondaryFont: string;
    };
}

const DEFAULT_BRANDING: BrandingConfig = {
    colors: {
        primary: '#22c55e',
        secondary: '#1e293b',
        accent: '#3b82f6',
        background: '#020617',
        surface: '#0f172a',
        text: '#f8fafc',
    },
    logos: {
        main: '/images/vualiku-logo.png',
        favicon: '/favicon.ico',
    },
    typography: {
        primaryFont: 'Tahoma',
        secondaryFont: 'Inter',
    },
};

interface BrandingContextType {
    branding: BrandingConfig;
    loading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'platformConfig', 'branding'), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as BrandingConfig;
                const merged = {
                    ...DEFAULT_BRANDING,
                    ...data,
                    colors: { ...DEFAULT_BRANDING.colors, ...data.colors },
                    logos: { ...DEFAULT_BRANDING.logos, ...data.logos },
                    typography: { ...DEFAULT_BRANDING.typography, ...data.typography },
                };
                setBranding(merged);
                applyBranding(merged);
            } else {
                applyBranding(DEFAULT_BRANDING);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const applyBranding = (config: BrandingConfig) => {
        if (typeof document === 'undefined') return;

        const root = document.documentElement;

        // Apply Colors
        root.style.setProperty('--brand-primary', config.colors.primary);
        root.style.setProperty('--brand-secondary', config.colors.secondary);
        root.style.setProperty('--brand-accent', config.colors.accent);
        root.style.setProperty('--brand-background', config.colors.background);
        root.style.setProperty('--brand-surface', config.colors.surface);
        root.style.setProperty('--brand-text', config.colors.text);

        // Apply Fonts
        root.style.setProperty('--font-primary', config.typography.primaryFont);
        root.style.setProperty('--font-secondary', config.typography.secondaryFont);
    };

    return (
        <BrandingContext.Provider value={{ branding, loading }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    const context = useContext(BrandingContext);
    if (context === undefined) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }
    return context;
}
