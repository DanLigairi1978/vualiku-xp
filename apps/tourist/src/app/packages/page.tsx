import Link from 'next/link';
import { defaultPackages } from '@/lib/packages-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
    title: 'Seasonal Packages & Multi-Day Tours - Vualiku XP',
    description: 'Explore curated multi-day packages across Fiji\'s northern islands. Discover untouched rainforests, eco-retreats, and cultural immersions.',
};

export default function PackagesPage() {
    const activePackages = defaultPackages.filter(p => p.status === 'active');

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Curated Pacific Journeys
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl">
                            Go beyond the single-day excursion. Our multi-day packages combine
                            the best eco-retreats, cultural experiences, and pristine environments
                            across Vanua Levu and surrounding islands into seamless, unforgettable itineraries.
                        </p>
                    </div>
                </div>
            </section>

            {/* Packages Grid */}
            <section className="container mx-auto px-4 md:px-6 -mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {activePackages.map((pkg) => (
                        <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-none shadow-md group flex flex-col">
                            <div className="relative h-[250px] md:h-[300px] w-full overflow-hidden shrink-0">
                                <Image
                                    src={pkg.imageUrl}
                                    alt={pkg.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary font-bold px-3 py-1.5 rounded-full text-sm flex items-center shadow-sm">
                                    <CalendarDays className="w-4 h-4 mr-1.5" />
                                    {pkg.durationDays} Days / {pkg.durationDays - 1} Nights
                                </div>
                            </div>
                            <CardContent className="p-6 md:p-8 flex flex-col flex-1">
                                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-secondary-900 group-hover:text-primary transition-colors">
                                    {pkg.title}
                                </h2>

                                <p className="text-gray-600 mb-6 line-clamp-3">
                                    {pkg.description}
                                </p>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-auto border-t border-gray-100">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                                            Starting From
                                        </p>
                                        <div className="flex items-baseline">
                                            <span className="text-sm font-semibold text-gray-500 mr-1">{pkg.currency}</span>
                                            <span className="text-3xl font-bold text-secondary-900">${pkg.price}</span>
                                            <span className="text-sm text-gray-500 ml-1">/ person</span>
                                        </div>
                                    </div>

                                    <Button asChild size="lg" className="w-full sm:w-auto rounded-full group-hover:bg-primary/90">
                                        <Link href={`/packages/${pkg.id}`}>
                                            View Itinerary
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </main>
    );
}
