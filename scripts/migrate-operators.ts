/**
 * Migration Script: Import hardcoded tourCompanies into Firestore operators/ collection.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/migrate-operators.ts
 *
 * Or run the "Import Legacy Operators" button in Admin → Operator Hub.
 *
 * Behaviour:
 *   - For each tourCompany, checks Firestore for existing operator with same name (case-insensitive)
 *   - If NOT found → creates new document in operators/ with status: 'active' + migratedFromHardcode: true
 *   - If found → skips it (does not overwrite admin-managed data)
 */

import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ——— Firebase Admin init ———
function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];

    if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        const sa: ServiceAccount = {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp',
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
        return initializeApp({ credential: cert(sa) });
    }

    return initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp' });
}

// ——— Hardcoded data ———
const tourCompanies = [
    {
        id: 'waisali-nature-experience',
        name: 'Waisali Nature Experience',
        description: 'Explore pristine rainforests and stunning waterfalls in the heart of Vanua Levu. A true eco-adventure.',
        imageId: 'waisali-nature',
    },
    {
        id: 'vorovoro-island',
        name: 'Vorovoro Island',
        description: 'Experience authentic island life. Learn from the local community, snorkel in clear waters, and relax on sandy beaches.',
        imageId: 'vorovoro-island',
    },
    {
        id: 'dromuninuku-heritage',
        name: 'Dromuninuku Heritage and Tours',
        description: 'Step back in time and immerse yourself in Fijian culture, history, and traditions with the people of Dromuninuku.',
        imageId: 'dromuninuku-heritage',
    },
    {
        id: 'drawa-eco-retreat',
        name: 'Drawa Eco Retreat',
        description: 'Deep in the heart of Vanua Levu, the Drawa Eco Retreat protects pristine rainforests while offering immersive jungle trekking, river rafting, and authentic stays.',
        imageId: 'drawa-block',
    },
    {
        id: 'vanualevu-farmstay',
        name: 'Vanualevu Farmstay',
        description: 'Discover the agricultural heart of Fiji. Participate in farm activities, enjoy fresh local food, and relax in a rural setting.',
        imageId: 'vanualevu-farmstay',
    },
    {
        id: 'devo-beach',
        name: 'Devo Beach',
        description: 'Explore the flora and fauna of the Tunuloa Peninsula including Bird watching.',
        imageId: 'devo-beach',
    },
    {
        id: 'baleyaga-nature',
        name: 'Baleyaga Nature',
        description: 'Trekking and eco-activities.',
        imageId: 'baleyaga-nature',
    },
];

// ——— Migration ———
async function migrateOperators() {
    const app = getAdminApp();
    const db = getFirestore(app);

    console.log('=== OPERATOR MIGRATION ===');
    console.log(`Found ${tourCompanies.length} hardcoded operators to check.\n`);

    // Fetch all existing operators
    const existingSnap = await db.collection('operators').get();
    const existingNames = new Set(
        existingSnap.docs.map(d => (d.data().name || '').toLowerCase())
    );

    let migrated = 0;
    let skipped = 0;

    for (const op of tourCompanies) {
        if (existingNames.has(op.name.toLowerCase())) {
            console.log(`  Skipped: ${op.name} (exists)`);
            skipped++;
            continue;
        }

        await db.collection('operators').doc(op.id).set({
            name: op.name,
            description: op.description,
            location: 'Vanua Levu, Fiji',
            heroImageUrl: '',
            basePrice: 0,
            capacity: 10,
            status: 'active',
            activities: [],
            contactEmail: '',
            phone: '',
            createdAt: FieldValue.serverTimestamp(),
            migratedFromHardcode: true,
        });

        console.log(`  Migrated: ${op.name}`);
        migrated++;
    }

    console.log(`\n=== COMPLETE ===`);
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Total:    ${tourCompanies.length}`);
}

migrateOperators().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
