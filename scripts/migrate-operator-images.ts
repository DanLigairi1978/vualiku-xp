/**
 * Migration Script: Upload operator hero images to Firebase Storage
 * and update Firestore heroImageUrl fields.
 *
 * Usage: npx ts-node scripts/migrate-operator-images.ts
 *
 * Requires env vars:
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 */

import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';

// ——— Firebase Admin init ———
function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];

    const sa: ServiceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp',
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '',
        privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    return initializeApp({
        credential: cert(sa),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vualiku-xp.firebasestorage.app',
    });
}

// ——— Image-to-operator mapping ———
const IMAGE_MAP: { operatorId: string; operatorName: string; imageFile: string }[] = [
    { operatorId: 'waisali-nature-experience', operatorName: 'Waisali Nature Experience', imageFile: 'waisali-nature.jpg' },
    { operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', imageFile: 'vorovoro-island.jpg' },
    { operatorId: 'dromuninuku-heritage', operatorName: 'Dromuninuku Heritage and Tours', imageFile: 'dromuninuku-heritage.jpg' },
    { operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', imageFile: 'drawa-block.jpg' },
    { operatorId: 'vanualevu-farmstay', operatorName: 'Vanualevu Farmstay', imageFile: 'vanualevu-farmstay.jpg' },
    { operatorId: 'devo-beach', operatorName: 'Devo Beach', imageFile: 'devo-beach.jpg' },
    { operatorId: 'baleyaga-nature', operatorName: 'Baleyaga Nature', imageFile: 'baleyaga-nature.jpg' },
];

async function migrateImages() {
    const app = getAdminApp();
    const db = getFirestore(app);
    const bucket = getStorage(app).bucket();

    const imagesDir = path.resolve(__dirname, '../apps/tourist/public/images');

    console.log('=== OPERATOR IMAGE MIGRATION ===');
    console.log(`Images directory: ${imagesDir}\n`);

    let uploaded = 0;
    let skipped = 0;
    let errors = 0;

    for (const entry of IMAGE_MAP) {
        try {
            // Check if operator doc exists and already has a valid URL
            const docRef = db.collection('operators').doc(entry.operatorId);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const current = docSnap.data()?.heroImageUrl || '';
                if (current.startsWith('https://firebasestorage') || current.startsWith('https://storage.googleapis.com')) {
                    console.log(`  ⏭️  Skipped: ${entry.operatorName} (already has Firebase Storage URL)`);
                    skipped++;
                    continue;
                }
            }

            // Read local image
            const imagePath = path.join(imagesDir, entry.imageFile);
            if (!fs.existsSync(imagePath)) {
                console.log(`  ⚠️  No image found for: ${entry.operatorName} (${entry.imageFile})`);
                skipped++;
                continue;
            }

            const buffer = fs.readFileSync(imagePath);
            const storagePath = `operators/${entry.operatorId}/hero.jpg`;

            // Upload to Firebase Storage
            const file = bucket.file(storagePath);
            await file.save(buffer, {
                metadata: {
                    contentType: 'image/jpeg',
                    cacheControl: 'public, max-age=31536000',
                },
            });

            // Make publicly readable
            await file.makePublic();

            // Get public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

            // Update Firestore
            await docRef.update({
                heroImageUrl: publicUrl,
                heroImageUpdatedAt: FieldValue.serverTimestamp(),
            });

            console.log(`  ✅ Uploaded and linked: ${entry.operatorName}`);
            uploaded++;
        } catch (err: any) {
            console.log(`  ❌ Error uploading: ${entry.operatorName} — ${err.message}`);
            errors++;
        }
    }

    console.log(`\n=== MIGRATION COMPLETE ===`);
    console.log(`  Uploaded: ${uploaded}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Errors:   ${errors}`);
    console.log(`  Total:    ${IMAGE_MAP.length}`);
}

migrateImages().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
