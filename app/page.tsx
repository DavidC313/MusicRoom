'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MusicControls from '@/components/MusicControls';
import MusicMaker from '@/components/MusicMaker';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TestAuth from '@/components/TestAuth';
import Login from '@/components/Login';
import Head from 'next/head';

export default function Home() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(120);
    const [volume, setVolume] = useState(50);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [isLooping, setIsLooping] = useState(false);

    const playSequence = () => {
        // Implement playback logic
        console.log('Playing sequence');
    };

    const cleanupAudioResources = () => {
        // Implement cleanup logic
        console.log('Cleaning up audio resources');
    };

    useEffect(() => {
        if (user && !loading) {
            router.push('/music-room');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (user) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Head>
                    <title>Music Creator</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </Head>

                <div className="container mx-auto px-4 py-8">
                    <main className="flex flex-col items-center justify-center min-h-screen p-6">
                        <MusicControls 
                            isPlaying={isPlaying}
                            setIsPlaying={setIsPlaying}
                            tempo={tempo}
                            setTempo={setTempo}
                            volume={volume}
                            setVolume={setVolume}
                            selectedTrack={selectedTrack}
                            setSelectedTrack={setSelectedTrack}
                            tracks={tracks}
                            setTracks={setTracks}
                            isLooping={isLooping}
                            setIsLooping={setIsLooping}
                            playSequence={playSequence}
                            cleanupAudioResources={cleanupAudioResources}
                        />
                        <p className="text-white">Welcome, {user.email}</p>
                        <button
                            onClick={logout}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Login />
        </div>
    );
}
