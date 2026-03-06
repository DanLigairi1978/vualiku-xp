'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@vualiku/shared';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

// Define the list of authorised admin emails here
const ADMIN_EMAILS = [
    'admin@vualiku.xp',
    // Add authorised Google account emails here:
    // 'your.email@gmail.com',
];

export default function LoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user email is in admin list
            if (user.email && ADMIN_EMAILS.includes(user.email)) {
                // If yes → redirect to /
                router.push('/');
            } else {
                // If no → sign out + show "Access denied" error
                await signOut(auth);
                setError('Access denied. You are not on the authorised personnel list.');
            }
        } catch (err: any) {
            console.error('[Login] Error:', err);
            setError(err.message || 'Failed to sign in with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md space-y-8 p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold font-tahoma uppercase italic tracking-tighter">Meridian Admin</h1>
                    <p className="text-slate-400 text-sm font-light">Authorised Personnel Only</p>
                </div>

                <div className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 text-xs font-medium text-center">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full h-14 bg-primary text-slate-950 font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(154,205,50,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                SIGN IN WITH GOOGLE
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Quantum Encryption Enabled</p>
                </div>
            </div>
        </div>
    );
}
