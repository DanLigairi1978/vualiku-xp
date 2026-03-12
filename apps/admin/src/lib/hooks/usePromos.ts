'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';

export interface PromoCode {
    id: string;
    code: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    active: boolean;
    maxUses?: number;
    currentUses: number;
    expiryDate?: string; // ISO date string
    createdAt?: any;
    updatedAt?: any;
}

export interface PromoBanner {
    active: boolean;
    text: string;
    linkUrl?: string;
    linkText?: string;
    backgroundColor: string; // Tailwind class e.g. 'bg-primary' or 'bg-blue-600'
}

export function usePromos() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [banner, setBanner] = useState<PromoBanner | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Promo Codes collection
        const q = query(collection(db, 'promos'));
        const unsubscribePromos = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PromoCode[];
            setPromoCodes(data);
        });

        // Fetch Global Banner settings
        const bannerRef = doc(db, 'platformConfig', 'banner');
        const unsubscribeBanner = onSnapshot(bannerRef, (docSnap) => {
            if (docSnap.exists()) {
                setBanner(docSnap.data() as PromoBanner);
            } else {
                setBanner({
                    active: false,
                    text: '',
                    backgroundColor: 'bg-primary',
                });
            }
            setLoading(false);
        });

        return () => {
            unsubscribePromos();
            unsubscribeBanner();
        };
    }, []);

    const addPromo = async (data: Omit<PromoCode, 'id' | 'currentUses' | 'createdAt' | 'updatedAt'>) => {
        return await addDoc(collection(db, 'promos'), {
            ...data,
            code: data.code.toUpperCase().trim(),
            currentUses: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    };

    const editPromo = async (id: string, data: Partial<PromoCode>) => {
        const docRef = doc(db, 'promos', id);
        if (data.code) data.code = data.code.toUpperCase().trim();
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    };

    const removePromo = async (id: string) => {
        await deleteDoc(doc(db, 'promos', id));
    };

    const updateBanner = async (data: Partial<PromoBanner>) => {
        const docRef = doc(db, 'platformConfig', 'banner');
        await setDoc(docRef, {
            ...(banner || {}),
            ...data,
        }, { merge: true });
    };

    return { promoCodes, banner, loading, addPromo, editPromo, removePromo, updateBanner };
}
