'use client';

import { useState } from 'react';
import { useBasket } from '@/context/BasketContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { sortBasketChronologically } from '@/lib/booking-utils';
import { pointsOfOrigin, getEstimatedTravelTime, masterEvents } from '@vualiku/shared';
import { format, parseISO } from 'date-fns';
import { Trash2, MapPin, Navigation, Clock, CreditCard, ChevronLeft, Download, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { GoogleMapPreview } from '@/components/booking/google-map-preview';
import { generatePdfItinerary } from '@/lib/pdf-generator';
import Image from 'next/image';
import { BookingStepTracker } from '@/components/booking/BookingStepTracker';

export default function CheckoutPage() {
    const { items, removeItem, origin } = useBasket();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const sortedItems = sortBasketChronologically(items);
    const originData = pointsOfOrigin.find(p => p.id === origin);

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.15; // 15% VAT placeholder
    const total = subtotal + tax;

    const handleDownloadDraft = async () => {
        await generatePdfItinerary(sortedItems, originData, total, true);
    };

    const handleCheckout = async () => {
        if (isProcessing) return; // H3: Prevent double-click debounce
        setIsProcessing(true);
        setPaymentError(null);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            // 1. Convert basket into a pending backend booking with verified prices
            const bookingRes = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    firstName: 'Guest', // TODO: User real form data / profile
                    lastName: 'User',
                    email: 'guest@vualiku-xp.com',
                    phone: '',
                    origin: origin || '',
                    items: items.map(item => ({
                        eventName: item.eventName,
                        operatorId: item.operatorId,
                        date: item.date,
                        timeSlot: item.timeSlot,
                        pax: item.pax
                    }))
                }),
            });

            const bookingData = await bookingRes.json();
            if (!bookingRes.ok) {
                throw new Error(bookingData.error || 'Failed to initialize booking');
            }

            // 2. Pass only bookingId to payment session creator
            const response = await fetch('/api/checkout/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    bookingId: bookingData.bookingId,
                    customerEmail: 'guest@vualiku-xp.com', // TODO: Get from auth context
                    customerName: 'Guest',
                }),
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to payment gateway
            window.location.href = data.checkoutUrl;
        } catch (error: any) {
            console.error('[checkout] Error:', error);

            // H5: Network error handling & feedback
            if (error.name === 'AbortError') {
                setPaymentError('Request timed out. Please check your connection and try again.');
            } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
                setPaymentError('Network error. You appear to be offline. Connect to the internet and try again.');
            } else {
                setPaymentError(
                    error instanceof Error
                        ? error.message
                        : 'Something went wrong. Please try again.'
                );
            }
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-background min-h-screen text-white pt-32 pb-24 px-6 relative overflow-hidden">
                <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />
                <div className="container relative z-10 mx-auto max-w-4xl space-y-12">
                    <div className="text-center p-12 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                        <AlertTriangle className="w-16 h-16 text-primary mx-auto mb-6 opacity-50" />
                        <h2 className="text-3xl font-bold font-tahoma mb-4">Your Basket is Empty</h2>
                        <p className="text-xl text-foreground/60 mb-8">You need to select at least one adventure to generate an itinerary.</p>
                        <Link href="/directory">
                            <Button className="btn-forest text-lg h-14 shadow-xl">Browse Tours</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen text-white pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-7xl mb-8">
                <BookingStepTracker currentStep={2} />
            </div>

            <div className="container relative z-10 mx-auto max-w-7xl space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
                    <div className="space-y-4">
                        <Link href="/booking" className="inline-flex items-center text-primary hover:text-white transition-colors">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Booking
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-tahoma text-shadow-lg">Checkout & Preview</h1>
                        <p className="text-foreground/80 text-lg max-w-2xl font-light">
                            Review your digital scroll timeline. Ensure all details are correct before generating your final invoice.
                        </p>
                    </div>
                    <Button onClick={handleDownloadDraft} variant="outline" className="border-primary/50 text-primary hover:bg-primary/20 h-12 bg-black/40 backdrop-blur-md shadow-xl">
                        <Download className="w-5 h-5 mr-2" /> Download Draft Itinerary
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Digital Scroll preview */}
                    <div className="lg:col-span-7 space-y-8">
                        <h3 className="text-2xl font-bold text-white font-tahoma flex items-center gap-3">
                            <Navigation className="text-primary w-6 h-6" /> Your Vualiku XP Adventure Preview
                        </h3>

                        <div className="relative pl-8 space-y-12 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-white/10 before:to-transparent">

                            {/* Arrival Node */}
                            {originData && (
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-black font-bold shadow-xl absolute -left-12">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="bg-white/5 border border-primary/30 p-6 rounded-2xl backdrop-blur-md w-full shadow-2xl relative">
                                        <h4 className="text-xl font-bold text-primary mb-1">Arrival & Transit</h4>
                                        <p className="text-sm text-foreground/70 mb-3 font-light">Your journey begins at {originData.label}.</p>
                                        <div className="text-xs bg-black/40 inline-flex items-center px-3 py-1.5 rounded-full border border-white/5">
                                            <Clock className="w-3 h-3 mr-2 text-primary" />
                                            Est. Transfer to first location: {getEstimatedTravelTime(originData.id, sortedItems[0].operatorId)} mins
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Chronological Event Nodes */}
                            {sortedItems.map((item, index) => {
                                const mEvent = masterEvents.find(e => e.name === item.eventName);
                                return (
                                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-zinc-800 text-white shadow-xl absolute -left-12">
                                            <span className="text-sm font-bold">{index + 1}</span>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-2xl backdrop-blur-md w-full hover:border-primary/50 transition-colors relative group/card">

                                            <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all opacity-0 group-hover/card:opacity-100 z-10" title="Remove from itinerary">
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="flex flex-col sm:flex-row gap-6">
                                                {mEvent?.imageUrl && (
                                                    <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                                        <Image src={mEvent.imageUrl} alt={item.eventName} fill className="object-cover" />
                                                    </div>
                                                )}
                                                <div className="space-y-2 flex-1">
                                                    <div className="text-xs font-bold text-primary uppercase tracking-widest">{format(parseISO(item.date), "EEEE, MMM d")}</div>
                                                    <h4 className="text-2xl font-bold text-white font-tahoma leading-tight pr-8">{item.eventName}</h4>
                                                    <p className="text-sm text-foreground/50">{item.operatorName}</p>

                                                    <div className="flex flex-wrap gap-3 pt-3">
                                                        <span className="text-xs bg-white/5 px-3 py-1 rounded-full border border-white/10">{item.timeSlot}</span>
                                                        <span className="text-xs bg-white/5 px-3 py-1 rounded-full border border-white/10">{item.pax} Pax</span>
                                                        <span className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">${item.totalPrice}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Column: Order Summary & Map Sync */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Map Sync Plugin */}
                        <div className="forest-card rounded-3xl overflow-hidden h-[300px] border border-white/10 shadow-2xl relative">
                            <GoogleMapPreview originId={origin} events={sortedItems} />
                            <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs text-center font-light z-10">
                                <span className="text-primary font-bold">Terrain Sync Live</span> - Operators mapped to actual Vanua Levu coordinates.
                            </div>
                        </div>

                        {/* Order Summary & Finalize */}
                        <div className="forest-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6 bg-white/5 backdrop-blur-xl">
                            <h3 className="text-2xl font-bold text-white font-tahoma border-b border-white/10 pb-4">Order Summary</h3>

                            <div className="space-y-4 text-sm font-light">
                                <div className="flex justify-between items-center text-foreground/80">
                                    <span>Adventure Subtotal ({items.length} events)</span>
                                    <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-foreground/80">
                                    <span>Taxes & Fees (15%) <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded ml-2">Inc. Insurance</span></span>
                                    <span className="font-bold text-white">${tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <span className="text-foreground/60">Grand Total</span>
                                <span className="text-4xl font-bold text-primary font-tahoma">${total.toFixed(2)}</span>
                            </div>

                            <div className="pt-8 space-y-4">
                                <p className="text-center text-sm font-light text-foreground/60 pb-2">Everything look perfect? Proceed to secure payment below.</p>

                                {paymentError && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl text-center">
                                        {paymentError}
                                    </div>
                                )}

                                <Button
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className="w-full h-14 bg-primary text-background hover:bg-white font-bold text-lg shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5 mr-2" /> Proceed to Payment
                                        </>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs text-foreground/40 pt-2">
                                    <ShieldCheck className="w-4 h-4 text-primary/60" />
                                    <span>Secured by encrypted payment gateway · FJD & USD accepted</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
