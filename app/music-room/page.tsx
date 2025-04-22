'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import MusicMaker from '@/components/MusicMaker';
import Image from 'next/image';
import { useState, useEffect } from 'react';

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
                <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                        <Link href="/music-room" className="text-blue-400 text-xl font-bold">
                            Music Room
                        </Link>
                        <Link href="/profile" className="text-white text-xl font-bold hover:text-blue-400 transition-colors">
                            Profile
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/profile" className="flex items-center space-x-2 group">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-blue-400 transition-colors">
                                {profileImage ? (
                                    <Image
                                        src={profileImage}
                                        alt="Profile"
                                        width={32}
                                        height={32}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <Image
                                        src="/default-profile.png"
                                        alt="Default Profile"
                                        width={32}
                                        height={32}
                                        className="object-cover w-full h-full"
                                    />
                                )}
                            </div>
                            <span className="text-white text-sm hidden md:block">
                                {user.email}
                            </span>
                        </Link>
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