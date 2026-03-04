'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@vualiku/shared';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming I'll create these or copy from tourist
import { Input } from '@/components/ui/input';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (err: any) {
            console.error('[Login] Error:', err);
            setError(err.message || 'Failed to sign in. Please check your credentials.');
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

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email System Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@vualiku.xp"
                            className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Secure Passkey</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 text-xs font-medium text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary text-slate-950 font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(154,205,50,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                ACCESS COMMAND CENTRE
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Quantum Encryption Enabled</p>
                </div>
            </div>
        </div>
    );
}
