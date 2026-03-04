'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { formatFJD } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    User, LogOut, Calendar, MapPin, Star, Trophy,
    ChevronRight, Shield, Loader2, Gift
} from 'lucide-react';
import Link from 'next/link';

interface BookingHistoryItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    bookingDate: string;
    totalFee: number;
    participants: number;
    checkedIn?: boolean;
    operatorName?: string;
    eventName?: string;
}

// Loyalty tiers computed from total bookings
const LOYALTY_TIERS = [
    { name: 'Explorer', min: 0, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20', icon: '🌱' },
    { name: 'Adventurer', min: 3, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: '🏔️' },
    { name: 'Pathfinder', min: 8, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', icon: '🌊' },
    { name: 'Legend', min: 15, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: '🌟' },
];

function getLoyaltyTier(bookingCount: number) {
    return [...LOYALTY_TIERS].reverse().find((t) => bookingCount >= t.min) || LOYALTY_TIERS[0];
}

function getNextTier(bookingCount: number) {
    const currentIndex = LOYALTY_TIERS.findIndex((t) => t === getLoyaltyTier(bookingCount));
    return currentIndex < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[currentIndex + 1] : null;
}

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [isUserLoading, user, router]);

    useEffect(() => {
        if (!firestore || !user) return;

        const fetchBookings = async () => {
            try {
                const q = query(
                    collection(firestore, 'allBookings'),
                    where('userId', '==', user.uid),
                    orderBy('bookingDate', 'desc')
                );
                const snapshot = await getDocs(q);
                setBookings(
                    snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingHistoryItem)
                );
            } catch (err) {
                console.error('Failed to fetch booking history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [firestore, user]);

    const stats = useMemo(() => {
        const totalSpent = bookings.reduce((sum, b) => sum + (b.totalFee || 0), 0);
        const totalTrips = bookings.length;
        const totalGuests = bookings.reduce((sum, b) => sum + (b.participants || 0), 0);
        return { totalSpent, totalTrips, totalGuests };
    }, [bookings]);

    const tier = getLoyaltyTier(stats.totalTrips);
    const nextTier = getNextTier(stats.totalTrips);
    const progressToNext = nextTier ? ((stats.totalTrips - tier.min) / (nextTier.min - tier.min)) * 100 : 100;

    if (isUserLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('');
    };

    return (
        <div className="min-h-screen bg-background text-white pt-32 pb-24 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="container relative z-10 mx-auto px-6 max-w-4xl space-y-8">
                {/* Profile Header */}
                <div className="forest-card p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24 border-2 border-primary/30">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                                {getInitials(user.displayName)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold font-tahoma">{user.displayName || 'Adventurer'}</h1>
                            <p className="text-foreground/50 text-sm mt-1">{user.email}</p>

                            {/* Loyalty Badge */}
                            <div className={`flex items-center gap-2 mt-3 ${tier.color}`}>
                                <span className="text-lg">{tier.icon}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tier.bg} ${tier.border} border`}>
                                    {tier.name}
                                </span>
                                {nextTier && (
                                    <span className="text-xs text-foreground/30">
                                        {nextTier.min - stats.totalTrips} more trips to {nextTier.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={() => { signOut(auth); router.push('/'); }}
                            variant="outline"
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl"
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </div>

                    {/* Loyalty Progress Bar */}
                    {nextTier && (
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className={tier.color}>{tier.icon} {tier.name}</span>
                                <span className="text-foreground/30">{nextTier.icon} {nextTier.name}</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, progressToNext)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Trips', value: stats.totalTrips.toString(), icon: <Calendar className="w-5 h-5 text-blue-400" /> },
                        { label: 'Total Spent', value: formatFJD(stats.totalSpent), icon: <Trophy className="w-5 h-5 text-amber-400" /> },
                        { label: 'Guests Booked', value: stats.totalGuests.toString(), icon: <User className="w-5 h-5 text-purple-400" /> },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                            <div className="flex justify-center mb-2">{icon}</div>
                            <p className="text-2xl font-bold text-white font-tahoma">{value}</p>
                            <p className="text-[10px] text-primary/50 uppercase font-bold tracking-wider mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/booking" className="forest-card p-5 flex items-center gap-4 group hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Gift className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white text-sm">Book New Adventure</p>
                            <p className="text-xs text-foreground/40">Explore experiences</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors" />
                    </Link>
                    <Link href="/explore" className="forest-card p-5 flex items-center gap-4 group hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white text-sm">Discover Activities</p>
                            <p className="text-xs text-foreground/40">Search & filter</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-blue-400 transition-colors" />
                    </Link>
                </div>

                {/* Booking History */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-tahoma flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary" /> Booking History
                    </h2>

                    {loading ? (
                        <div className="py-12 text-center text-foreground/40">
                            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-primary/50" />
                            Loading history...
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-3xl">
                            <MapPin className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                            <p className="text-foreground/50 text-lg font-light italic">No bookings yet.</p>
                            <Button asChild className="btn-forest mt-6">
                                <Link href="/booking">Book Your First Adventure</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${booking.checkedIn ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'
                                            }`}>
                                            {booking.checkedIn ? <Shield className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">
                                                {booking.eventName || 'Adventure Booking'}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-foreground/40 mt-0.5">
                                                <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                                {booking.operatorName && <span>• {booking.operatorName}</span>}
                                                <span>• {booking.participants} guests</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary font-tahoma">{formatFJD(booking.totalFee)}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${booking.checkedIn ? 'text-green-400' : 'text-amber-400'
                                            }`}>
                                            {booking.checkedIn ? 'Completed' : 'Upcoming'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
