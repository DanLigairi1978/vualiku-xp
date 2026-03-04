// JSON-LD Structured Data Generator — Vualiku XP
// Generates valid JSON-LD for TouristAttraction, Event, and Organization schemas
// Used across all pages for SEO

export interface TouristAttractionSchema {
    name: string;
    description: string;
    image?: string;
    address?: string;
    geo?: { latitude: number; longitude: number };
    url?: string;
    aggregateRating?: { ratingValue: number; reviewCount: number };
}

export interface EventSchema {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    location: string;
    image?: string;
    price?: number;
    currency?: string;
    organizer?: string;
    url?: string;
}

export interface OrganizationSchema {
    name: string;
    description: string;
    url: string;
    logo?: string;
    email?: string;
    phone?: string;
    address?: string;
    sameAs?: string[];
}

export function generateJsonLd(
    type: 'TouristAttraction' | 'Event' | 'Organization',
    data: TouristAttractionSchema | EventSchema | OrganizationSchema
): Record<string, unknown> {
    switch (type) {
        case 'TouristAttraction': {
            const d = data as TouristAttractionSchema;
            return {
                '@context': 'https://schema.org',
                '@type': 'TouristAttraction',
                name: d.name,
                description: d.description,
                ...(d.image && { image: d.image }),
                ...(d.url && { url: d.url }),
                ...(d.address && {
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: d.address,
                        addressCountry: 'FJ',
                    },
                }),
                ...(d.geo && {
                    geo: {
                        '@type': 'GeoCoordinates',
                        latitude: d.geo.latitude,
                        longitude: d.geo.longitude,
                    },
                }),
                ...(d.aggregateRating && {
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: d.aggregateRating.ratingValue,
                        reviewCount: d.aggregateRating.reviewCount,
                        bestRating: 5,
                        worstRating: 1,
                    },
                }),
                isAccessibleForFree: false,
                touristType: ['Eco-tourism', 'Adventure tourism', 'Cultural tourism'],
            };
        }

        case 'Event': {
            const d = data as EventSchema;
            return {
                '@context': 'https://schema.org',
                '@type': 'Event',
                name: d.name,
                description: d.description,
                startDate: d.startDate,
                ...(d.endDate && { endDate: d.endDate }),
                ...(d.image && { image: d.image }),
                ...(d.url && { url: d.url }),
                location: {
                    '@type': 'Place',
                    name: d.location,
                    address: {
                        '@type': 'PostalAddress',
                        addressCountry: 'FJ',
                    },
                },
                ...(d.organizer && {
                    organizer: {
                        '@type': 'Organization',
                        name: d.organizer,
                    },
                }),
                ...(d.price !== undefined && {
                    offers: {
                        '@type': 'Offer',
                        price: d.price,
                        priceCurrency: d.currency || 'FJD',
                        availability: 'https://schema.org/InStock',
                    },
                }),
                eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            };
        }

        case 'Organization': {
            const d = data as OrganizationSchema;
            return {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: d.name,
                description: d.description,
                url: d.url,
                ...(d.logo && { logo: d.logo }),
                ...(d.email && { email: d.email }),
                ...(d.phone && { telephone: d.phone }),
                ...(d.address && {
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: d.address,
                        addressCountry: 'FJ',
                    },
                }),
                ...(d.sameAs && { sameAs: d.sameAs }),
                areaServed: {
                    '@type': 'Country',
                    name: 'Fiji',
                },
            };
        }
    }
}

/**
 * Generate the Vualiku XP organization JSON-LD (used on every page)
 */
export function generateSiteJsonLd(): Record<string, unknown> {
    return generateJsonLd('Organization', {
        name: 'Vualiku XP',
        description:
            'Community-led eco-tourism booking platform for authentic Fijian adventure experiences in the Pacific Islands.',
        url: 'https://vualiku-xp.web.app',
        logo: 'https://vualiku-xp.web.app/icons/icon-512x512.png',
        address: 'Vanua Levu, Fiji',
        sameAs: [],
    });
}
