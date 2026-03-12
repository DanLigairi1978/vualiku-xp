'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Plus,
    Search,
    MoreVertical,
    Clock,
    DollarSign,
    Tag,
    Trash2,
    Edit2,
    Package,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { MasterEvent, masterEvents } from '@danligairi1978/shared';

interface ActivityManagerProps {
    operatorId?: string;
    isAdmin: boolean;
}

export function ActivityManager({ operatorId, isAdmin }: ActivityManagerProps) {
    const firestore = useFirestore();
    const [activities, setActivities] = useState<MasterEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        const fetchActivities = async () => {
            if (!firestore) return;

            try {
                // For now, we mix some from static and eventually from Firestore
                // In a real migration, we'd only use Firestore
                const q = isAdmin
                    ? query(collection(firestore, 'activities'))
                    : query(collection(firestore, 'activities'), where('operatorId', '==', operatorId));

                const snapshot = await getDocs(q);
                const firestoreActivities = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MasterEvent));

                // Combine with static data filtered by operatorId
                const staticActivities = isAdmin
                    ? masterEvents
                    : masterEvents.filter(e => e.operatorId === operatorId);

                // Dedup and set (Firestore takes precedence)
                const combined = [...firestoreActivities];
                staticActivities.forEach(sa => {
                    if (!combined.find(ca => ca.id === sa.id)) {
                        combined.push(sa);
                    }
                });

                setActivities(combined);
            } catch (err) {
                console.error('Failed to fetch activities:', err);
                // Fallback to static if Firestore fails (likely due to API not enabled)
                setActivities(isAdmin ? masterEvents : masterEvents.filter(e => e.operatorId === operatorId));
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [firestore, operatorId, isAdmin]);

    const filteredActivities = activities.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        if (!confirm('Are you sure you want to delete this activity?')) return;

        try {
            await deleteDoc(doc(firestore, 'activities', id));
            setActivities(prev => prev.filter(a => a.id !== id));
            toast.success('Activity deleted');
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error('Failed to delete activity. It may be a static record.');
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center text-foreground/40">
                <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary/50" />
                <p className="font-light italic">Loading your experiences...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search activities..."
                        className="bg-white/5 border-white/10 pl-12 h-12 rounded-2xl focus:border-primary/50 transition-all font-light"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="btn-forest h-12 px-8 rounded-xl font-bold border-none shadow-xl w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" /> New Activity
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                        <Package className="w-16 h-16 text-foreground/10 mx-auto mb-4" />
                        <p className="text-foreground/40 text-xl font-light italic">No matching activities found.</p>
                    </div>
                ) : (
                    filteredActivities.map((activity) => (
                        <Card key={activity.id} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all hover:shadow-2xl hover:-translate-y-1">
                            <div className="aspect-video relative overflow-hidden">
                                {activity.imageUrl ? (
                                    <img
                                        src={activity.imageUrl}
                                        alt={activity.name}
                                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-foreground/10" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary border border-primary/30 uppercase tracking-widest">
                                        {activity.category || 'Experience'}
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{activity.name}</h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-foreground/40 hover:text-white">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(activity.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-foreground/40 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-foreground/50">
                                        <Clock className="w-4 h-4" />
                                        <span>{activity.durationDesc}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground/50">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="font-bold text-white flex items-center gap-1">
                                            ${activity.price} <span className="text-[10px] uppercase tracking-tighter text-foreground/30">{activity.pricingType === 'per_head' ? 'Per Person' : 'Per Night'}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground/50">
                                        <Tag className="w-4 h-4" />
                                        <span className="italic font-light">{activity.slotId} Departure</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Placeholder Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                    <div className="bg-card w-full max-w-lg rounded-[2.5rem] border border-white/10 p-10 relative z-10 animate-in zoom-in-95 duration-300">
                        <h2 className="text-3xl font-bold font-tahoma mb-2">New Experience</h2>
                        <p className="text-foreground/50 italic mb-8">Tell the world about your unique tour.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Activity Name</label>
                                <Input placeholder="e.g. Sunset Kayaking" className="bg-white/5 border-white/10 h-12 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Price (FJD)</label>
                                    <Input type="number" placeholder="0.00" className="bg-white/5 border-white/10 h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Duration</label>
                                    <Input placeholder="e.g. 4 Hours" className="bg-white/5 border-white/10 h-12 rounded-xl" />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-12 rounded-xl uppercase tracking-widest text-[10px] font-bold">Cancel</Button>
                                <Button className="btn-forest flex-1 h-12 rounded-xl uppercase tracking-widest text-[10px] font-bold shadow-xl shadow-primary/20">List Activity</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
