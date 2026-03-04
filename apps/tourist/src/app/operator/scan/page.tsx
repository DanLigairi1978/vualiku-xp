'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';



export default function OperatorScanner() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const [scanResult, setScanResult] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'invalid'>('idle');
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    useEffect(() => {
        const verifyAdmin = async () => {
            if (!isUserLoading) {
                if (!user) {
                    router.push('/');
                    return;
                }

                try {
                    const token = await user.getIdToken();
                    const res = await fetch('/api/operator/check-admin', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (!data.isAdmin) {
                            router.push('/operator/dashboard');
                        }
                    } else {
                        router.push('/operator/dashboard');
                    }
                } catch (err) {
                    console.error("Failed admin check", err);
                    router.push('/operator/dashboard');
                }
            }
        };
        verifyAdmin();
    }, [user, isUserLoading, router]);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
      /* verbose= */ false
        );

        const onScanSuccess = async (decodedText: string) => {
            if (status === 'success') return; // Prevent multiple Rapid Scans
            setScanResult(decodedText);
            setStatus('scanning');
            scanner.pause(true);

            if (firestore) {
                try {
                    const docRef = doc(firestore, 'allBookings', decodedText);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        await updateDoc(docRef, { checkedIn: true });
                        setBookingDetails({ id: docSnap.id, ...docSnap.data() });
                        setStatus('success');
                    } else {
                        setStatus('invalid');
                    }
                } catch (error) {
                    console.error("Scan processing error:", error);
                    setStatus('invalid');
                }
            }
        };

        const onScanFailure = (error: any) => {
            // Ignored for continuous scanning
        };

        if (user && status === 'idle') {
            scanner.render(onScanSuccess, onScanFailure);
        }

        return () => {
            if (scanner && document.getElementById('reader')) {
                scanner.clear().catch(e => console.error(e));
            }
        };
    }, [firestore, user, status]);

    const resetScanner = () => {
        setScanResult(null);
        setBookingDetails(null);
        setStatus('idle');
    };

    if (isUserLoading || !user) return null;

    return (
        <div className="min-h-screen bg-background text-white pb-24 relative overflow-hidden flex flex-col items-center">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <header className="w-full bg-white/5 border-b border-white/10 relative z-10 pt-8 pb-6 px-6 backdrop-blur-xl">
                <div className="container mx-auto max-w-xl flex justify-between items-center">
                    <Button onClick={() => router.push('/operator/dashboard')} variant="ghost" className="text-white hover:bg-white/10">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
                    </Button>
                    <div className="h-10 w-10 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-xl px-6 pt-12 relative z-10 space-y-8 flex-1 flex flex-col items-center">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold font-tahoma tracking-tight">Ticket <span className="text-primary italic">Scanner</span></h1>
                    <p className="text-foreground/50 text-sm mt-2">Position the guest's digital booking QR code within the frame.</p>
                </div>

                {status === 'idle' && (
                    <div className="w-full max-w-sm aspect-square bg-black/50 border border-primary/30 rounded-3xl overflow-hidden shadow-2xl relative">
                        <div id="reader" className="w-full h-full text-black" />

                        {/* Overlay styles for html5-qrcode to make it look native */}
                        <style dangerouslySetInnerHTML={{
                            __html: `
              #reader img { display: none !important; }
              #reader__scan_region { background: transparent !important; }
              #reader__dashboard_section_csr span { color: white !important; }
              #reader__dashboard_section_csr { padding: 10px; background: rgba(0,0,0,0.8); }
              #reader__dashboard_section_swaplink { text-decoration: none; color: #22c55e !important; }
              #reader button { background: #22c55e; color: black; border: none; padding: 5px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; }
            `}} />
                    </div>
                )}

                {status === 'scanning' && (
                    <div className="w-full max-w-sm rounded-[2rem] border border-primary/20 bg-white/5 flex flex-col items-center justify-center text-primary p-12">
                        <div className="h-16 w-16 bg-primary/20 rounded-full animate-ping mb-6" />
                        <p className="font-bold tracking-widest text-sm uppercase">Verifying Booking...</p>
                    </div>
                )}

                {status === 'success' && bookingDetails && (
                    <div className="w-full max-w-sm forest-card p-8 flex flex-col items-center text-center animate-in zoom-in duration-300">
                        <CheckCircle2 className="h-20 w-20 text-green-400 mb-6" />
                        <h2 className="text-2xl font-bold font-tahoma text-white tracking-tight leading-tight">Identity Verified</h2>
                        <p className="text-lg font-bold text-primary mt-2 uppercase tracking-widest">{bookingDetails.firstName} {bookingDetails.lastName}</p>
                        <div className="mt-8 space-y-3 w-full text-left bg-black/20 p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between text-sm">
                                <span className="text-foreground/50">Group Size</span>
                                <span className="font-bold text-white">{bookingDetails.participants} Pax</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                                <span className="text-foreground/50">Booking Code</span>
                                <span className="font-bold text-white uppercase text-[10px] break-all ml-4">{scanResult}</span>
                            </div>
                        </div>
                        <Button onClick={resetScanner} className="w-full mt-8 btn-forest h-14 shadow-xl">
                            Scan Next Guest
                        </Button>
                    </div>
                )}

                {status === 'invalid' && (
                    <div className="w-full max-w-sm bg-red-500/10 border border-red-500/20 p-8 flex flex-col items-center text-center rounded-[2rem] animate-in zoom-in duration-300 relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                        <XCircle className="h-20 w-20 text-red-500 mb-6" />
                        <h2 className="text-2xl font-bold font-tahoma text-white tracking-tight leading-tight">Booking Not Found</h2>
                        <p className="text-foreground/70 mt-4 text-sm">The provided QR code does not match any active booking in our system or the code is corrupted.</p>
                        <Button onClick={resetScanner} variant="outline" className="w-full mt-8 border-red-500/30 text-red-400 font-bold bg-white/5 hover:bg-red-500/10 h-14 rounded-xl">
                            Try Again
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
