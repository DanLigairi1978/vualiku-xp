'use client';

import {
    Mail,
    MessageSquare,
    Bell,
    ShieldAlert,
    ArrowUpRight,
    Activity,
    Send
} from 'lucide-react';
import { useCommunications } from '@/lib/hooks/useCommunications';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTrigger
} from '@/components/ui/dialog';
import { ComposeMessage } from '@/components/communications/ComposeMessage';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useEmailTemplates, TemplateKey, EmailTemplateConfig } from '@/lib/hooks/useEmailTemplates';
import { TemplateEditorDialog } from '@/components/communications/TemplateEditorDialog';

export default function CommunicationsPage() {
    const { logs, loading: logsLoading, sendMessage } = useCommunications();
    const { templates, loading: templatesLoading, updateTemplate } = useEmailTemplates();
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<TemplateKey | null>(null);
    const [selectedTemplateName, setSelectedTemplateName] = useState('');
    const [selectedConfig, setSelectedConfig] = useState<EmailTemplateConfig | null>(null);

    const stats = [
        { label: 'Outbound Velocity', value: '1.2k/hr', icon: <Activity className="w-5 h-5" />, trend: '+4%', color: 'text-primary' },
        { label: 'Delivery Success', value: '99.8%', icon: <ShieldAlert className="w-5 h-5" />, trend: 'Stable', color: 'text-green-400' },
        { label: 'Pending Queue', value: '12', icon: <Activity className="w-5 h-5" />, trend: '-2', color: 'text-yellow-400' },
    ];

    return (
        <main className="p-8 max-w-[1600px] mx-auto space-y-10">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Komunike Protocol v2
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Communications Hub
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Omnichannel Message Routing & System Notifications
                    </p>
                </div>
                <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-slate-950 font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 px-6 h-12 rounded-xl group transition-all">
                            COMPOSE BROADCAST <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    </DialogTrigger>
                    <ComposeMessage onSuccess={() => setIsComposeOpen(false)} />
                </Dialog>

                {selectedTemplateKey && selectedConfig && (
                    <TemplateEditorDialog
                        open={editorOpen}
                        onOpenChange={setEditorOpen}
                        templateKey={selectedTemplateKey}
                        templateName={selectedTemplateName}
                        initialConfig={selectedConfig}
                        onSave={updateTemplate}
                    />
                )}
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl group hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                {stat.icon}
                            </div>
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", stat.color)}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Logs Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Live Transmission Log</h2>
                        <button className="text-[10px] font-bold text-primary uppercase hover:underline">View Historical Archive</button>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/50 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Channel</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Recipient</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject / Header</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {logsLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                                Synchronizing with Komunike nodes...
                                            </td>
                                        </tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                                No active transmissions detected.
                                            </td>
                                        </tr>
                                    ) : logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-800/30 transition-all group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                                        {log.type === 'email' ? <Mail className="w-4 h-4" /> :
                                                            log.type === 'sms' ? <MessageSquare className="w-4 h-4" /> :
                                                                <Bell className="w-4 h-4" />}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white transition-colors">{log.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-200">{log.recipient}</span>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate">
                                                <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors uppercase font-medium">{log.subject || log.content.substring(0, 30) + '...'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={cn(
                                                    "uppercase text-[9px] px-2 py-0.5 border-2",
                                                    log.status === 'delivered' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                        log.status === 'sent' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                            "bg-red-500/10 text-red-400 border-red-500/20"
                                                )}>{log.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[10px] font-black uppercase text-slate-600">
                                                    {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'HH:mm:ss') : 'LIVE'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Automation Panel */}
                <div className="space-y-6">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-4">Automated Protocols</h2>

                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl space-y-6">
                        {templatesLoading ? (
                            <div className="text-center text-slate-500 font-bold uppercase tracking-widest text-[10px] py-4">
                                Loading Protocols...
                            </div>
                        ) : [
                            { key: 'bookingConfirmation', name: 'Booking Confirmation', status: 'Active', color: 'bg-green-400' },
                            { key: 'tripReminder', name: 'Trip Reminder (24h)', status: 'Active', color: 'bg-green-400' },
                            { key: 'reviewRequest', name: 'Review Request', status: 'Active', color: 'bg-green-400' },
                            { key: 'bookingCancellation', name: 'Booking Cancellation', status: 'Active', color: 'bg-green-400' },
                            { key: 'operatorWelcome', name: 'Operator Welcome', status: 'Active', color: 'bg-green-400' },
                        ].map((protocol, i) => (
                            <div key={i} className="flex justify-between items-center group">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-tight group-hover:text-primary transition-colors">{protocol.name}</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]", protocol.color)} />
                                        <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{protocol.status}</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        setSelectedTemplateKey(protocol.key as TemplateKey);
                                        setSelectedTemplateName(protocol.name);
                                        setSelectedConfig(templates[protocol.key as TemplateKey]);
                                        setEditorOpen(true);
                                    }}
                                    variant="outline" size="sm" className="h-8 border-slate-800 bg-slate-950 text-[9px] font-black uppercase tracking-widest px-3 hover:text-white transition-all">
                                    CONFIGURE
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest">Protocol Override</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase">
                            Emergency broadcast systems are currently on standby. All manual overrides will be logged to the security audit trail.
                        </p>
                        <Button className="w-full bg-slate-950 border border-slate-800 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl hover:bg-slate-900 transition-all">
                            TRIGGER TEST SEQUENCE
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
