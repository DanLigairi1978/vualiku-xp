'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { usePackages, Package } from '@/lib/hooks/usePackages';
import { useOperators } from '@/lib/hooks/useOperators';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@vualiku/shared';
import { Upload, X, Plus, ChevronLeft, ChevronRight, Check, Loader2, Package as PackageIcon, MapPin, Settings2, Eye } from 'lucide-react';

interface PackageFormProps {
    initialData?: Partial<Package>;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CATEGORY_OPTIONS = ['Eco', 'Adventure', 'Cultural', 'Water', 'Trekking', 'Overnight', 'Family', 'Luxury'];
const DIFFICULTY_OPTIONS: Package['difficulty'][] = ['Easy', 'Moderate', 'Challenging'];

export function PackageForm({ initialData, onSuccess, onCancel }: PackageFormProps) {
    const { addPackage, editPackage } = usePackages();
    const { operators } = useOperators();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        shortDescription: initialData?.shortDescription || '',
        longDescription: initialData?.longDescription || '',
        pricePerHead: initialData?.pricePerHead?.toString() || '',
        duration: initialData?.duration || '',
        maxGroupSize: initialData?.maxGroupSize?.toString() || '12',
        difficulty: initialData?.difficulty || 'Moderate' as Package['difficulty'],
        operatorId: initialData?.operatorId || '',
        operatorName: initialData?.operatorName || '',
        location: initialData?.location || '',
        status: initialData?.status || 'active' as Package['status'],
        seoTitle: initialData?.seoTitle || '',
        seoDescription: initialData?.seoDescription || '',
    });

    const [includedItems, setIncludedItems] = useState<string[]>(initialData?.includedItems || ['']);
    const [whatToBring, setWhatToBring] = useState<string[]>(initialData?.whatToBring || ['']);
    const [categoryTags, setCategoryTags] = useState<string[]>(initialData?.categoryTags || []);
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(initialData?.heroImageUrl || null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.galleryImageUrls || []);
    const [imageError, setImageError] = useState('');

    const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageError('');
        if (!file) return;
        if (file.type !== 'image/jpeg') { setImageError('Only JPG images are accepted'); return; }
        if (file.size > 2 * 1024 * 1024) { setImageError('Image must be under 2MB'); return; }
        setHeroImage(file);
        setHeroPreview(URL.createObjectURL(file));
    };

    const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'image/jpeg') { setImageError('Only JPG images are accepted'); return; }
        if (file.size > 2 * 1024 * 1024) { setImageError('Image must be under 2MB'); return; }
        if (galleryFiles.length + galleryPreviews.length >= 5) { setImageError('Maximum 5 gallery images'); return; }
        setImageError('');
        setGalleryFiles(prev => [...prev, file]);
        setGalleryPreviews(prev => [...prev, URL.createObjectURL(file)]);
    };

    const removeGalleryImage = (index: number) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleCategory = (cat: string) => {
        setCategoryTags(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    };

    const handleOperatorChange = (opId: string) => {
        const op = operators.find(o => o.id === opId);
        setFormData({ ...formData, operatorId: opId, operatorName: op?.name || '' });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            let heroImageUrl = initialData?.heroImageUrl || '';
            let galleryImageUrls = initialData?.galleryImageUrls || [];

            const packageData = {
                name: formData.name,
                shortDescription: formData.shortDescription,
                longDescription: formData.longDescription,
                pricePerHead: parseFloat(formData.pricePerHead) || 0,
                duration: formData.duration,
                maxGroupSize: parseInt(formData.maxGroupSize) || 12,
                difficulty: formData.difficulty,
                operatorId: formData.operatorId,
                operatorName: formData.operatorName,
                location: formData.location,
                status: formData.status,
                seoTitle: formData.seoTitle || formData.name,
                seoDescription: formData.seoDescription || formData.shortDescription,
                includedItems: includedItems.filter(i => i.trim()),
                whatToBring: whatToBring.filter(i => i.trim()),
                categoryTags,
                heroImageUrl,
                galleryImageUrls,
            };

            let packageId = initialData?.id;

            if (packageId) {
                await editPackage(packageId, packageData);
            } else {
                const docRef = await addPackage(packageData);
                packageId = docRef.id;
            }

            // Upload hero image
            if (heroImage && packageId) {
                const imageRef = ref(storage, `packages/${packageId}/hero.jpg`);
                await uploadBytes(imageRef, heroImage);
                const downloadUrl = await getDownloadURL(imageRef);
                await editPackage(packageId, { heroImageUrl: downloadUrl });
            }

            // Upload gallery images
            if (galleryFiles.length > 0 && packageId) {
                const uploadedUrls: string[] = [...(initialData?.galleryImageUrls || [])];
                for (let i = 0; i < galleryFiles.length; i++) {
                    const gRef = ref(storage, `packages/${packageId}/gallery_${Date.now()}_${i}.jpg`);
                    await uploadBytes(gRef, galleryFiles[i]);
                    const url = await getDownloadURL(gRef);
                    uploadedUrls.push(url);
                }
                await editPackage(packageId, { galleryImageUrls: uploadedUrls });
            }

            onSuccess?.();
        } catch (err: any) {
            console.error('Package submit error:', err);
            setError(err.message || 'Failed to save package');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const steps = [
        { id: 1, title: 'Details', icon: PackageIcon },
        { id: 2, title: 'Media', icon: Upload },
        { id: 3, title: 'Operations', icon: Settings2 },
        { id: 4, title: 'Review', icon: Eye },
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

            {/* Step 1: Details */}
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Package Name</Label>
                        <Input placeholder="e.g. 3-Day Rainforest Expedition" className="bg-slate-950 border-slate-800 h-12 focus:border-primary/50"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Short Description (card text)</Label>
                        <Input placeholder="Shown on package cards..." className="bg-slate-950 border-slate-800 h-12 focus:border-primary/50"
                            value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Long Description</Label>
                        <textarea placeholder="Full package details shown on detail page..."
                            className="w-full min-h-[120px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary/50"
                            value={formData.longDescription} onChange={e => setFormData({ ...formData, longDescription: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Per Head (FJD)</Label>
                            <Input type="number" placeholder="0.00" className="bg-slate-950 border-slate-800 h-12"
                                value={formData.pricePerHead} onChange={e => setFormData({ ...formData, pricePerHead: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</Label>
                            <Input placeholder="e.g. 3 Days / 2 Nights" className="bg-slate-950 border-slate-800 h-12"
                                value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Group Size</Label>
                            <Input type="number" placeholder="12" className="bg-slate-950 border-slate-800 h-12"
                                value={formData.maxGroupSize} onChange={e => setFormData({ ...formData, maxGroupSize: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty</Label>
                            <div className="flex gap-2">
                                {DIFFICULTY_OPTIONS.map(d => (
                                    <button key={d} onClick={() => setFormData({ ...formData, difficulty: d })}
                                        className={cn("flex-1 py-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                                            formData.difficulty === d ? "bg-primary border-primary text-slate-950" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                                        )}>{d}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Media */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hero Image / Cover Photo</Label>
                            {imageError && <span className="text-[10px] text-red-500 font-bold uppercase">{imageError}</span>}
                        </div>
                        {!heroPreview ? (
                            <Label htmlFor="pkg-hero" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer border-slate-800 hover:border-primary/50 bg-slate-950/50 hover:bg-slate-900 transition-all">
                                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Click to upload JPG</p>
                                <p className="text-[10px] text-slate-600 mt-1">MAX 2MB</p>
                                <input id="pkg-hero" type="file" accept="image/jpeg" className="hidden" onChange={handleHeroChange} />
                            </Label>
                        ) : (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 group bg-slate-950">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={heroPreview} alt="Hero Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Label htmlFor="pkg-hero-change" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer border border-slate-700">Change</Label>
                                    <input id="pkg-hero-change" type="file" accept="image/jpeg" className="hidden" onChange={handleHeroChange} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gallery Images (up to 5)</Label>
                        <div className="grid grid-cols-5 gap-3">
                            {galleryPreviews.map((url, i) => (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                                    <button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}
                            {galleryPreviews.length < 5 && (
                                <Label htmlFor="pkg-gallery" className="aspect-square rounded-lg border-2 border-dashed border-slate-800 hover:border-primary/50 flex items-center justify-center cursor-pointer bg-slate-950/50 hover:bg-slate-900 transition-all">
                                    <Plus className="w-6 h-6 text-slate-500" />
                                    <input id="pkg-gallery" type="file" accept="image/jpeg" className="hidden" onChange={handleGalleryAdd} />
                                </Label>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Operations */}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operator</Label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-primary/50"
                            value={formData.operatorId} onChange={e => handleOperatorChange(e.target.value)}>
                            <option value="">Select operator...</option>
                            {operators.filter(o => o.status === 'active').map(op => (
                                <option key={op.id} value={op.id}>{op.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location / Meeting Point</Label>
                        <Input placeholder="e.g. Drawa Village, Vanua Levu" className="bg-slate-950 border-slate-800 h-12"
                            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_OPTIONS.map(cat => (
                                <button key={cat} onClick={() => toggleCategory(cat)}
                                    className={cn("px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all",
                                        categoryTags.includes(cat) ? "bg-primary border-primary text-slate-950" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                                    )}>{cat}</button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">What&apos;s Included</Label>
                        {includedItems.map((item, i) => (
                            <div key={i} className="flex gap-2">
                                <Input placeholder="e.g. Lunch, Guide, Gear" className="bg-slate-950 border-slate-800 h-10"
                                    value={item} onChange={e => { const arr = [...includedItems]; arr[i] = e.target.value; setIncludedItems(arr); }} />
                                {i === includedItems.length - 1 && (
                                    <Button variant="outline" size="sm" className="h-10 border-slate-800" onClick={() => setIncludedItems([...includedItems, ''])}><Plus className="w-4 h-4" /></Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">What to Bring</Label>
                        {whatToBring.map((item, i) => (
                            <div key={i} className="flex gap-2">
                                <Input placeholder="e.g. Sunscreen, Water bottle" className="bg-slate-950 border-slate-800 h-10"
                                    value={item} onChange={e => { const arr = [...whatToBring]; arr[i] = e.target.value; setWhatToBring(arr); }} />
                                {i === whatToBring.length - 1 && (
                                    <Button variant="outline" size="sm" className="h-10 border-slate-800" onClick={() => setWhatToBring([...whatToBring, ''])}><Plus className="w-4 h-4" /></Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</Label>
                        <div className="flex gap-2">
                            {(['active', 'inactive', 'featured'] as const).map(s => (
                                <button key={s} onClick={() => setFormData({ ...formData, status: s })}
                                    className={cn("flex-1 py-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                                        formData.status === s
                                            ? s === 'featured' ? "bg-yellow-500 border-yellow-500 text-slate-950" : "bg-primary border-primary text-slate-950"
                                            : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                                    )}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">SEO Title</Label>
                            <Input placeholder="Custom page title..." className="bg-slate-950 border-slate-800 h-10"
                                value={formData.seoTitle} onChange={e => setFormData({ ...formData, seoTitle: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">SEO Description</Label>
                            <Input placeholder="Custom meta description..." className="bg-slate-950 border-slate-800 h-10"
                                value={formData.seoDescription} onChange={e => setFormData({ ...formData, seoDescription: e.target.value })} />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-dashed border-slate-800 space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Eye className="w-4 h-4" /> Final Review</p>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div className="space-y-1"><span className="text-[10px] text-slate-600 font-bold uppercase">Package</span><p className="text-white font-medium">{formData.name || 'Not set'}</p></div>
                            <div className="space-y-1"><span className="text-[10px] text-slate-600 font-bold uppercase">Price</span><p className="text-white font-medium">${formData.pricePerHead || '0'} FJD / head</p></div>
                            <div className="space-y-1"><span className="text-[10px] text-slate-600 font-bold uppercase">Duration</span><p className="text-white font-medium">{formData.duration || 'Not set'}</p></div>
                            <div className="space-y-1"><span className="text-[10px] text-slate-600 font-bold uppercase">Difficulty</span><p className="text-white font-medium">{formData.difficulty}</p></div>
                            <div className="space-y-1"><span className="text-[10px] text-slate-600 font-bold uppercase">Operator</span><p className="text-white font-medium">{formData.operatorName || 'Not selected'}</p></div>
                            <div className="space-y-1"><span className="text-[10px] text-slate-600 font-bold uppercase">Status</span><p className="text-white font-medium capitalize">{formData.status}</p></div>
                            <div className="space-y-1"><span className="text-[10px] text-slate-600 font-bold uppercase">Max Group</span><p className="text-white font-medium">{formData.maxGroupSize} guests</p></div>
                            <div className="space-y-1"><span className="text-[10px] text-slate-600 font-bold uppercase">Categories</span><p className="text-white font-medium">{categoryTags.join(', ') || 'None'}</p></div>
                        </div>
                        {heroPreview && (
                            <div className="mt-4">
                                <span className="text-[10px] text-slate-600 font-bold uppercase block mb-2">Hero Image</span>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={heroPreview} alt="Hero" className="w-full max-h-40 object-cover rounded-lg border border-slate-800" />
                            </div>
                        )}
                    </div>
                    {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl">{error}</div>}
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
                {step > 1 && (
                    <Button variant="outline" onClick={prevStep} className="flex-1 h-14 bg-slate-900 border-slate-800 text-slate-400 hover:text-white">
                        <ChevronLeft className="w-4 h-4 mr-2" /> PREVIOUS
                    </Button>
                )}
                {onCancel && step === 1 && (
                    <Button variant="outline" onClick={onCancel} className="flex-1 h-14 bg-slate-900 border-slate-800 text-slate-400 hover:text-white">CANCEL</Button>
                )}
                <Button onClick={step === 4 ? handleSubmit : nextStep} disabled={isSubmitting}
                    className={cn("h-14 font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all",
                        step === 4 ? "flex-1 bg-green-500 text-slate-950 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "flex-1 bg-primary text-slate-950 hover:bg-primary/90"
                    )}>
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> SAVING...</> : step === 4 ? 'PUBLISH PACKAGE' : <>CONTINUE <ChevronRight className="w-4 h-4 ml-2" /></>}
                </Button>
            </div>
        </div>
    );
}
