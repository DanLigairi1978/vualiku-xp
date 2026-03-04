'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { formatFJD, formatFJDCompact } from '@/lib/currency';
import {
    DollarSign, Download, ArrowLeft, History,
    Calendar, FileText, Loader2, Filter,
    CheckCircle2, Clock, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Booking {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    totalFee: number;
    bookingDate: string;
    status: string;
    paymentStatus: string;
    items: any[];
    operatorId?: string;
    packageName?: string;
    isPackage?: boolean;
}

export default function OperatorEarnings() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/operator/login');
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        if (!firestore || !user) return;

        const fetchBookings = async () => {
            try {
                // Fetch bookings for this operator
                const q = query(
                    collection(firestore, 'allBookings'),
                    where('operatorId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );

                const snapshot = await getDocs(q);
                const fetched: Booking[] = [];
                snapshot.forEach((d) => fetched.push({ id: d.id, ...d.data() } as Booking));
                setBookings(fetched);
            } catch (err) {
                console.error("Failed to fetch earnings history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [firestore, user]);

    // Monthly aggregation
    const monthlyStats = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const start = startOfMonth(new Date(year, month - 1));
        const end = endOfMonth(new Date(year, month - 1));

        const filtered = bookings.filter(b => {
            try {
                const date = parseISO(b.bookingDate);
                return isWithinInterval(date, { start, end });
            } catch {
                return false;
            }
        });

        const revenue = filtered.reduce((sum, b) => sum + (b.totalFee || 0), 0);
        return {
            revenue,
            count: filtered.length,
            bookings: filtered
        };
    }, [bookings, selectedMonth]);

    const downloadReceipt = async (monthStr: string) => {
        if (!receiptRef.current) return;
        setGeneratingPdf(monthStr);

        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`VualikuXP-Receipt-${monthStr}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
        } finally {
            setGeneratingPdf(null);
        }
    };

    if (isUserLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-foreground/40 font-medium">Calculating ledger…</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background text-white pb-24 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            {/* Header */}
            <header className="bg-white/5 border-b border-white/10 relative z-10 pt-8 pb-6 px-6 backdrop-blur-xl">
                <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center">
                            <DollarSign className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-tahoma tracking-tight">Earnings & Receipts</h1>
                            <p className="text-foreground/50 text-sm mt-1">Manage your payouts and download tax receipts</p>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="border-white/10 text-foreground/60 hover:bg-white/5 rounded-xl">
                        <Link href="/operator/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto max-w-5xl px-6 pt-12 relative z-10 space-y-8">

                {/* Month Picker & Summary */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                                <Filter className="w-4 h-4" /> Filter Period
                            </div>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-background/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="flex items-baseline gap-4">
                            <h2 className="text-5xl font-bold font-tahoma">{formatFJD(monthlyStats.revenue)}</h2>
                            <p className="text-foreground/40 font-medium uppercase tracking-tighter">FJD Revenue</p>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-[10px] text-foreground/40 uppercase font-bold mb-1">Total Activities</p>
                                <p className="text-xl font-bold">{monthlyStats.count}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-[10px] text-foreground/40 uppercase font-bold mb-1">Status</p>
                                <p className="text-xl font-bold text-green-400">Verified</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 flex flex-col justify-between">
                        <div>
                            <FileText className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-bold font-tahoma mb-2">Monthly Receipt</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Download an official Vualiku XP receipt for the period of {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}.
                            </p>
                        </div>
                        <Button
                            onClick={() => downloadReceipt(selectedMonth)}
                            disabled={monthlyStats.count === 0 || generatingPdf !== null}
                            className="w-full btn-forest rounded-xl h-12 font-bold shadow-lg mt-6"
                        >
                            {generatingPdf === selectedMonth ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-5 w-5" />
                            )}
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/10 bg-white/5 flex items-center gap-3">
                        <History className="w-5 h-5 text-primary" />
                        <h3 className="font-bold font-tahoma">Activity Ledger</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/20 text-[10px] uppercase font-bold tracking-widest text-foreground/40">
                                <tr>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4">Reference</th>
                                    <th className="px-8 py-4">Guest</th>
                                    <th className="px-8 py-4">Amount</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {monthlyStats.bookings.length > 0 ? (
                                    monthlyStats.bookings.map((booking) => (
                                        <tr key={booking.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{format(parseISO(booking.bookingDate), 'MMM dd, yyyy')}</span>
                                                    <span className="text-[10px] text-foreground/40">{booking.id.slice(0, 8).toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Activity className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {booking.isPackage ? booking.packageName : (booking.items?.[0]?.eventName || 'Adventure')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-medium">{booking.firstName} {booking.lastName}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-primary">{formatFJD(booking.totalFee)}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5">
                                                    {booking.paymentStatus === 'paid' ? (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                            <span className="text-xs font-bold text-green-400">Paid</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-4 h-4 text-amber-400" />
                                                            <span className="text-xs font-bold text-amber-400">Pending</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center text-foreground/30 italic">
                                            No activity records found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Hidden Receipt Template for PDF Generation */}
            <div className="fixed top-[5000px] left-0">
                <div
                    ref={receiptRef}
                    className="w-[800px] bg-white p-16 text-black font-sans"
                    style={{ minHeight: '1100px' }}
                >
                    <div className="flex justify-between items-start border-b-4 border-black pb-12 mb-12">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">VUALIKU XP</h1>
                            <p className="text-gray-500 font-bold">COMMUNITY OPERATOR RECEIPT</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">Period</p>
                            <p className="text-2xl font-black">{format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-16">
                        <div>
                            <p className="text-xs uppercase font-black text-gray-400 mb-2">Operator Details</p>
                            <p className="font-bold text-lg">{user.displayName || 'Register Operator'}</p>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase font-black text-gray-400 mb-2">Summary</p>
                            <p className="text-3xl font-black text-black">{formatFJD(monthlyStats.revenue)}</p>
                            <p className="font-bold text-gray-500">{monthlyStats.count} Completed Activities</p>
                        </div>
                    </div>

                    <table className="w-full mb-16">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="text-left py-4 uppercase text-xs font-black">Date</th>
                                <th className="text-left py-4 uppercase text-xs font-black">Description</th>
                                <th className="text-right py-4 uppercase text-xs font-black">Guest</th>
                                <th className="text-right py-4 uppercase text-xs font-black">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyStats.bookings.map(b => (
                                <tr key={b.id} className="border-b border-gray-100">
                                    <td className="py-4 font-bold text-sm">{format(parseISO(b.bookingDate), 'MMM dd')}</td>
                                    <td className="py-4 text-sm">{b.isPackage ? b.packageName : (b.items?.[0]?.eventName || 'Adventure')}</td>
                                    <td className="py-4 text-right text-sm">{b.lastName}</td>
                                    <td className="py-4 text-right font-bold text-sm">{formatFJD(b.totalFee)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-auto pt-12 border-t border-gray-200">
                        <div className="flex justify-between items-center bg-gray-50 p-8 rounded-2xl">
                            <div>
                                <p className="font-black text-xs uppercase tracking-widest text-gray-400">Total Settlement</p>
                                <p className="text-sm font-medium text-gray-500 italic mt-1">This receipt serves as a official record of community activity revenue.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black">{formatFJD(monthlyStats.revenue)}</p>
                                <p className="text-xs font-bold text-green-600 uppercase mt-1">Status: Verified Community Income</p>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-12">
                            Generated by Vualiku XP Platform — Empowing Fiji's Vanua Levu Operators
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Minimal Link stub if not imported
import Link from 'next/link';
