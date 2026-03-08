import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { defaultPackages, getEventForPackageItem } from '@/lib/packages-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CalendarDays, MapPin, Clock, ShieldCheck } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ packageId: string }> }) {
    const { packageId } = await params;
    const pkg = defaultPackages.find((p) => p.id === packageId);
    if (!pkg) return { title: 'Package Not Found' };
    return { title: `${pkg.title} | Vualiku XP Packages` };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ packageId: string }> }) {
    const { packageId } = await params;
    const pkg = defaultPackages.find((p) => p.id === packageId);

    if (!pkg || pkg.status !== 'active') {
        notFound();
    }

    // Group itinerary items by day
    const itineraryByDay = pkg.itinerary.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
    }, {} as Record<number, typeof pkg.itinerary>);

    const days = Object.keys(itineraryByDay).map(Number).sort((a, b) => a - b);

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* Hero Image Section */}
            <div className="relative h-[40vh] md:h-[60vh] w-full">
                <Image
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-4 md:px-6">
                        <Link href="/packages" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Packages
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl">
                            {pkg.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/90 font-medium">
                            <div className="flex items-center bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                                <CalendarDays className="w-4 h-4 mr-2" />
                                {pkg.durationDays} Days / {pkg.durationDays - 1} Nights
                            </div>
                            <div className="flex items-center bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Vualiku XP Curated
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content: Overview & Itinerary */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Package Overview</h2>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {pkg.description}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-3xl font-bold text-secondary-900 mb-6">Your Itinerary</h2>
                            <div className="space-y-8">
                                {days.map((day) => (
                                    <div key={day} className="relative pl-8 md:pl-0">
                                        {/* Timeline Line (Mobile) */}
                                        <div className="md:hidden absolute top-0 bottom-0 left-[11px] w-0.5 bg-primary/20" />

                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Day Marker */}
                                            <div className="md:w-32 flex-shrink-0 relative z-10">
                                                <div className="md:sticky md:top-24 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg inline-block w-auto shadow-sm">
                                                    Day {day}
                                                </div>
                                                {/* Mobile dot */}
                                                <div className="md:hidden absolute top-3 -left-[27px] w-4 h-4 rounded-full bg-primary border-4 border-gray-50" />
                                            </div>

                                            {/* Activities for the Day */}
                                            <div className="flex-1 space-y-6">
                                                {itineraryByDay[day].map((item, idx) => {
                                                    const eventData = getEventForPackageItem(item.eventId);
                                                    if (!eventData) return null;

                                                    return (
                                                        <Card key={`${day}-${idx}`} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex flex-col sm:flex-row">
                                                                <div className="relative h-48 sm:h-auto sm:w-48 flex-shrink-0">
                                                                    <Image
                                                                        src={eventData.imageUrl || '/images/placeholder.jpg'}
                                                                        alt={item.customName || eventData.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <CardContent className="p-6">
                                                                    <h3 className="text-xl font-bold text-secondary-900 mb-2">
                                                                        {item.customName || eventData.name}
                                                                    </h3>
                                                                    {/* Location removed as it is not on MasterEvent */}
                                                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                                                        {item.customDescription || `${eventData.category || ''} Activity`}
                                                                    </p>

                                                                    <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
                                                                        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
                                                                            <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                                                                            {eventData.durationDesc}
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </div>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-none shadow-xl">
                                <CardContent className="p-6 md:p-8">
                                    <div className="mb-6 pb-6 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                                            Package Price
                                        </p>
                                        <div className="flex items-end gap-1">
                                            <span className="text-lg font-semibold text-gray-500 mb-1">{pkg.currency}</span>
                                            <span className="text-5xl font-bold text-secondary-900">${pkg.price}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">per person</p>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-start text-sm text-gray-600">
                                            <ShieldCheck className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                                            <span>All activities, entrance fees, and standard transport included.</span>
                                        </div>
                                    </div>

                                    <Button size="lg" className="w-full h-14 text-lg rounded-xl shadow-lg border-2 border-primary/20 hover:border-transparent transition-all" asChild>
                                        <Link href={`/checkout?packageId=${pkg.id}`}>
                                            Book This Journey
                                        </Link>
                                    </Button>

                                    <p className="text-center text-xs text-gray-400 mt-4">
                                        Immediate confirmation available.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
