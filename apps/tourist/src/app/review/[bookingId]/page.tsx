'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { StarRating } from '@/components/ui/star-rating';
import { Send, Loader2, CheckCircle, Camera, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const bookingId = params.bookingId as string;

    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 5));
        }
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // TODO: Upload photos to Firebase Storage and get URLs
            // const photoUrls = await Promise.all(photos.map(uploadPhoto));

            await addDoc(collection(firestore!, 'reviews'), {
                bookingId,
                rating,
                title: title.trim(),
                text: text.trim(),
                reviewerName: name.trim() || 'Anonymous',
                photoUrls: [], // TODO: Replace with actual uploaded URLs
                status: 'pending', // Pending operator moderation
                createdAt: serverTimestamp(),
            });

            setIsSubmitted(true);
        } catch (err) {
            console.error('[review] Error submitting review:', err);
            setError('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success State
    if (isSubmitted) {
        return (
            <div className="bg-background min-h-screen text-white pt-32 pb-24 px-6 relative overflow-hidden">
                <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />
                <div className="container relative z-10 mx-auto max-w-2xl">
                    <div className="text-center p-12 bg-white/5 border border-primary/30 rounded-3xl backdrop-blur-md shadow-2xl space-y-8 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                            <CheckCircle className="w-14 h-14 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold font-tahoma">
                            Vinaka <span className="text-primary">Vakalevu!</span>
                        </h1>
                        <p className="text-foreground/60 text-lg">
                            Your review has been submitted and will appear after moderation.
                            Your feedback helps the local community thrive!
                        </p>
                        <Button
                            onClick={() => router.push('/directory')}
                            className="btn-forest h-14 px-8 text-lg"
                        >
                            Explore More Adventures
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen text-white pt-32 pb-24 px-6 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-2xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 text-primary/60">
                        <span className="h-[1px] w-8 bg-primary/30" />
                        <span className="text-[12px] font-bold tracking-[0.4em] uppercase">Leave a Review</span>
                        <span className="h-[1px] w-8 bg-primary/30" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-tahoma text-shadow-lg">
                        How Was Your <span className="text-primary">Adventure?</span>
                    </h1>
                    <p className="text-foreground/50 text-lg font-light">
                        Your honest feedback helps local operators improve and guides other travellers.
                    </p>
                </div>

                {/* Review Form */}
                <form
                    onSubmit={handleSubmit}
                    className="forest-card space-y-8"
                >
                    {/* Star Rating */}
                    <div className="text-center space-y-4">
                        <label className="block text-sm font-bold text-primary uppercase tracking-widest">
                            Overall Rating *
                        </label>
                        <div className="flex justify-center">
                            <StarRating value={rating} onChange={setRating} size="lg" showLabel />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary ml-1">Your Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Anonymous"
                            className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30"
                        />
                    </div>

                    {/* Review Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary ml-1">Review Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Summarize your experience in a few words..."
                            className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30"
                        />
                    </div>

                    {/* Review Text */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary ml-1">Your Experience *</label>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                            placeholder="Tell us about your adventure — what stood out, what you loved, any tips for future travellers..."
                            className="bg-white/5 border-white/10 min-h-[160px] rounded-xl text-white placeholder:text-white/30 resize-none"
                        />
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-primary ml-1">Add Photos (up to 5)</label>
                        <div className="flex flex-wrap gap-3">
                            {photos.map((photo, index) => (
                                <div
                                    key={index}
                                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={URL.createObjectURL(photo)}
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(index)}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {photos.length < 5 && (
                                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/40 transition-colors">
                                    <Camera className="w-5 h-5 text-white/30" />
                                    <span className="text-[10px] text-white/30 font-bold">ADD</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoAdd}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="w-full btn-forest h-14 text-lg font-bold shadow-xl disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2" /> Submit Review
                            </>
                        )}
                    </Button>

                    <p className="text-center text-xs text-foreground/30">
                        Booking ID: {bookingId} · Reviews are moderated before publishing
                    </p>
                </form>
            </div>
        </div>
    );
}
