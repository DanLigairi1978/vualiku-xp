'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { PricingOverride } from '@vualiku/shared';

export interface Operator {
    id: string;
    name: string;
    description: string;
    heroImageUrl?: string;
    status: 'active' | 'inactive' | 'pending';
    basePrice?: number;
    capacity?: number;
    category: string;
    pricingOverrides?: PricingOverride[];
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
        }, (error) => {
            console.error("Error fetching operators:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { operators, loading };
}

export function useOperator(id: string | null) {
    const [operator, setOperator] = useState<Operator | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchOp = async () => {
            try {
                const docRef = doc(db, 'operators', id);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setOperator({ id: snap.id, ...snap.data() } as Operator);
                }
            } catch (err) {
                console.error("Error fetching operator:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOp();
    }, [id]);

    return { operator, loading };
}
