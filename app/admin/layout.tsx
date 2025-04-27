import { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#000000',
} as const satisfies Viewport;

export const metadata = {
    title: 'Admin - MusicRoom',
    description: 'Manage users and system settings',
} as const satisfies Metadata;

export default function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <>{children}</>;
} 