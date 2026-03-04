'use client';

import { useParams } from 'next/navigation';
import { WaiverForm } from '@/components/waivers/waiver-form';

export default function WaiverPage() {
    const params = useParams();
    const bookingId = params.bookingId as string;

    return (
        <div className="min-h-screen bg-background text-white pt-32 pb-24 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="container relative z-10 mx-auto px-6 max-w-2xl">
                {/* Header */}
                <div className="text-center space-y-4 mb-10">
                    <div className="flex items-center justify-center gap-3 text-primary/60">
                        <span className="h-[1px] w-8 bg-primary/30" />
                        <span className="text-[12px] font-bold tracking-[0.4em] uppercase">Safety First</span>
                        <span className="h-[1px] w-8 bg-primary/30" />
                    </div>
                    <h1 className="text-4xl font-bold font-tahoma">
                        Activity <span className="text-primary">Waiver</span>
                    </h1>
                    <p className="text-foreground/50 text-sm">
                        Complete this waiver before your adventure. Quick, secure, and paperless.
                    </p>
                </div>

                <WaiverForm bookingId={bookingId} />
            </div>
        </div>
    );
}
