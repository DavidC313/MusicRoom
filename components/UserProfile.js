'use client';

import React from 'react';
import { FaUser, FaMusic, FaHistory, FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function UserProfile() {
    // Mock user data - replace with actual user data from your auth system
    const user = {
        username: 'MusicMaker',
        email: 'musicmaker@example.com',
        joinDate: '2024-01-01',
        compositions: 12,
        totalPlayTime: '24h 36m'
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                            <FaUser className="text-4xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user.username}</h1>
                            <p className="text-gray-400">{user.email}</p>
                            <p className="text-gray-400 text-sm">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                <FaMusic className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{user.compositions}</h2>
                                <p className="text-gray-400">Compositions</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                <FaHistory className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{user.totalPlayTime}</h2>
                                <p className="text-gray-400">Total Play Time</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                    <div className="space-y-4">
                        <button className="w-full flex items-center space-x-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                            <FaCog className="text-xl" />
                            <span>Account Settings</span>
                        </button>
                        <button className="w-full flex items-center space-x-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                            <FaMusic className="text-xl" />
                            <span>Manage Compositions</span>
                        </button>
                        <button className="w-full flex items-center space-x-4 p-4 bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                            <FaSignOutAlt className="text-xl" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 