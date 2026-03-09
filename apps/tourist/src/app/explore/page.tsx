'use client';

import { InstantSearch, Configure, Stats, Pagination, useSearchBox, useInstantSearch } from 'react-instantsearch';
import { searchClient, ALGOLIA_INDEX_NAME } from '@/lib/search/algolia';
import { SearchBar } from '@/components/search/search-bar';
import { CategoryFilters } from '@/components/search/category-filters';
import { PriceFilter } from '@/components/search/price-filter';
import { ActivityResults } from '@/components/search/activity-card';
import { Compass, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { useFeatureFlags } from '@/context/FeatureFlagsContext';

function ExploreContent() {
    const { pages } = useFeatureFlags();
    const searchParams = useSearchParams();
    const router = useRouter();

    if (pages.explore === false) {
        return (
            <div className="min-h-screen bg-[#0a110d] flex items-center justify-center text-white px-6">
                <div className="text-center space-y-8 max-w-md">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl">
                        <Compass className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black italic font-tahoma uppercase tracking-tighter">Coming Soon</h1>
                        <p className="text-slate-400 font-light">We're currently scouting the best adventures in Vanua Levu. Check back shortly for our full directory.</p>
                    </div>
                    <Link href="/" className="inline-block">
                        <button className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-xs hover:text-emerald-400 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const initialCategory = searchParams.get('category');
    const [filtersOpen, setFiltersOpen] = useState(true);

    return (
        <div className="bg-background min-h-screen text-white pt-32 pb-24 relative overflow-hidden">
            <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

            <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
                <Configure
                    hitsPerPage={12}
                    filters={initialCategory ? `category:"${initialCategory}"` : undefined}
                />

                <div className="container relative z-10 mx-auto px-6 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-3 text-primary/60">
                            <span className="h-[1px] w-8 bg-primary/30" />
                            <span className="text-[12px] font-bold tracking-[0.4em] uppercase">Discover</span>
                            <span className="h-[1px] w-8 bg-primary/30" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold font-tahoma text-shadow-lg uppercase tracking-tighter">
                            {initialCategory ? (
                                <>
                                    <span className="text-primary">{initialCategory}</span> Experiences
                                </>
                            ) : (
                                <>
                                    Explore <span className="text-primary">Adventures</span>
                                </>
                            )}
                        </h1>
                        <p className="text-foreground/50 text-lg font-light max-w-2xl mx-auto">
                            Search, filter, and discover authentic Fijian experiences. From misty mountain treks to crystal lagoon snorkeling.
                        </p>
                    </div>

                    {/* Search Bar / Back to All */}
                    <div className="max-w-3xl mx-auto flex items-center gap-4">
                        {initialCategory && (
                            <Link
                                href="/explore"
                                className="h-14 px-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-primary hover:bg-white/10 transition-colors shrink-0"
                                title="Clear category filter"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        )}
                        <div className="flex-1">
                            <SearchBar />
                        </div>
                    </div>

                    {/* Stats + Filter Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-foreground/40 font-tahoma italic">
                            <Stats
                                classNames={{
                                    root: 'text-foreground/40 text-sm',
                                }}
                                translations={{
                                    rootElementText({ nbHits, processingTimeMS }) {
                                        return `${nbHits.toLocaleString()} results found (${processingTimeMS}ms)`;
                                    },
                                }}
                            />
                        </div>
                        <button
                            onClick={() => setFiltersOpen((prev) => !prev)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                'border',
                                filtersOpen
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                            )}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </button>
                    </div>

                    {/* Content Grid */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        {filtersOpen && (
                            <aside className="w-full lg:w-64 shrink-0 space-y-8">
                                <div className="forest-card space-y-8 sticky top-32">
                                    <CategoryFilters attribute="category" />
                                    <PriceFilter attribute="price" />

                                    {/* Operator Filter */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                            <Compass className="w-3.5 h-3.5" /> Operators
                                        </h3>
                                        <CategoryFilters attribute="operatorName" />
                                    </div>
                                </div>
                            </aside>
                        )}

                        {/* Results */}
                        <main className="flex-1 space-y-8">
                            <ActivityResults />

                            {/* Pagination */}
                            <div className="flex justify-center pt-8">
                                <Pagination
                                    classNames={{
                                        root: 'flex items-center gap-2',
                                        item: 'w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
                                        selectedItem: 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(34,197,94,0.15)]',
                                        disabledItem: 'opacity-30 pointer-events-none',
                                        link: 'w-full h-full flex items-center justify-center',
                                    }}
                                />
                            </div>
                        </main>
                    </div>
                </div>
            </InstantSearch>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Compass className="animate-spin h-12 w-12 text-primary" />
            </div>
        }>
            <ExploreContent />
        </Suspense>
    );
}
