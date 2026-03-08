'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@vualiku/shared';

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

    return { operators, loading, addOperator, editOperator, removeOperator };
}
