'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Users, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TodaysTours() {
    const [tours, setTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const today = new Date();
        const start = startOfDay(today).toISOString();
        const end = endOfDay(today).toISOString();

        const q = query(
            collection(db, 'allBookings'),
            where('tourDate', '>=', start),
            where('tourDate', '<=', end),
            orderBy('tourDate', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTours(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return null;

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-tahoma text-white uppercase tracking-tight">Today's Schedule</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">{format(new Date(), 'EEEE, MMMM do')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tours.length === 0 ? (
                    <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                        <p className="text-slate-500 font-light italic">No tours scheduled for today.</p>
                    </div>
                ) : (
                    tours.map((tour) => (
                        <div key={tour.id} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-primary/40 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className={cn(
                                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
                                    tour.status === 'confirmed' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                                )}>
                                    {tour.status || 'Confirmed'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate pr-16">{tour.tourName}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {tour.operatorName}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-sm py-4 border-y border-slate-800/50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase">Participants</span>
                                        <div className="flex items-center gap-1.5 text-slate-200">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span className="font-bold">{tour.participants || 1} Guests</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase">Pickup Location</span>
                                        <span className="text-slate-200 font-medium truncate max-w-[120px]">{tour.pickupLocation || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                G{i}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest flex items-center gap-1">
                                        View manifest <Info className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
