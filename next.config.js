/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com'],
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
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };
        return config;
    },
};

module.exports = nextConfig; 