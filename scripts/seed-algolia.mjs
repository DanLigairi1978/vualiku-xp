/**
 * Algolia Index Seed Script — Vualiku XP
 * 
 * Pushes all MasterEvent records into the Algolia 'masterEvents' index.
 * 
 * Usage:
 *   node scripts/seed-algolia.mjs
 * 
 * Requirements:
 *   - ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY set in .env.local (or pass as env vars)
 *   - npm install dotenv (already in project)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const INDEX_NAME = 'masterEvents';

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY in .env.local');
    process.exit(1);
}

// ─── All MasterEvent records (from booking-data.ts) ─────────────
const masterEvents = [
    // Waisali Nature Experience
    { objectID: 'evt_waisali_zip', operatorId: 'waisali-nature-experience', operatorName: 'Waisali Nature Experience', name: 'Zip Lining', price: 75, pricingType: 'per_head', durationDesc: '2 Hours', slotId: 'Mid-day', imageUrl: '/images/zip-lining.png', category: 'Land & Trekking' },
    { objectID: 'evt_waisali_jungle', operatorId: 'waisali-nature-experience', operatorName: 'Waisali Nature Experience', name: 'Jungle Trekking', price: 50, pricingType: 'per_head', durationDesc: '5 Hours', slotId: 'Morning', imageUrl: '/images/jungle-trekking.png', category: 'Land & Trekking' },
    { objectID: 'evt_waisali_hunt', operatorId: 'waisali-nature-experience', operatorName: 'Waisali Nature Experience', name: 'Hunting & Cooking', price: 65, pricingType: 'per_head', durationDesc: '6 Hours', slotId: 'Evening', imageUrl: '/images/hunting-cooking.png', category: 'Cultural & Workshops' },

    // Vorovoro Island
    { objectID: 'evt_vor_hike', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Four Peaks Hike', price: 40, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Morning', imageUrl: '/images/four-peaks-hike.png', category: 'Land & Trekking' },
    { objectID: 'evt_vor_coco', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Coconut Workshop', price: 25, pricingType: 'per_head', durationDesc: '2 Hours', slotId: 'Afternoon', imageUrl: '/images/coconut-workshop.png', category: 'Cultural & Workshops' },
    { objectID: 'evt_vor_cook', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Cook Fijian-Style', price: 35, pricingType: 'per_head', durationDesc: '3 Hours', slotId: 'Mid-day', imageUrl: '/images/fijian-cooking.png', category: 'Cultural & Workshops' },
    { objectID: 'evt_vor_oil', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Oil & Soap Making', price: 30, pricingType: 'per_head', durationDesc: '2 Hours', slotId: 'Afternoon', imageUrl: '/images/oil-soap-making.png', category: 'Cultural & Workshops' },
    { objectID: 'evt_vorovoro_1', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Island Day Pass', price: 100, pricingType: 'per_head', durationDesc: 'Full Day', slotId: 'Morning', imageUrl: '/images/island-day-pass.png', category: 'Water & Coastal' },
    { objectID: 'evt_vorovoro_2', operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', name: 'Overnight Island Stay', price: 150, pricingType: 'per_night', durationDesc: '24 Hours', slotId: 'Overnight', imageUrl: '/images/overnight-island.png', category: 'Stay & Overnight' },

    // Dromuninuku Heritage
    { objectID: 'evt_dromuninuku_culture', operatorId: 'dromuninuku-heritage', operatorName: 'Dromuninuku Heritage', name: 'Culture Tour', price: 50, pricingType: 'per_head', durationDesc: '3 Hours', slotId: 'Morning', imageUrl: '/images/culture-tour.png', category: 'Cultural & Workshops' },
    { objectID: 'evt_dromuninuku_glamp', operatorId: 'dromuninuku-heritage', operatorName: 'Dromuninuku Heritage', name: 'Beach Glamping', price: 120, pricingType: 'per_night', durationDesc: '24 Hours', slotId: 'Overnight', imageUrl: '/images/beach-glamping.png', category: 'Stay & Overnight' },

    // Drawa Eco Retreat
    { objectID: 'evt_drawa_hike', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'Mountain Hiking', price: 45, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Morning', imageUrl: '/images/mountain-hiking.png', category: 'Land & Trekking' },
    { objectID: 'evt_drawa_horse', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'Horseback Riding', price: 55, pricingType: 'per_head', durationDesc: '3 Hours', slotId: 'Mid-day', imageUrl: '/images/horseback-riding.png', category: 'Land & Trekking' },
    { objectID: 'evt_drawa_raft', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'River Rafting', price: 85, pricingType: 'per_head', durationDesc: '5 Hours', slotId: 'Morning', imageUrl: '/images/river-rafting.png', category: 'Water & Coastal' },
    { objectID: 'evt_drawa_snork', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'Snorkeling', price: 40, pricingType: 'per_head', durationDesc: '2 Hours', slotId: 'Afternoon', imageUrl: '/images/snorkeling.png', category: 'Water & Coastal' },
    { objectID: 'evt_drawa_2', operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', name: 'Jungle Survival Course', price: 120, pricingType: 'per_night', durationDesc: 'Overnight', slotId: 'Overnight', imageUrl: '/images/jungle-survival.png', category: 'Stay & Overnight' },

    // Vanualevu Farmstay
    { objectID: 'evt_farmstay_1', operatorId: 'vanualevu-farmstay', operatorName: 'Vanualevu Farmstay', name: 'Farm Experience & Lunch', price: 75, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Mid-day', imageUrl: '/images/farm-experience.png', category: 'Cultural & Workshops' },
    { objectID: 'evt_farmstay_2', operatorId: 'vanualevu-farmstay', operatorName: 'Vanualevu Farmstay', name: 'Glamping', price: 25, pricingType: 'per_night', durationDesc: 'Overnight', slotId: 'Overnight', imageUrl: '/images/beach-glamping.png', category: 'Stay & Overnight' },

    // Devo Beach
    { objectID: 'evt_devo_1', operatorId: 'devo-beach', operatorName: 'Devo Beach', name: 'Coastal Snorkeling', price: 45, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Afternoon', imageUrl: '/images/snorkeling.png', category: 'Water & Coastal' },

    // Baleyaga Nature
    { objectID: 'evt_baleyaga_trek', operatorId: 'baleyaga-nature', operatorName: 'Baleyaga Nature', name: 'Trekking', price: 30, pricingType: 'per_head', durationDesc: '4 Hours', slotId: 'Morning', imageUrl: '/images/jungle-trekking.png', category: 'Land & Trekking' },
    { objectID: 'evt_baleyaga_prawn', operatorId: 'baleyaga-nature', operatorName: 'Baleyaga Nature', name: 'Prawn Catching', price: 20, pricingType: 'per_head', durationDesc: '3 Hours', slotId: 'Evening', imageUrl: '/images/hunting-cooking.png', category: 'Water & Coastal' },
    { objectID: 'evt_baleyaga_camp', operatorId: 'baleyaga-nature', operatorName: 'Baleyaga Nature', name: 'Camping', price: 60, pricingType: 'per_night', durationDesc: '24 Hours', slotId: 'Overnight', imageUrl: '/images/jungle-survival.png', category: 'Stay & Overnight' },
];

// ─── Push to Algolia using REST API (no SDK needed for scripting) ──
async function seedAlgolia() {
    console.log(`\n🔍 Algolia Seed Script — Vualiku XP`);
    console.log(`   App ID: ${ALGOLIA_APP_ID}`);
    console.log(`   Index:  ${INDEX_NAME}`);
    console.log(`   Records: ${masterEvents.length}\n`);

    const url = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${INDEX_NAME}/batch`;

    const body = {
        requests: masterEvents.map((record) => ({
            action: 'addObject',
            body: record,
        })),
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Algolia-Application-Id': ALGOLIA_APP_ID,
                'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.ok) {
            console.log(`✅ Successfully indexed ${masterEvents.length} records!`);
            console.log(`   Task ID: ${data.taskID}`);
            console.log(`   Object IDs: ${data.objectIDs?.length || 0} indexed`);

            // Configure searchable attributes and facets
            console.log('\n⚙️  Configuring index settings...');

            const settingsUrl = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${INDEX_NAME}/settings`;
            const settingsRes = await fetch(settingsUrl, {
                method: 'PUT',
                headers: {
                    'X-Algolia-Application-Id': ALGOLIA_APP_ID,
                    'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchableAttributes: ['name', 'operatorName', 'category', 'durationDesc'],
                    attributesForFaceting: ['category', 'operatorName', 'pricingType', 'slotId', 'filterOnly(price)'],
                    customRanking: ['asc(price)'],
                    attributesToRetrieve: ['objectID', 'operatorId', 'operatorName', 'name', 'price', 'pricingType', 'durationDesc', 'slotId', 'imageUrl', 'category'],
                }),
            });

            if (settingsRes.ok) {
                console.log('✅ Index settings configured (searchable attrs, facets, ranking)');
            } else {
                const err = await settingsRes.json();
                console.error('⚠️  Settings update failed:', err.message);
            }

        } else {
            console.error('❌ Indexing failed:', data.message);
        }
    } catch (err) {
        console.error('❌ Error:', err);
    }

    console.log('\n🎉 Done! Visit https://dashboard.algolia.com to verify.\n');
}

seedAlgolia();
