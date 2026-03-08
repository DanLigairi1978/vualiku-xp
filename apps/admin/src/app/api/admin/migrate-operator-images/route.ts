import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';

const IMAGE_MAP = [
    { operatorId: 'waisali-nature-experience', operatorName: 'Waisali Nature Experience', imageFile: 'waisali-nature.jpg' },
    { operatorId: 'vorovoro-island', operatorName: 'Vorovoro Island', imageFile: 'vorovoro-island.jpg' },
    { operatorId: 'dromuninuku-heritage', operatorName: 'Dromuninuku Heritage and Tours', imageFile: 'dromuninuku-heritage.jpg' },
    { operatorId: 'drawa-eco-retreat', operatorName: 'Drawa Eco Retreat', imageFile: 'drawa-block.jpg' },
    { operatorId: 'vanualevu-farmstay', operatorName: 'Vanualevu Farmstay', imageFile: 'vanualevu-farmstay.jpg' },
    { operatorId: 'devo-beach', operatorName: 'Devo Beach', imageFile: 'devo-beach.jpg' },
    { operatorId: 'baleyaga-nature', operatorName: 'Baleyaga Nature', imageFile: 'baleyaga-nature.jpg' },
];

function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];

    if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        const sa: ServiceAccount = {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp',
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
        return initializeApp({
            credential: cert(sa),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vualiku-xp.firebasestorage.app',
        });
    }

    return initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vualiku-xp.firebasestorage.app',
    });
}

export async function POST() {
    try {
        const app = getAdminApp();
        const db = getFirestore(app);
        const bucket = getStorage(app).bucket();
        const imagesDir = path.resolve(process.cwd(), 'public/images');

        const results: { name: string; status: string }[] = [];
        let uploaded = 0;
        let skipped = 0;
        let errors = 0;

        for (const entry of IMAGE_MAP) {
            try {
                const docRef = db.collection('operators').doc(entry.operatorId);
                const docSnap = await docRef.get();

                if (docSnap.exists) {
                    const current = docSnap.data()?.heroImageUrl || '';
                    if (current.startsWith('https://firebasestorage') || current.startsWith('https://storage.googleapis.com')) {
                        results.push({ name: entry.operatorName, status: 'skipped' });
                        skipped++;
                        continue;
                    }
                }

                const imagePath = path.join(imagesDir, entry.imageFile);
                if (!fs.existsSync(imagePath)) {
                    results.push({ name: entry.operatorName, status: 'no_image' });
                    skipped++;
                    continue;
                }

                const buffer = fs.readFileSync(imagePath);
                const storagePath = `operators/${entry.operatorId}/hero.jpg`;

                const file = bucket.file(storagePath);
                await file.save(buffer, {
                    metadata: {
                        contentType: 'image/jpeg',
                        cacheControl: 'public, max-age=31536000',
                    },
                });

                await file.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

                await docRef.update({
                    heroImageUrl: publicUrl,
                    heroImageUpdatedAt: FieldValue.serverTimestamp(),
                });

                results.push({ name: entry.operatorName, status: 'uploaded' });
                uploaded++;
            } catch (err: any) {
                results.push({ name: entry.operatorName, status: `error: ${err.message}` });
                errors++;
            }
        }

        return NextResponse.json({ uploaded, skipped, errors, total: IMAGE_MAP.length, results });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
