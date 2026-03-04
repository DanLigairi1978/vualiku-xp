'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Loader2 } from 'lucide-react';

export default function OperatorLogin() {
    const router = useRouter();
    const auth = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) return;

        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/operator/dashboard');
        } catch (err: any) {
            console.error(err);
            setError('Invalid credentials or unauthorized access.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="w-full max-w-md bg-white/5 border border-primary/20 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-16 w-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold font-tahoma tracking-tight">Operator <span className="text-primary italic">Portal</span></h1>
                    <p className="text-foreground/50 text-sm mt-2 text-center">Secure access for Vanguard Rangers and Community Partners</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary/80 uppercase tracking-widest pl-1">Email Address</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-base"
                            placeholder="operator@vualikuxp.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary/80 uppercase tracking-widest pl-1">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-base"
                            placeholder="••••••••"
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-14 btn-forest text-lg mt-4 shadow-xl">
                        {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Authenticate'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
