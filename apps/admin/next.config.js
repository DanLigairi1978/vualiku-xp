/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
    transpilePackages: ['@vualiku/shared'],
    images: {
        unoptimized: true,
    },
    experimental: {},
};

module.exports = nextConfig;