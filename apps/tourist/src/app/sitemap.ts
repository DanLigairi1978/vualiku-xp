// Dynamic Sitemap — Vualiku XP
// Auto-generates sitemap.xml from known routes and Firestore documents
// This runs server-side at request time

import type { MetadataRoute } from 'next';
import { getAdminFirestore } from '@/lib/firebase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://vualiku-xp.web.app';
    const db = getAdminFirestore();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/explore`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/directory`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/map`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/booking`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/packages`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];

    try {
        // 1. Fetch Active Operators
        const operatorsSnap = await db.collection('operators')
            .where('status', '==', 'active')
            .get();

        const operatorPages = operatorsSnap.docs.map(doc => ({
            url: `${baseUrl}/directory/${doc.id}`,
            lastModified: doc.data().updatedAt?.toDate() || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        // 2. Fetch Active/Featured Packages
        // Note: Firestore doesn't support OR queries easily across multiple where clauses without collectionGroup or multiple queries
        // We'll fetch all and filter or do two queries if needed. For simplicity and volume, fetching both.
        const activePackagesSnap = await db.collection('packages')
            .where('status', 'in', ['active', 'featured'])
            .get();

        const packagePages = activePackagesSnap.docs.map(doc => ({
            url: `${baseUrl}/packages/${doc.id}`,
            lastModified: doc.data().updatedAt?.toDate() || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        // 3. Fetch Published Blog Posts
        const blogSnap = await db.collection('blog')
            .where('status', '==', 'published')
            .get();

        const blogPages = blogSnap.docs.map(doc => ({
            url: `${baseUrl}/blog/${doc.data().slug || doc.id}`,
            lastModified: doc.data().updatedAt?.toDate() || doc.data().date?.toDate() || new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));

        return [
            ...staticPages,
            ...operatorPages,
            ...packagePages,
            ...blogPages
        ];
    } catch (error) {
        console.error('Error generating dynamic sitemap:', error);
        return staticPages;
    }
}
