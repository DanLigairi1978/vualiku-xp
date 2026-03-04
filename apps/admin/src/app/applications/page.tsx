'use client';

import {
    FileText,
    ShieldCheck,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    ChevronRight,
    Building2,
    Mail,
    Phone,
    Briefcase
} from 'lucide-react';
import { useApplications, OperatorApplication } from '@/lib/hooks/useApplications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTrigger
} from '@/components/ui/dialog';
import { ApplicationReview } from '@/components/applications/ApplicationReview';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

export default function OperatorApplicationsPage() {
    const { applications, loading, updateApplicationStatus } = useApplications();
    const [selectedApp, setSelectedApp] = useState<OperatorApplication | null>(null);

    return (
        <main className="p-8 max-w-[1600px] mx-auto space-y-10">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Partnership Intake Node
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Operator Requests
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Global Partner Onboarding Queue & Credential Verification
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List View */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-800">
                        <div className="relative group flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Search by company or contact..."
                                className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 h-11 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-primary/50 w-full transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'pending', 'reviewing', 'approved'].map((s) => (
                                <Button key={s} variant="outline" className="h-11 border-slate-800 bg-slate-950 text-slate-500 hover:text-white uppercase text-[10px] font-black tracking-widest px-4">
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Applicant Node</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact Vector</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Fleet Scope</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Intake Status</th>
                                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                            Synchronizing with Global Intake Gateways...
                                        </td>
                                    </tr>
                                ) : applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                            No active applications in queue.
                                        </td>
                                    </tr>
                                ) : applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-800/30 transition-all group cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black text-sm uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                                                        {app.companyName}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                                        Submitted {app.submittedAt?.toDate ? format(app.submittedAt.toDate(), 'dd MMM yyyy') : 'Recently'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-200 font-bold text-xs uppercase tracking-tight">{app.contactName}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Mail className="w-3 h-3 text-slate-600" />
                                                    <span className="text-[10px] text-slate-500 font-medium">{app.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-black text-xs uppercase italic">{app.fleetSize} VESSELS / UNITS</span>
                                                <span className="text-[10px] text-slate-600 font-bold uppercase">{app.tourTypes.join(' • ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={cn(
                                                "uppercase text-[9px] px-2 py-0.5 border-2",
                                                app.status === 'approved' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    app.status === 'pending' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                        app.status === 'reviewing' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                                            "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>{app.status}</Badge>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedApp(app)}
                                                        className="h-8 text-[9px] font-black uppercase border border-slate-800 bg-slate-950 text-slate-500 hover:text-white rounded-lg px-4 group/btn"
                                                    >
                                                        REVIEW DOSSIER <ChevronRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                </DialogTrigger>
                                                {selectedApp && selectedApp.id === app.id && (
                                                    <ApplicationReview application={selectedApp} onSuccess={() => setSelectedApp(null)} />
                                                )}
                                            </Dialog>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
