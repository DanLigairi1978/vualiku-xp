// Reviews Utilities — Vualiku XP
// Firestore queries for fetching and aggregating reviews

import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    limit,
    type DocumentData,
    type Firestore,
} from 'firebase/firestore';

export interface Review {
    id: string;
    bookingId: string;
    rating: number;
    title: string;
    text: string;
    reviewerName: string;
    photoUrls: string[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    operatorId?: string;
    eventName?: string;
}

export interface AggregatedRating {
    average: number;
    count: number;
    distribution: [number, number, number, number, number]; // 1-star to 5-star counts
}

/**
 * Fetch approved reviews for a specific operator
 */
export async function getOperatorReviews(
    db: Firestore,
    operatorId: string,
    maxCount = 20
): Promise<Review[]> {
    const q = query(
        collection(db, 'reviews'),
        where('operatorId', '==', operatorId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(maxCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToReview);
}

/**
 * Fetch all approved reviews (for homepage, limited)
 */
export async function getRecentReviews(db: Firestore, maxCount = 10): Promise<Review[]> {
    const q = query(
        collection(db, 'reviews'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(maxCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToReview);
}

/**
 * Calculate aggregated rating from reviews
 */
export function aggregateRatings(reviews: Review[]): AggregatedRating {
    if (reviews.length === 0) {
        return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
    }

    const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    let total = 0;

    for (const review of reviews) {
        if (review.rating >= 1 && review.rating <= 5) {
            distribution[review.rating - 1]++;
            total += review.rating;
        }
    }

    return {
        average: Math.round((total / reviews.length) * 10) / 10,
        count: reviews.length,
        distribution,
    };
}

function docToReview(doc: DocumentData): Review {
    const data = doc.data();
    return {
        id: doc.id,
        bookingId: data.bookingId || '',
        rating: data.rating || 0,
        title: data.title || '',
        text: data.text || '',
        reviewerName: data.reviewerName || 'Anonymous',
        photoUrls: data.photoUrls || [],
        status: data.status || 'pending',
        createdAt: data.createdAt?.toDate() || new Date(),
        operatorId: data.operatorId,
        eventName: data.eventName,
    };
}
