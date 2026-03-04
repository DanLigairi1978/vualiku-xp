'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CancelledContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('booking_id') || '';

    return (
        <div className="bg-background min-h-screen text-white pt-32 pb-24 px-6 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-2xl space-y-12">
                <div className="text-center p-12 bg-white/5 border border-red-500/30 rounded-3xl backdrop-blur-md shadow-2xl space-y-8">
                    {/* Cancel Icon */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-in zoom-in duration-500">
                            <XCircle className="w-14 h-14 text-red-400" />
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl md:text-5xl font-bold font-tahoma text-shadow-lg">
                            Payment <span className="text-red-400">Cancelled</span>
                        </h1>
                        <p className="text-lg text-foreground/60 font-light">
                            Your payment was not completed. No charges have been made.
                        </p>
                    </div>

                    {/* Info */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left space-y-3 animate-in fade-in duration-700 delay-200">
                        <h3 className="text-lg font-bold text-foreground/80">What happened?</h3>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                            The payment process was cancelled before completion. Your basket items are still saved —
                            you can return to checkout at any time to complete your booking.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-in fade-in duration-700 delay-300">
                        <Button asChild className="btn-forest h-14 px-8 text-lg shadow-xl">
                            <Link href="/checkout">
                                <RefreshCw className="w-5 h-5 mr-2" /> Try Again
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="btn-outline-forest h-14 px-8 text-lg">
                            <Link href="/booking">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Booking
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingCancelledPage() {
    return (
        <Suspense fallback={
            <div className="bg-background min-h-screen text-white pt-32 pb-24 px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground/60">Loading...</p>
                </div>
            </div>
        }>
            <CancelledContent />
        </Suspense>
    );
}
