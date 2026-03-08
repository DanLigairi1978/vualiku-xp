'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@vualiku/shared';

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
    updatedAt?: any;
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
    updatedAt?: any;
}

export function useContent(docId: 'homepage' | 'global') {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'platformContent', docId), (snapshot) => {
            if (snapshot.exists()) {
                setData(snapshot.data());
            }
            setLoading(false);
        }, (error) => {
            console.error(`Error fetching ${docId} content:`, error);
            setLoading(false);
        });

        return () => unsub();
    }, [docId]);

    const saveContent = async (content: any) => {
        await setDoc(doc(db, 'platformContent', docId), {
            ...content,
            updatedAt: serverTimestamp(),
        });
    };

    return { data, loading, saveContent };
}
