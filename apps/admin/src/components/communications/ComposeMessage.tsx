'use client';

import { useState } from 'react';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Mail,
    MessageSquare,
    Bell,
    Send,
    Users,
    ShieldCheck
} from 'lucide-react';
import { useCommunications } from '@/lib/hooks/useCommunications';
import { cn } from '@/lib/utils';

export function ComposeMessage({ onSuccess }: { onSuccess?: () => void }) {
    const { sendMessage } = useCommunications();
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        type: 'email' as 'email' | 'sms' | 'push',
        recipient: 'all-operators',
        subject: '',
        content: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await sendMessage({
                type: formData.type,
                recipient: formData.recipient,
                subject: formData.type === 'email' ? formData.subject : undefined,
                content: formData.content,
            });
            onSuccess?.();
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-white p-8 rounded-3xl">
            <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black font-tahoma uppercase italic tracking-tighter text-white">
                    Manual Transmission
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                    Initiate an outbound broadcast via Komunike Protocol.
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Channel</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger className="bg-slate-950 border-slate-800 h-11 text-xs font-bold uppercase">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                <SelectItem value="email">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                        <span>Electronic Mail</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="sms">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-green-400" />
                                        <span>SMS Protocol</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="push">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-yellow-400" />
                                        <span>Push Alert</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Group</Label>
                        <Select
                            value={formData.recipient}
                            onValueChange={(val) => setFormData({ ...formData, recipient: val })}
                        >
                            <SelectTrigger className="bg-slate-950 border-slate-800 h-11 text-xs font-bold uppercase">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                <SelectItem value="all-operators">All Active Partners</SelectItem>
                                <SelectItem value="tourists-today">Today's Guests</SelectItem>
                                <SelectItem value="meridian-admins">System Admin Hub</SelectItem>
                                <SelectItem value="manual-input">Manual Dispatch</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {formData.type === 'email' && (
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subject Vector</Label>
                        <Input
                            placeholder="Enter transmission header..."
                            className="bg-slate-950 border-slate-800 h-11 text-sm font-bold placeholder:text-slate-700"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payload Content</Label>
                    <textarea
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-medium min-h-[120px] focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-700"
                        placeholder="Construct message body..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                    />
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                        Security verification active. Broadcast will be distributed via authorized Vualiku XP gateways.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        className="flex-1 border border-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl hover:text-white"
                    >
                        ABORT
                    </Button>
                    <Button
                        type="submit"
                        disabled={sending}
                        className="flex-[2] bg-primary text-slate-950 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl hover:bg-primary/90"
                    >
                        {sending ? 'TRANSMITTING...' : 'EXECUTE DISPATCH'} <Send className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
