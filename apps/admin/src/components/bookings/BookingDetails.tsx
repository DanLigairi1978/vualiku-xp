'use client';

import { Booking } from '@/lib/hooks/useBookings';
import {
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    Users,
    CreditCard,
    Hash,
    Mail,
    Phone,
    MapPin,
    Clock,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BookingDetailsProps {
    booking: Booking;
}

export function BookingDetails({ booking }: BookingDetailsProps) {
    const detailRow = (icon: any, label: string, value: string, subValue?: string) => (
        <div className="flex gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/50 transition-all">
                {icon}
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">{label}</p>
                <p className="text-sm font-bold text-white leading-tight">{value}</p>
                {subValue && <p className="text-xs text-slate-500 font-medium">{subValue}</p>}
            </div>
        </div>
    );

    return (
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white p-8 rounded-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

            <DialogHeader className="mb-8 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className={cn(
                        "uppercase text-[9px] px-2 py-0.5 border-2",
                        booking.status === 'paid' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            booking.status === 'pending' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>{booking.status}</Badge>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Hash className="w-3 h-3" /> {booking.id.slice(-8).toUpperCase()}
                    </span>
                </div>
                <DialogTitle className="text-3xl font-black font-tahoma uppercase italic tracking-tighter text-white leading-none">
                    {booking.tourName}
                </DialogTitle>
                <p className="text-primary font-bold uppercase tracking-widest text-[10px] mt-1 italic">{booking.operator}</p>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
                <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">Customer Intelligence</h3>
                    <div className="space-y-6">
                        {detailRow(<Users className="w-5 h-5" />, "Lead Participant", booking.customerName)}
                        {detailRow(<Mail className="w-5 h-5" />, "Email Protocol", booking.customerEmail)}
                        {detailRow(<Phone className="w-5 h-5" />, "Contact Vector", booking.customerPhone)}
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">Transaction Metadata</h3>
                    <div className="space-y-6">
                        {detailRow(<CreditCard className="w-5 h-5" />, "Volume & Value", `${booking.currency} ${booking.totalAmount.toFixed(2)}`, `${booking.participants} Guests authorised`)}
                        {detailRow(<Calendar className="w-5 h-5" />, "Scheduled Window", booking.tourDate || "Unassigned", "Standard 08:30 Departure")}
                        {detailRow(<Clock className="w-5 h-5" />, "Creation Stamp", booking.timestamp?.toDate ? format(booking.timestamp.toDate(), 'PPP HH:mm') : 'Recently')}
                    </div>
                </div>
            </div>

            <Separator className="my-10 bg-slate-800/50 relative z-10" />

            <div className="flex flex-col gap-6 relative z-10">
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reconciliation Status</p>
                            <p className="text-sm font-bold text-white">{booking.reconciled ? `Verified by ${booking.reconciledBy}` : 'Awaiting Administrative Review'}</p>
                        </div>
                    </div>
                    {!booking.reconciled && booking.status === 'pending' && (
                        <Button className="bg-primary text-slate-950 font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 px-6 h-12 rounded-xl">
                            AUTHORISE NOW <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </DialogContent>
    );
}
