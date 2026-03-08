'use client';

import { useState } from 'react';
import { usePackages, Package } from '@/lib/hooks/usePackages';
import { PackageForm } from '@/components/packages/PackageForm';
import { Button } from '@/components/ui/button';
import { Package as PackageIcon, Plus, Pencil, ToggleLeft, ToggleRight, Star, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PackagesPage() {
    const { packages, loading, editPackage, removePackage } = usePackages();
    const [showForm, setShowForm] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    const handleEdit = (pkg: Package) => {
        setEditingPackage(pkg);
        setShowForm(true);
    };

    const handleToggleStatus = async (pkg: Package) => {
        const newStatus = pkg.status === 'active' || pkg.status === 'featured' ? 'inactive' : 'active';
        try {
            await editPackage(pkg.id, { status: newStatus });
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    const handleToggleFeatured = async (pkg: Package) => {
        const newStatus = pkg.status === 'featured' ? 'active' : 'featured';
        try {
            await editPackage(pkg.id, { status: newStatus });
        } catch (err) {
            console.error('Failed to toggle featured:', err);
        }
    };

    const handleDelete = async (pkg: Package) => {
        if (!confirm(`Delete "${pkg.name}"? This cannot be undone.`)) return;
        try {
            await removePackage(pkg.id);
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    if (showForm) {
        return (
            <div className="p-8 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <PackageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">{editingPackage ? 'Edit Package' : 'New Package'}</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Package Builder Protocol</p>
                    </div>
                </div>
                <PackageForm
                    initialData={editingPackage || undefined}
                    onSuccess={() => { setShowForm(false); setEditingPackage(null); }}
                    onCancel={() => { setShowForm(false); setEditingPackage(null); }}
                />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <PackageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Packages</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{packages.length} Tour Packages</p>
                    </div>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-primary text-slate-950 hover:bg-primary/90 h-12 px-6 font-bold uppercase tracking-widest text-xs">
                    <Plus className="w-4 h-4 mr-2" /> New Package
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : packages.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                    <PackageIcon className="w-16 h-16 text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No packages configured</p>
                    <Button onClick={() => setShowForm(true)} variant="outline" className="border-slate-800 text-slate-400 hover:text-white">
                        <Plus className="w-4 h-4 mr-2" /> Create First Package
                    </Button>
                </div>
            ) : (
                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 p-4">Package</th>
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 p-4">Operator</th>
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 p-4">Price</th>
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 p-4">Duration</th>
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 p-4">Status</th>
                                <th className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map(pkg => (
                                <tr key={pkg.id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {pkg.heroImageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={pkg.heroImageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-800" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center"><PackageIcon className="w-5 h-5 text-slate-600" /></div>
                                            )}
                                            <div>
                                                <p className="font-bold text-sm">{pkg.name}</p>
                                                <p className="text-[10px] text-slate-500 line-clamp-1">{pkg.shortDescription}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">{pkg.operatorName || '—'}</td>
                                    <td className="p-4 text-sm font-bold text-primary">${pkg.pricePerHead} FJD</td>
                                    <td className="p-4 text-sm text-slate-400">{pkg.duration || '—'}</td>
                                    <td className="p-4">
                                        <span className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                                            pkg.status === 'active' ? "bg-green-500/10 text-green-400" :
                                                pkg.status === 'featured' ? "bg-yellow-500/10 text-yellow-400" :
                                                    "bg-red-500/10 text-red-400"
                                        )}>{pkg.status}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleEdit(pkg)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleToggleFeatured(pkg)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-yellow-400 transition-colors" title="Toggle Featured">
                                                <Star className={cn("w-4 h-4", pkg.status === 'featured' && "fill-yellow-400 text-yellow-400")} />
                                            </button>
                                            <button onClick={() => handleToggleStatus(pkg)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Toggle Active">
                                                {pkg.status === 'inactive' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4 text-green-400" />}
                                            </button>
                                            <button onClick={() => handleDelete(pkg)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
