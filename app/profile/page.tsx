'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaEdit, FaSave, FaCamera, FaMusic, FaUser } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, updateProfile } from 'firebase/auth';

const musicGenres = [
  'Pop', 'Rock', 'Rap', 'Electronic'
];

export default function Profile() {
  const { user } = useAuth();
    const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
    const [profileData, setProfileData] = useState({
        displayName: '',
    email: '',
    photoURL: '',
        aboutMe: '',
    favoriteArtists: '',
    musicGenres: [] as string[],
    socialLinks: {
      twitter: '',
      github: '',
      linkedin: '',
            instagram: '',
      facebook: '',
      youtube: ''
    }
    });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        if (!user) {
            console.log('No user found, redirecting to login');
            router.push('/login');
            return;
        }

        console.log('User found:', user.uid);
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get the ID token
                const token = await user.getIdToken();
                console.log('Got ID token:', token ? 'yes' : 'no');
                
                // Log the API URL
                const apiUrl = `/api/users/${user.uid}`;
                console.log('Fetching from:', apiUrl);
                
                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Profile fetch error:', {
                        status: response.status,
                        statusText: response.statusText,
                        error: errorData
                    });
                    throw new Error(errorData.error || `Failed to fetch profile data (${response.status})`);
                }

                const data = await response.json();
                console.log('Profile data received:', data);
                
                setProfileData(prev => ({
                    ...prev,
                    ...data,
                    displayName: data.displayName || user.displayName || '',
                    email: data.email || user.email || '',
                    photoURL: data.photoURL || user.photoURL || '',
                    aboutMe: data.aboutMe || '',
                    favoriteArtists: data.favoriteArtists || '',
                    musicGenres: data.musicGenres || [],
                    socialLinks: data.socialLinks || {
                        twitter: '',
                        github: '',
                        linkedin: '',
                        instagram: '',
                        facebook: '',
                        youtube: ''
                    }
                }));
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user, router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('Image size should be less than 5MB');
            return;
        }

        try {
      setUploadingPhoto(true);
      setError(null);
      
      const storage = getStorage();
      const storageRef = ref(storage, `profile-photos/${user.uid}/${file.name}`);
            
            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);
      console.log('Uploaded file:', snapshot);
            
            // Get the download URL
      const photoURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL:', photoURL);

      // Update Firebase Auth profile using the auth instance
      const auth = getAuth();
      await updateProfile(auth.currentUser!, { photoURL });
      console.log('Updated Firebase Auth profile');

      // Update local state
      setProfileData(prev => ({ ...prev, photoURL }));
      
      // Also update the user document in Firestore
      const token = await user.getIdToken();
      const response = await fetch(`/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photoURL }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile in database');
      }

    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photo. Please try again.');
        } finally {
      setUploadingPhoto(false);
        }
    };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      
      // Update Firebase Auth profile first
      const auth = getAuth();
      await updateProfile(auth.currentUser!, {
        displayName: profileData.displayName
      });
      console.log('Updated Firebase Auth profile');

      // Update MongoDB document
      const updateData = {
        displayName: profileData.displayName,
        aboutMe: profileData.aboutMe,
        favoriteArtists: profileData.favoriteArtists,
        musicGenres: profileData.musicGenres,
        socialLinks: profileData.socialLinks
      };

      const response = await fetch(`/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setIsEditing(false);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-xl text-gray-300">Loading...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
        return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-xl text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </>
        );
    }

    return (
    <>
            <Navbar />
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Profile</h2>
                <div className="flex space-x-4">
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <FaSave className="mr-2" />
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                  )}
                </div>
                            </div>

              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center">
                    <div className="relative">
                        {profileData.photoURL ? (
                            <Image
                                src={profileData.photoURL}
                                alt={profileData.displayName || 'Profile'}
                                width={100}
                                height={100}
                                className="rounded-full"
                                priority
                                style={{ width: 'auto', height: 'auto' }}
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                                <span className="text-3xl text-white">
                                    {profileData.email?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                            >
                                <FaCamera />
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <div className="ml-6">
                        {isEditing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={profileData.displayName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                                    placeholder="Enter your name"
                                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-sm text-gray-400">This name will appear in the admin dashboard</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-medium text-white">
                                    {profileData.displayName || 'Anonymous User'}
                                </h3>
                                <p className="text-gray-400">{profileData.email}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* About Me Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-lg font-medium text-white mb-4">About Me</h4>
                  {isEditing ? (
                    <textarea
                      value={profileData.aboutMe}
                      onChange={(e) => setProfileData(prev => ({ ...prev, aboutMe: e.target.value }))}
                      className="w-full h-32 bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-300">
                      {profileData.aboutMe || 'No description provided'}
                    </p>
                  )}
                            </div>

                {/* Favorite Artists Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-lg font-medium text-white mb-4">Favorite Artists</h4>
                  {isEditing ? (
                                <textarea
                      value={profileData.favoriteArtists}
                      onChange={(e) => setProfileData(prev => ({ ...prev, favoriteArtists: e.target.value }))}
                      className="w-full h-24 bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List your favorite artists..."
                    />
                  ) : (
                    <p className="text-gray-300">
                      {profileData.favoriteArtists || 'No favorite artists listed'}
                    </p>
                  )}
                            </div>

                {/* Music Genres Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-lg font-medium text-white mb-4">Music Genres</h4>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {musicGenres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => {
                            setProfileData(prev => ({
                              ...prev,
                              musicGenres: prev.musicGenres.includes(genre)
                                ? prev.musicGenres.filter(g => g !== genre)
                                : [...prev.musicGenres, genre]
                            }));
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            profileData.musicGenres.includes(genre)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileData.musicGenres.length > 0 ? (
                        profileData.musicGenres.map((genre) => (
                          <span
                            key={genre}
                            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                          >
                            {genre}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-400">No genres selected</p>
                      )}
                            </div>
                  )}
                            </div>

                {/* Social Links Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-lg font-medium text-white mb-4">Social Links</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profileData.socialLinks).map(([platform, url]) => (
                                            <div key={platform} className="flex items-center space-x-2">
                        <span className="text-gray-300 capitalize w-24">{platform}</span>
                        {isEditing ? (
                                                    <input
                                                        type="text"
                            value={url}
                            onChange={(e) =>
                              setProfileData(prev => ({
                                ...prev,
                                socialLinks: {
                                  ...prev.socialLinks,
                                  [platform]: e.target.value
                                }
                              }))
                            }
                            placeholder={`Enter your ${platform} URL`}
                            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                        ) : (
                                                    <a
                            href={url || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                            className={`flex-1 text-blue-400 hover:text-blue-300 ${
                              !url && 'pointer-events-none text-gray-500'
                            }`}
                                                    >
                            {url || 'Not set'}
                                                    </a>
                                                )}
                                            </div>
                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
    );
} 