'use client';

import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Head from 'next/head';
import MusicControls from '../components/MusicControls';
import Navbar from '@/components/Navbar';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && !loading) {
            router.push('/music-room');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (user) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Head>
                    <title>Music Creator</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </Head>

                <main className="min-h-screen bg-gray-900">
                    <Navbar />
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-4xl font-bold text-white text-center mb-8">
                            Welcome to Music Room
                        </h1>
                        <div className="max-w-4xl mx-auto">
                    <MusicControls />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Login />
        </div>
    );
}
