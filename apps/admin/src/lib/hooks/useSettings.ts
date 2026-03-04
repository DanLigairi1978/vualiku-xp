'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@vualiku/shared';

export interface PlatformConfig {
    featureFlags: {
        bookings_enabled: boolean;
        operator_portal_active: boolean;
        dynamic_pricing_active: boolean;
        beta_ui_enabled: boolean;
    };
    pricingRules: {
        base_multiplier: number;
        high_season_surge: number;
        last_minute_discount: number;
    };
}

export function useSettings() {
    const [config, setConfig] = useState<PlatformConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'system', 'config'), (snapshot) => {
            if (snapshot.exists()) {
                setConfig(snapshot.data() as PlatformConfig);
            } else {
                // Initialize default config if not exists
                const defaultConfig: PlatformConfig = {
                    featureFlags: {
                        bookings_enabled: true,
                        operator_portal_active: true,
                        dynamic_pricing_active: false,
                        beta_ui_enabled: true
                    },
                    pricingRules: {
                        base_multiplier: 1.0,
                        high_season_surge: 1.2,
                        last_minute_discount: 0.8
                    }
                };
                setDoc(doc(db, 'system', 'config'), defaultConfig);
                setConfig(defaultConfig);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateConfig = async (newConfig: Partial<PlatformConfig>) => {
        return await updateDoc(doc(db, 'system', 'config'), newConfig);
    };

    return { config, loading, updateConfig };
}
