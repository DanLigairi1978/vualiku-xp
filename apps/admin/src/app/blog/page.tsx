'use client';

import { useBlog } from '@/lib/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BookOpen, Plus, Trash2, Edit2, Loader2, Eye, ExternalLink } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BlogManagementPage() {
    const { posts, loading, deletePost } = useBlog();

    if (loading) {
        return (
            <main className="p-8 max-w-[1600px] mx-auto flex items-center justify-center min-h-[50vh]">
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
                            Content Node Zeta
                        </span>
                    </div>
                    <h1 className="text-4xl font-black font-tahoma text-white uppercase italic tracking-tighter leading-none">
                        Blog &amp; Stories
                    </h1>
                    <p className="text-slate-500 font-light tracking-wide">
                        Manage articles, guides and community stories
                    </p>
                </div>

                <Link href="/blog/editor/new">
                    <Button className="bg-primary text-slate-950 hover:bg-primary/90 gap-2 h-11 px-6 rounded-xl font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <Plus className="w-4 h-4" /> Create New Post
                    </Button>
                </Link>
            </header>

            <section className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-tahoma text-white uppercase italic tracking-tight">Article Library</h2>
                        <p className="text-sm text-slate-500">Total of {posts.length} entries registered in system.</p>
                    </div>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/30">
                    <Table>
                        <TableHeader className="bg-slate-950">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] w-[40%]">Post Title</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Author</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Published</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                        <div className="flex flex-col items-center gap-4">
                                            <BookOpen className="w-8 h-8 opacity-20" />
                                            <span>No blog posts found.</span>
                                            <Link href="/blog/editor/new">
                                                <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 uppercase text-[10px] tracking-widest font-bold">Write your first story</Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : posts.map((post) => (
                                <TableRow key={post.id} className="border-slate-800 hover:bg-slate-900/50 group transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {post.coverImage ? (
                                                <img
                                                    src={post.coverImage}
                                                    alt=""
                                                    className="w-12 h-8 rounded object-cover border border-slate-700 bg-slate-800"
                                                />
                                            ) : (
                                                <div className="w-12 h-8 rounded border border-slate-700 bg-slate-900 flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 text-slate-700" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-white group-hover:text-primary transition-colors">{post.title}</div>
                                                <div className="text-[10px] text-slate-500 font-mono tracking-tighter">/{post.slug}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "uppercase text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md",
                                            post.status === 'published'
                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                        )}>
                                            {post.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-400 font-medium">{post.author}</TableCell>
                                    <TableCell className="text-xs text-slate-500 font-mono">
                                        {post.publishedAt
                                            ? format(post.publishedAt.toDate(), 'MMM d, yyyy')
                                            : post.createdAt
                                                ? format(post.createdAt.toDate(), 'MMM d, yyyy')
                                                : 'Draft'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/blog/editor/${post.id}`}>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        {post.status === 'published' && (
                                            <Link href={`https://vualiku-xp.web.app/blog/${post.slug}`} target="_blank">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this post?')) {
                                                    deletePost(post.id);
                                                }
                                            }}
                                            className="h-9 w-9 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>
        </main>
    );
}
