'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@vualiku/shared';

// ——— Types matching admin PlatformConfig ———

interface PageFlags {
    showHomePage: boolean;
    showExplorePage: boolean;
    showPackagesPage: boolean;
    showDirectoryPage: boolean;
    showMapPage: boolean;
    showBookingPage: boolean;
    showAboutPage: boolean;
    showContactPage: boolean;
    showBlogPage: boolean;
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
        showHomePage: true, showExplorePage: true, showPackagesPage: true, showDirectoryPage: true,
        showMapPage: true, showBookingPage: true, showAboutPage: true, showContactPage: true, showBlogPage: true,
    },
    features: {
        bookings_enabled: true, ai_assistant_enabled: true,
        whatsapp_chat_enabled: true, user_registration_enabled: true,
        operator_portal_active: true, dynamic_pricing_active: true,
        beta_ui_enabled: true, promo_codes_enabled: true,
        gift_vouchers_enabled: true, reviews_enabled: true,
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

const CACHE_KEY = 'vxp_feature_flags';

function loadCachedFlags(): PlatformFlags | null {
    if (typeof window === 'undefined') return null;
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) return JSON.parse(cached);
    } catch { }
    return null;
}

function saveToCache(flags: PlatformFlags) {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(flags));
    } catch { }
}

// ——— Provider ———

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
    const [flags, setFlags] = useState<PlatformFlags>(() => {
        const cached = loadCachedFlags();
        if (cached) {
            return {
                pages: { ...DEFAULT_FLAGS.pages, ...cached.pages },
                features: { ...DEFAULT_FLAGS.features, ...cached.features },
                maintenance: { ...DEFAULT_FLAGS.maintenance, ...cached.maintenance },
                bookingWindow: { ...DEFAULT_FLAGS.bookingWindow, ...cached.bookingWindow },
            };
        }
        return DEFAULT_FLAGS;
    });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const ref = doc(db, 'platformConfig', 'features');
        let hasReceivedData = false;

        const unsubscribe = onSnapshot(
            ref,
            (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    const merged: PlatformFlags = {
                        pages: { ...DEFAULT_FLAGS.pages, ...(data?.pages || {}) },
                        features: { ...DEFAULT_FLAGS.features, ...(data?.featureFlags || data?.features || {}) },
                        maintenance: { ...DEFAULT_FLAGS.maintenance, ...(data?.maintenance || {}) },
                        bookingWindow: { ...DEFAULT_FLAGS.bookingWindow, ...(data?.bookingWindow || {}) },
                    };
                    hasReceivedData = true;
                    setFlags(merged);
                    saveToCache(merged);
                } else if (!hasReceivedData) {
                    // Doc doesn't exist yet, keep defaults and cache them
                    saveToCache(DEFAULT_FLAGS);
                }
                setLoaded(true);
            },
            (error) => {
                console.error('Feature flags error:', error);
                setLoaded(true);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <FlagsContext.Provider value={flags}>
            {children}
        </FlagsContext.Provider>
    );
}
