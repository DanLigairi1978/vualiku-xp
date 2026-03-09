'use client';

import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { Wrench } from 'lucide-react';

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
    const flags = useFeatureFlags();
    const isEnabled = flags?.maintenance?.enabled ?? false;

    if (isEnabled) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-white px-6">
                <div className="text-center max-w-md space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                        <Wrench className="w-10 h-10 text-yellow-400" />
                    </div>
                    <h1 className="text-3xl font-bold font-tahoma tracking-tight">Under Maintenance</h1>
                    <p className="text-lg text-foreground/60 font-light leading-relaxed">
                        {flags?.maintenance?.message || 'We are currently performing maintenance. Please check back shortly.'}
                    </p>
                    <p className="text-sm text-foreground/30 italic">
                        Please check back shortly. We appreciate your patience.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
