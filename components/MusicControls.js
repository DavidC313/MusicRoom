'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaGuitar, FaMusic, FaDrum, FaChartBar, FaMobileAlt } from 'react-icons/fa';
import * as Tone from 'tone';

export default function MusicControls() {
    const [instrument, setInstrument] = useState('Electric Guitar');
    const [volume, setVolume] = useState(50);
    const [effect, setEffect] = useState('None');
    const [metronomeEnabled, setMetronomeEnabled] = useState(false);
    const [tempo, setTempo] = useState(120);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const [initError, setInitError] = useState(null);
    const canvasRef = useRef(null);
    const recorderRef = useRef(null);
    const synthsRef = useRef({
        Guitar: null,
        Bass: null,
        Drums: null
    });
    const masterVolumeRef = useRef(null);
    const hasInitializedRef = useRef(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const initializeAudio = async () => {
            if (hasInitializedRef.current) return;
            
            try {
                console.log('Starting audio initialization...');
                
                // Create audio context
                const context = new (window.AudioContext || window.webkitAudioContext)();
                await context.resume();
                console.log('Audio context created and resumed');

                // Initialize Tone.js
                await Tone.start();
                console.log('Tone.js started');
                
                // Create master volume control
                masterVolumeRef.current = new Tone.Volume(0).toDestination();
                console.log('Master volume created');
                
                // Create synths for each instrument
                synthsRef.current.Guitar = new Tone.Synth({
                    oscillator: {
                        type: "sine"
                    },
                    envelope: {
                        attack: 0.005,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 1
                    }
                }).connect(masterVolumeRef.current);

                synthsRef.current.Bass = new Tone.Synth({
                    oscillator: {
                        type: "sine"
                    },
                    envelope: {
                        attack: 0.005,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 1
                    }
                }).connect(masterVolumeRef.current);

                synthsRef.current.Drums = new Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 4,
                    oscillator: {
                        type: "sine"
                    },
                    envelope: {
                        attack: 0.001,
                        decay: 0.2,
                        sustain: 0.01,
                        release: 0.2,
                        attackCurve: "exponential"
                    }
                }).connect(masterVolumeRef.current);

                console.log('Synths created and connected');

                // Create recorder
                recorderRef.current = new Tone.Recorder();
                Object.values(synthsRef.current).forEach(synth => {
                    synth.connect(recorderRef.current);
                });

                // Test sound
                const testSynth = new Tone.Synth().toDestination();
                await testSynth.triggerAttackRelease("C4", "8n");
                console.log('Test sound played');

                setIsInitialized(true);
                setInitError(null);
                hasInitializedRef.current = true;
                console.log('Audio initialized successfully');
            } catch (error) {
                console.error('Failed to initialize audio:', error);
                setInitError(error.message);
            }
        };

        const handleInteraction = (e) => {
            if (!hasInitializedRef.current) {
                console.log('Interaction detected, initializing audio...');
                initializeAudio();
            }
        };

        // Add click event listener to the container
        const container = containerRef.current;
        if (container) {
            container.addEventListener('click', handleInteraction);
            container.addEventListener('touchstart', handleInteraction);
        }

        // Cleanup function
        return () => {
            if (container) {
                container.removeEventListener('click', handleInteraction);
                container.removeEventListener('touchstart', handleInteraction);
            }
            if (masterVolumeRef.current && typeof masterVolumeRef.current.dispose === 'function') {
                masterVolumeRef.current.dispose();
            }
            Object.values(synthsRef.current).forEach(synth => {
                if (synth && typeof synth.dispose === 'function') {
                    synth.dispose();
                }
            });
            if (recorderRef.current && typeof recorderRef.current.dispose === 'function') {
                recorderRef.current.dispose();
            }
        };
    }, []);

    const handlePlay = async (instrumentType) => {
        if (!isInitialized) {
            console.log('Audio not initialized yet');
            return;
        }

        const noteMap = {
            Guitar: 'C4',
            Bass: 'E2',
            Drums: 'C1',
        };

        try {
            console.log(`Playing ${instrumentType} with note ${noteMap[instrumentType]}`);
            const synth = synthsRef.current[instrumentType];
            if (synth) {
                await synth.triggerAttackRelease(noteMap[instrumentType], '8n');
                console.log('Note triggered successfully');
            } else {
                console.error(`Synth not found for ${instrumentType}`);
            }
        } catch (error) {
            console.error('Error playing note:', error);
        }
    };

    const handleRecord = () => {
        if (!isInitialized) return;
        setIsRecording(true);
        recorderRef.current.start();
    };

    const handleStopRecording = async () => {
        if (!isInitialized) return;
        setIsRecording(false);
        const recording = await recorderRef.current.stop();
        setHasRecording(true);
        // You can save the recording or do something with it here
    };

    const handlePlayRecording = () => {
        if (!isInitialized || !hasRecording) return;
        // Implement playback of recording
    };

    const handleDownload = () => {
        if (!isInitialized || !hasRecording) return;
        // Implement download functionality
    };

    const handlePlayAll = async () => {
        if (!isInitialized) return;
        await handlePlay('Guitar');
        await handlePlay('Bass');
        await handlePlay('Drums');
    };

    const handleLoopAll = async () => {
        if (!isInitialized) return;
        
        try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
            Tone.Transport.bpm.value = tempo;
            
            const loop = new Tone.Loop((time) => {
            handlePlayAll();
            }, '1m').start(0);
            
        Tone.Transport.start();
        } catch (error) {
            console.error('Error starting loop:', error);
        }
    };

    const handleStopAll = () => {
        if (!isInitialized) return;
        Tone.Transport.stop();
        Tone.Transport.cancel();
    };

    const handleMetronomeToggle = () => {
        if (!isInitialized) return;
        setMetronomeEnabled(!metronomeEnabled);
        if (metronomeEnabled) {
            Tone.Transport.stop();
        } else {
            Tone.Transport.start();
        }
    };

    return (
        <div ref={containerRef} data-testid="music-controls-container" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Electric Guitar</h2>
                    <div className="flex flex-col space-y-4">
                        <div>
                            <label htmlFor="volume" className="block text-sm font-medium text-gray-700">
                                Volume
                            </label>
                            <input
                                type="range"
                                id="volume"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-full"
                                aria-label="Volume"
                            />
                        </div>
                        <div>
                            <label htmlFor="effect" className="block text-sm font-medium text-gray-700">
                                Effect
                            </label>
                            <select
                                id="effect"
                                value={effect}
                                onChange={(e) => setEffect(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                aria-label="Effect"
                            >
                                <option value="None">None</option>
                                <option value="Reverb">Reverb</option>
                                <option value="Delay">Delay</option>
                                <option value="Distortion">Distortion</option>
                            </select>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePlay('Guitar')}
                                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                aria-label="Play Guitar"
                            >
                                Play
                            </button>
                            <button
                                onClick={handleRecord}
                                className={`flex-1 ${isRecording ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded hover:opacity-90`}
                                aria-label="Record"
                            >
                                {isRecording ? 'Recording...' : 'Record'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Global Controls</h2>
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={handlePlayAll}
                            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                            aria-label="Play All"
                        >
                            Play All
                        </button>
                        <div>
                            <label htmlFor="tempo" className="block text-sm font-medium text-gray-700">
                                Tempo
                            </label>
                            <input
                                type="number"
                                id="tempo"
                                min="60"
                                max="200"
                                value={tempo}
                                onChange={(e) => setTempo(Number(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                aria-label="Tempo"
                            />
                        </div>
                        <button
                            onClick={handleMetronomeToggle}
                            className={`${metronomeEnabled ? 'bg-green-500' : 'bg-gray-500'} text-white px-4 py-2 rounded hover:opacity-90`}
                            aria-label="Metronome"
                        >
                            Metronome {metronomeEnabled ? 'On' : 'Off'}
                        </button>
                    </div>
                </div>
            </div>
            {initError && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    Error initializing audio: {initError}
                </div>
            )}
        </div>
    );
}
