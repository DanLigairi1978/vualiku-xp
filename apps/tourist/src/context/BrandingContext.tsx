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
        main: '/icons/icon-512x512.png',
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
    if (context === undefined) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }
    return context;
}
