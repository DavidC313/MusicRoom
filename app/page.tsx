'use client';

import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Register from '@/components/Register';
import Head from 'next/head';
import MusicControls from '../components/MusicControls'; // Direct Import (No SSR)
import TestAuth from '@/components/TestAuth';

export default function Home() {
    const { user, logout } = useAuth();

    if (user) {
        return (
            <div>
                <Head>
                    <title>Music Creator</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </Head>

                <main className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
                    <MusicControls />
                    <p>Welcome, {user.email}</p>
                    <button onClick={logout}>Logout</button>
                </main>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="space-y-8">
                <Login />
                <hr />
                <Register />
            </div>
        </div>
    );
}
