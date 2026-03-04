'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowRight, QrCode } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('booking_id') || 'PENDING';

    return (
        <div className="bg-background min-h-screen text-white pt-32 pb-24 px-6 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-2xl space-y-12">
                <div className="text-center p-12 bg-white/5 border border-primary/30 rounded-3xl backdrop-blur-md shadow-2xl space-y-8">
                    {/* Success Icon */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-in zoom-in duration-500">
                            <CheckCircle className="w-14 h-14 text-primary" />
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl md:text-5xl font-bold font-tahoma text-shadow-lg">
                            Booking <span className="text-primary">Confirmed!</span>
                        </h1>
                        <p className="text-lg text-foreground/60 font-light">
                            Vinaka vakalevu! Your adventure has been booked and payment received.
                        </p>
                    </div>

                    {/* Booking ID */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-2 animate-in fade-in duration-700 delay-200">
                        <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold">Booking ID</p>
                        <p className="text-2xl font-bold text-primary font-mono">{bookingId}</p>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 animate-in fade-in duration-700 delay-300">
                        <QrCode className="w-32 h-32 mx-auto text-primary/60" />
                        <p className="text-sm text-foreground/50">
                            Show this QR code at check-in. A copy has been sent to your email.
                        </p>
                    </div>

                    {/* What's Next */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left space-y-3 animate-in fade-in duration-700 delay-400">
                        <h3 className="text-lg font-bold text-primary">What happens next?</h3>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">✓</span>
                                <span>Confirmation email with your full itinerary and QR code</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">✓</span>
                                <span>24-hour reminder before each activity with meetup details</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">✓</span>
                                <span>PDF itinerary available for download at any time</span>
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-in fade-in duration-700 delay-500">
                        <Button className="btn-forest h-14 px-8 text-lg shadow-xl">
                            <Download className="w-5 h-5 mr-2" /> Download Itinerary
                        </Button>
                        <Button asChild variant="ghost" className="btn-outline-forest h-14 px-8 text-lg">
                            <Link href="/directory">
                                Explore More <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="bg-background min-h-screen text-white pt-32 pb-24 px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground/60">Loading confirmation...</p>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
