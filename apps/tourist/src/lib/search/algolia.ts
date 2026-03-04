// Algolia Client Configuration — Vualiku XP
// See SEARCH_NOTES.md for why Algolia was chosen over Firestore search

import { liteClient as algoliasearch } from 'algoliasearch/lite';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '';

export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

export const ALGOLIA_INDEX_NAME = 'masterEvents';

/**
 * Shape of an activity record in the Algolia index.
 * Must match the schema pushed by the Firebase Algolia Extension or manual sync.
 */
export interface AlgoliaActivity {
    objectID: string;
    name: string;
    operatorId: string;
    operatorName: string;
    price: number;
    pricingType: 'per_head' | 'per_night';
    durationDesc: string;
    category: string;
    imageUrl?: string;
    description?: string;
    rating?: number;
    reviewCount?: number;
    location?: string;
}
