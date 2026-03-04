// Robots.txt — Vualiku XP
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/operator/dashboard/',
                    '/operator/scan/',
                    '/operator/login/',
                    '/checkout/',
                    '/booking/success/',
                    '/booking/cancelled/',
                ],
            },
        ],
        sitemap: 'https://vualiku-xp.web.app/sitemap.xml',
    };
}
