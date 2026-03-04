/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        outputFileTracingRoot: require('path').join(__dirname, '../../'),
    },
    transpilePackages: ['@vualiku/shared'],
    images: {
        unoptimized: true,
    },
};

module.exports = nextConfig;
