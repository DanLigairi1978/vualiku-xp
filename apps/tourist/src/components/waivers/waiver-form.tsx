'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
    Shield, CheckCircle, Loader2, PenLine, RotateCcw,
    AlertTriangle, Phone, Heart, FileText
} from 'lucide-react';

interface WaiverFormProps {
    bookingId: string;
    participantName?: string;
    participantEmail?: string;
    onComplete?: () => void;
}

export function WaiverForm({ bookingId, participantName = '', participantEmail = '', onComplete }: WaiverFormProps) {
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSigned, setHasSigned] = useState(false);

    // Form state
    const [name, setName] = useState(participantName);
    const [email, setEmail] = useState(participantEmail);
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [medicalConditions, setMedicalConditions] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [waiverEnabled, setWaiverEnabled] = useState<boolean | null>(null);

    // Check if waivers are enabled
    useEffect(() => {
        fetch('/api/waivers/sign')
            .then((r) => r.json())
            .then((data) => setWaiverEnabled(data.enabled))
            .catch(() => setWaiverEnabled(false));
    }, []);

    // Set up canvas for signature
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#22c55e';
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSigned(true);
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSigned(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !hasSigned || !agreedToTerms) {
            toast({
                title: 'Missing Info',
                description: 'Please fill in all required fields, sign the waiver, and agree to terms.',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);

        try {
            const signatureDataUrl = canvasRef.current?.toDataURL('image/png') || '';

            const res = await fetch('/api/waivers/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    participantName: name,
                    participantEmail: email,
                    signatureDataUrl,
                    agreedToTerms,
                    emergencyContactName: emergencyName,
                    emergencyContactPhone: emergencyPhone,
                    medicalConditions,
                }),
            });

            const data = await res.json();

            if (data.gated) {
                toast({
                    title: 'Waivers Unavailable',
                    description: 'Digital waivers are currently disabled pending legal review.',
                });
                return;
            }

            if (data.success) {
                setSubmitted(true);
                onComplete?.();
            } else {
                throw new Error(data.error || 'Submission failed');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to submit waiver.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Gated state
    if (waiverEnabled === false) {
        return (
            <div className="forest-card p-8 text-center space-y-4 max-w-lg mx-auto">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Digital Waivers Coming Soon</h3>
                <p className="text-foreground/50 text-sm">
                    Digital waivers are currently disabled pending legal review in Fiji. Physical waivers will be provided at check-in.
                </p>
            </div>
        );
    }

    // Loading state
    if (waiverEnabled === null) {
        return (
            <div className="py-12 text-center text-foreground/40">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary/50" />
                Checking waiver availability...
            </div>
        );
    }

    // Success state
    if (submitted) {
        return (
            <div className="forest-card p-8 text-center space-y-4 max-w-lg mx-auto">
                <div className="h-16 w-16 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white font-tahoma">Waiver Signed ✓</h3>
                <p className="text-foreground/50 text-sm">
                    A confirmation copy has been sent to <span className="text-primary">{email}</span>.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="forest-card space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold font-tahoma text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" /> Activity Waiver & Release
                </h3>
                <p className="text-foreground/50 text-xs mt-1">
                    Please complete this waiver before your adventure. All information is kept confidential.
                </p>
            </div>

            {/* Waiver Text */}
            <div className="bg-white/3 border border-white/5 rounded-xl p-4 max-h-48 overflow-y-auto text-xs text-foreground/50 leading-relaxed space-y-2">
                <p><strong className="text-white">ASSUMPTION OF RISK & RELEASE OF LIABILITY</strong></p>
                <p>I acknowledge that participation in eco-tourism activities organized through Vualiku XP involves inherent risks including, but not limited to, physical injury, exposure to natural elements, and encounters with wildlife.</p>
                <p>I voluntarily assume all risks associated with my participation and release Vualiku XP, its operators, guides, and affiliates from any liability for injury, loss, or damage arising from my participation.</p>
                <p>I certify that I am in good physical health and capable of participating in the selected activities. I agree to follow all safety instructions provided by guides and operators.</p>
                <p>I consent to emergency medical treatment if required and understand that I am responsible for any associated costs not covered by my own insurance.</p>
            </div>

            {/* Participant Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-primary font-bold ml-1 text-xs">Full Name *</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full legal name"
                        className="bg-white/5 border-white/10 h-11 rounded-xl text-sm"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-primary font-bold ml-1 text-xs">Email *</Label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="bg-white/5 border-white/10 h-11 rounded-xl text-sm"
                        required
                    />
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="Contact person name"
                        className="bg-white/5 border-white/10 h-11 rounded-xl text-sm"
                    />
                    <Input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+679 ..."
                        className="bg-white/5 border-white/10 h-11 rounded-xl text-sm"
                    />
                </div>
            </div>

            {/* Medical */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5" /> Medical Conditions
                </Label>
                <Textarea
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="List any medical conditions, allergies, or medications (or 'None')"
                    className="bg-white/5 border-white/10 rounded-xl min-h-[70px] text-sm"
                />
            </div>

            {/* Signature Pad */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <PenLine className="w-3.5 h-3.5" /> Signature *
                    </Label>
                    <button type="button" onClick={clearSignature} className="text-xs text-foreground/40 hover:text-white flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                </div>
                <div className="relative rounded-xl border-2 border-dashed border-white/10 bg-white/3 overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-32 cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                    {!hasSigned && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs text-foreground/20 italic">Draw your signature here</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Agreement */}
            <div className="flex items-start gap-3">
                <Checkbox
                    id="agree-terms"
                    checked={agreedToTerms}
                    onCheckedChange={(v) => setAgreedToTerms(v === true)}
                    className="mt-0.5 border-primary/30 data-[state=checked]:bg-primary"
                />
                <label htmlFor="agree-terms" className="text-xs text-foreground/60 leading-relaxed cursor-pointer">
                    I have read and agree to the <span className="text-primary font-bold">Activity Waiver & Release of Liability</span>.
                    I understand the inherent risks and voluntarily assume all responsibility.
                </label>
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={submitting || !hasSigned || !agreedToTerms}
                className="w-full h-13 text-base font-bold btn-forest"
            >
                {submitting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                ) : (
                    <><FileText className="mr-2 h-5 w-5" /> Sign Waiver</>
                )}
            </Button>
        </form>
    );
}
