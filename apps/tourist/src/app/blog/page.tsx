'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { BlogPost } from '@vualiku/shared';
import { format } from 'date-fns';
import { Calendar, User, ArrowRight, BookOpen, Loader2, Tag } from 'lucide-react';
import Link from 'next/link';

export default function BlogIndexPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(
                    collection(db, 'blogPosts'),
                    where('status', '==', 'published'),
                    orderBy('publishedAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as BlogPost[];
                setPosts(data);
            } catch (error) {
                console.error("Error fetching blog posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="text-slate-400 font-medium animate-pulse uppercase tracking-widest text-xs">Gathering Stories...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a110d]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="h-[1px] w-12 bg-emerald-500/50" />
                            <span className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-xs">Vualiku Chronicles</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                            Stories from the <span className="text-emerald-500 italic">Edge of the World.</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-light leading-relaxed max-w-2xl">
                            Dive deep into the culture, nature, and community stories of Vanua Levu. Your guide to authentic Fijian discovery and eco-tourism.
                        </p>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="pb-32 container mx-auto px-6">
                {posts.length === 0 ? (
                    <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-20 text-center flex flex-col items-center max-w-2xl mx-auto shadow-2xl">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 border border-emerald-500/20 shadow-inner">
                            <BookOpen className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 italic tracking-tight uppercase font-tahoma">The library is currently quiet.</h2>
                        <p className="text-slate-500 mb-8 font-light">We're out in the field gathering new stories. Check back soon for updates from the heart of Fiji.</p>
                        <Link href="/explore">
                            <button className="bg-emerald-500 text-slate-950 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
                                Explore Experiences
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {posts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col h-full bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-[2rem] overflow-hidden hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2 shadow-xl shadow-black/20">
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    {post.coverImage ? (
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-emerald-950/20 flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-emerald-800" />
                                        </div>
                                    )}
                                    <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                                        {post.tags?.slice(0, 2).map((tag, idx) => (
                                            <span key={idx} className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest leading-none">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                                        <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-emerald-500" /> {format(post.publishedAt.toDate(), 'MMM d, yyyy')}</div>
                                        <div className="flex items-center gap-1.5"><User className="w-3 h-3 text-emerald-500" /> {post.author}</div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-4 group-hover:text-emerald-400 transition-colors leading-tight italic font-tahoma uppercase tracking-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-light leading-relaxed mb-8 flex-1 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-auto">
                                        Read Full Story <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
