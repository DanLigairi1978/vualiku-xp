import { masterEvents } from '@vualiku/shared';

export interface SeasonalPackage {
    id: string;
    title: string;
    description: string;
    durationDays: number;
    price: number;
    currency: string;
    imageUrl: string;
    validityStart: string; // ISO string
    validityEnd: string;   // ISO string
    itinerary: {
        day: number;
        eventId: string;
        customName?: string;
        customDescription?: string;
    }[];
    status: 'active' | 'draft' | 'expired';
}

// Helper to pull the full event detail for a package item
export function getEventForPackageItem(eventId: string) {
    return masterEvents.find(e => e.id === eventId);
}

// Data seeding: Hardcoded default packages to prototype the UI
export const defaultPackages: SeasonalPackage[] = [
    {
        id: 'pkg_vanualevu_explorer_01',
        title: '3-Day Vanua Levu Eco Explorer',
        description: 'Discover the untouched northern beauty of Fiji. This 3-day holistic package takes you deep into the rainforests of Waisali, the coastal heritage of Dromuninuku, and concludes with a cultural immersion at Vanualevu Farmstay.',
        durationDays: 3,
        price: 350, // Discounted package price
        currency: 'FJD',
        imageUrl: '/images/jungle-trekking.png',
        validityStart: '2026-06-01T00:00:00Z',
        validityEnd: '2026-12-31T23:59:59Z',
        status: 'active',
        itinerary: [
            {
                day: 1,
                eventId: 'evt_waisali_jungle',
                customName: 'Waisali Rainforest Expedition',
            },
            {
                day: 1,
                eventId: 'evt_waisali_hunt',
                customName: 'Traditional Hunting Walk',
            },
            {
                day: 2,
                eventId: 'evt_dromuninuku_culture',
            },
            {
                day: 2,
                eventId: 'evt_dromuninuku_glamp',
                customName: 'Coastal Glamping under the Stars',
            },
            {
                day: 3,
                eventId: 'evt_farmstay_1',
                customName: 'Farm-to-Table Farewell Lunch',
            }
        ]
    },
    {
        id: 'pkg_vorovoro_escape',
        title: 'Vorovoro Weekend Escape',
        description: 'A 2-day island immersion on exclusive Vorovoro Island. Learn traditional skills, trek the highest peaks, and experience true island time.',
        durationDays: 2,
        price: 280,
        currency: 'FJD',
        imageUrl: '/images/island-day-pass.png',
        validityStart: '2026-01-01T00:00:00Z',
        validityEnd: '2026-12-31T23:59:59Z',
        status: 'active',
        itinerary: [
            { day: 1, eventId: 'evt_vor_hike' },
            { day: 1, eventId: 'evt_vor_cook' },
            { day: 1, eventId: 'evt_vorovoro_2', customDescription: 'Spend the night in our beachfront bure.' },
            { day: 2, eventId: 'evt_vor_coco' },
            { day: 2, eventId: 'evt_vor_oil' }
        ]
    }
];
