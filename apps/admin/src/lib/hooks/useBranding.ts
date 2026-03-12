'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';

export interface BrandingConfig {
    colors: {
        primary: string;      // main brand color
        secondary: string;    // secondary accents
        accent: string;       // highlights
        background: string;   // tourist site background
        surface: string;      // cards/sections
        text: string;         // primary text color
    };
    logos: {
        main: string;         // header logo URL
        white?: string;       // white version for dark backgrounds
        favicon: string;      // icon URL
    };
    typography: {
        primaryFont: string;   // header font e.g. 'Tahoma'
        secondaryFont: string; // body font e.g. 'Inter'
    };
    updatedAt?: any;
}

const DEFAULT_BRANDING: BrandingConfig = {
    colors: {
        primary: '#22c55e',    // green-500
        secondary: '#1e293b',  // slate-800
        accent: '#3b82f6',     // blue-500
        background: '#020617', // slate-950
        surface: '#0f172a',    // slate-900
        text: '#f8fafc',       // slate-50
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

export function useBranding() {
    const [branding, setBranding] = useState<BrandingConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'platformConfig', 'branding'), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as BrandingConfig;
                // Merge with defaults to ensure all fields exist
                setBranding({
                    ...DEFAULT_BRANDING,
                    ...data,
                    colors: { ...DEFAULT_BRANDING.colors, ...data.colors },
                    logos: { ...DEFAULT_BRANDING.logos, ...data.logos },
                    typography: { ...DEFAULT_BRANDING.typography, ...data.typography },
                });
            } else {
                // Initialize default branding
                setDoc(doc(db, 'platformConfig', 'branding'), {
                    ...DEFAULT_BRANDING,
                    updatedAt: serverTimestamp(),
                });
                setBranding(DEFAULT_BRANDING);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateBranding = async (partial: Partial<BrandingConfig>) => {
        return await updateDoc(doc(db, 'platformConfig', 'branding'), {
            ...partial,
            updatedAt: serverTimestamp(),
        });
    };

    return { branding, loading, updateBranding, DEFAULT_BRANDING };
}
