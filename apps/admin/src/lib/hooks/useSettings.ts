'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';

export interface PlatformConfig {
    // ——— Page Toggles ———
    pages: {
        showHomePage: boolean;
        showExplorePage: boolean;
        showPackagesPage: boolean;
        showDirectoryPage: boolean;
        showMapPage: boolean;
        showBookingPage: boolean;
        showAboutPage: boolean;
        showContactPage: boolean;
        showBlogPage: boolean;
    };
    // ——— Feature Flags ———
    featureFlags: {
        bookings_enabled: boolean;
        ai_assistant_enabled: boolean;
        whatsapp_chat_enabled: boolean;
        user_registration_enabled: boolean;
        operator_portal_active: boolean;
        dynamic_pricing_active: boolean;
        beta_ui_enabled: boolean;
        promo_codes_enabled: boolean;
        gift_vouchers_enabled: boolean;
        reviews_enabled: boolean;
    };
    // ——— Maintenance Mode ———
    maintenance: {
        enabled: boolean;
        message: string;
        allowAdmins: boolean;
    };
    // ——— Booking Window ———
    bookingWindow: {
        minAdvanceHours: number;
        maxAdvanceDays: number;
        globalBlackoutDates: string[];
    };
    // ——— Pricing Rules ———
    pricingRules: {
        base_multiplier: number;
        high_season_surge: number;
        last_minute_discount: number;
    };
    updatedAt?: any;
}

export const DEFAULT_CONFIG: PlatformConfig = {
    pages: {
        showHomePage: true,
        showExplorePage: true,
        showPackagesPage: true,
        showDirectoryPage: true,
        showMapPage: true,
        showBookingPage: true,
        showAboutPage: true,
        showContactPage: true,
        showBlogPage: false,
    },
    featureFlags: {
        bookings_enabled: true,
        ai_assistant_enabled: false,
        whatsapp_chat_enabled: true,
        user_registration_enabled: true,
        operator_portal_active: true,
        dynamic_pricing_active: false,
        beta_ui_enabled: false,
        promo_codes_enabled: false,
        gift_vouchers_enabled: false,
        reviews_enabled: true,
    },
    maintenance: {
        enabled: false,
        message: 'We are currently performing maintenance. Please check back shortly.',
        allowAdmins: true,
    },
    bookingWindow: {
        minAdvanceHours: 24,
        maxAdvanceDays: 90,
        globalBlackoutDates: [],
    },
    pricingRules: {
        base_multiplier: 1.0,
        high_season_surge: 1.2,
        last_minute_discount: 0.8,
    },
};

export function useSettings() {
    const [config, setConfig] = useState<PlatformConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'platformConfig', 'features'), (snapshot) => {
            if (snapshot.exists()) {
                // Deep-merge with defaults to handle newly added fields
                const data = snapshot.data();
                const merged: PlatformConfig = {
                    pages: { ...DEFAULT_CONFIG.pages, ...data.pages },
                    featureFlags: { ...DEFAULT_CONFIG.featureFlags, ...data.featureFlags },
                    maintenance: { ...DEFAULT_CONFIG.maintenance, ...data.maintenance },
                    bookingWindow: { ...DEFAULT_CONFIG.bookingWindow, ...data.bookingWindow },
                    pricingRules: { ...DEFAULT_CONFIG.pricingRules, ...data.pricingRules },
                    updatedAt: data.updatedAt,
                };
                setConfig(merged);
            } else {
                // Initialize default config
                setDoc(doc(db, 'platformConfig', 'features'), {
                    ...DEFAULT_CONFIG,
                    updatedAt: serverTimestamp(),
                });
                setConfig(DEFAULT_CONFIG);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateConfig = async (partial: Record<string, any>) => {
        return await updateDoc(doc(db, 'platformConfig', 'features'), {
            ...partial,
            updatedAt: serverTimestamp(),
        });
    };

    return { config, loading, updateConfig, DEFAULT_CONFIG };
}
