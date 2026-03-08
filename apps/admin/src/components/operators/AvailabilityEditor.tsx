'use client';

import { useState } from 'react';
import { useOperators, Operator } from '@/lib/hooks/useOperators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { CalendarOff, Clock, Users, Bell, Save, Loader2, Trash2, Plus } from 'lucide-react';

interface AvailabilityEditorProps {
    operator: Operator;
    onSaved?: () => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AvailabilityEditor({ operator, onSaved }: AvailabilityEditorProps) {
    const { editOperator } = useOperators();
    const [saving, setSaving] = useState(false);

    // Local state
    const [operatingDays, setOperatingDays] = useState<number[]>(operator.operatingDays || [1, 2, 3, 4, 5, 6]); // Default: Mon–Sat
    const [openTime, setOpenTime] = useState(operator.operatingHoursOpen || '08:00');
    const [closeTime, setCloseTime] = useState(operator.operatingHoursClose || '17:00');
    const [minGroup, setMinGroup] = useState(operator.minGroupSize?.toString() || '1');
    const [maxGroup, setMaxGroup] = useState(operator.maxGroupSize?.toString() || '50');
    const [advanceHours, setAdvanceHours] = useState(operator.advanceNoticeHours?.toString() || '24');
    const [blackoutDates, setBlackoutDates] = useState<string[]>(operator.blackoutDates || []);
    const [newBlackoutDate, setNewBlackoutDate] = useState('');

    const toggleDay = (day: number) => {
        setOperatingDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
        );
    };

    const addBlackoutDate = () => {
        if (newBlackoutDate && !blackoutDates.includes(newBlackoutDate)) {
            setBlackoutDates(prev => [...prev, newBlackoutDate].sort());
            setNewBlackoutDate('');
        }
    };

    const removeBlackoutDate = (date: string) => {
        setBlackoutDates(prev => prev.filter(d => d !== date));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await editOperator(operator.id, {
                operatingDays,
                operatingHoursOpen: openTime,
                operatingHoursClose: closeTime,
                minGroupSize: parseInt(minGroup) || 1,
                maxGroupSize: parseInt(maxGroup) || 50,
                advanceNoticeHours: parseInt(advanceHours) || 24,
                blackoutDates,
            });
            onSaved?.();
        } catch (err) {
            console.error('Failed to save availability:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Operating Days */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-primary">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Operating Days</h3>
                        <p className="text-[10px] text-slate-500">Select which days this operator accepts bookings</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {DAY_NAMES.map((name, i) => (
                        <button
                            key={i}
                            onClick={() => toggleDay(i)}
                            className={cn(
                                "w-12 h-12 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                                operatingDays.includes(i)
                                    ? "bg-primary/20 border-primary/40 text-primary"
                                    : "bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700"
                            )}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </section>

            {/* Operating Hours */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-primary">
                        <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Operating Hours</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Opens</Label>
                        <Input
                            type="time"
                            value={openTime}
                            onChange={(e) => setOpenTime(e.target.value)}
                            className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold text-primary font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Closes</Label>
                        <Input
                            type="time"
                            value={closeTime}
                            onChange={(e) => setCloseTime(e.target.value)}
                            className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold text-primary font-mono"
                        />
                    </div>
                </div>
            </section>

            {/* Group Size */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-primary">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Group Size Limits</h3>
                        <p className="text-[10px] text-slate-500">Minimum and maximum pax per booking</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Min Pax</Label>
                        <Input
                            type="number"
                            min={1}
                            value={minGroup}
                            onChange={(e) => setMinGroup(e.target.value)}
                            className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold text-primary font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Pax</Label>
                        <Input
                            type="number"
                            min={1}
                            value={maxGroup}
                            onChange={(e) => setMaxGroup(e.target.value)}
                            className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold text-primary font-mono"
                        />
                    </div>
                </div>
            </section>

            {/* Advance Notice */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-primary">
                        <Bell className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Advance Notice</h3>
                        <p className="text-[10px] text-slate-500">Minimum hours before tour guests must book</p>
                    </div>
                </div>

                <div className="relative">
                    <Input
                        type="number"
                        min={0}
                        value={advanceHours}
                        onChange={(e) => setAdvanceHours(e.target.value)}
                        className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold text-primary font-mono pl-4 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 uppercase">Hours</span>
                </div>
            </section>

            {/* Blackout Dates */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-red-400">
                        <CalendarOff className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Blackout Dates</h3>
                        <p className="text-[10px] text-slate-500">Days when this operator is unavailable for bookings</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Input
                        type="date"
                        value={newBlackoutDate}
                        onChange={(e) => setNewBlackoutDate(e.target.value)}
                        className="bg-slate-950 border-slate-800 h-10 rounded-xl text-sm text-white flex-1"
                    />
                    <Button
                        onClick={addBlackoutDate}
                        disabled={!newBlackoutDate}
                        className="h-10 px-4 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {blackoutDates.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {blackoutDates.map(date => (
                            <div
                                key={date}
                                className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400"
                            >
                                {date}
                                <button onClick={() => removeBlackoutDate(date)} className="hover:text-white transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {blackoutDates.length === 0 && (
                    <p className="text-[10px] text-slate-600 italic">No blackout dates set. Operator available on all operating days.</p>
                )}
            </section>

            {/* Save Button */}
            <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 bg-primary text-slate-950 hover:bg-primary/90 font-black uppercase tracking-widest text-xs rounded-xl"
            >
                {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Availability Rules</>
                )}
            </Button>
        </div>
    );
}
