'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@vualiku/shared';

export interface Operator {
    id: string;
    name: string;
    description: string;
    email?: string;
    phone?: string;
    location?: string;
    pricingType?: string;
    basePrice?: number;
    capacity?: number;
    status: 'active' | 'inactive' | 'pending';
    category: string;
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

    const addOperator = async (data: Omit<Operator, 'id'>) => {
        return await addDoc(collection(db, 'operators'), data);
    };

    const editOperator = async (id: string, data: Partial<Operator>) => {
        const docRef = doc(db, 'operators', id);
        return await updateDoc(docRef, data);
    };

    const removeOperator = async (id: string) => {
        return await deleteDoc(doc(db, 'operators', id));
    };

    return { operators, loading, addOperator, editOperator, removeOperator };
}
