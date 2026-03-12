'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { tourCompanies, type TourCompany, PlaceHolderImages } from '@danligairi1978/shared';
import { Waves, Mountain, Compass, Moon, ArrowRight } from 'lucide-react';
import { useBookingDrawer } from '@/hooks/use-booking-drawer';
import { StarRatingDisplay } from '@/components/ui/star-rating';
import { cn } from '@/lib/utils';
import { useSiteContent } from '@/hooks/useSiteContent';

// Movement / Mood Options
const MOODS = [
  {
    id: 'water',
    title: 'Water',
    subtitle: 'Coastal & Snorkeling',
    category: 'Water & Coastal',
    icon: Waves,
    image: '/images/snorkeling.png',
    color: 'from-blue-600/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'mountain',
    title: 'Mountain',
    subtitle: 'Trekking & Heights',
    category: 'Mountain & Trekking',
    icon: Mountain,
    image: '/images/mountain-hiking.png',
    color: 'from-green-600/20 to-emerald-500/20',
    borderColor: 'border-green-500/30'
  },
  {
    id: 'culture',
    title: 'Culture',
    subtitle: 'Heritage & Traditions',
    category: 'Cultural & Heritage',
    icon: Compass,
    image: '/images/culture-tour.png',
    color: 'from-amber-600/20 to-orange-500/20',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'retreat',
    title: 'Stay',
    subtitle: 'Overnights & Glamping',
    category: 'Stay & Overnight',
    icon: Moon,
    image: '/images/beach-glamping.png',
    color: 'from-purple-600/20 to-indigo-500/20',
    borderColor: 'border-purple-500/30'
  }
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-fiji');
  const { openDrawer } = useBookingDrawer();
  const { homepage, global, loading } = useSiteContent();

  return (
    <div className="flex flex-col bg-background min-h-screen text-white overflow-hidden selection:bg-primary/30">
      {/* Misty Background Layer */}
      <div className="fixed inset-0 misty-bg opacity-80 pointer-events-none" />

      {/* Announcement Banner */}
      {homepage.announcement.enabled && homepage.announcement.text && (
        <div className="relative z-50 py-2.5 px-4 text-center text-sm font-bold" style={{ backgroundColor: homepage.announcement.color || '#2D6A4F' }}>
          {homepage.announcement.link ? (
            <Link href={homepage.announcement.link} className="text-white hover:underline">{homepage.announcement.text}</Link>
          ) : (
            <span className="text-white">{homepage.announcement.text}</span>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-4">
        {/* Main Hero Background - Jungle Theme */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background z-10" />
          {heroImage && (
            <Image
              src={homepage.hero.heroImageUrl || heroImage.imageUrl}
              alt="Jungle Forest"
              fill
              className="object-cover opacity-20 mix-blend-overlay scale-105 animate-slow-zoom"
              priority
              unoptimized
            />
          )}
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl px-6 text-center space-y-12">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-center gap-3 text-primary/60 mb-8">
              <span className="h-[1px] w-8 bg-primary/30" />
              <span className="text-[12px] font-bold tracking-[0.4em] uppercase">Vualiku XP</span>
              <span className="h-[1px] w-8 bg-primary/30" />
            </div>

            <h1 className="text-5xl md:text-9xl font-bold tracking-tighter leading-[0.9] text-shadow-2xl font-tahoma uppercase italic">
              {homepage.hero.headline.includes(' ') ? (
                <>
                  {homepage.hero.headline.split(' ').slice(0, -1).join(' ')} <br />
                  <span className="text-primary not-italic">{homepage.hero.headline.split(' ').slice(-1)[0]}</span>
                </>
              ) : (
                <span className="text-primary not-italic">{homepage.hero.headline}</span>
              )}
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-2xl text-foreground/60 font-light leading-relaxed font-tahoma">
              {homepage.hero.subheadline}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Button asChild size="lg" className="btn-forest h-16 px-12 text-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all">
              <Link href={homepage.hero.ctaLink || '/explore'}>
                {homepage.hero.ctaText || 'START YOUR STORY'}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="h-16 px-12 text-lg border border-white/10 hover:bg-white/5 transition-all">
              <Link href="/about">
                WATCH FILM
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative Floating Elements */}
        <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-accent/5 rounded-full blur-[150px] animate-pulse delay-700" />
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary font-tahoma">{homepage.stats.tours}+</p>
              <p className="text-sm text-foreground/50 mt-1 font-light">Unique Tours</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary font-tahoma">{homepage.stats.operators}</p>
              <p className="text-sm text-foreground/50 mt-1 font-light">Local Operators</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary font-tahoma">{homepage.stats.happyGuests}+</p>
              <p className="text-sm text-foreground/50 mt-1 font-light">Happy Guests</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary font-tahoma">{homepage.stats.yearsExperience}</p>
              <p className="text-sm text-foreground/50 mt-1 font-light">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Discover by Mood Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold font-tahoma tracking-tighter uppercase italic">Discover Your <span className="text-primary not-italic">Mood</span></h2>
            <p className="text-foreground/50 text-lg font-light max-w-xl mx-auto italic">How do you want to feel today?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOODS.map((mood) => (
              <Link
                key={mood.id}
                href={`/explore?category=${encodeURIComponent(mood.category)}`}
                className="group relative h-[450px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={mood.image}
                    alt={mood.title}
                    fill
                    className="object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className={cn("absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90", mood.color)} />
                </div>

                {/* Content */}
                <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end items-center text-center space-y-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border backdrop-blur-md mb-2 group-hover:scale-110 transition-transform duration-500", mood.borderColor, mood.color)}>
                    <mood.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold font-tahoma tracking-tight uppercase italic">{mood.title}</h3>
                    <p className="text-sm text-foreground/60 font-light">{mood.subtitle}</p>
                  </div>
                  <div className="pt-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">
                      Explore Now <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {homepage.testimonials.length > 0 && (
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold font-tahoma tracking-tighter uppercase italic">What Guests <span className="text-primary not-italic">Say</span></h2>
              <p className="text-foreground/50 text-lg font-light max-w-xl mx-auto italic">Real stories from real adventurers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {homepage.testimonials.slice(0, 3).map((t, i) => (
                <div key={i} className="forest-card p-8 space-y-4">
                  <StarRatingDisplay value={t.rating} />
                  <p className="text-foreground/80 font-light italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="pt-4 border-t border-white/10">
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-xs text-foreground/50">{t.location}{t.date ? ` · ${t.date}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Operator Banner */}
      <section className="py-24 relative z-10 bg-primary/5 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">
                <Compass className="w-4 h-4" /> Operator Highlight
              </div>
              <h2 className="text-4xl md:text-7xl font-bold font-tahoma tracking-tighter leading-none uppercase">Drawa Eco <br /><span className="text-primary italic">Retreat</span></h2>
              <p className="text-xl text-foreground/70 font-light leading-relaxed">
                Vanua Levu&apos;s crown jewel. A community-owned project protecting 10,000 acres of pristine rainforest.
                Experience trekking, rafting, and authentic stays like nowhere else on Earth.
              </p>
              <Button
                onClick={() => openDrawer('evt_drawa_raft', 'drawa-eco-retreat')}
                size="lg"
                className="h-14 px-8 border border-primary/50 text-white bg-transparent hover:bg-primary/10 transition-all font-bold"
              >
                View Expedition Details
              </Button>
            </div>
            <div className="w-full md:w-1/2 relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/images/jungle-survival.png"
                alt="Drawa Rainforest"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
