'use client';

import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';
import MusicMaker from '@/components/MusicMaker';

export default function MusicRoom() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
                <div className="text-white text-center space-y-4">
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
        <div className="min-h-screen bg-gray-900">
            <Head>
                <title>Music Room</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <main className="flex flex-col min-h-screen">
                <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
                    <h1 className="text-white text-xl font-bold">Music Room</h1>
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Welcome to MusicRoom,{' '}
                            <Link 
                                href="/profile" 
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                {user.email}
                            </Link>
                        </h1>
                        <button 
                            onClick={logout} 
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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