/** @type {import('next').NextConfig} */
const nextConfig = {
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.fijivacations.com',
                port: '',
                pathname: '/wp-content/uploads/2014/12/Matangi-Matangi-Beach.jpg'
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/_deprecated_ai_planner',
                destination: '/explore',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
