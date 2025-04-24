'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import MusicMaker from '@/components/MusicMaker';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function MusicRoom() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [profileImage, setProfileImage] = useState('');

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            const response = await fetch(`/api/users/${user?.uid}`, {
                headers: {
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            const data = await response.json();
            setProfileImage(data.profileImage);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

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
                <Navbar />
                <div className="flex-1 p-6">
                    <MusicMaker />
                </div>
            </main>
        </div>
    );
} 