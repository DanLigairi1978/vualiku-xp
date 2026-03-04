'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, tourCompanies } from '@vualiku/shared';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, MoreVertical, ExternalLink, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { OperatorOnboarding } from './OnboardingForm';
import { useOperators, Operator } from '@/lib/hooks/useOperators';

export function OperatorList() {
    const { operators, loading, removeOperator } = useOperators();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOperator, setEditingOperator] = useState<Operator | null>(null);

    const handleEdit = (op: Operator) => {
        setEditingOperator(op);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingOperator(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-tahoma text-white uppercase italic tracking-tight">Partner Inventory</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAdd} className="bg-primary text-slate-950 hover:bg-primary/90 gap-2">
                            <Plus className="w-4 h-4" /> ONBOARD NEW OPERATOR
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white p-8 rounded-3xl">
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-2xl font-black font-tahoma uppercase italic tracking-wider flex items-center gap-3">
                                <ShieldAlert className="w-6 h-6 text-primary" />
                                {editingOperator ? 'Update Operator Credentials' : 'Operator Interview Protocol'}
                            </DialogTitle>
                        </DialogHeader>
                        <OperatorOnboarding
                            initialData={editingOperator || undefined}
                            onSuccess={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-950/50">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Operator Name</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Capacity</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    Retrieving encrypted manifests...
                                </TableCell>
                            </TableRow>
                        ) : operators.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    No designated operators found.
                                </TableCell>
                            </TableRow>
                        ) : operators.map((op) => (
                            <TableRow key={op.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors group">
                                <TableCell className="py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-700 group-hover:border-primary/50 transition-colors">
                                            {op.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200 group-hover:text-primary transition-colors">{op.name}</p>
                                            <p className="text-xs text-slate-500 truncate max-w-[300px]">{op.description}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "uppercase text-[9px] px-2 py-0.5",
                                        op.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                    )}>{op.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-slate-400 font-medium">{op.capacity || 0} GUESTS</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(op)}
                                            className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeOperator(op.id)}
                                            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
