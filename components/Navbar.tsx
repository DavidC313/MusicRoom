'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (user) {
            // Check if user is admin based on email or UID
            const isUserAdmin = user.email === 'admin@admin.com' || user.uid === 'XbJ8BBGIJsTTJeaGrMwXilEdOkc2';
            setIsAdmin(isUserAdmin);
        }
    }, [user]);

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
                <Link href="/music-room" className="text-blue-400 text-xl font-bold hover:text-blue-300 transition-colors">
                    Music Room
                </Link>
                <Link href="/profile" className="text-white text-xl font-bold hover:text-blue-400 transition-colors">
                    Profile
                </Link>
                {isAdmin && (
                    <Link href="/admin" className="text-white text-xl font-bold hover:text-blue-400 transition-colors">
                        Admin
                    </Link>
                )}
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4">
                    {user?.photoURL ? (
                            <Image
                            src={user.photoURL}
                            alt={user.displayName || 'Profile'}
                            width={40}
                            height={40}
                            className="rounded-full"
                            style={{ width: 'auto', height: 'auto' }}
                            />
                        ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-white text-sm">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        )}
                    <span className="text-white text-sm">{user?.email}</span>
                    </div>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </header>
    );
} 