'use client';

import { useMedia } from '@/lib/hooks/useMedia';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Trash2, Copy, ImageIcon, FileIcon, ExternalLink, Check, Search, X } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function MediaLibraryPage() {
    const { assets, loading, uploading, uploadFile, deleteAsset } = useMedia();
    const [dragActive, setDragActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFiles(e.dataTransfer.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        for (let i = 0; i < files.length; i++) {
            try {
                await uploadFile(files[i]);
            } catch (err) {
                console.error("Upload error:", err);
            }
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const copyToClipboard = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const filteredAssets = useMemo(() => {
        return assets.filter(asset =>
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [assets, searchQuery]);

    if (loading) {
        return (
            <main className="p-8 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </main>
        );
    }

    return (
        <main className="p-8 max-w-[1600px] mx-auto space-y-12 pb-24">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Storage Node Alpha
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Media Library
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Centralized high-performance asset management
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-900/50 border-slate-800 text-slate-300 pl-10 h-11 w-64 rounded-xl focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-primary text-slate-950 hover:bg-primary/90 gap-2 h-11 px-6 rounded-xl font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-95"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Processing...' : 'Upload New'}
                    </Button>
                </div>
            </header>

            {/* Upload Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative group transition-all duration-500",
                    "h-32 rounded-3xl border-2 border-dashed",
                    "flex items-center justify-center gap-6 cursor-pointer overflow-hidden",
                    dragActive
                        ? "bg-primary/5 border-primary shadow-[0_0_40px_rgba(34,197,94,0.1)] scale-[1.01]"
                        : "bg-slate-900/20 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40"
                )}
            >
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                    dragActive ? "bg-primary text-slate-950 rotate-0 scale-110" : "bg-slate-800 text-slate-500 group-hover:scale-110 group-hover:bg-slate-700"
                )}>
                    <Upload className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                    <p className="font-bold text-slate-300 uppercase tracking-widest text-xs">Drop files to deploy to cloud</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1 font-mono">Max size 20MB per asset • All types supported</p>
                </div>

                {/* Visual pulses when drag active */}
                {dragActive && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                    </div>
                )}
            </div>

            {/* Asset Grid Section */}
            <section className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-8 min-h-[400px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-tahoma text-white uppercase italic tracking-tight">System Assets</h2>
                            <p className="text-sm text-slate-500">{filteredAssets.length} records active</p>
                        </div>
                    </div>

                    {searchQuery && (
                        <Button
                            variant="ghost"
                            onClick={() => setSearchQuery('')}
                            className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-bold"
                        >
                            Clear Results
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {filteredAssets.length === 0 ? (
                        <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-600 border border-slate-800 border-dashed rounded-3xl bg-slate-950/20">
                            <div className="relative mb-4">
                                <ImageIcon className="w-16 h-16 opacity-10" />
                                <X className="absolute top-0 right-0 w-6 h-6 text-red-500/50" />
                            </div>
                            <p className="uppercase font-bold tracking-widest text-xs opacity-50">No matching assets found</p>
                        </div>
                    ) : (
                        filteredAssets.map((asset) => (
                            <div
                                key={asset.id}
                                className="group relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:-translate-y-1"
                            >
                                {/* Preview Area */}
                                <div className="aspect-square bg-slate-900 flex items-center justify-center overflow-hidden relative">
                                    {asset.type.startsWith('image/') ? (
                                        <img
                                            src={asset.url}
                                            alt={asset.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <FileIcon className="w-12 h-12 text-slate-700 group-hover:text-slate-500 transition-colors" />
                                            <span className="text-[8px] font-mono text-slate-600 uppercase">{asset.type.split('/')[1] || 'FILE'}</span>
                                        </div>
                                    )}

                                    {/* Glass Overlay Actions */}
                                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(asset.url); }}
                                            className={cn(
                                                "w-full rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                                                copiedUrl === asset.url
                                                    ? "bg-green-500 text-white hover:bg-green-600"
                                                    : "bg-primary/10 hover:bg-primary hover:text-slate-950 text-primary border border-primary/20"
                                            )}
                                        >
                                            {copiedUrl === asset.url ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                                            {copiedUrl === asset.url ? 'Copied' : 'Copy URL'}
                                        </Button>

                                        <div className="flex gap-2 w-full">
                                            <a href={asset.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-[10px] uppercase font-bold"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </Button>
                                            </a>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { if (confirm(`Delete ${asset.name}?`)) deleteAsset(asset); }}
                                                className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Subtle size badge on hover */}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {formatBytes(asset.size)}
                                    </div>
                                </div>

                                {/* Info Footer */}
                                <div className="p-4 bg-slate-900/60 border-t border-slate-800/50">
                                    <p className="text-[10px] font-bold text-slate-300 truncate tracking-tight" title={asset.name}>
                                        {asset.name}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[9px] text-slate-500 font-mono tracking-tighter bg-slate-800 px-1.5 py-0.5 rounded">
                                            {asset.type.split('/')[1]?.toUpperCase() || 'DATA'}
                                        </span>
                                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                                            {asset.createdAt ? format(asset.createdAt.toDate(), 'MMM d') : '...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}
