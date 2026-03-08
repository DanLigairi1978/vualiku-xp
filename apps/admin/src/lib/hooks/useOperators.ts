'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, setDoc, getDocs } from 'firebase/firestore';
import { db, tourCompanies } from '@vualiku/shared';

export interface Operator {
    id: string;
    name: string;
    description: string;
    email?: string; // Kept for backwards compatibility if needed
    contactEmail?: string;
    phone?: string;
    location?: string;
    pricingType?: string;
    basePrice?: number;
    capacity?: number;
    status: 'active' | 'inactive' | 'pending';
    category: string;
    heroImageUrl?: string;
    activities?: string[];
    createdAt?: any;
    updatedAt?: any;
    authorisedBy?: string;
    authorisedAt?: any;
    migratedFromHardcode?: boolean;
}

export function useOperators() {
    const [operators, setOperators] = useState<Operator[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'operators'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const opsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Operator[];
            setOperators(opsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const syncAlgolia = async (id: string, isDelete = false) => {
        try {
            const apiUrl = process.env.NODE_ENV === 'production'
                ? 'https://vualiku-xp.web.app/api/webhooks/algolia'
                : 'http://localhost:9002/api/webhooks/algolia';

            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operatorId: id,
                    secret: 'vualiku-admin-secret-2026',
                    isDelete
                })
            });
        } catch (e) {
            console.error("Failed to sync Algolia", e);
        }
    };

    const addOperator = async (data: Omit<Operator, 'id' | 'createdAt' | 'updatedAt'>) => {
        const docRef = await addDoc(collection(db, 'operators'), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        await syncAlgolia(docRef.id);
        return docRef;
    };

    const editOperator = async (id: string, data: Partial<Operator>) => {
        const docRef = doc(db, 'operators', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
        await syncAlgolia(id);
    };

    const removeOperator = async (id: string) => {
        await syncAlgolia(id, true);
        return await deleteDoc(doc(db, 'operators', id));
    };

    /**
     * Migrate all hardcoded tourCompanies into Firestore.
     * Skips any that already exist (name match, case-insensitive).
     * Returns { migrated: number, skipped: number, total: number }.
     */
    const migrateFromHardcode = async (
        onProgress?: (current: number, total: number, name: string, action: 'migrated' | 'skipped') => void
    ) => {
        // Get existing names for de-duplication
        const existingSnap = await getDocs(collection(db, 'operators'));
        const existingNames = new Set(
            existingSnap.docs.map(d => (d.data().name || '').toLowerCase())
        );

        let migrated = 0;
        let skipped = 0;
        const total = tourCompanies.length;

        for (let i = 0; i < tourCompanies.length; i++) {
            const op = tourCompanies[i];

            if (existingNames.has(op.name.toLowerCase())) {
                skipped++;
                onProgress?.(i + 1, total, op.name, 'skipped');
                continue;
            }

            await setDoc(doc(db, 'operators', op.id), {
                name: op.name,
                description: op.description,
                location: 'Vanua Levu, Fiji',
                heroImageUrl: '',
                basePrice: 0,
                capacity: 10,
                status: 'active',
                category: 'eco',
                activities: [],
                contactEmail: '',
                phone: '',
                createdAt: serverTimestamp(),
                migratedFromHardcode: true,
            });

            migrated++;
            onProgress?.(i + 1, total, op.name, 'migrated');
        }

        return { migrated, skipped, total };
    };

    return { operators, loading, addOperator, editOperator, removeOperator, migrateFromHardcode };
}

