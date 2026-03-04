'use client';

import { useHits, type UseHitsProps } from 'react-instantsearch';
import { type AlgoliaActivity } from '@/lib/search/algolia';
import { StarRatingDisplay } from '@/components/ui/star-rating';
import { Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useBookingDrawer } from '@/hooks/use-booking-drawer';

export function ActivityResults(props: UseHitsProps<AlgoliaActivity>) {
    const { items } = useHits<AlgoliaActivity>(props);

    if (items.length === 0) {
        return (
            <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                <MapPin className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white/60 mb-2">No Adventures Found</h3>
                <p className="text-foreground/40 text-sm">Try adjusting your search or filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((activity) => (
                <ActivityCard key={activity.objectID} activity={activity} />
            ))}
        </div>
    );
}

function ActivityCard({ activity }: { activity: AlgoliaActivity }) {
    const { openDrawer } = useBookingDrawer();

    return (
        <div className="forest-card flex flex-col group overflow-hidden">
            {/* Image */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4">
                {activity.imageUrl ? (
                    <Image
                        src={activity.imageUrl}
                        alt={activity.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-primary/30" />
                    </div>
                )}

                {/* Category Badge */}
                {activity.category && (
                    <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">
                        {activity.category}
                    </div>
                )}

                {/* Rating Badge */}
                {activity.rating && activity.rating > 0 && (
                    <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full">
                        <StarRatingDisplay value={activity.rating} count={activity.reviewCount} size="sm" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white font-tahoma line-clamp-1">{activity.name}</h3>

                <p className="text-xs text-foreground/50 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary/50" />
                    {activity.operatorName}
                </p>

                {activity.description && (
                    <p className="text-xs text-foreground/40 line-clamp-2 leading-relaxed">
                        {activity.description}
                    </p>
                )}

                <div className="flex items-center gap-4 text-xs text-foreground/40 mt-1">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {activity.durationDesc}
                    </span>
                    {activity.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {activity.location}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div>
                    <span className="text-xl font-bold text-primary font-tahoma">
                        ${activity.price}
                    </span>
                    <span className="text-[10px] text-foreground/40 italic ml-1">
                        / {activity.pricingType === 'per_head' ? 'person' : 'night'}
                    </span>
                </div>
                <Button
                    onClick={() => openDrawer(activity.objectID || activity.name, activity.operatorId)}
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-300"
                >
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
