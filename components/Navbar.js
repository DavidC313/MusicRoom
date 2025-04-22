'use client';

import React from 'react';
import Link from 'next/link';
import { FaMusic, FaUser } from 'react-icons/fa';

export default function Navbar() {
    // Mock user data - replace with actual user data from your auth system
    const user = {
        username: 'MusicMaker'
    };

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <FaMusic className="text-2xl text-blue-500" />
                    <span className="text-xl font-bold">MusicRoom</span>
                </Link>

                <div className="flex items-center space-x-4">
                    <Link 
                        href="/profile" 
                        className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        <FaUser className="text-lg" />
                        <span>{user.username}</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
} 