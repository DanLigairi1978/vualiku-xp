'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';

// ——— Type definitions matching admin useContent.ts schema ———

export interface HomepageContent {
    hero: {
        headline: string;
        subheadline: string;
        heroImageUrl: string;
        ctaText: string;
        ctaLink: string;
    };
    featuredTitle: string;
    featuredSubtitle: string;
    whySection: {
        title: string;
        features: { icon: string; title: string; description: string }[];
    };
    testimonials: {
        name: string;
        location: string;
        rating: number;
        quote: string;
        date: string;
    }[];
    stats: {
        tours: number;
        operators: number;
        happyGuests: number;
        yearsExperience: number;
    };
    announcement: {
        enabled: boolean;
        text: string;
        color: string;
        link: string;
    };
}

export interface GlobalContent {
    navigation: {
        items: { label: string; href: string; visible: boolean; highlight: boolean }[];
    };
    contact: {
        phone: string;
        email: string;
        address: string;
        whatsapp: string;
        socialLinks: { platform: string; url: string }[];
        mapLat: string;
        mapLng: string;
    };
    about: {
        missionStatement: string;
        companyStory: string;
        teamMembers: { name: string; role: string; imageUrl: string; bio: string }[];
    };
    footer: {
        tagline: string;
        links: { label: string; href: string }[];
        socialLinks: { platform: string; url: string }[];
        copyrightText: string;
    };
    seo: {
        defaultTitleFormat: string;
        defaultDescription: string;
        ogImageUrl: string;
        googleAnalyticsId: string;
    };
}

// ——— Hardcoded fallback defaults ———

const DEFAULT_HOMEPAGE: HomepageContent = {
    hero: {
        headline: 'Experience Raw Fiji',
        subheadline: 'Step off the beaten path into the mist. Discover authentic, community-led adventures across the hidden north.',
        heroImageUrl: '/images/hero-fiji.jpg',
        ctaText: 'BOOK TOUR',
        ctaLink: '/booking',
    },
    featuredTitle: 'Featured Experiences',
    featuredSubtitle: '',
    whySection: { title: 'Why Vualiku XP', features: [] },
    testimonials: [],
    stats: { tours: 25, operators: 7, happyGuests: 500, yearsExperience: 3 },
    announcement: { enabled: false, text: '', color: '#2D6A4F', link: '' },
};

const DEFAULT_GLOBAL: GlobalContent = {
    navigation: {
        items: [
            { label: 'Home', href: '/', visible: true, highlight: false },
            { label: 'Explore', href: '/explore', visible: true, highlight: false },
            { label: 'Packages', href: '/packages', visible: true, highlight: false },
            { label: 'Directory', href: '/directory', visible: true, highlight: false },
            { label: 'Map', href: '/map', visible: true, highlight: false },
            { label: 'Booking', href: '/booking', visible: true, highlight: false },
            { label: 'About', href: '/about', visible: true, highlight: false },
            { label: 'Contact', href: '/contact', visible: true, highlight: false },
        ],
    },
    contact: {
        phone: '(679) 7630785',
        email: 'admin@vualikuxp.com',
        address: 'Vanua Levu, Fiji',
        whatsapp: '+6797630785',
        socialLinks: [],
        mapLat: '-16.5',
        mapLng: '179.2',
    },
    about: {
        missionStatement: 'Vualiku XP is a proud initiative by The Meridian Solutions Company. Our goal is to empower local Fijian tour operators and connect travelers with authentic, sustainable experiences.',
        companyStory: 'The Meridian solutions company provides tailored solutions for budding tour operators in terms of management, financial consultancy and digital marketing.',
        teamMembers: [],
    },
    footer: {
        tagline: 'Your gateway to authentic Fiji.',
        links: [],
        socialLinks: [],
        copyrightText: `© ${new Date().getFullYear()} The Meridian Solutions Company. All rights reserved.`,
    },
    seo: {
        defaultTitleFormat: '%s | Vualiku XP',
        defaultDescription: 'Discover authentic, community-led eco-tourism experiences across Fiji\'s hidden north.',
        ogImageUrl: '',
        googleAnalyticsId: '',
    },
};

// ——— Caching layer (60 second TTL) ———

const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 60_000; // 60 seconds

function getCached(key: string) {
    const entry = cache[key];
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
    return null;
}

function setCache(key: string, data: any) {
    cache[key] = { data, timestamp: Date.now() };
}

// ——— Deep merge utility: Firestore values override defaults, but missing fields get default ———

function deepMerge<T extends Record<string, any>>(defaults: T, overrides: Record<string, any> | null | undefined): T {
    if (!overrides) return defaults;
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
        const defaultVal = (defaults as any)[key];
        const overrideVal = (overrides as any)[key];

        if (overrideVal === undefined || overrideVal === null) continue;

        if (Array.isArray(defaultVal)) {
            // Arrays: use override if non-empty, otherwise keep default
            (result as any)[key] = Array.isArray(overrideVal) && overrideVal.length > 0 ? overrideVal : defaultVal;
        } else if (typeof defaultVal === 'object' && defaultVal !== null && !Array.isArray(defaultVal)) {
            (result as any)[key] = deepMerge(defaultVal, overrideVal);
        } else {
            // Scalar: use override if truthy/non-empty, else keep default
            (result as any)[key] = overrideVal !== '' ? overrideVal : defaultVal;
        }
    }
    return result;
}

// ——— Hook ———

export function useSiteContent() {
    const [homepage, setHomepage] = useState<HomepageContent>(DEFAULT_HOMEPAGE);
    const [global, setGlobal] = useState<GlobalContent>(DEFAULT_GLOBAL);
    const [loading, setLoading] = useState(true);
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        const fetchContent = async () => {
            try {
                // Check cache first
                const cachedHome = getCached('homepage');
                const cachedGlobal = getCached('global');

                if (cachedHome && cachedGlobal) {
                    setHomepage(cachedHome);
                    setGlobal(cachedGlobal);
                    setLoading(false);
                    return;
                }

                // Fetch both docs in parallel
                const [homeSnap, globalSnap] = await Promise.all([
                    getDoc(doc(db, 'platformContent', 'homepage')),
                    getDoc(doc(db, 'platformContent', 'global')),
                ]);

                const mergedHome = deepMerge(DEFAULT_HOMEPAGE, homeSnap.exists() ? homeSnap.data() : null);
                const mergedGlobal = deepMerge(DEFAULT_GLOBAL, globalSnap.exists() ? globalSnap.data() : null);

                setHomepage(mergedHome);
                setGlobal(mergedGlobal);

                setCache('homepage', mergedHome);
                setCache('global', mergedGlobal);
            } catch (err) {
                console.error('Failed to fetch site content from Firestore:', err);
                // Falls back to defaults already set in state
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    return { homepage, global, loading };
}
