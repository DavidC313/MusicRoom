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
    // Ensure proper static export settings
    trailingSlash: true,
    // Disable ESLint during build
    eslint: {
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig 