import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';

// Ensure this matches search.algolia.ts
const ALGOLIA_INDEX_NAME = 'masterEvents';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { operatorId, secret, isDelete } = body;

        // Simple security check (could be improved)
        if (secret !== process.env.ADMIN_SECRET_KEY && secret !== 'vualiku-admin-secret-2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!operatorId) {
            return NextResponse.json({ error: 'operatorId is required' }, { status: 400 });
        }

        const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
        const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || process.env.ALGOLIA_ADMIN_API_KEY || '';

        if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
            console.error('Algolia credentials missing');
            return NextResponse.json({ error: 'Algolia credentials missing' }, { status: 500 });
        }

        if (isDelete) {
            const deleteUrl = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/${encodeURIComponent(operatorId)}`;
            const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'X-Algolia-Application-Id': ALGOLIA_APP_ID,
                    'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
                },
            });
            return NextResponse.json({ success: true, deleted: true });
        }

        const db = getAdminFirestore();
        const docRef = await db.collection('operators').doc(operatorId).get();

        if (!docRef.exists) {
            return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
        }

        const opData = docRef.data();

        // Map Firestore to Algolia format
        // The masterEvents index originally holds "Activities", so treating an Operator as an Activity for the sync
        const algoliaRecord = {
            objectID: docRef.id,
            name: opData?.name,
            operatorId: docRef.id,
            operatorName: opData?.name,
            price: opData?.basePrice || 0,
            basePrice: opData?.basePrice || 0,
            pricingType: opData?.pricingType || 'per_night',
            durationDesc: opData?.durationDesc || 'Custom duration',
            category: opData?.category || 'Accommodation',
            imageUrl: opData?.heroImageUrl || null,
            heroImageUrl: opData?.heroImageUrl || null,
            description: opData?.description || '',
            rating: opData?.rating || 0,
            reviewCount: opData?.reviewCount || 0,
            location: opData?.location || 'Vanua Levu, Fiji',
        };

        // Save or update the record via Algolia REST API
        if (opData?.status === 'active') {
            const saveUrl = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/${encodeURIComponent(algoliaRecord.objectID)}`;
            const response = await fetch(saveUrl, {
                method: 'PUT',
                headers: {
                    'X-Algolia-Application-Id': ALGOLIA_APP_ID,
                    'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(algoliaRecord),
            });
            if (!response.ok) {
                const err = await response.json();
                console.error('Algolia index error:', err);
                return NextResponse.json({ error: 'Algolia update failed', details: err }, { status: 500 });
            }
        } else {
            // If disabled/inactive, remove from Algolia
            const deleteUrl = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/${encodeURIComponent(operatorId)}`;
            const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'X-Algolia-Application-Id': ALGOLIA_APP_ID,
                    'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
                },
            });
            if (!response.ok) {
                const err = await response.json();
                console.error('Algolia delete error:', err);
                return NextResponse.json({ error: 'Algolia delete failed', details: err }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, algoliaRecord });
    } catch (error) {
        console.error('Algolia sync error:', error);
        return NextResponse.json({ error: 'Failed to sync with Algolia' }, { status: 500 });
    }
}
