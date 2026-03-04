'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, getDocs, updateDoc, doc, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
    Shield,
    LogOut,
    Users,
    Calendar,
    MapPin,
    CheckCircle2,
    QrCode,
    Globe,
    DollarSign,
    AlertTriangle,
    Package,
    TrendingUp,
    Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ActivityManager } from '@/components/operator/activity-manager';
import { AdminApprovalQueue } from '@/components/operator/admin-approval-queue';
import { AnalyticsDashboard } from '@/components/operator/analytics-dashboard';
import { WeatherWidget } from '@/components/booking/weather-widget';
import { CommandCentreLayout } from '@/components/operator/command-centre-layout';
import { UnifiedInbox } from '@/components/operator/unified-inbox';

interface Booking {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    participants: number;
    bookingDate: string;
    totalFee: number;
    checkedIn?: boolean;
}

export default function OperatorDashboard() {
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdminState, setIsAdminState] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/operator/login');
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        if (!firestore || !user) return;

        const fetchBookings = async () => {
            try {
                let isAdminInfo = false;
                try {
                    const token = await user.getIdToken();
                    const res = await fetch('/api/operator/check-admin', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        isAdminInfo = data.isAdmin === true;
                        setIsAdminState(isAdminInfo);
                    }
                } catch (err) {
                    console.error("Failed to check admin status", err);
                }

                let q;
                if (isAdminInfo) {
                    q = query(collection(firestore, 'allBookings'), orderBy('bookingDate', 'asc'));
                } else {
                    q = query(collection(firestore, 'allBookings'), where('userId', '==', user.uid));
                }

                const snapshot = await getDocs(q);
                let fetched: Booking[] = [];
                snapshot.forEach((d) => fetched.push({ id: d.id, ...d.data() } as Booking));

                if (!isAdminInfo) {
                    fetched = fetched.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
                }

                setBookings(fetched);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [firestore, user]);

    const markCheckedIn = async (bookingId: string) => {
        if (!firestore) return;
        try {
            const bookingRef = doc(firestore, 'allBookings', bookingId);
            await updateDoc(bookingRef, { checkedIn: true });
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, checkedIn: true } : b));
        } catch (err) {
            console.error("Error updating check-in status", err);
        }
    };

    if (isUserLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center text-white"><Shield className="animate-pulse h-12 w-12 text-primary" /></div>;
    }

    if (!user) return null;

    const isAdmin = isAdminState;

    return (
        <CommandCentreLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {/* Tab: Dashboard */}
            {activeTab === 'dashboard' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                    <header className="mb-12">
                        <h2 className="text-4xl font-bold font-tahoma tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Overview</h2>
                        <p className="text-foreground/50 mt-4 text-lg font-light">Welcome back, {user.email?.split('@')[0]}. Here's what's happening today.</p>
                    </header>

                    <AnalyticsDashboard isAdmin={!!isAdmin} />

                    <div className="grid md:grid-cols-2 gap-8">
                        <WeatherWidget />
                        <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-8 flex items-center gap-6">
                            <div className="h-16 w-16 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-500 uppercase tracking-tight">Active Alerts</h3>
                                <p className="text-foreground/70 leading-relaxed mt-1 italic">High rainfall predicted in Savusavu. Ensure all water-based activities include safety blankets.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Komuniké Inbox */}
            {
                activeTab === 'inbox' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                        <header className="mb-8">
                            <h2 className="text-4xl font-bold font-tahoma tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Komuniké Inbox</h2>
                            <p className="text-foreground/50 mt-4">Unified guest communications across all channels.</p>
                        </header>
                        <UnifiedInbox />
                    </div>
                )
            }

            {/* Tab: Manage Bookings */}
            {
                activeTab === 'bookings' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <header className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-4xl font-bold font-tahoma tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Bookings</h2>
                                <p className="text-foreground/50 mt-4">Manage upcoming tours and guest arrivals.</p>
                            </div>
                            <div className="bg-primary/20 text-primary px-6 py-2 rounded-full text-sm font-bold border border-primary/30">
                                {bookings.length} Active Bookings
                            </div>
                        </header>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.length === 0 ? (
                                <div className="col-span-full py-24 text-center border border-white/5 bg-white/5 rounded-[3rem]">
                                    <Calendar className="h-16 w-16 text-foreground/10 mx-auto mb-6" />
                                    <p className="text-foreground/40 text-xl font-light italic">Your schedule is clear for now.</p>
                                </div>
                            ) : (
                                bookings.map((booking) => (
                                    <div key={booking.id} className="forest-card p-8 group relative overflow-hidden transition-all hover:border-primary/40">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-white capitalize">{booking.firstName} {booking.lastName}</h3>
                                                <p className="text-sm font-light text-foreground/50 truncate flex items-center gap-2">
                                                    <Users className="w-3.5 h-3.5" /> {booking.participants} Pax
                                                </p>
                                            </div>
                                            {booking.checkedIn ? (
                                                <div className="bg-primary/20 text-primary p-2 rounded-xl border border-primary/40">
                                                    <CheckCircle2 className="h-6 w-6" />
                                                </div>
                                            ) : (
                                                <div className="bg-white/10 text-white/40 p-2 rounded-xl">
                                                    <Clock className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 border-t border-white/5 pt-6">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Date</span>
                                                <span className="font-medium text-primary">{booking.bookingDate ? format(parseISO(booking.bookingDate), 'MMM d, yyyy') : 'TBD'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Contact</span>
                                                <span className="font-medium truncate max-w-[150px]">{booking.phone || booking.email}</span>
                                            </div>
                                        </div>

                                        {!booking.checkedIn && (
                                            <Button
                                                onClick={() => markCheckedIn(booking.id)}
                                                className="w-full mt-8 btn-forest h-12 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                            >
                                                Check-In Guest
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )
            }

            {/* Tab: Activities */}
            {
                activeTab === 'activities' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <ActivityManager
                            isAdmin={isAdmin}
                            operatorId={user.email?.includes('waisali') ? 'waisali-nature-experience' : undefined}
                        />
                    </div>
                )
            }

            {/* Tab: Insights */}
            {
                activeTab === 'analytics' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <header className="mb-12">
                            <h2 className="text-4xl font-bold font-tahoma tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Advanced Insights</h2>
                            <p className="text-foreground/50 mt-4">Projected revenue, popularity trends, and market performance.</p>
                        </header>
                        <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-12 text-center">
                            <TrendingUp className="w-16 h-16 text-primary/40 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Market Intelligence</h3>
                            <p className="text-foreground/60 max-w-md mx-auto italic font-light">Unlock data-driven growth. Identify peak booking patterns and optimize your pricing strategy for maximum impact.</p>
                        </div>
                    </div>
                )
            }

            {/* Admin: Operator Applications Queue */}
            {
                activeTab === 'dashboard' && isAdmin && user?.email && (
                    <div className="mt-20 pt-12 border-t border-white/5 animate-in fade-in duration-1000">
                        <h3 className="text-2xl font-bold mb-8 uppercase italic tracking-tight opacity-40">Approval Queue</h3>
                        <AdminApprovalQueue adminEmail={user.email} />
                    </div>
                )
            }
        </CommandCentreLayout >
    );
}
