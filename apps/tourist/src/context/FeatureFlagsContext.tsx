'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@vualiku/shared';

// ——— Types matching admin PlatformConfig ———

interface PageFlags {
    homepage: boolean;
    explore: boolean;
    packages: boolean;
    directory: boolean;
    map: boolean;
    booking: boolean;
    about: boolean;
    contact: boolean;
    blog: boolean;
}

interface FeatureFlags {
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
}

interface MaintenanceConfig {
    enabled: boolean;
    message: string;
    allowAdmins: boolean;
}

interface BookingWindow {
    minAdvanceHours: number;
    maxAdvanceDays: number;
    globalBlackoutDates: string[];
}

export interface PlatformFlags {
    pages: PageFlags;
    features: FeatureFlags;
    maintenance: MaintenanceConfig;
    bookingWindow: BookingWindow;
}

// ——— Defaults (all enabled / no maintenance) ———

const DEFAULT_FLAGS: PlatformFlags = {
    pages: {
        homepage: true, explore: true, packages: true, directory: true,
        map: true, booking: true, about: true, contact: true, blog: false,
    },
    features: {
        bookings_enabled: true, ai_assistant_enabled: false,
        whatsapp_chat_enabled: true, user_registration_enabled: true,
        operator_portal_active: true, dynamic_pricing_active: false,
        beta_ui_enabled: false, promo_codes_enabled: false,
        gift_vouchers_enabled: false, reviews_enabled: true,
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
};

// ——— Context ———

const FlagsContext = createContext<PlatformFlags>(DEFAULT_FLAGS);

export function useFeatureFlags() {
    return useContext(FlagsContext);
}

// ——— 60-second cache ———

let cachedFlags: PlatformFlags | null = null;
let cachedAt = 0;
const CACHE_TTL = 60_000;

// ——— Provider ———

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
    const [flags, setFlags] = useState<PlatformFlags>(cachedFlags || DEFAULT_FLAGS);
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        // Return cached if fresh
        if (cachedFlags && Date.now() - cachedAt < CACHE_TTL) {
            setFlags(cachedFlags);
            return;
        }

        const fetchFlags = async () => {
            try {
                const snap = await getDoc(doc(db, 'platformConfig', 'features'));
                if (snap.exists()) {
                    const data = snap.data();
                    const merged: PlatformFlags = {
                        pages: { ...DEFAULT_FLAGS.pages, ...data.pages },
                        features: { ...DEFAULT_FLAGS.features, ...data.featureFlags },
                        maintenance: { ...DEFAULT_FLAGS.maintenance, ...data.maintenance },
                        bookingWindow: { ...DEFAULT_FLAGS.bookingWindow, ...data.bookingWindow },
                    };
                    setFlags(merged);
                    cachedFlags = merged;
                    cachedAt = Date.now();
                }
            } catch (err) {
                console.error('Failed to fetch feature flags:', err);
                // Keep defaults
            }
        };

        fetchFlags();
    }, []);

    return (
        <FlagsContext.Provider value={flags}>
            {children}
        </FlagsContext.Provider>
    );
}
