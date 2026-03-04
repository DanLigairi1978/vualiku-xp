'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Building2, MapPin, Mail, Phone, Tag, Info } from 'lucide-react';
import { toast } from 'sonner';

export function OperatorOnboardingForm() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        businessName: '',
        operatorName: '',
        email: user?.email || '',
        phone: '',
        location: '',
        description: '',
        primaryActivity: '',
        category: 'Water & Coastal',
        basePrice: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;

        setLoading(true);
        try {
            await addDoc(collection(firestore, 'operatorApplications'), {
                ...formData,
                userId: user?.uid,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            setSubmitted(true);
            toast.success('Application submitted successfully!');
        } catch (err) {
            console.error('Error submitting application:', err);
            toast.error('Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Card className="max-w-2xl mx-auto bg-white/5 border-primary/20 backdrop-blur-xl rounded-[2rem] p-8 text-center animate-in zoom-in duration-500">
                <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
                    <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold font-tahoma mb-4">Application Received!</CardTitle>
                <CardDescription className="text-lg text-foreground/60 leading-relaxed italic">
                    Vinaka! Your application to join the Vualiku XP network has been sent for review.
                    Our curators will verify your details and get back to you within 48 hours.
                </CardDescription>
                <Button onClick={() => window.location.href = '/'} className="mt-8 btn-forest h-12 px-8 rounded-xl font-bold">
                    Return to Homepage
                </Button>
            </Card>
        );
    }

    return (
        <Card className="max-w-3xl mx-auto bg-white/5 border-white/10 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-10" />

            <CardHeader className="p-10 pb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Operator Network</span>
                </div>
                <CardTitle className="text-4xl font-bold font-tahoma tracking-tight">Join the Experience</CardTitle>
                <CardDescription className="text-lg font-light text-foreground/50 mt-2">
                    Partner with us to showcase the best of Vanua Levu to the world.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-10 pt-4">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Business Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                <Input
                                    required
                                    placeholder="e.g. Blue Lagoon Adventures"
                                    className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary/50 transition-all"
                                    value={formData.businessName}
                                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                <Input
                                    required
                                    placeholder="e.g. Savusavu, Vanua Levu"
                                    className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary/50 transition-all"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Operator Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                <Input
                                    required
                                    type="email"
                                    placeholder="your@email.com"
                                    className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary/50 transition-all font-mono text-sm"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                <Input
                                    required
                                    placeholder="+679 ..."
                                    className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary/50 transition-all"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">About Your Service</label>
                        <div className="relative">
                            <Info className="absolute left-4 top-4 w-4 h-4 text-foreground/30" />
                            <Textarea
                                required
                                placeholder="Tell us about the experiences you offer..."
                                className="bg-white/5 border-white/10 min-h-[120px] pl-12 pt-4 rounded-3xl focus:border-primary/50 transition-all resize-none italic font-light"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-6">
                            <Tag className="w-4 h-4" /> Primary Experience
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                required
                                placeholder="Activity Name (e.g. Jungle Hike)"
                                className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-primary/50 transition-all"
                                value={formData.primaryActivity}
                                onChange={e => setFormData({ ...formData, primaryActivity: e.target.value })}
                            />
                            <Input
                                required
                                type="number"
                                placeholder="Price per Pax (FJD)"
                                className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-primary/50 transition-all"
                                value={formData.basePrice}
                                onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        disabled={loading}
                        className="w-full btn-forest h-16 rounded-[2rem] text-lg font-bold shadow-2xl hover:scale-[1.02] transition-all active:scale-95 mt-4"
                    >
                        {loading ? 'Submitting Application...' : 'Submit Partnership Application'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
