/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['firebasestorage.googleapis.com'],
    },
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
        typedRoutes: true,
    },
    typescript: {
        ignoreBuildErrors: true,
            },
    serverExternalPackages: ['mongodb'],
    // Ensure static assets are properly cached
    async headers() {
        return [
            {
                source: '/musicroom.ico',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig; 