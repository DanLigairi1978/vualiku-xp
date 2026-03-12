'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';

export interface CommunicationLog {
    id: string;
    type: 'email' | 'sms' | 'push';
    recipient: string;
    subject?: string;
    content: string;
    status: 'sent' | 'failed' | 'delivered';
    timestamp: any;
    provider?: string;
    metadata?: any;
}

export function useCommunications() {
    const [logs, setLogs] = useState<CommunicationLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'communicationLogs'),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CommunicationLog[];
            setLogs(logsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching communication logs:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async (data: Omit<CommunicationLog, 'id' | 'timestamp' | 'status'>) => {
        return await addDoc(collection(db, 'communicationLogs'), {
            ...data,
            status: 'sent',
            timestamp: serverTimestamp()
        });
    };

    return { logs, loading, sendMessage };
}
