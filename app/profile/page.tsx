'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { storage } from '@/utils/firebase-client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [profileData, setProfileData] = useState({
        displayName: '',
        aboutMe: '',
        favoriteGenres: '',
        instruments: '',
        profileImage: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

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
            setProfileData(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        try {
            setIsSaving(true);
            setError('');
            setUploadProgress(0);

            // Generate a unique filename
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const fileName = `${user?.uid}_${timestamp}.${fileExtension}`;

            // Create a storage reference
            const storageRef = ref(storage, `profile-images/${fileName}`);
            
            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);
            
            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Update profile with new image URL
            const updatedProfile = { ...profileData, profileImage: downloadURL };
            await updateProfile(updatedProfile);
            
            setProfileData(updatedProfile);
            setUploadProgress(100);
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateProfile = async (data: typeof profileData) => {
        try {
            const response = await fetch(`/api/users/${user?.uid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            await updateProfile(profileData);
        } catch (error) {
            // Error already handled in updateProfile
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
                    <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>
                    
                    {error && (
                        <div className="mb-4 p-4 bg-red-900/50 text-red-300 rounded-md border border-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                {profileData.profileImage ? (
                                    <Image
                                        src={profileData.profileImage}
                                        alt="Profile"
                                        width={128}
                                        height={128}
                                        className="rounded-full object-cover border-2 border-gray-700"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                                        <span className="text-gray-400">No image</span>
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2 cursor-pointer hover:bg-gray-700 border border-gray-600">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-white">Profile Picture</h2>
                                <p className="text-sm text-gray-400">Upload a new profile picture</p>
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
                                Display Name
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                value={profileData.displayName}
                                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-300">
                                About Me
                            </label>
                            <textarea
                                id="aboutMe"
                                value={profileData.aboutMe}
                                onChange={(e) => setProfileData({ ...profileData, aboutMe: e.target.value })}
                                rows={4}
                                className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="favoriteGenres" className="block text-sm font-medium text-gray-300">
                                Favorite Genres
                            </label>
                            <input
                                type="text"
                                id="favoriteGenres"
                                value={profileData.favoriteGenres}
                                onChange={(e) => setProfileData({ ...profileData, favoriteGenres: e.target.value })}
                                className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="instruments" className="block text-sm font-medium text-gray-300">
                                Instruments
                            </label>
                            <input
                                type="text"
                                id="instruments"
                                value={profileData.instruments}
                                onChange={(e) => setProfileData({ ...profileData, instruments: e.target.value })}
                                className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 