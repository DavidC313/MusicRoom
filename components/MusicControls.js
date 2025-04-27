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
            if (masterVolumeRef.current) {
                masterVolumeRef.current.dispose();
            }
            Object.values(synthsRef.current).forEach(synth => {
                if (synth) {
                    synth.dispose();
                }
            });
            if (recorderRef.current) {
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
        <div ref={containerRef} className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {initError && (
                <div className="col-span-3 text-center">
                    <p className="text-red-500">Error: {initError}</p>
                </div>
            )}

            {/* Audio Visualization */}
            <div className="col-span-3 text-center">
                <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                    <FaChartBar className="text-green-500" /> Audio Visualization
                </h2>
                <canvas ref={canvasRef} className="w-full h-40 bg-black rounded-lg mt-4"></canvas>
            </div>

            {/* Instrument Panels */}
            {[{ name: 'Guitar', icon: FaGuitar, color: 'text-red-500' }, { name: 'Bass', icon: FaMusic, color: 'text-purple-500' }, { name: 'Drums', icon: FaDrum, color: 'text-orange-500' }].map((instrument, index) => (
                <div key={index} className="bg-gray-100 p-6 rounded-xl shadow-lg text-center border border-gray-300">
                    <h2 className={`text-xl font-bold flex items-center justify-center gap-2 ${instrument.color}`}>
                        <instrument.icon /> {instrument.name}
                    </h2>
                    <div className="mt-4 flex flex-col gap-2">
                        <button 
                            onClick={() => handlePlay(instrument.name)} 
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            disabled={!isInitialized}
                        >
                            Play
                        </button>
                        <button 
                            onClick={isRecording ? handleStopRecording : handleRecord}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors"
                            disabled={!isInitialized}
                        >
                            {isRecording ? 'Stop Recording' : 'Record'}
                        </button>
                        <button 
                            onClick={handlePlayRecording}
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                            disabled={!isInitialized || !hasRecording}
                        >
                            Play Recording
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            disabled={!isInitialized || !hasRecording}
                        >
                            Download
                        </button>
                    </div>
                    <label className="block text-sm mt-4">Volume</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume} 
                        className="w-full" 
                        onChange={(e) => {
                            setVolume(e.target.value);
                            const synth = synthsRef.current[instrument.name];
                            if (synth) {
                                synth.volume.value = Tone.gainToDb(e.target.value / 100);
                            }
                        }}
                    />
                    <label className="block text-sm mt-4">Effects</label>
                    <select 
                        className="w-full p-2 mt-1 border rounded"
                        value={effect}
                        onChange={(e) => setEffect(e.target.value)}
                    >
                        <option>None</option>
                        <option>Chorus</option>
                        <option>Distortion</option>
                        <option>Phaser</option>
                    </select>
                </div>
            ))}

            {/* Playback Controls */}
            <div className="col-span-3 text-center mt-6">
                <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                    <FaMobileAlt className="text-gray-600" /> Playback Controls
                </h2>
                <div className="mt-4 flex justify-center gap-4">
                    <button 
                        onClick={handlePlayAll} 
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        disabled={!isInitialized}
                    >
                        Play All
                    </button>
                    <button 
                        onClick={handleLoopAll} 
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        disabled={!isInitialized}
                    >
                        Loop All
                    </button>
                    <button 
                        onClick={handleStopAll} 
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        disabled={!isInitialized}
                    >
                        Stop All
                    </button>
                </div>
                <div className="mt-4">
                    <input 
                        type="checkbox" 
                        checked={metronomeEnabled} 
                        onChange={handleMetronomeToggle}
                        className="mr-2"
                        disabled={!isInitialized}
                    />
                    Enable Metronome
                </div>
                <div className="mt-2">
                    <label className="text-sm mr-2">Tempo (BPM)</label>
                    <input 
                        type="number" 
                        value={tempo} 
                        onChange={(e) => setTempo(Number(e.target.value))} 
                        className="w-16 border p-1 rounded"
                        min="40"
                        max="240"
                    />
                </div>
            </div>
        </div>
    );
}
