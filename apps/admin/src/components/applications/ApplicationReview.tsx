'use client';

import { useState } from 'react';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Building2,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    ShieldAlert,
    ChevronRight,
    MessageSquare
} from 'lucide-react';
import { useApplications, OperatorApplication } from '@/lib/hooks/useApplications';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ApplicationReviewProps {
    application: OperatorApplication;
    onSuccess?: () => void;
}

export function ApplicationReview({ application, onSuccess }: ApplicationReviewProps) {
    const { updateApplicationStatus } = useApplications();
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState(application.notes || '');

    const handleAction = async (status: 'approved' | 'rejected' | 'reviewing') => {
        setSubmitting(true);
        try {
            await updateApplicationStatus(application.id, status, 'admin@vualiku.xp', notes);
            onSuccess?.();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DialogContent className="max-w-3xl bg-slate-900 border-slate-800 text-white p-8 rounded-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

            <DialogHeader className="mb-8 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className={cn(
                        "uppercase text-[9px] px-2 py-0.5 border-2",
                        application.status === 'approved' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            application.status === 'pending' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>{application.status}</Badge>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Received {application.submittedAt?.toDate ? format(application.submittedAt.toDate(), 'PPP') : 'Recently'}
                    </span>
                </div>
                <DialogTitle className="text-3xl font-black font-tahoma uppercase italic tracking-tighter text-white leading-none">
                    {application.companyName}
                </DialogTitle>
                <p className="text-primary font-bold uppercase tracking-widest text-[10px] mt-1 italic">Dossier ID: {application.id.slice(-12).toUpperCase()}</p>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2 mb-4">Partner Intelligence</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Lead Principal</span>
                                <span className="text-sm font-bold text-white">{application.contactName}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Operational Scope</span>
                                <span className="text-sm font-bold text-white uppercase italic">{application.tourTypes.join(' • ')}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Fleet Capability</span>
                                <span className="text-sm font-bold text-white">{application.fleetSize} Configured Units</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2 mb-4">Experience Summary</h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium uppercase italic">
                            "{application.experience}"
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2 mb-4">Administrative Action</h3>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Internal Review Notes</Label>
                            <textarea
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-medium min-h-[120px] focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-700"
                                placeholder="Construct case review..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol Check</h4>
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium leading-relaxed uppercase">
                            Approval will provision a new partner node and trigger the Meridian Onboarding Sequence.
                        </p>
                    </div>
                </div>
            </div>

            <Separator className="my-10 bg-slate-800/50 relative z-10" />

            <div className="flex gap-4 relative z-10">
                <Button
                    variant="outline"
                    onClick={() => handleAction('rejected')}
                    disabled={submitting}
                    className="flex-1 border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-xl transition-all"
                >
                    DECLINE REQUEST <XCircle className="w-4 h-4 ml-2" />
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAction('reviewing')}
                    disabled={submitting}
                    className="flex-1 border-slate-800 bg-slate-950 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-xl"
                >
                    MOVE TO REVIEW <Clock className="w-4 h-4 ml-2" />
                </Button>
                <Button
                    onClick={() => handleAction('approved')}
                    disabled={submitting}
                    className="flex-[2] bg-primary text-slate-950 font-black uppercase text-[10px] tracking-widest h-14 rounded-xl hover:bg-primary/90"
                >
                    APPROVE PARTNERSHIP <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </DialogContent>
    );
}
