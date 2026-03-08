'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Info, MapPin, CreditCard, ChevronRight, ChevronLeft, Check, Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOperators, Operator } from '@/lib/hooks/useOperators';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@vualiku/shared';

interface OnboardingFormProps {
    initialData?: Partial<Operator>;
    onSuccess?: () => void;
}

export function OperatorOnboarding({ initialData, onSuccess }: OnboardingFormProps) {
    const { addOperator, editOperator } = useOperators();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        category: initialData?.category || 'Eco-Tourism',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        location: initialData?.location || '',
        pricingType: initialData?.pricingType || 'per_head',
        basePrice: initialData?.basePrice?.toString() || '',
        capacity: initialData?.capacity?.toString() || ''
    });
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(initialData?.heroImageUrl || null);
    const [imageError, setImageError] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageError('');

        if (!file) {
            setHeroImage(null);
            setHeroImagePreview(initialData?.heroImageUrl || null);
            return;
        }

        if (file.type !== 'image/jpeg') {
            setImageError('Only JPG images are accepted');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setImageError('Image must be less than 2MB');
            return;
        }

        setHeroImage(file);
        setHeroImagePreview(URL.createObjectURL(file));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        console.log("handleSubmit fired", formData);
        setIsSubmitting(true);
        try {
            let heroImageUrl = initialData?.heroImageUrl || '';

            const dataToSave = {
                ...formData,
                basePrice: parseFloat(formData.basePrice),
                capacity: parseInt(formData.capacity),
                status: (initialData?.status || 'active') as 'active' | 'inactive' | 'pending',
                heroImageUrl,
            };

            let operatorId = initialData?.id;

            if (operatorId) {
                await editOperator(operatorId, dataToSave);
            } else {
                const newDocRef = await addOperator(dataToSave);
                operatorId = newDocRef.id;
            }

            if (heroImage && operatorId) {
                const imageRef = ref(storage, `operators/${operatorId}/hero.jpg`);
                await uploadBytes(imageRef, heroImage);
                const downloadUrl = await getDownloadURL(imageRef);
                await editOperator(operatorId, { heroImageUrl: downloadUrl });
            }

            onSuccess?.();
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, title: 'Identity', icon: ShieldCheck },
        { id: 2, title: 'Contact', icon: MapPin },
        { id: 3, title: 'Operations', icon: CreditCard },
        { id: 4, title: 'Review', icon: Check },
    ];

    return (
        <div className="space-y-8 p-1">
            {/* Progress Bar */}
            <div className="flex justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-800 -translate-y-1/2 z-0" />
                {steps.map((s) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                            step >= s.id ? "bg-primary border-primary text-slate-950 scale-110 shadow-[0_0_15px_rgba(154,205,50,0.3)]" : "bg-slate-950 border-slate-800 text-slate-500"
                        )}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            step >= s.id ? "text-primary" : "text-slate-600"
                        )}>{s.title}</span>
                    </div>
                ))}
            </div>

            <Separator className="bg-slate-800/50" />

            {/* Form Content */}
            <div className="min-h-[350px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Name</Label>
                            <Input
                                placeholder="e.g. Drawa Eco Retreat"
                                className="bg-slate-950 border-slate-800 h-12 focus:border-primary/50"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hero Image / Cover Photo</Label>
                                {imageError && <span className="text-[10px] text-red-500 font-bold uppercase">{imageError}</span>}
                            </div>

                            {!heroImagePreview ? (
                                <Label
                                    htmlFor="hero-image"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer border-slate-800 hover:border-primary/50 bg-slate-950/50 hover:bg-slate-900 transition-all"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                                        <Upload className="w-6 h-6 mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Click to upload JPG</p>
                                        <p className="text-[10px] text-slate-600 mt-1">MAX 2MB FILE SIZE</p>
                                    </div>
                                    <input
                                        id="hero-image"
                                        type="file"
                                        accept="image/jpeg"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </Label>
                            ) : (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 group bg-slate-950">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={heroImagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Label
                                            htmlFor="hero-image-change"
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase rounded-lg cursor-pointer transition-colors border border-slate-700"
                                        >
                                            Change Image
                                        </Label>
                                        <input
                                            id="hero-image-change"
                                            type="file"
                                            accept="image/jpeg"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service Description</Label>
                            <textarea
                                placeholder="Describe the tour experience..."
                                className="w-full min-h-[120px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-full">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Email</Label>
                            <Input
                                type="email"
                                placeholder="ops@operator.com"
                                className="bg-slate-950 border-slate-800 h-12"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</Label>
                            <Input
                                placeholder="+679 ..."
                                className="bg-slate-950 border-slate-800 h-12"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Office Location</Label>
                            <Input
                                placeholder="Town / Region"
                                className="bg-slate-950 border-slate-800 h-12"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center block">Pricing Model</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setFormData({ ...formData, pricingType: 'per_head' })}
                                        className={cn(
                                            "py-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                                            formData.pricingType === 'per_head' ? "bg-primary border-primary text-slate-950" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                                        )}
                                    >Per Head</button>
                                    <button
                                        onClick={() => setFormData({ ...formData, pricingType: 'per_night' })}
                                        className={cn(
                                            "py-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                                            formData.pricingType === 'per_night' ? "bg-primary border-primary text-slate-950" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                                        )}
                                    >Per Night</button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Rate (FJD)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="bg-slate-950 border-slate-800 h-12"
                                    value={formData.basePrice}
                                    onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Capacity</Label>
                                <Input
                                    type="number"
                                    placeholder="12"
                                    className="bg-slate-950 border-slate-800 h-12"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 bg-slate-950/50 p-6 rounded-2xl border border-dashed border-slate-800">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <Info className="w-5 h-5" />
                            <p className="text-xs font-bold uppercase tracking-widest">Final Review Required</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-600 font-bold uppercase">Name</span>
                                <p className="text-white font-medium">{formData.name || 'Not provided'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-600 font-bold uppercase">Contact</span>
                                <p className="text-white font-medium">{formData.email || 'No email'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-600 font-bold uppercase">Pricing</span>
                                <p className="text-white font-medium">${formData.basePrice || '0'} / {formData.pricingType.replace('_', ' ')}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-600 font-bold uppercase">Capacity</span>
                                <p className="text-white font-medium">{formData.capacity || '0'} guests</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
                {step > 1 && (
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1 h-14 bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> PREVIOUS
                    </Button>
                )}
                <Button
                    onClick={step === 4 ? handleSubmit : nextStep}
                    className={cn(
                        "h-14 font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all",
                        step === 4 ? "flex-1 bg-green-500 text-slate-950 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "flex-1 bg-primary text-slate-950 hover:bg-primary/90"
                    )}
                >
                    {step === 4 ? 'AUTHORISE OPERATOR' : 'CONTINUE PROTOCOL'}
                    {step < 4 && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
            </div>
        </div>
    );
}
