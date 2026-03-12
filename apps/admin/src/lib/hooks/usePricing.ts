'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';

export interface PricingRule {
    name: string;
    type: 'peak' | 'offpeak' | 'lastminute' | 'earlybird';
    multiplier: number; // e.g. 1.20 for +20%, 0.90 for -10%
    startDate?: string;
    endDate?: string;
    daysThreshold?: number; // for earlybird/lastminute
    enabled: boolean;
}

export interface PricingConfig {
    platformFeePercent: number;
    dynamicRules: PricingRule[];
    groupDiscounts: {
        minPax: number;
        discountPercent: number;
    }[];
    updatedAt?: any;
}

const defaultConfig: PricingConfig = {
    platformFeePercent: 10,
    dynamicRules: [
        { name: 'Christmas Peak', type: 'peak', multiplier: 1.20, startDate: '12-15', endDate: '01-05', enabled: false },
        { name: 'Off-Peak Feb-Mar', type: 'offpeak', multiplier: 0.90, startDate: '02-01', endDate: '03-31', enabled: false },
        { name: 'Last Minute (48hrs)', type: 'lastminute', multiplier: 0.85, daysThreshold: 2, enabled: false },
        { name: 'Early Bird (30+ days)', type: 'earlybird', multiplier: 0.95, daysThreshold: 30, enabled: false },
    ],
    groupDiscounts: [
        { minPax: 5, discountPercent: 10 },
        { minPax: 10, discountPercent: 15 },
    ],
};

export function usePricing() {
    const [config, setConfig] = useState<PricingConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'platformConfig', 'pricing'), (snapshot) => {
            if (snapshot.exists()) {
                setConfig(snapshot.data() as PricingConfig);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching pricing config:', error);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const saveConfig = async (newConfig: PricingConfig) => {
        await setDoc(doc(db, 'platformConfig', 'pricing'), {
            ...newConfig,
            updatedAt: serverTimestamp(),
        });
    };

    return { config, loading, saveConfig };
}
