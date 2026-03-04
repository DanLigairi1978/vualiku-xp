'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@vualiku/shared';

export interface OperatorApplication {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    tourTypes: string[];
    experience: string;
    fleetSize: number;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected';
    submittedAt: any;
    reviewedAt?: any;
    reviewedBy?: string;
    notes?: string;
}

export function useApplications() {
    const [applications, setApplications] = useState<OperatorApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'operatorApplications'),
            orderBy('submittedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const appsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as OperatorApplication[];
            setApplications(appsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching operator applications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateApplicationStatus = async (id: string, status: OperatorApplication['status'], reviewer: string, notes?: string) => {
        const docRef = doc(db, 'operatorApplications', id);
        return await updateDoc(docRef, {
            status,
            reviewedAt: new Date(),
            reviewedBy: reviewer,
            notes: notes || ''
        });
    };

    return { applications, loading, updateApplicationStatus };
}
