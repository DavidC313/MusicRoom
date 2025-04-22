'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const defaultProfileData = {
    displayName: '',
    aboutMe: '',
    favoriteGenres: '',
    instruments: ''
};

export default function Profile() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(defaultProfileData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                console.log('Fetching profile data for user:', user.uid);
                const token = await user.getIdToken();
                if (!token) {
                    throw new Error('Failed to get authentication token');
                }
                console.log('Got authentication token');

                const response = await fetch(`/api/users/${user.uid}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    console.error('Profile fetch error:', {
                        status: response.status,
                        statusText: response.statusText,
                        errorData
                    });
                    throw new Error(
                        errorData?.error || 
                        errorData?.details || 
                        `HTTP error! status: ${response.status}`
                    );
                }

                const data = await response.json();
                console.log('Profile data received:', data);
                setProfileData({
                    displayName: data.displayName || '',
                    aboutMe: data.aboutMe || '',
                    favoriteGenres: data.favoriteGenres || '',
                    instruments: data.instruments || ''
                });
                setError(null);
            } catch (error) {
                console.error('Error fetching profile data:', error);
                if (error instanceof Error) {
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        name: error.name
                    });
                }
                setError(error instanceof Error ? error.message : 'Failed to load profile');
                setProfileData(defaultProfileData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    const handleSave = async () => {
        if (!user) {
            console.error('No user logged in');
            return;
        }

        try {
            console.log('Saving profile data for user:', user.uid);
            const token = await user.getIdToken();
            if (!token) {
                throw new Error('Failed to get authentication token');
            }
            console.log('Got authentication token');

            const response = await fetch(`/api/users/${user.uid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Profile save error:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });
                throw new Error(
                    errorData?.error || 
                    errorData?.details || 
                    `HTTP error! status: ${response.status}`
                );
            }

            console.log('Profile saved successfully');
            setIsEditing(false);
            setError(null);
        } catch (error) {
            console.error('Error saving profile data:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
            }
            setError(error instanceof Error ? error.message : 'Failed to save profile');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
                <div className="text-white text-center space-y-4">
                    <h1 className="text-2xl">Please log in to view your profile</h1>
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <Link 
                        href="/music-room" 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Back to Music Room
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Display Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="displayName"
                                    value={profileData.displayName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="text-lg">{profileData.displayName || 'Not set'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                About Me
                            </label>
                            {isEditing ? (
                                <textarea
                                    name="aboutMe"
                                    value={profileData.aboutMe}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="text-lg whitespace-pre-wrap">{profileData.aboutMe || 'No description provided'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Favorite Genres
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="favoriteGenres"
                                    value={profileData.favoriteGenres}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="text-lg">{profileData.favoriteGenres || 'Not specified'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Instruments
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="instruments"
                                    value={profileData.instruments}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="text-lg">{profileData.instruments || 'Not specified'}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                                >
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 