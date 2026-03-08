import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { tourCompanies, type TourCompany, PlaceHolderImages } from '@vualiku/shared';
import Link from 'next/link';
import { getAdminFirestore } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tour Directory — Verified Partners',
  description:
    'Browse verified eco-tourism operators in Fiji. Adventure tours, cultural experiences, water sports, and overnight expeditions in Vanua Levu.',
};

export default async function DirectoryPage() {
  const db = getAdminFirestore();
  const snapshot = await db.collection('operators')
    .where('status', '==', 'active')
    // We can't rely on orderBy createdAt here if an index doesn't exist, so we will order in memory
    .get();

  let operators = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

  if (operators.length > 0) {
    operators.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  } else {
    operators = [...tourCompanies];
  }

  return (
    <div className="bg-background min-h-screen text-white pt-32 pb-24 overflow-hidden selection:bg-primary/30">
      {/* Misty Background Layer */}
      <div className="fixed inset-0 misty-bg opacity-70 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3 text-primary/60">
              <span className="h-[1px] w-8 bg-primary/30" />
              <span className="text-[12px] font-bold tracking-[0.4em] uppercase">Tour Directory</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none">
              Verified <br /> <span className="text-primary italic">Partners</span>
            </h1>
            <p className="text-foreground/50 text-xl font-light leading-relaxed">
              Every coordinate represents a community startup.
              Tours are ready for your arrival.
            </p>
          </div>

          <div className="md:border-l border-primary/10 pl-8 hidden lg:block">
            <div className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-30 mb-4">Signal Integrity</div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-bold text-shadow-sm">SECTORS SECURED</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {operators.map((company: any, index: number) => {
            const staticImage = company.imageId ? PlaceHolderImages.find((p) => p.id === company.imageId)?.imageUrl : null;
            const imageUrl = company.heroImageUrl || staticImage || '/images/tours/drawa-forest.jpg';

            return (
              <div
                key={company.id || company.name}
                className="forest-card group flex flex-col gap-6"
              >
                <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-slate-900 border border-slate-800">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={company.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized={imageUrl.startsWith('http')}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    <span className="text-[10px] font-bold tracking-widest text-white/60">ACTIVE TOUR</span>
                  </div>
                </div>

                <div className="space-y-4 flex-grow flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <div className="text-xs font-bold text-primary/60">
                      #{index + 1}
                    </div>
                  </div>

                  <p className="text-sm text-foreground/50 font-light leading-relaxed line-clamp-3">
                    {company.description}
                  </p>

                  <div className="pt-6 mt-auto">
                    <Button asChild className="btn-forest w-full h-12 text-sm">
                      <Link href={company.bookingLink || `/directory`}>
                        BOOK TOUR
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
