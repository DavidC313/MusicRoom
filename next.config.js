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
};

module.exports = nextConfig; 