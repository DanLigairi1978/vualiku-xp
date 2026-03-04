'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    CheckCircle, XCircle, Clock, Building2, MapPin, Mail, Phone,
    ChevronDown, ChevronUp, Loader2, FileText
} from 'lucide-react';

interface OperatorApplication {
    id: string;
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    region: string;
    category: string;
    description: string;
    activities: string;
    certifications: string;
    whyJoin: string;
    teamSize: string;
    website: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    notes: string;
}

interface AdminApprovalQueueProps {
    adminEmail: string;
}

export function AdminApprovalQueue({ adminEmail }: AdminApprovalQueueProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [applications, setApplications] = useState<OperatorApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');

    useEffect(() => {
        if (!firestore) return;

        const fetchApplications = async () => {
            try {
                const q = filter === 'pending'
                    ? query(
                        collection(firestore, 'operatorApplications'),
                        where('status', '==', 'pending'),
                        orderBy('submittedAt', 'desc')
                    )
                    : query(
                        collection(firestore, 'operatorApplications'),
                        orderBy('submittedAt', 'desc')
                    );

                const snapshot = await getDocs(q);
                const apps = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                    submittedAt: d.data().submittedAt?.toDate() || new Date(),
                })) as OperatorApplication[];

                setApplications(apps);
            } catch (err) {
                console.error('Failed to fetch applications:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [firestore, filter]);

    const handleAction = async (appId: string, action: 'approve' | 'reject') => {
        if (!firestore) return;
        setProcessing(appId);

        try {
            const appRef = doc(firestore, 'operatorApplications', appId);
            await updateDoc(appRef, {
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewedAt: serverTimestamp(),
                reviewedBy: adminEmail,
            });

            // Trigger approval API (sends welcome email)
            if (action === 'approve') {
                try {
                    await fetch('/api/operator/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ applicationId: appId, action, reviewerEmail: adminEmail }),
                    });
                } catch {
                    // Non-critical
                }
            }

            setApplications((prev) =>
                prev.map((a) =>
                    a.id === appId ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a
                )
            );

            toast({
                title: action === 'approve' ? 'Operator Approved ✅' : 'Application Rejected',
                description: action === 'approve'
                    ? 'Welcome email has been sent to the operator.'
                    : 'The application has been rejected.',
            });
        } catch (err) {
            console.error('Action failed:', err);
            toast({ title: 'Error', description: 'Failed to process application.', variant: 'destructive' });
        } finally {
            setProcessing(null);
        }
    };

    const pendingCount = applications.filter((a) => a.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-tahoma flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" /> Operator Applications
                    {pendingCount > 0 && (
                        <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full font-bold ml-2">
                            {pendingCount} Pending
                        </span>
                    )}
                </h2>
                <div className="flex gap-2">
                    {(['pending', 'all'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === f
                                    ? 'bg-primary/20 border-primary/50 text-primary'
                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                }`}
                        >
                            {f === 'pending' ? 'Pending' : 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="py-12 text-center text-foreground/40">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary/50" />
                    Loading applications...
                </div>
            )}

            {/* Empty State */}
            {!loading && applications.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-3xl">
                    <Building2 className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                    <p className="text-foreground/40">
                        {filter === 'pending' ? 'No pending applications.' : 'No applications found.'}
                    </p>
                </div>
            )}

            {/* Application Cards */}
            <div className="space-y-4">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors"
                    >
                        {/* Summary Row */}
                        <button
                            onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                            className="w-full flex items-center justify-between p-5 text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${app.status === 'approved'
                                        ? 'bg-green-500/20 text-green-400'
                                        : app.status === 'rejected'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    {app.status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                                        app.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                                            <Clock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{app.businessName}</h3>
                                    <div className="flex items-center gap-3 text-xs text-foreground/40 mt-1">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.region}</span>
                                        <span>{app.category}</span>
                                        <span>{app.submittedAt.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            {expandedId === app.id ? <ChevronUp className="w-5 h-5 text-foreground/30" /> : <ChevronDown className="w-5 h-5 text-foreground/30" />}
                        </button>

                        {/* Expanded Details */}
                        {expandedId === app.id && (
                            <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Detail label="Contact" value={app.contactName} />
                                    <Detail label="Email" value={app.email} icon={<Mail className="w-3 h-3" />} />
                                    <Detail label="Phone" value={app.phone || 'N/A'} icon={<Phone className="w-3 h-3" />} />
                                    <Detail label="Team" value={app.teamSize || 'N/A'} />
                                </div>

                                {app.description && (
                                    <div>
                                        <p className="text-[10px] text-primary/60 uppercase font-bold tracking-wider mb-1">Description</p>
                                        <p className="text-sm text-foreground/60 leading-relaxed">{app.description}</p>
                                    </div>
                                )}

                                {app.activities && (
                                    <div>
                                        <p className="text-[10px] text-primary/60 uppercase font-bold tracking-wider mb-1">Activities</p>
                                        <p className="text-sm text-foreground/60">{app.activities}</p>
                                    </div>
                                )}

                                {app.certifications && (
                                    <div>
                                        <p className="text-[10px] text-primary/60 uppercase font-bold tracking-wider mb-1">Certifications</p>
                                        <p className="text-sm text-foreground/60">{app.certifications}</p>
                                    </div>
                                )}

                                {app.whyJoin && (
                                    <div>
                                        <p className="text-[10px] text-primary/60 uppercase font-bold tracking-wider mb-1">Why Join?</p>
                                        <p className="text-sm text-foreground/60">{app.whyJoin}</p>
                                    </div>
                                )}

                                {app.status === 'pending' && (
                                    <div className="flex gap-3 pt-4 border-t border-white/5">
                                        <Button
                                            onClick={() => handleAction(app.id, 'approve')}
                                            disabled={processing === app.id}
                                            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold h-12"
                                        >
                                            {processing === app.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleAction(app.id, 'reject')}
                                            disabled={processing === app.id}
                                            variant="outline"
                                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold h-12"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] text-primary/60 uppercase font-bold tracking-wider mb-1">{label}</p>
            <p className="text-sm text-white/80 flex items-center gap-1.5">
                {icon}
                {value}
            </p>
        </div>
    );
}
