import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

interface SocialProof {
    bookingCount: number;
    spotsLeft: number | null;
    loading: boolean;
}

export function useActivitySocialProof(activityId: string, maxCapacity: number = 20) {
    const firestore = useFirestore();
    const [proof, setProof] = useState<SocialProof>({
        bookingCount: 0,
        spotsLeft: null,
        loading: true,
    });

    useEffect(() => {
        if (!activityId || !firestore) return;

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Query for last 7 days confirmed bookings
        const q = query(
            collection(firestore, 'allBookings'),
            where('activityId', '==', activityId),
            where('status', '==', 'confirmed'),
            where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const count = snapshot.size;

            // Calculate spots left if we have a capacity context
            // This is a simplified version; typically you'd query a specific timeslot's capacity
            setProof(prev => ({
                ...prev,
                bookingCount: count,
                loading: false,
            }));
        }, (error) => {
            console.error('[useActivitySocialProof] Error:', error);
            setProof(prev => ({ ...prev, loading: false }));
        });

        return () => unsubscribe();
    }, [activityId, firestore]);

    return proof;
}
