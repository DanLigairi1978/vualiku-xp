'use client';

import { useState } from 'react';
import { useBookings, Booking } from '@/lib/hooks/useBookings';
import { useOperators } from '@/lib/hooks/useOperators';
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
import {
    Search,
    Filter,
    Calendar as CalendarIcon,
    Download,
    MoreHorizontal,
    Eye,
    CheckCircle2,
    XCircle,
    ChevronDown,
    CreditCard
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { BookingDetails } from './BookingDetails';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function BookingsTable() {
    const [filters, setFilters] = useState({
        status: 'all',
        operator: 'all',
    });

    const { bookings, loading, reconcileBooking, updateBookingStatus } = useBookings(filters);
    const { operators } = useOperators();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-800">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Find hash or customer..."
                            className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 h-11 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-primary/50 w-64 transition-all"
                        />
                    </div>

                    <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
                        <SelectTrigger className="w-40 bg-slate-950 border-slate-800 h-11 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="all">Every State</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.operator} onValueChange={(val) => setFilters({ ...filters, operator: val })}>
                        <SelectTrigger className="w-48 bg-slate-950 border-slate-800 h-11 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="all">All Partners</SelectItem>
                            {operators.map(op => (
                                <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="h-11 border-slate-800 bg-slate-950 text-slate-500 hover:text-white uppercase text-[10px] font-bold tracking-widest px-4">
                        <CalendarIcon className="w-4 h-4 mr-2" /> Date Range
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="h-11 border-slate-800 bg-slate-950 text-slate-500 hover:text-white uppercase text-[10px] font-bold tracking-widest px-4">
                        <Download className="w-4 h-4 mr-2" /> Export XML
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-slate-950/50">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] pl-8">Transaction</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Customer</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Amount</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-right pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    Scanning global transaction ledger...
                                </TableCell>
                            </TableRow>
                        ) : bookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    No records matching active protocol.
                                </TableCell>
                            </TableRow>
                        ) : bookings.map((booking) => (
                            <TableRow key={booking.id} className="border-slate-800 hover:bg-slate-800/30 transition-all group">
                                <TableCell className="py-6 pl-8">
                                    <div className="flex flex-col">
                                        <span className="text-white font-black text-sm uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                                            {booking.tourName}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                            {booking.operator} • {booking.timestamp?.toDate ? format(booking.timestamp.toDate(), 'dd MMM HH:mm') : 'Recently'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-slate-200 font-bold text-xs uppercase tracking-tight">{booking.customerName}</span>
                                        <span className="text-[10px] text-slate-600 font-medium">{booking.customerEmail}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-white font-black text-sm font-mono tracking-tighter">
                                            {booking.currency} {booking.totalAmount.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-bold uppercase">{booking.participants} GUESTS</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "uppercase text-[9px] px-2 py-0.5 border-2",
                                        booking.status === 'paid' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                            booking.status === 'pending' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}>{booking.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <div className="flex justify-end gap-2">
                                        {booking.status === 'pending' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => reconcileBooking(booking.id, 'admin@vualiku.xp')}
                                                className="h-8 text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-slate-950 transition-all rounded-lg"
                                            >
                                                Authorize Payment
                                            </Button>
                                        )}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            {selectedBooking && selectedBooking.id === booking.id && (
                                                <BookingDetails booking={selectedBooking} />
                                            )}
                                        </Dialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest px-4">
                <p>Showing {bookings.length} active records</p>
                <div className="flex items-center gap-4">
                    <button className="hover:text-primary transition-colors disabled:opacity-30" disabled>Previous Phase</button>
                    <div className="h-1 w-1 rounded-full bg-slate-800" />
                    <button className="hover:text-primary transition-colors disabled:opacity-30" disabled>Next Phase</button>
                </div>
            </div>
        </div>
    );
}
