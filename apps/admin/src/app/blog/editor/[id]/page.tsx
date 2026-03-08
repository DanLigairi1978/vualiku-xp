'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBlog } from '@/lib/hooks/useBlog';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { BlogPost } from '@vualiku/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft, Save, Sparkles, Image as ImageIcon, Layout, Tag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BlogEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const { createPost, updatePost } = useBlog();

    const [loading, setLoading] = useState(id !== 'new');
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: 'Vualiku Team',
        tags: [],
        status: 'draft',
        coverImage: '',
    });

    const [tagsInput, setTagsInput] = useState('');

    useEffect(() => {
        if (id !== 'new') {
            const fetchPost = async () => {
                try {
                    const docRef = doc(db, 'blogPosts', id as string);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data() as BlogPost;
                        setFormData(data);
                        setTagsInput(data.tags?.join(', ') || '');
                    }
                } catch (error) {
                    console.error("Error fetching post:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [id]);

    const handleTitleChange = (title: string) => {
        const slug = title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');

        setFormData(prev => ({ ...prev, title, slug }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const finalData = {
                ...formData,
                tags: tagsInput.split(',').map(tag => tag.trim()).filter(Boolean),
            } as any;

            if (id === 'new') {
                await createPost(finalData);
            } else {
                await updatePost(id as string, finalData);
            }
            router.push('/blog');
        } catch (error) {
            console.error("Error saving post:", error);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="p-8 max-w-[1600px] mx-auto flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </main>
        );
    }

    return (
        <main className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/blog">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white rounded-xl">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                            {id === 'new' ? 'Compose Post' : 'Refine Story'}
                        </h1>
                        <p className="text-slate-500 font-light tracking-wide text-sm mt-1">
                            {id === 'new' ? 'Start a new chapter in the Vualiku odyssey' : `Editing ID: ${id}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Status</Label>
                        <Switch
                            checked={formData.status === 'published'}
                            onCheckedChange={(checked) => setFormData(p => ({ ...p, status: checked ? 'published' : 'draft' }))}
                        />
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            formData.status === 'published' ? "text-green-400" : "text-amber-500"
                        )}>
                            {formData.status}
                        </span>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !formData.title}
                        className="bg-primary text-slate-950 hover:bg-primary/90 gap-2 h-11 px-8 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Post</>}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    placeholder="Enter a compelling title..."
                                    className="bg-slate-950 border-slate-800 h-14 text-xl font-bold font-tahoma italic tracking-tight rounded-2xl placeholder:opacity-20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">URL Slug</Label>
                                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-4 h-11">
                                    <span className="text-slate-600 text-sm font-mono tracking-tighter">vualiku.com/blog/</span>
                                    <input
                                        value={formData.slug}
                                        onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                                        className="bg-transparent border-none outline-none text-primary text-sm font-mono tracking-tighter flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Content Body (Markdown Supported)</Label>
                            <div className="relative group">
                                <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 pointer-events-none group-focus-within:text-primary transition-colors">
                                    <Layout className="w-3 h-3" /> Rich Mode Active
                                </div>
                                <Textarea
                                    value={formData.content}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(p => ({ ...p, content: e.target.value }))}
                                    placeholder="Tell your story here..."
                                    className="bg-slate-950 border-slate-800 min-h-[500px] rounded-2xl resize-none p-6 text-slate-300 leading-relaxed font-light text-lg"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h2 className="text-xs font-black font-tahoma text-white uppercase italic tracking-widest">Article Metadata</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" /> Cover Image URL
                                </Label>
                                <Input
                                    value={formData.coverImage}
                                    onChange={e => setFormData(p => ({ ...p, coverImage: e.target.value }))}
                                    placeholder="https://..."
                                    className="bg-slate-950 border-slate-800 rounded-xl text-xs font-mono"
                                />
                                {formData.coverImage && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 aspect-video relative">
                                        <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <User className="w-3 h-3" /> Author
                                </Label>
                                <Input
                                    value={formData.author}
                                    onChange={e => setFormData(p => ({ ...p, author: e.target.value }))}
                                    className="bg-slate-950 border-slate-800 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> Tags (Comma separated)
                                </Label>
                                <Input
                                    value={tagsInput}
                                    onChange={e => setTagsInput(e.target.value)}
                                    placeholder="Adventure, Fiji, Eco-tourism..."
                                    className="bg-slate-950 border-slate-800 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Short Excerpt</Label>
                                <Textarea
                                    value={formData.excerpt}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                                    placeholder="A brief summary for the preview card..."
                                    className="bg-slate-950 border-slate-800 rounded-xl text-sm min-h-[100px] resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Publishing Tip</h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">
                            Ensure your slug is descriptive for SEO. Images should ideally be 16:9 ratio and under 500KB for optimal web performance.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
