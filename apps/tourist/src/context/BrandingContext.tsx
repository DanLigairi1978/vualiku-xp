'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';

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
        primary: '#2D6A4F',
        secondary: '#1B4332',
        accent: '#E8C547',
        background: '#F8F4EE',
        surface: '#ffffff',
        text: '#1f2937',
    },
    logos: {
        main: '/vualiku-logo.png',
        favicon: '/favicon.ico',
    },
    typography: {
        primaryFont: 'PT Sans',
        secondaryFont: 'PT Sans',
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
                const data = snapshot.data() as BrandingConfig | undefined;
                const merged = {
                    ...DEFAULT_BRANDING,
                    ...data,
                    colors: { ...DEFAULT_BRANDING.colors, ...(data?.colors || {}) },
                    logos: { ...DEFAULT_BRANDING.logos, ...(data?.logos || {}) },
                    typography: { ...DEFAULT_BRANDING.typography, ...(data?.typography || {}) },
                };
                setBranding(merged as BrandingConfig);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <BrandingContext.Provider value={{ branding, loading }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    const context = useContext(BrandingContext);
    return context ?? { branding: DEFAULT_BRANDING, loading: false };
}
