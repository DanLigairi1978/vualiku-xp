'use client';

import { useState, useEffect } from 'react';
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject, getMetadata } from 'firebase/storage';
import { storage } from '@vualiku/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Upload, Trash2, Copy, Loader2, FolderOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
    name: string;
    fullPath: string;
    url: string;
    size?: number;
    contentType?: string;
}

const FOLDERS = ['operators', 'packages', 'homepage', 'general'];

export default function MediaPage() {
    const [folder, setFolder] = useState('general');
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState('');

    const loadFolder = async (folderName: string) => {
        setLoading(true);
        setFolder(folderName);
        try {
            const folderRef = ref(storage, folderName);
            const result = await listAll(folderRef);
            const mediaItems: MediaItem[] = [];

            for (const item of result.items) {
                try {
                    const url = await getDownloadURL(item);
                    let size: number | undefined;
                    let contentType: string | undefined;
                    try {
                        const meta = await getMetadata(item);
                        size = meta.size;
                        contentType = meta.contentType || undefined;
                    } catch { /* metadata may not be available */ }
                    mediaItems.push({ name: item.name, fullPath: item.fullPath, url, size, contentType });
                } catch { /* skip items we can't access */ }
            }

            // Also recursively list subdirectories
            for (const prefix of result.prefixes) {
                const subResult = await listAll(prefix);
                for (const item of subResult.items) {
                    try {
                        const url = await getDownloadURL(item);
                        let size: number | undefined;
                        let contentType: string | undefined;
                        try {
                            const meta = await getMetadata(item);
                            size = meta.size;
                            contentType = meta.contentType || undefined;
                        } catch { /* metadata may not be available */ }
                        mediaItems.push({ name: `${prefix.name}/${item.name}`, fullPath: item.fullPath, url, size, contentType });
                    } catch { /* skip */ }
                }
            }

            setItems(mediaItems);
        } catch (err) {
            console.error('Failed to load media:', err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFolder('general');
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError('');
        if (!file.type.startsWith('image/')) {
            setUploadError('Only image files are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File must be under 5MB');
            return;
        }

        setUploading(true);
        try {
            const imageRef = ref(storage, `${folder}/${file.name}`);
            await uploadBytes(imageRef, file);
            await loadFolder(folder);
        } catch (err) {
            console.error('Upload failed:', err);
            setUploadError('Upload failed. Check permissions.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item: MediaItem) => {
        if (!confirm(`Delete "${item.name}"?`)) return;
        try {
            const itemRef = ref(storage, item.fullPath);
            await deleteObject(itemRef);
            setItems(prev => prev.filter(i => i.fullPath !== item.fullPath));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleCopy = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-primary" /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Media Library</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{items.length} files in /{folder}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {uploadError && <span className="text-xs text-red-400 font-bold">{uploadError}</span>}
                    <Label htmlFor="media-upload" className={cn(
                        "h-12 px-6 font-bold uppercase tracking-widest text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-all",
                        uploading ? "bg-slate-800 text-slate-500" : "bg-primary text-slate-950 hover:bg-primary/90"
                    )}>
                        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Image</>}
                        <input id="media-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </Label>
                </div>
            </div>

            {/* Folder Tabs */}
            <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                {FOLDERS.map(f => (
                    <button key={f} onClick={() => loadFolder(f)}
                        className={cn("flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                            folder === f ? "bg-primary text-slate-950" : "text-slate-500 hover:text-white hover:bg-slate-800"
                        )}><FolderOpen className="w-4 h-4" /> {f}</button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                    <ImageIcon className="w-16 h-16 text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No images in this folder</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map(item => (
                        <div key={item.fullPath} className="group bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                            <div className="relative aspect-square bg-slate-950">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => handleCopy(item.url)} className="p-2 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors" title="Copy URL">
                                        {copied === item.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                                    </button>
                                    <button onClick={() => handleDelete(item)} className="p-2 bg-slate-900 rounded-lg border border-slate-700 hover:bg-red-500/20 transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 space-y-1">
                                <p className="text-xs font-medium truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-500">{formatSize(item.size)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
