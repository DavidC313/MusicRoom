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
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-white text-2xl sm:text-4xl">
                                {user.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">{user.username}</h1>
                            <p className="text-gray-400">{user.email}</p>
                            <p className="text-gray-400 text-sm">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
                        <div className="bg-gray-700 rounded-lg p-4 sm:p-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                    <FaMusic className="text-lg sm:text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-semibold text-white">{user.compositions}</h2>
                                    <p className="text-gray-400 text-sm">Compositions</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4 sm:p-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center">
                                    <FaHistory className="text-lg sm:text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-semibold text-white">{user.totalPlayTime}</h2>
                                    <p className="text-gray-400 text-sm">Total Play Time</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-700 rounded-lg">
                                <div>
                                    <h3 className="text-white font-medium">Email Notifications</h3>
                                    <p className="text-gray-400 text-sm">Receive updates about your compositions</p>
                                </div>
                                <button className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Enable
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 