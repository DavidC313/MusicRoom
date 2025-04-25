/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    basePath: process.env.NODE_ENV === 'production' ? '/MusicRoom' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/MusicRoom/' : '',
}

module.exports = nextConfig 