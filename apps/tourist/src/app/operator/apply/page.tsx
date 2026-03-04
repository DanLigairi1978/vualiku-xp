'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Shield, CheckCircle, Loader2, MapPin, Building2, Phone, Mail,
    FileText, Globe, Users, Leaf
} from 'lucide-react';

const ACTIVITY_CATEGORIES = [
    'Water & Marine',
    'Land & Trekking',
    'Cultural & Heritage',
    'Stay & Overnight',
    'Food & Dining',
    'Wildlife & Nature',
    'Wellness & Spa',
    'Other',
];

const REGIONS = [
    'Labasa',
    'Savusavu',
    'Taveuni',
    'Bua',
    'Macuata',
    'Cakaudrove',
    'Other Vanua Levu',
    'Western Division',
    'Central Division',
];

export default function OperatorApplyPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [businessName, setBusinessName] = useState('');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [region, setRegion] = useState('');
    const [website, setWebsite] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [activities, setActivities] = useState('');
    const [teamSize, setTeamSize] = useState('');
    const [certifications, setCertifications] = useState('');
    const [whyJoin, setWhyJoin] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!businessName || !contactName || !email || !region || !category || !description) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);

        try {
            const normalizedEmail = email.trim().toLowerCase();

            await setDoc(doc(firestore!, 'operatorApplications', normalizedEmail), {
                businessName: businessName.trim(),
                contactName: contactName.trim(),
                email: normalizedEmail,
                phone: phone.trim(),
                region,
                website: website.trim(),
                category,
                description: description.trim(),
                activities: activities.trim(),
                teamSize: teamSize.trim(),
                certifications: certifications.trim(),
                whyJoin: whyJoin.trim(),
                status: 'pending', // pending | approved | rejected
                submittedAt: serverTimestamp(),
                reviewedAt: null,
                reviewedBy: null,
                notes: '',
            });

            setSubmitted(true);

            // Trigger notification email to admin
            try {
                await fetch('/api/email/send-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'operator-application',
                        businessName,
                        contactName,
                        email,
                    }),
                });
            } catch {
                // Non-critical — application is already saved
            }
        } catch (error) {
            console.error('Application submission failed:', error);
            toast({
                title: 'Submission Failed',
                description: 'Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background text-white pt-32 pb-24 relative overflow-hidden">
                <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />
                <div className="container relative z-10 mx-auto px-6 max-w-lg text-center">
                    <div className="forest-card p-12 space-y-6">
                        <div className="h-20 w-20 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold font-tahoma">Vinaka Vakalevu!</h1>
                        <p className="text-foreground/60 leading-relaxed">
                            Your operator application has been submitted successfully. Our team will review it within
                            <span className="text-primary font-bold"> 48 hours</span> and contact you via email.
                        </p>
                        <p className="text-sm text-foreground/40">
                            Application Reference: <span className="text-primary font-mono">{businessName.replace(/\s+/g, '-').toLowerCase()}</span>
                        </p>
                        <Button onClick={() => window.location.href = '/'} className="btn-forest w-full h-14 text-lg mt-6">
                            Return Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white pt-32 pb-24 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="container relative z-10 mx-auto px-6 max-w-3xl">
                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <div className="flex items-center justify-center gap-3 text-primary/60">
                        <span className="h-[1px] w-8 bg-primary/30" />
                        <span className="text-[12px] font-bold tracking-[0.4em] uppercase">Partner With Us</span>
                        <span className="h-[1px] w-8 bg-primary/30" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-tahoma">
                        Become a <span className="text-primary">Vualiku XP</span> Operator
                    </h1>
                    <p className="text-foreground/50 text-lg font-light max-w-xl mx-auto">
                        Join our network of eco-tourism operators and connect with visitors looking for authentic Fijian experiences.
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    {[
                        { icon: Globe, title: 'Global Reach', desc: 'Get discovered by travellers worldwide' },
                        { icon: Shield, title: 'Secure Payments', desc: 'FJD payments processed safely' },
                        { icon: Leaf, title: 'Eco-Certified', desc: 'Part of a sustainable tourism network' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-2">
                            <Icon className="w-6 h-6 text-primary mx-auto" />
                            <h3 className="font-bold text-sm text-white">{title}</h3>
                            <p className="text-xs text-foreground/40">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* Application Form */}
                <form onSubmit={handleSubmit} className="forest-card space-y-8">
                    <div className="border-b border-white/5 pb-6">
                        <h2 className="text-2xl font-bold font-tahoma text-white flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-primary" /> Application Form
                        </h2>
                        <p className="text-foreground/50 text-sm mt-1">Fields marked with * are required.</p>
                    </div>

                    {/* Business Info */}
                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Business Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-primary font-bold ml-1">Business Name *</Label>
                                <Input
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="e.g. Waisali Nature Experience"
                                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold ml-1">Primary Category *</Label>
                                <Select value={category} onValueChange={setCategory} required>
                                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                                        <SelectValue placeholder="Select category..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-green-950 border-white/10 text-white backdrop-blur-xl">
                                        {ACTIVITY_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat} className="focus:bg-primary font-medium">
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold ml-1">Region *</Label>
                                <Select value={region} onValueChange={setRegion} required>
                                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                                        <SelectValue placeholder="Select region..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-green-950 border-white/10 text-white backdrop-blur-xl">
                                        {REGIONS.map((r) => (
                                            <SelectItem key={r} value={r} className="focus:bg-primary font-medium">
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold ml-1">Website / Social</Label>
                                <Input
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://..."
                                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-primary font-bold ml-1">Business Description *</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell us about your business, what makes it unique, and the experiences you offer..."
                                className="bg-white/5 border-white/10 rounded-xl min-h-[120px]"
                                required
                            />
                        </div>
                    </section>

                    {/* Contact Info */}
                    <section className="space-y-6 pt-6 border-t border-white/5">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Contact Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-primary font-bold ml-1">Contact Person *</Label>
                                <Input
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    placeholder="Your full name"
                                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold ml-1">Email *</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold ml-1">Phone</Label>
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+679 ..."
                                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold ml-1">Team Size</Label>
                                <Input
                                    value={teamSize}
                                    onChange={(e) => setTeamSize(e.target.value)}
                                    placeholder="e.g. 5 guides, 2 boats"
                                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Activities & Qualifications */}
                    <section className="space-y-6 pt-6 border-t border-white/5">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Activities & Qualifications
                        </h3>
                        <div className="space-y-2">
                            <Label className="text-primary font-bold ml-1">Activities You Offer</Label>
                            <Textarea
                                value={activities}
                                onChange={(e) => setActivities(e.target.value)}
                                placeholder="List your main activities (e.g. Guided Trek, River Rafting, Cultural Dinner...)"
                                className="bg-white/5 border-white/10 rounded-xl min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-primary font-bold ml-1">Certifications / Insurance</Label>
                            <Textarea
                                value={certifications}
                                onChange={(e) => setCertifications(e.target.value)}
                                placeholder="List any tourism certifications, insurance, or safety qualifications..."
                                className="bg-white/5 border-white/10 rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-primary font-bold ml-1">Why Join Vualiku XP?</Label>
                            <Textarea
                                value={whyJoin}
                                onChange={(e) => setWhyJoin(e.target.value)}
                                placeholder="Tell us why you'd like to partner with Vualiku XP..."
                                className="bg-white/5 border-white/10 rounded-xl min-h-[80px]"
                            />
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="pt-6 border-t border-white/5">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-14 text-lg font-bold btn-forest shadow-xl"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    <Users className="mr-2 h-5 w-5" /> Submit Application
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-foreground/30 text-center mt-4">
                            Applications are typically reviewed within 48 hours. You&apos;ll receive an email with the outcome.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
