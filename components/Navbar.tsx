'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
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
            setProfileImage(data.profileImage || '/default-profile.png');
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfileImage('/default-profile.png');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center space-x-4">
                <Link href="/music-room" className="text-blue-400 text-xl font-bold">
                    Music Room
                </Link>
            </div>
            
            <div className="flex items-center space-x-4">
                {user ? (
                    <>
                        <Link href="/profile" className="text-gray-300 hover:text-white">
                            Profile
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className="text-gray-300 hover:text-white">
                                Admin
                            </Link>
                        )}
                        <div className="flex items-center space-x-2">
                            {profileImage && (
                                <Image
                                    src={profileImage}
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            )}
                            <button
                                onClick={handleLogout}
                                className="text-gray-300 hover:text-white"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <Link href="/register" className="text-gray-300 hover:text-white">
                        Register
                    </Link>
                )}
            </div>
        </header>
    );
} 