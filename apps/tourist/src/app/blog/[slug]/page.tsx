'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { BlogPost } from '@vualiku/shared';
import { format } from 'date-fns';
import { Calendar, User, ArrowLeft, BookOpen, Loader2, Tag, ChevronRight, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function BlogPostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const q = query(
                    collection(db, 'blogPosts'),
                    where('slug', '==', slug),
                    where('status', '==', 'published'),
                    limit(1)
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setPost({
                        id: querySnapshot.docs[0].id,
                        ...querySnapshot.docs[0].data()
                    } as BlogPost);
                }
            } catch (error) {
                console.error("Error fetching blog post:", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[#0a110d]">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Accessing Chronicles...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-[#0a110d] p-6">
                <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                    <BookOpen className="w-10 h-10" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-white italic font-tahoma uppercase tracking-tighter">Story Lost in the Mist</h1>
                    <p className="text-slate-500 max-w-md mx-auto">The article you're looking for might have been moved, deleted, or is still being written by our scouts.</p>
                </div>
                <Link href="/blog">
                    <button className="bg-emerald-500 text-slate-950 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all">
                        Back to Library
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a110d] pb-32">
            {/* Header / Breadcrumbs */}
            <div className="pt-32 pb-12 container mx-auto px-6">
                <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">
                    <Link href="/blog" className="hover:text-emerald-500 transition-colors">Blog</Link>
                    <ChevronRight className="w-3 h-3 opacity-30" />
                    <span className="text-emerald-500">Current Story</span>
                </div>

                <div className="max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-[0.9] font-tahoma uppercase italic">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-8 text-slate-400 text-xs font-medium border-y border-slate-800/50 py-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Author</p>
                                <p className="text-white font-bold">{post.author}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Published</p>
                                <p className="text-white font-bold">{format(post.publishedAt.toDate(), 'MMMM d, yyyy')}</p>
                            </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest mr-2">Share</span>
                            <button className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all"><Facebook className="w-4 h-4" /></button>
                            <button className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all"><Twitter className="w-4 h-4" /></button>
                            <button className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all"><LinkIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            {post.coverImage && (
                <div className="container mx-auto px-6 mb-16">
                    <div className="aspect-[21/9] rounded-[2rem] overflow-hidden border border-slate-800/50 shadow-2xl relative">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2rem]" />
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert prose-emerald max-w-none">
                        {/* 
                          We use white-space: pre-wrap to preserve basic formatting if it's plain text, 
                          or we render as HTML if it contains tags.
                        */}
                        <div className="text-slate-300 text-lg leading-[1.8] font-light space-y-6 whitespace-pre-wrap">
                            {post.content}
                        </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-20 pt-10 border-t border-slate-800/50 flex items-center gap-4">
                            <Tag className="w-4 h-4 text-emerald-500" />
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, idx) => (
                                    <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Next Steps / Related */}
                    <div className="mt-24 p-12 bg-slate-900/40 rounded-[2rem] border border-slate-800/50 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen className="w-32 h-32" />
                        </div>
                        <h3 className="text-2xl font-black text-white italic font-tahoma uppercase tracking-tight mb-4">Inspired by this story?</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Experience the magic for yourself. Book an authentic Fijian adventure today.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/explore">
                                <button className="bg-emerald-500 text-slate-950 px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
                                    Explore Packages
                                </button>
                            </Link>
                            <Link href="/blog">
                                <button className="bg-slate-950 text-white border border-slate-800 px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-900 transition-all">
                                    Back to Library
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
