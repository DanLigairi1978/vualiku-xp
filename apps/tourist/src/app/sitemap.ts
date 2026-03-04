// Dynamic Sitemap — Vualiku XP
// Auto-generates sitemap.xml from known routes and Firestore documents
// This runs server-side at request time

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://vualiku-xp.web.app';

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

    // TODO: When Firestore Admin SDK is available server-side, dynamically fetch
    // operators and activities to generate individual operator/activity pages:
    //
    // const operatorsSnapshot = await getDocs(collection(adminDb, 'operators'));
    // const operatorPages = operatorsSnapshot.docs.map(doc => ({
    //   url: `${baseUrl}/operator/${doc.id}`,
    //   lastModified: doc.data().updatedAt?.toDate() || new Date(),
    //   changeFrequency: 'weekly' as const,
    //   priority: 0.7,
    // }));

    return [...staticPages];
}
