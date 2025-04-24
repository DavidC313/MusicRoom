'use client';

import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Head from 'next/head';
import MusicControls from '../components/MusicControls'; // Direct Import (No SSR)
import TestAuth from '@/components/TestAuth';

export default function Home() {
    const { user, logout, loading } = useAuth();
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

                <main className="flex flex-col items-center justify-center min-h-screen p-6">
                    <MusicControls />
                    <p className="text-white">Welcome, {user.email}</p>
                    <button 
                        onClick={logout} 
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02]"
                    >
                        Logout
                    </button>
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
