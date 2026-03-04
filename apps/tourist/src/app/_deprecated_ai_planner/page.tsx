'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';

interface ItineraryDay {
    day: number;
    title: string;
    activities: {
        time: string;
        description: string;
        location?: string;
    }[];
    tips?: string;
}

interface ItineraryResponse {
    title: string;
    summary: string;
    days: ItineraryDay[];
}

export default function PlannerPage() {
    const [loading, setLoading] = useState(false);
    const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setItinerary(null);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            interests: formData.get('interests'),
            duration: Number(formData.get('duration')),
            partySize: Number(formData.get('partySize')),
        };

        try {
            const res = await fetch('/api/genkit/itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok || result.error) {
                throw new Error(result.error || 'The AI Travel Assistant encountered a turbulence. Please try again.');
            }

            // Validate the result shape
            if (!result.days || !Array.isArray(result.days)) {
                throw new Error("Received an unexpected travel map format. Let's re-generate.");
            }

            setItinerary(result);
        } catch (err: any) {
            console.error('Failed to fetch itinerary', err);
            setError(err.message || 'Failed to generate itinerary');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen text-white pt-32 pb-24 px-6 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-4xl space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">AI Itinerary <span className="text-primary italic">Planner</span></h1>
                    <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
                        Tell our AI travel assistant what you're looking for, and we'll craft the perfect eco-tourism adventure across Vanua Levu tailored just for you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/5 border border-primary/20 rounded-2xl p-8 backdrop-blur-md space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-primary/80 uppercase tracking-wider">Duration (Days)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-current opacity-50 h-5 w-5" />
                                <Input name="duration" type="number" min="1" max="14" defaultValue="3" required className="pl-10 h-12 bg-black/40 border-primary/20" />
                            </div>
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-primary/80 uppercase tracking-wider">Party Size</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-current opacity-50 h-5 w-5" />
                                <Input name="partySize" type="number" min="1" max="50" defaultValue="2" required className="pl-10 h-12 bg-black/40 border-primary/20" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary/80 uppercase tracking-wider">Your Interests</label>
                        <Textarea
                            name="interests"
                            placeholder="e.g. Hiking, bird watching, authentic village culture, waterfalls, beach relaxation..."
                            required
                            rows={4}
                            className="bg-black/40 border-primary/20 resize-none"
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-14 btn-forest text-lg">
                        {loading ? <><Loader2 className="animate-spin mr-2" /> Generating Itinerary...</> : 'Generate Magic'}
                    </Button>
                </form>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-100 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <h3 className="font-bold text-red-400">Generation Failed</h3>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {itinerary && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="border-l-4 border-primary pl-6">
                            <h2 className="text-3xl font-bold">{itinerary.title}</h2>
                            <p className="text-foreground/70 mt-2">{itinerary.summary}</p>
                        </div>

                        <div className="space-y-8">
                            {itinerary.days.map((day) => (
                                <div key={day.day} className="bg-white/5 border border-white/10 rounded-xl p-6 relative">
                                    <div className="absolute -left-3 -top-3 h-10 w-10 bg-primary text-black font-bold flex items-center justify-center rounded-xl shadow-lg ring-4 ring-background">
                                        D{day.day}
                                    </div>

                                    <h3 className="text-xl font-bold mb-6 pl-4 text-primary">{day.title}</h3>

                                    <div className="space-y-6">
                                        {day.activities.map((act, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="text-sm font-bold text-white/50 w-20 shrink-0 mt-1">{act.time}</div>
                                                <div className="space-y-1">
                                                    <p className="text-white/90">{act.description}</p>
                                                    {act.location && (
                                                        <div className="flex items-center text-xs text-primary/80">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {act.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {day.tips && (
                                        <div className="mt-6 pt-4 border-t border-white/5 text-sm text-foreground/50 italic">
                                            Tip: {day.tips}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
