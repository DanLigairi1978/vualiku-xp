'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@vualiku/shared';

export interface Booking {
    id: string;
    tourName: string;
    operator: string;
    participants: number;
    totalAmount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed' | 'cancelled';
    paymentMethod?: string;
    timestamp: any;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    tourDate?: string;
    reconciled?: boolean;
    reconciledAt?: any;
    reconciledBy?: string;
}

export function useBookings(filters?: { status?: string; operator?: string; date?: string }) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let q = query(collection(db, 'allBookings'), orderBy('timestamp', 'desc'));

        if (filters?.status && filters.status !== 'all') {
            q = query(q, where('status', '==', filters.status));
        }
        if (filters?.operator && filters.operator !== 'all') {
            q = query(q, where('operator', '==', filters.operator));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookingsData = snapshot.docs.map(doc => {
                const data = doc.data() as any;
                return {
                    id: doc.id,
                    tourName: data.tourName || data.packageName || data.items?.[0]?.eventName || 'Unknown Tour',
                    operator: data.operator || data.operatorId || 'Unknown Operator',
                    participants: data.participants || data.guestCount || 0,
                    totalAmount: data.totalAmount || data.totalFee || data.totalAmountPaid || 0,
                    currency: data.currency || 'FJD',
                    status: (data.status === 'paid' || data.paymentStatus === 'paid') ? 'paid' : (data.paymentStatus || data.status || 'pending'),
                    timestamp: data.timestamp || data.createdAt,
                    customerName: data.customerName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Guest',
                    customerEmail: data.customerEmail || data.email || data.userEmail || '',
                    customerPhone: data.customerPhone || data.phone || '',
                    tourDate: data.tourDate || data.bookingDate,
                    ...data
                };
            }) as Booking[];
            setBookings(bookingsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching bookings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [filters?.status, filters?.operator]);

    const reconcileBooking = async (id: string, adminEmail: string) => {
        const docRef = doc(db, 'allBookings', id);
        return await updateDoc(docRef, {
            status: 'paid',
            reconciled: true,
            reconciledAt: new Date(),
            reconciledBy: adminEmail
        });
    };

    const updateBookingStatus = async (id: string, status: Booking['status']) => {
        const docRef = doc(db, 'allBookings', id);
        return await updateDoc(docRef, { status });
    };

    return { bookings, loading, reconcileBooking, updateBookingStatus };
}
