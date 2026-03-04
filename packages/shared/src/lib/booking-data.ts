export const pointsOfOrigin = [
    { id: 'LBS', label: 'Labasa Airport (LBS)', category: 'Airports' },
    { id: 'SVU', label: 'Savusavu Airport (SVU)', category: 'Airports' },
    { id: 'NAN', label: 'Nadi International (NAN)', category: 'Airports' },
    { id: 'SUV', label: 'Nausori/Suva (SUV)', category: 'Airports' },
    { id: 'Nabouwalu', label: 'Nabouwalu Jetty', category: 'Ferry Terminals' },
    { id: 'SavusavuWharf', label: 'Savusavu Wharf', category: 'Ferry Terminals' },
    { id: 'Natovi', label: 'Natovi Jetty', category: 'Ferry Terminals' },
    { id: 'LabasaTown', label: 'Labasa Town', category: 'Major Hubs' },
    { id: 'SavusavuTown', label: 'Savusavu Town', category: 'Major Hubs' },
    { id: 'Seaqaqa', label: 'Seaqaqa', category: 'Major Hubs' },
    { id: 'Other', label: 'Other (Custom)', category: 'Custom' },
];

export type TimeSlotId = 'Morning' | 'Mid-day' | 'Afternoon' | 'Evening' | 'Overnight';

export interface TimeSlot {
    id: TimeSlotId;
    label: string;
    order: number;
}

export const standardSlots: Record<TimeSlotId, TimeSlot> = {
    'Morning': { id: 'Morning', label: 'Morning (8 AM - 12 PM)', order: 1 },
    'Mid-day': { id: 'Mid-day', label: 'Mid-day (12 PM - 2 PM)', order: 2 },
    'Afternoon': { id: 'Afternoon', label: 'Afternoon (2 PM - 6 PM)', order: 3 },
    'Evening': { id: 'Evening', label: 'Evening (6 PM - 10 PM)', order: 4 },
    'Overnight': { id: 'Overnight', label: 'Overnight / 24 Hours', order: 5 },
};

export interface MasterEvent {
    id: string;
    operatorId: string;
    operatorName: string;
    name: string;
    price: number;
    pricingType: 'per_head' | 'per_night';
    durationDesc: string;
    slotId: TimeSlotId;
    imageUrl?: string;
    category?: string;
}

// Master list of events mapped to standard slots and durations
export const masterEvents: MasterEvent[] = [
    // Waisali Nature Experience
    { id: 'evt_waisali_zip', operatorId: 'waisali-nature-experience', operatorName: 'Waisali Nature Experience', name: 'Zip Lining', price: 75, pricingType: 'per_head', durationDesc: '2 Hours', slotId: 'Mid-day', imageUrl: '/images/zip-lining.png', category: 'Land & Trekking' },
    { id: 'evt_waisali_jungle', operatorId: 'waisali-nature-experience', operatorName: 'Waisali Nature Experience', name: 'Jungle Trekking', price: 50, pricingType: 'per_head', durationDesc: '5 Hours', slotId: 'Morning', imageUrl: '/images/jungle-trekking.png', category: 'Land & Trekking' },
    { id: 'evt_waisali_hunt', operatorId: 'waisali-nature-experience', operatorName: 'Waisali Nature Experience', name: 'Hunting & Cooking', price: 65, pricingType: 'per_head', durationDesc: '6 Hours', slotId: 'Evening', imageUrl: '/images/hunting-cooking.png', category: 'Cultural & Workshops' },

    // Vorovoro Island
    { id: 'evt_vor_hike', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Four Peaks Hike', price: 40, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Morning', imageUrl: '/images/four-peaks-hike.png', category: 'Land & Trekking' },
    { id: 'evt_vor_coco', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Coconut Workshop', price: 25, pricingType: 'per_head', durationDesc: '2 Hours', slotId: 'Afternoon', imageUrl: '/images/coconut-workshop.png', category: 'Cultural & Workshops' },
    { id: 'evt_vor_cook', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Cook Fijian-Style', price: 35, pricingType: 'per_head', durationDesc: '3 Hours', slotId: 'Mid-day', imageUrl: '/images/fijian-cooking.png', category: 'Cultural & Workshops' },
    { id: 'evt_vor_oil', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Oil & Soap Making', price: 30, pricingType: 'per_head', durationDesc: '2 Hours', slotId: 'Afternoon', imageUrl: '/images/oil-soap-making.png', category: 'Cultural & Workshops' },
    { id: 'evt_vorovoro_1', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Island Day Pass', price: 100, pricingType: 'per_head', durationDesc: 'Full Day', slotId: 'Morning', imageUrl: '/images/island-day-pass.png', category: 'Water & Coastal' },
    { id: 'evt_vorovoro_2', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Overnight Island Stay', price: 150, pricingType: 'per_night', durationDesc: '24 Hours', slotId: 'Overnight', imageUrl: '/images/overnight-island.png', category: 'Stay & Overnight' },

    // Dromuninuku Heritage
    { id: 'evt_dromuninuku_culture', operatorId: 'dromuninuku-heritage', operatorName: 'Dromuninuku Heritage', name: 'Culture Tour', price: 50, pricingType: 'per_head', durationDesc: '3 Hours', slotId: 'Morning', imageUrl: '/images/culture-tour.png', category: 'Cultural & Workshops' },
    { id: 'evt_dromuninuku_glamp', operatorId: 'dromuninuku-heritage', operatorName: 'Dromuninuku Heritage', name: 'Beach Glamping', price: 120, pricingType: 'per_night', durationDesc: '24 Hours', slotId: 'Overnight', imageUrl: '/images/beach-glamping.png', category: 'Stay & Overnight' },

    // Drawa Eco Retreat
    { id: 'evt_drawa_hike', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'Mountain Hiking', price: 45, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Morning', imageUrl: '/images/mountain-hiking.png', category: 'Land & Trekking' },
    { id: 'evt_drawa_horse', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'Horseback Riding', price: 55, pricingType: 'per_head', durationDesc: '3 Hours', slotId: 'Mid-day', imageUrl: '/images/horseback-riding.png', category: 'Land & Trekking' },
    { id: 'evt_drawa_raft', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'River Rafting', price: 85, pricingType: 'per_head', durationDesc: '5 Hours', slotId: 'Morning', imageUrl: '/images/river-rafting.png', category: 'Water & Coastal' },
    { id: 'evt_drawa_snork', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'Snorkeling', price: 40, pricingType: 'per_head', durationDesc: '2 Hours', slotId: 'Afternoon', imageUrl: '/images/snorkeling.png', category: 'Water & Coastal' },
    { id: 'evt_drawa_2', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'Jungle Survival Course', price: 120, pricingType: 'per_night', durationDesc: 'Overnight', slotId: 'Overnight', imageUrl: '/images/jungle-survival.png', category: 'Stay & Overnight' },

    // Vanualevu Farmstay
    { id: 'evt_farmstay_1', operatorId: 'vanualevu-farmstay', operatorName: 'Vanualevu Farmstay', name: 'Farm Experience & Lunch', price: 75, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Mid-day', imageUrl: '/images/farm-experience.png', category: 'Cultural & Workshops' },
    { id: 'evt_farmstay_2', operatorId: 'vanualevu-farmstay', operatorName: 'Vanualevu Farmstay', name: 'Glamping', price: 25, pricingType: 'per_night', durationDesc: 'Overnight', slotId: 'Overnight', imageUrl: '/images/beach-glamping.png', category: 'Stay & Overnight' },

    // Devo Beach
    { id: 'evt_devo_1', operatorId: 'devo-beach', operatorName: 'Devo Beach', name: 'Coastal Snorkeling', price: 45, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Afternoon', imageUrl: '/images/snorkeling.png', category: 'Water & Coastal' },

    // Baleyaga Nature
    { id: 'evt_baleyaga_trek', operatorId: 'baleyaga-nature', operatorName: 'Baleyaga Nature', name: 'Trekking', price: 30, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Morning', imageUrl: '/images/jungle-trekking.png', category: 'Land & Trekking' },
    { id: 'evt_baleyaga_prawn', operatorId: 'baleyaga-nature', operatorName: 'Baleyaga Nature', name: 'Prawn Catching', price: 20, pricingType: 'per_head', durationDesc: '3 Hours', slotId: 'Evening', imageUrl: '/images/hunting-cooking.png', category: 'Water & Coastal' },
    { id: 'evt_baleyaga_camp', operatorId: 'baleyaga-nature', operatorName: 'Baleyaga Nature', name: 'Camping', price: 60, pricingType: 'per_night', durationDesc: '24 Hours', slotId: 'Overnight', imageUrl: '/images/jungle-survival.png', category: 'Stay & Overnight' },
];

// Mock travel times in minutes
export const travelTimesMap: Record<string, Record<string, number>> = {
    'LBS': { 'waisali-nature-experience': 60, 'vorovoro-island': 90, 'dromuninuku-heritage': 120, 'drawa-eco-retreat': 150, 'vanualevu-farmstay': 45, 'devo-beach': 100, 'baleyaga-nature': 50 },
    'SVU': { 'waisali-nature-experience': 30, 'vorovoro-island': 120, 'dromuninuku-heritage': 60, 'drawa-eco-retreat': 180, 'vanualevu-farmstay': 75, 'devo-beach': 40, 'baleyaga-nature': 90 },
    // ... others can be added as needed. Default fallback will be 60 mins.
};

export function getEstimatedTravelTime(originId: string, destOperatorId: string): number {
    if (travelTimesMap[originId] && travelTimesMap[originId][destOperatorId]) {
        return travelTimesMap[originId][destOperatorId];
    }
    return 60; // 1 hour fallback
}
