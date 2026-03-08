'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@vualiku/shared';

export interface Package {
    id: string;
    name: string;
    shortDescription: string;
    longDescription: string;
    heroImageUrl: string;
    galleryImageUrls: string[];
    pricePerHead: number;
    duration: string;
    maxGroupSize: number;
    difficulty: 'Easy' | 'Moderate' | 'Challenging';
    includedItems: string[];
    whatToBring: string[];
    operatorId: string;
    operatorName: string;
    location: string;
    categoryTags: string[];
    status: 'active' | 'inactive' | 'featured';
    seoTitle: string;
    seoDescription: string;
    createdAt?: any;
    updatedAt?: any;
}

export function usePackages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'packages'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Package[];
            setPackages(data);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching packages:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addPackage = async (data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>) => {
        const docRef = await addDoc(collection(db, 'packages'), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef;
    };

    const editPackage = async (id: string, data: Partial<Package>) => {
        const docRef = doc(db, 'packages', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    };

    const removePackage = async (id: string) => {
        return await deleteDoc(doc(db, 'packages', id));
    };

    return { packages, loading, addPackage, editPackage, removePackage };
}
