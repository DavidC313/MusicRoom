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
    // Add basePath for GitHub Pages
    basePath: process.env.NODE_ENV === 'production' ? '/MusicRoom' : '',
    // Add assetPrefix for GitHub Pages
    assetPrefix: process.env.NODE_ENV === 'production' ? '/MusicRoom/' : '',
    // Ensure proper static export settings
    trailingSlash: true,
    distDir: 'out',
    // Disable ESLint during build
    eslint: {
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig 