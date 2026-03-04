'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AdventureMap = dynamic(() => import('@/components/map/adventure-map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[70vh] rounded-[2rem] border border-primary/20 bg-white/5 flex flex-col items-center justify-center text-primary">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="font-bold tracking-widest text-sm uppercase">Establishing Uplink...</p>
        </div>
    )
});

export default function MapPage() {
    return (
        <div className="bg-background min-h-screen text-white pt-32 pb-24 px-6 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-6xl space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Adventure <span className="text-primary italic">Map</span></h1>
                        <p className="text-foreground/60 text-lg max-w-2xl">
                            Explore Vanua Levu. Select a map marker to view tour details and find out more.
                        </p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3">
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-primary text-xs font-bold tracking-widest uppercase">Live Tracking Enabled</span>
                    </div>
                </div>

                <AdventureMap />
            </div>
        </div>
    );
}
