'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <header className="bg-gray-800 p-4">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link href="/music-room" className="text-blue-400 text-xl font-bold hover:text-blue-300 transition-colors">
                            Music Room
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/profile" className="text-white text-xl font-bold hover:text-blue-400 transition-colors">
                            Profile
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className="text-white text-xl font-bold hover:text-blue-400 transition-colors">
                                Admin
                            </Link>
                        )}
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
                            <span className="text-white text-sm hidden md:block">{user?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-4`}>
                    <div className="flex flex-col space-y-4">
                        <Link 
                            href="/profile" 
                            className="text-white text-xl font-bold hover:text-blue-400 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Profile
                        </Link>
                        {isAdmin && (
                            <Link 
                                href="/admin" 
                                className="text-white text-xl font-bold hover:text-blue-400 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Admin
                            </Link>
                        )}
                        <div className="flex items-center space-x-4">
                            <span className="text-white text-sm">{user?.email}</span>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
} 