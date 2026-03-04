'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { auth } = initializeFirebase();

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast({ title: 'Welcome Back!' });
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                toast({ title: 'Account Created Successfully!' });
            }
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: error.message || 'An error occurred during authentication.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        const { auth } = initializeFirebase();
        const provider = new GoogleAuthProvider();

        try {
            await signInWithPopup(auth, provider);
            toast({ title: 'Welcome Back!' });
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: error.message || 'An error occurred during Google authentication.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-background border-primary/20 text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold font-heading text-center">
                        {isLogin ? 'Traveler Login' : 'Sign Up'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-foreground/70">
                        {isLogin
                            ? 'Enter your credentials to continue.'
                            : 'Create an account to secure your booking.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAuth} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="operator@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white/5 border-primary/20 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-white/5 border-primary/20 text-white"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-primary/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <Button type="button" variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-primary/20 text-white transition-colors" onClick={handleGoogleAuth} disabled={loading}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Google
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary hover:underline"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
