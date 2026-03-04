'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Droplets, Info } from 'lucide-react';
import { WeatherData } from '@/lib/weather';

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/weather')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setWeather(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="animate-pulse flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-white/10 rounded-full" />
            <div className="space-y-2">
                <div className="w-20 h-3 bg-white/10 rounded" />
                <div className="w-12 h-2 bg-white/10 rounded" />
            </div>
        </div>
    );

    if (!weather) return null;

    const Icon = weather.isRainy ? CloudRain : (weather.temp > 28 ? Sun : Cloud);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">Labasa/Vanua Levu</p>
                    <p className="text-lg font-bold font-tahoma">{weather.temp}°C — {weather.condition}</p>
                </div>
            </div>
            <div className="hidden md:flex flex-col text-right">
                <div className="flex items-center gap-1.5 text-[10px] text-foreground/40 font-bold uppercase">
                    <Droplets className="w-3 h-3" /> Humidity {weather.humidity}%
                </div>
                <div className="text-[10px] text-primary/60 font-bold uppercase mt-0.5">
                    Real-time Forecast
                </div>
            </div>
        </div>
    );
}

export function CulturalAlert({ date }: { date: string }) {
    const [event, setEvent] = useState<any>(null);

    useEffect(() => {
        // Dynamically import to avoid server-side issues if any
        import('@/lib/cultural-events').then(m => {
            setEvent(m.getCulturalEvent(date));
        });
    }, [date]);

    if (!event) return null;

    return (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-amber-500 font-bold text-sm uppercase tracking-wider">{event.name} ({event.type})</p>
                <p className="text-xs text-foreground/60 mt-0.5 leading-relaxed">{event.description}</p>
            </div>
        </div>
    );
}
