'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user && pathname !== '/login') {
                router.push('/login');
            } else if (user && !isAdmin && pathname !== '/unauthorized') {
                // Potential unauthorized page
                // router.push('/unauthorized');
            }
        }
    }, [user, loading, isAdmin, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Allow access to login page even if not authenticated
    if (!user && pathname === '/login') {
        return <>{children}</>;
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
