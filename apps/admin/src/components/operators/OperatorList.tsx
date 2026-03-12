'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, tourCompanies } from '@danligairi1978/shared';
import { OperatorAvatar } from '@/components/ui/OperatorAvatar';
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
import { Edit2, MoreVertical, ExternalLink, Plus, ShieldAlert, Trash2, CalendarClock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { OperatorOnboarding } from './OnboardingForm';
import { AvailabilityEditor } from './AvailabilityEditor';
import { useOperators, Operator } from '@/lib/hooks/useOperators';

function OperatorRow({
    op,
    onEdit,
    editOperator
}: {
    op: Operator;
    onEdit: (op: Operator) => void;
    editOperator: (id: string, data: Partial<Operator>) => Promise<void>;
}) {
    const [price, setPrice] = useState(op.basePrice?.toString() || '0');
    const [isUpdating, setIsUpdating] = useState(false);
    const [availOpen, setAvailOpen] = useState(false);

    const handlePriceBlur = async () => {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice === op.basePrice) {
            setPrice(op.basePrice?.toString() || '0');
            return;
        }
        setIsUpdating(true);
        try {
            await editOperator(op.id, { basePrice: numPrice });
        } catch (error) {
            console.error(error);
            setPrice(op.basePrice?.toString() || '0');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleStatus = async () => {
        setIsUpdating(true);
        try {
            const newStatus = op.status === 'active' ? 'inactive' : 'active';
            await editOperator(op.id, { status: newStatus });
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const opDays = op.operatingDays || [1, 2, 3, 4, 5, 6];

    return (
        <TableRow className="border-slate-800 hover:bg-slate-800/30 transition-colors group">
            <TableCell className="py-6">
                <div className="flex items-center gap-4">
                    <OperatorAvatar name={op.name} imageUrl={op.heroImageUrl} size="md" className="shrink-0 group-hover:border-primary/50 transition-colors" />
                    <div>
                        <p className="font-bold text-slate-200 group-hover:text-primary transition-colors">{op.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[300px]">{op.description}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                        "uppercase text-[9px] px-2 py-0.5",
                        op.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            op.status === 'pending' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    )}>{op.status}</Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleStatus}
                        disabled={isUpdating}
                        className="h-6 text-[10px] uppercase tracking-wider text-slate-400 hover:text-white px-2"
                    >
                        {op.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2 max-w-[120px]">
                    <span className="text-slate-400 text-xs">$</span>
                    <input
                        type="number"
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm w-full text-slate-200 focus:border-primary/50 focus:outline-none"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        onBlur={handlePriceBlur}
                        disabled={isUpdating}
                    />
                </div>
            </TableCell>
            <TableCell>
                <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-medium">{op.minGroupSize || 1}–{op.maxGroupSize || 50} PAX</span>
                    <div className="flex gap-0.5">
                        {dayNames.map((d, i) => (
                            <span key={i} className={cn("w-4 h-4 rounded text-[8px] flex items-center justify-center font-bold", opDays.includes(i) ? "bg-primary/20 text-primary" : "bg-slate-900 text-slate-700")}>{d}</span>
                        ))}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(op)}
                        className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Dialog open={availOpen} onOpenChange={setAvailOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10">
                                <CalendarClock className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg bg-slate-900 border-slate-800 text-white p-8 rounded-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="mb-6">
                                <DialogTitle className="text-xl font-black font-tahoma uppercase italic tracking-wider flex items-center gap-3">
                                    <CalendarClock className="w-5 h-5 text-amber-400" />
                                    Availability — {op.name}
                                </DialogTitle>
                            </DialogHeader>
                            <AvailabilityEditor operator={op} onSaved={() => setAvailOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </TableCell>
        </TableRow>
    );
}

export function OperatorList() {
    const { operators, loading, removeOperator, editOperator } = useOperators();
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
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Price</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Capacity</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    Retrieving encrypted manifests...
                                </TableCell>
                            </TableRow>
                        ) : operators.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    No designated operators found.
                                </TableCell>
                            </TableRow>
                        ) : operators.map((op) => (
                            <OperatorRow
                                key={op.id}
                                op={op}
                                onEdit={handleEdit}
                                editOperator={editOperator}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
