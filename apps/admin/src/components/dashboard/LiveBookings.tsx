'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@danligairi1978/shared';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiveBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'allBookings'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBookings(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-tahoma uppercase tracking-tight text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Live Activity Feed
                </h2>
                <button className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">
                    View All Logs
                </button>
            </div>

            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl">
                        <p className="text-slate-500 text-sm italic">No recent bookings found.</p>
                    </div>
                ) : (
                    bookings.map((booking, i) => (
                        <div key={booking.id} className="group relative flex gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/40 hover:border-primary/20 transition-all cursor-pointer">
                            <div className="relative">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110",
                                    booking.paymentStatus === 'paid' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                        booking.paymentStatus === 'failed' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                            "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                )}>
                                    <Clock className="w-6 h-6" />
                                </div>
                                {i < bookings.length - 1 && (
                                    <div className="absolute top-12 left-1/2 -ml-[0.5px] w-[1px] h-8 bg-slate-800/50" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-primary transition-colors">
                                        {booking.tourName || 'Unknown Tour'}
                                    </h4>
                                    <span className="text-[10px] font-mono text-slate-500">
                                        {booking.createdAt ? format(new Date(booking.createdAt), 'HH:mm') : '—'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {booking.participants || 1}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {booking.operatorName || 'Operator'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <span className={cn(
                                        "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border",
                                        booking.paymentStatus === 'paid' ? "text-green-400 border-green-400/20 bg-green-400/5" :
                                            booking.paymentStatus === 'failed' ? "text-red-400 border-red-400/20 bg-red-400/5" :
                                                "text-blue-400 border-blue-400/20 bg-blue-400/5"
                                    )}>
                                        {booking.paymentStatus || 'Pending'}
                                    </span>
                                    <span className="text-xs font-bold text-white">
                                        ${booking.totalAmount || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
