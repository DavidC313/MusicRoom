'use client';

import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';
import MusicMaker from '@/components/MusicMaker';

export default function MusicRoom() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="text-gray-900 text-center space-y-4">
                    <h1 className="text-2xl">Please log in to access the Music Room</h1>
                    <Link 
                        href="/" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Head>
                <title>Music Room</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <main className="flex flex-col min-h-screen">
                <header className="bg-gray-100 p-4 flex justify-between items-center border-b border-gray-200">
                    <h1 className="text-gray-900 text-xl font-bold">Music Room</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Welcome, {user.email}</span>
                        <button 
                            onClick={logout} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-6">
                    <MusicMaker />
                </div>
            </main>
        </div>
    );
} 