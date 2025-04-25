'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as Tone from 'tone';
import { FaPlay, FaStop, FaTrash, FaSave, FaUpload, FaMusic, FaDownload, FaPlus, FaChartLine, FaKeyboard, FaRecordVinyl, FaCut, FaCopy, FaPaste, FaSync, FaCheck, FaEraser } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { saveAs } from 'file-saver';
import { render } from 'react-dom';
import { exportToMP3 } from '@/lib/audioUtils';

const SCALES = {
    'C Major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'A Minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    'G Major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'E Minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
    'Pentatonic': ['C', 'D', 'E', 'G', 'A']
};

// Add timing constants
const STEPS_PER_BEAT = 4; // 16th notes per beat
const BEATS_PER_BAR = 4;
const STEPS_PER_BAR = STEPS_PER_BEAT * BEATS_PER_BAR;

// Add color mapping for notes
const NOTE_COLORS = {
    'C': '#FF6B6B',  // Red
    'D': '#4ECDC4',  // Teal
    'E': '#45B7D1',  // Blue
    'F': '#96CEB4',  // Green
    'G': '#FFEEAD',  // Yellow
    'A': '#D4A5A5',  // Pink
    'B': '#9B59B6',  // Purple
    'F#': '#2ECC71', // Emerald
};

const INSTRUMENTS = {
    piano: {
        name: 'Piano',
        synth: () => new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        })
    },
    synth: {
        name: 'Synth',
        synth: () => new Tone.Synth({
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 }
        })
    },
    guitar: {
        name: 'Guitar',
        synth: () => new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4 }
        })
    },
    bass: {
        name: 'Bass',
        synth: () => new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4 }
        })
    },
    drums: {
        name: 'Drums',
        isDrum: true,
        synth: () => {
            // Create individual drum synths
            const kick = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 4,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
            }).toDestination();

            const snare = new Tone.NoiseSynth({
                noise: { type: "white" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
            }).toDestination();

            const hihat = new Tone.NoiseSynth({
                noise: { type: "white" },
                envelope: { attack: 0.001, decay: 0.1, sustain: 0.01, release: 0.1 }
            }).toDestination();

            const tomLow = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 3,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
            }).toDestination();

            const tomMid = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 4,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
            }).toDestination();

            const tomHigh = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 5,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
            }).toDestination();

            const crash = new Tone.NoiseSynth({
                noise: { type: "white" },
                envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.3 }
            }).toDestination();

            const ride = new Tone.NoiseSynth({
                noise: { type: "white" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
            }).toDestination();

            const clap = new Tone.NoiseSynth({
                noise: { type: "white" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
            }).toDestination();

            const cowbell = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 6,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.1, sustain: 0.01, release: 0.1 }
            }).toDestination();

            // Create a drum player object that maps to the individual synths
            const drumPlayer = {
                player: (name) => ({
                    start: (time) => {
                        try {
                            switch (name) {
                                case 'kick':
                                    kick.triggerAttackRelease("C1", "8n", time);
                                    break;
                                case 'snare':
                                    snare.triggerAttackRelease("8n", time);
                                    break;
                                case 'hihat':
                                    hihat.triggerAttackRelease("8n", time);
                                    break;
                                case 'hihatOpen':
                                    hihat.triggerAttackRelease("8n", time);
                                    break;
                                case 'tomLow':
                                    tomLow.triggerAttackRelease("C2", "8n", time);
                                    break;
                                case 'tomMid':
                                    tomMid.triggerAttackRelease("C3", "8n", time);
                                    break;
                                case 'tomHigh':
                                    tomHigh.triggerAttackRelease("C4", "8n", time);
                                    break;
                                case 'crash':
                                    crash.triggerAttackRelease("8n", time);
                                    break;
                                case 'ride':
                                    ride.triggerAttackRelease("8n", time);
                                    break;
                                case 'clap':
                                    clap.triggerAttackRelease("8n", time);
                                    break;
                                case 'cowbell':
                                    cowbell.triggerAttackRelease("C5", "8n", time);
                                    break;
                                default:
                                    console.warn(`Unknown drum type: ${name}`);
                            }
                        } catch (error) {
                            console.error(`Error playing drum ${name}:`, error);
                        }
                    }
                }),
                connect: (destination) => {
                    try {
                        // Connect all drum synths to the destination
                        [kick, snare, hihat, tomLow, tomMid, tomHigh, crash, ride, clap, cowbell].forEach(synth => {
                            if (synth) {
                                synth.connect(destination);
                                console.log(`Connected ${synth.constructor.name} to destination`);
                            } else {
                                console.warn('Attempted to connect undefined synth');
                            }
                        });
                    } catch (error) {
                        console.error('Error connecting drum synths:', error);
                    }
                },
                dispose: () => {
                    try {
                        // Dispose all drum synths
                        [kick, snare, hihat, tomLow, tomMid, tomHigh, crash, ride, clap, cowbell].forEach(synth => {
                            if (synth) {
                                synth.dispose();
                                console.log(`Disposed ${synth.constructor.name}`);
                            }
                        });
                    } catch (error) {
                        console.error('Error disposing drum synths:', error);
                    }
                }
            };

            return drumPlayer;
        },
        drumMap: {
            'C3': 'kick',
            'D3': 'snare',
            'E3': 'hihat',
            'F3': 'hihatOpen',
            'G3': 'tomLow',
            'A3': 'tomMid',
            'B3': 'tomHigh',
            'C4': 'crash',
            'D4': 'ride',
            'E4': 'clap',
            'F4': 'cowbell',
            'G4': 'kick',
            'A4': 'snare',
            'B4': 'hihat',
            'C5': 'hihatOpen',
            'D5': 'tomLow',
            'E5': 'tomMid',
            'F5': 'tomHigh',
            'G5': 'crash',
            'A5': 'ride',
            'B5': 'clap',
            'C6': 'cowbell',
            'D6': 'kick',
            'E6': 'snare',
            'F6': 'hihat',
            'G6': 'hihatOpen',
            'A6': 'tomLow',
            'B6': 'tomMid',
            'C7': 'tomHigh'
        },
        volumeControls: {
            kick: { min: -24, max: 0, default: -6 },
            snare: { min: -24, max: 0, default: -3 },
            hihat: { min: -24, max: 0, default: -9 },
            hihatOpen: { min: -24, max: 0, default: -9 },
            tomLow: { min: -24, max: 0, default: -6 },
            tomMid: { min: -24, max: 0, default: -6 },
            tomHigh: { min: -24, max: 0, default: -6 },
            crash: { min: -24, max: 0, default: -12 },
            ride: { min: -24, max: 0, default: -12 },
            clap: { min: -24, max: 0, default: -6 },
            cowbell: { min: -24, max: 0, default: -9 }
        }
    },
    fmSynth: {
        name: 'FM Synth',
        synth: () => new Tone.FMSynth({
            harmonicity: 3.01,
            modulationIndex: 14,
            oscillator: { type: "sine" },
            envelope: { attack: 0.2, decay: 0.3, sustain: 0.1, release: 1.2 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.1 }
        })
    },
    amSynth: {
        name: 'AM Synth',
        synth: () => new Tone.AMSynth({
            harmonicity: 3.01,
            oscillator: { type: "sine" },
            envelope: { attack: 0.2, decay: 0.3, sustain: 0.1, release: 1.2 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.1 }
        })
    },
    duoSynth: {
        name: 'Duo Synth',
        synth: () => new Tone.DuoSynth({
            vibratoAmount: 0.5,
            vibratoRate: 5,
            harmonicity: 1.5,
            voice0: {
                oscillator: { type: "sine" },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4 },
                filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4 }
            },
            voice1: {
                oscillator: { type: "sine" },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4 },
                filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4 }
            }
        })
    },
    metalSynth: {
        name: 'Metal Synth',
        synth: () => new Tone.MetalSynth({
            frequency: 200,
            envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        })
    },
    pluckSynth: {
        name: 'Pluck Synth',
        synth: () => new Tone.PluckSynth({
            attackNoise: 1,
            dampening: 4000,
            resonance: 0.7
        })
    },
    monoSynth: {
        name: 'Mono Synth',
        synth: () => new Tone.MonoSynth({
            oscillator: { type: "sawtooth" },
            filter: { Q: 6, type: "lowpass", rolloff: -24 },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.9, release: 1 },
            filterEnvelope: { attack: 0.6, decay: 0.2, sustain: 0.5, release: 0.8, baseFrequency: 200, octaves: 3 }
        })
    },
    polySynth: {
        name: 'Poly Synth',
        synth: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.9, release: 1 }
        })
    }
};

const NOTE_LENGTHS = {
    '1n': 'Whole',
    '2n': 'Half',
    '4n': 'Quarter',
    '8n': 'Eighth',
    '16n': 'Sixteenth'
};

const EFFECTS = {
    reverb: {
        name: 'Reverb',
        effect: () => new Tone.Reverb({
            decay: 2.5,
            wet: 0.5
        })
    },
    delay: {
        name: 'Delay',
        effect: () => new Tone.FeedbackDelay({
            delayTime: 0.25,
            feedback: 0.5,
            wet: 0.5
        })
    },
    distortion: {
        name: 'Distortion',
        effect: () => new Tone.Distortion({
            distortion: 0.8,
            wet: 0.5
        })
    },
    chorus: {
        name: 'Chorus',
        effect: () => new Tone.Chorus({
            frequency: 1.5,
            delayTime: 3.5,
            depth: 0.7,
            wet: 0.5
        })
    }
};

export default function MusicMaker() {
    const { user } = useAuth();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [tracks, setTracks] = useState([]);
    const [effects, setEffects] = useState([]);
    const audioContextRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const gainNodeRef = useRef(null);
    const analyserNodeRef = useRef(null);
    const animationFrameRef = useRef(null);
    const [currentNote, setCurrentNote] = useState(null);
    const [drumVolumes, setDrumVolumes] = useState(
        Object.fromEntries(
            Object.entries(INSTRUMENTS.drums.volumeControls).map(([name, { default: defaultValue }]) => 
                [name, defaultValue]
            )
        )
    );
    const [metronomeEnabled, setMetronomeEnabled] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [showVisualizer, setShowVisualizer] = useState(false);
    const [currentColumn, setCurrentColumn] = useState(null);
    const visualizerRef = useRef(null);
    const [midiEnabled, setMidiEnabled] = useState(false);
    const [midiInputs, setMidiInputs] = useState([]);
    const [selectedMidiInput, setSelectedMidiInput] = useState(null);
    const [pianoRollNotes, setPianoRollNotes] = useState([]);
    const pianoRollRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedNotes, setRecordedNotes] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState(null);
    const [copiedNotes, setCopiedNotes] = useState([]);
    const [quantizeValue, setQuantizeValue] = useState(1); // 1 = no quantization
    const [selectedScale, setSelectedScale] = useState('C Major');
    const [selectedTrack, setSelectedTrack] = useState(1);
    const [noteLength, setNoteLength] = useState('8n');
    const [savedCompositions, setSavedCompositions] = useState([]);
    const [isExporting, setIsExporting] = useState(false);

    const initializeAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            gainNodeRef.current = audioContextRef.current.createGain();
            analyserNodeRef.current = audioContextRef.current.createAnalyser();
            gainNodeRef.current.connect(analyserNodeRef.current);
            analyserNodeRef.current.connect(audioContextRef.current.destination);
        }
    }, []);

    const cleanupAudioContext = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    useEffect(() => {
        initializeAudioContext();
        return () => {
            cleanupAudioContext();
        };
    }, [initializeAudioContext, cleanupAudioContext]);

    const handlePlay = useCallback(async () => {
        if (!audioContextRef.current) return;
        
        try {
            const audioBuffer = await exportToMP3(tracks, effects);
            sourceNodeRef.current = audioContextRef.current.createBufferSource();
            sourceNodeRef.current.buffer = audioBuffer;
            sourceNodeRef.current.connect(gainNodeRef.current);
            sourceNodeRef.current.start();
            setIsPlaying(true);
            
            const updateTime = () => {
                if (sourceNodeRef.current) {
                    setCurrentTime(sourceNodeRef.current.context.currentTime);
                    animationFrameRef.current = requestAnimationFrame(updateTime);
                }
            };
            updateTime();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }, [tracks, effects]);

    const handleStop = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }
        setIsPlaying(false);
        setCurrentTime(0);
    }, []);

    const handleSave = useCallback(async () => {
        if (!user) return;
        
        try {
            await addDoc(collection(db, 'compositions'), {
                userId: user.uid,
                tracks,
                effects,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving composition:', error);
        }
    }, [user, tracks, effects]);

    const handleExport = useCallback(async () => {
        try {
            const audioBuffer = await exportToMP3(tracks, effects);
            const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
            saveAs(blob, 'composition.mp3');
        } catch (error) {
            console.error('Error exporting audio:', error);
        }
    }, [tracks, effects]);

    // Calculate time per step based on tempo
    const timePerStep = useMemo(() => {
        // Calculate time per step in seconds
        // At 60 BPM, one beat = 1 second
        // Each step is 1/16th of a beat
        return (60 / tempo) / STEPS_PER_BEAT;
    }, [tempo]);

    // Draw the grid and notes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas dimensions
        canvas.width = 800;
        canvas.height = 400;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const gridSize = 20;
        const rows = Math.floor(height / gridSize);
        const cols = Math.floor(width / gridSize);
        const labelWidth = 40;

        // Clear canvas with a light background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);

        // Draw scale notes with alternating colors and labels
        const scaleNotes = SCALES[selectedScale];
        const octaves = Math.ceil(rows / scaleNotes.length);
        
        for (let octave = 0; octave < octaves; octave++) {
            scaleNotes.forEach((note, index) => {
                const y = rows - (octave * scaleNotes.length + index) - 1;
                if (y < 0) return;
                
                // Draw alternating background colors
                ctx.fillStyle = (octave * scaleNotes.length + index) % 2 === 0 ? '#ffffff' : '#f0f2f5';
                ctx.fillRect(0, y * gridSize, width, gridSize);
                
                // Draw note label with octave number
                ctx.fillStyle = '#333333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${note}${octave + 4}`, labelWidth / 2, y * gridSize + gridSize / 2);
            });
        }

        // Draw grid lines with subtle colors
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;

        // Draw horizontal lines
        for (let i = 0; i <= rows; i++) {
            ctx.beginPath();
            ctx.moveTo(labelWidth, i * gridSize);
            ctx.lineTo(width, i * gridSize);
            ctx.stroke();
        }

        // Draw vertical lines
        for (let i = 0; i <= cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize + labelWidth, 0);
            ctx.lineTo(i * gridSize + labelWidth, height);
            ctx.stroke();
        }

        // Draw notes for the selected track with rounded corners and note-specific colors
        const selectedTrackData = tracks.find(t => t.id === selectedTrack);
        if (selectedTrackData) {
            selectedTrackData.notes.forEach(note => {
                const x = note.x * gridSize + labelWidth;
                const y = note.y * gridSize;
                const size = gridSize;
                
                // Get the note name from the pitch
                const noteName = note.pitch.replace(/[0-9]/g, '');
                
                // Draw note with rounded corners and note-specific color
                ctx.beginPath();
                ctx.roundRect(x, y, size, size, 4);
                ctx.fillStyle = note === currentNote ? '#4a90e2' : (NOTE_COLORS[noteName] || '#6c757d');
                ctx.fill();
                
                // Add subtle shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                ctx.shadowBlur = 2;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
            });
        }

        // Draw current column highlight
        if (currentColumn !== null) {
            ctx.fillStyle = 'rgba(74, 144, 226, 0.2)';
            ctx.fillRect(currentColumn * gridSize + labelWidth, 0, gridSize, height);
        }
    }, [tracks, currentNote, selectedScale, selectedTrack, canvasRef, currentColumn]);

    // Add metronome
    useEffect(() => {
        let metronome = null;
        let metronomeLoop = null;

        const initMetronome = async () => {
            try {
                if (Tone.context.state !== 'running') {
                    await Tone.start();
                    console.log('Audio context started for metronome');
                }

                // Create metronome synth
                metronome = new Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 4,
                    oscillator: { type: "sine" },
                    envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
                }).toDestination();

                // Set the tempo
                Tone.Transport.bpm.value = tempo;
                console.log(`Metronome tempo set to ${tempo} BPM`);

                // Create the metronome loop
                metronomeLoop = new Tone.Loop((time) => {
                    metronome.triggerAttackRelease("C2", "16n", time);
                    setCurrentBeat(prev => (prev + 1) % 4);
                }, "4n").start(0);

                // Start the transport if it's not already running
                if (Tone.Transport.state !== 'started') {
                    Tone.Transport.start();
                }

                console.log('Metronome initialized and started');
            } catch (error) {
                console.error('Error initializing metronome:', error);
            }
        };

        const cleanupMetronome = () => {
            if (metronomeLoop) {
                metronomeLoop.dispose();
                metronomeLoop = null;
            }
            if (metronome) {
                metronome.dispose();
                metronome = null;
            }
            // Only stop transport if it's not being used for playback
            if (!isPlaying) {
                Tone.Transport.stop();
            }
            console.log('Metronome cleaned up');
        };

        if (metronomeEnabled) {
            initMetronome();
        } else {
            cleanupMetronome();
        }

        return () => {
            cleanupMetronome();
        };
    }, [metronomeEnabled, tempo, isPlaying]);

    // Add effect to handle tempo changes
    useEffect(() => {
        // Update transport tempo whenever it changes
        Tone.Transport.bpm.value = tempo;
        console.log(`Transport tempo updated to ${tempo} BPM`);

        // If we're currently playing, we need to restart the playback to apply the new tempo
        if (isPlaying) {
            stopPlayback();
            playSequence();
        }
    }, [tempo]);

    // Initialize audio
    useEffect(() => {
        let isMounted = true;
        let masterVolume = null;
        let audioContext = null;
        
        const initAudio = async () => {
            try {
                // Only initialize audio context if it's not already running
                if (Tone.context.state !== 'running') {
                    console.log('Audio context not running, waiting for user interaction');
                    return;
                }
                
                if (isMounted) {
                    // Create a master volume control with proper gain staging
                    masterVolume = new Tone.Volume(-6).toDestination();
                    console.log('Master volume created');
                    
                    // Initialize synths and effects for each track with proper timing
                    tracks.forEach(track => {
                        console.log(`Initializing track ${track.id} with instrument ${track.instrument}`);
                        if (!synthRefs.current[track.id]) {
                            const instrument = INSTRUMENTS[track.instrument];
                            if (instrument.isDrum) {
                                const drumPlayer = instrument.synth();
                                synthRefs.current[track.id] = drumPlayer;
                                // Connect drum player to master volume
                                drumPlayer.connect(masterVolume);
                                console.log(`Drum player initialized and connected for track ${track.id}`);
                            } else {
                                const synth = instrument.synth();
                                synthRefs.current[track.id] = synth;
                                synth.connect(masterVolume);
                                console.log(`Synth initialized and connected for track ${track.id}`);
                            }
                        }

                        // Initialize effects for the track
                        const trackEffects = Array.isArray(track.effects) ? track.effects : [];
                        trackEffects.forEach(effectName => {
                            if (!effectName || typeof effectName !== 'string') return;
                            
                            const effectKey = `${track.id}-${effectName}`;
                            if (!effectRefs.current[effectKey]) {
                                const effect = EFFECTS[effectName];
                                if (effect) {
                                    const effectInstance = effect.effect();
                                    effectRefs.current[effectKey] = effectInstance;
                                    const synth = synthRefs.current[track.id];
                                    if (synth) {
                                        synth.disconnect();
                                        synth.chain(effectInstance, masterVolume);
                                    }
                                }
                            }
                        });
                    });
                }
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        };

        // Initialize audio on component mount
        initAudio();

        return () => {
            isMounted = false;
            // Only clean up when component unmounts
            if (!isMounted) {
                // Clean up master volume
                if (masterVolume) {
                    masterVolume.dispose();
                    masterVolume = null;
                }
                
                // Clean up synths
                Object.values(synthRefs.current).forEach(synth => {
                    try {
                        if (synth && typeof synth.dispose === 'function') {
                            synth.dispose();
                            console.log('Synth disposed');
                        }
                    } catch (error) {
                        console.error('Error disposing synth:', error);
                    }
                });
                synthRefs.current = {};
                
                // Clean up effects
                Object.entries(effectRefs.current).forEach(([key, effect]) => {
                    try {
                        if (Array.isArray(effect)) {
                            effect.forEach(e => {
                                if (e && typeof e.dispose === 'function') {
                                    e.dispose();
                                }
                            });
                        } else if (effect && typeof effect.dispose === 'function') {
                            effect.dispose();
                        }
                    } catch (error) {
                        console.error(`Error disposing effect ${key}:`, error);
                    }
                });
                effectRefs.current = {};
                
                // Clean up parts
                Object.values(partRefs.current).forEach(parts => {
                    if (Array.isArray(parts)) {
                        parts.forEach(part => {
                            try {
                                if (part && typeof part.dispose === 'function') {
                                    part.dispose();
                                }
                            } catch (error) {
                                console.error('Error disposing part:', error);
                            }
                        });
                    }
                });
                partRefs.current = {};
            }
        };
    }, [tracks]);

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridSize = 20;
        const labelWidth = 40;

        // Adjust x coordinate to account for label width
        const adjustedX = x - labelWidth;
        if (adjustedX < 0) return; // Don't allow clicks in the label area

        // Convert click coordinates to grid positions
        const gridX = Math.floor(adjustedX / gridSize);
        const gridY = Math.floor(y / gridSize);

        const scaleNotes = SCALES[selectedScale];
        const noteIndex = scaleNotes.length - 1 - (gridY % scaleNotes.length);
        const octave = Math.floor(gridY / scaleNotes.length) + 4;
        const pitch = `${scaleNotes[noteIndex]}${octave}`;

        // Find the selected track
        const selectedTrackData = tracks.find(t => t.id === selectedTrack);
        if (!selectedTrackData) return;

        // Check if clicking on an existing note
        const existingNote = selectedTrackData.notes.find(
            note => note.x === gridX && note.y === gridY
        );

        // Update the selected track's notes
        setTracks(tracks.map(track => {
            if (track.id === selectedTrack) {
                if (existingNote) {
                    // Remove the note
                    return {
                        ...track,
                        notes: track.notes.filter(note => !(note.x === gridX && note.y === gridY))
                    };
                } else {
                    // Add a new note
                    return {
                        ...track,
                        notes: [...track.notes, {
                            x: gridX,
                            y: gridY,
                            pitch,
                            time: gridX * 16,
                            length: noteLength
                        }]
                    };
                }
            }
            return track;
        }));

        // Play the note immediately for feedback
        const track = tracks.find(t => t.id === selectedTrack);
        if (!track) return;

        // Ensure audio context is running
        const initAudio = async () => {
            try {
                if (Tone.context.state !== 'running') {
                    await Tone.start();
                    console.log('Audio context started for note playback');
                }
            } catch (error) {
                console.error('Error starting audio context:', error);
            }
        };

        // Initialize synth if needed
        const initSynth = async () => {
            try {
                await initAudio();
                
                if (!synthRefs.current[selectedTrack]) {
                    console.log('Initializing synth for track');
                    const instrument = INSTRUMENTS[track.instrument];
                    if (instrument.isDrum) {
                        const drumPlayer = instrument.synth();
                        synthRefs.current[selectedTrack] = drumPlayer;
                        console.log('Drum player initialized');
                    } else {
                        const synth = instrument.synth();
                        synthRefs.current[selectedTrack] = synth;
                        synth.toDestination();
                        console.log('Synth initialized and connected to destination');
                    }
                }
            } catch (error) {
                console.error('Error initializing synth:', error);
            }
        };

        // Play the note
        const playNote = async () => {
            try {
                await initSynth();
                const synth = synthRefs.current[selectedTrack];
                if (synth) {
                    const now = Tone.now();
                    if (INSTRUMENTS[track.instrument].isDrum) {
                        const drumType = INSTRUMENTS[track.instrument].drumMap[pitch];
                        if (drumType && typeof synth.player === 'function') {
                            synth.player(drumType).start(now);
                        }
                    } else if (typeof synth.triggerAttackRelease === 'function') {
                        synth.triggerAttackRelease(pitch, '8n', now);
                    }
                }
            } catch (error) {
                console.error('Error playing note:', error);
            }
        };

        playNote();
    };

    // Initialize audio and transport
    const initializeAudioAndTransport = useCallback(async () => {
        try {
            console.log('Starting playback sequence...');
            
            // Ensure audio context is running
            if (Tone.context.state !== 'running') {
                await Tone.start();
                console.log('Audio context started');
            }

            // Set tempo
            Tone.Transport.bpm.value = tempo;
            console.log(`Tempo set to ${tempo} BPM`);

            // Initialize synths for each track
            tracks.forEach(track => {
                if (!synthRefs.current[track.id]) {
                    const instrument = INSTRUMENTS[track.instrument];
                    if (instrument.isDrum) {
                        // Initialize drum player with proper setup
                        const drumPlayer = instrument.synth();
                        if (typeof drumPlayer === 'function') {
                            const player = drumPlayer();
                            synthRefs.current[track.id] = player;
                            player.connect(Tone.getDestination());
                            console.log(`Drum player initialized for track ${track.id}`);
                        } else {
                            console.error(`Invalid drum player for instrument ${track.instrument}`);
                        }
                    } else {
                        const synth = instrument.synth();
                        synthRefs.current[track.id] = synth;
                        synth.connect(Tone.getDestination());
                        console.log(`Synth initialized for track ${track.id}`);
                    }
                }
            });

            return true;
        } catch (error) {
            console.error('Error initializing audio and transport:', error);
            return false;
        }
    }, [tempo, tracks]);

    // Update the playSequence function to properly handle loop state and transport
    const playSequence = async () => {
        try {
            console.log('Starting playback sequence...');
            
            // Ensure audio context is running
            if (Tone.context.state !== 'running') {
                await Tone.start();
                console.log('Audio context started');
            }
            
            // Initialize audio and transport
            const initialized = await initializeAudioAndTransport();
            if (!initialized) {
                throw new Error('Failed to initialize audio and transport');
            }

            // Stop any existing playback
            Tone.Transport.stop();
            Tone.Transport.cancel();

            // Set tempo and timing parameters
            Tone.Transport.bpm.value = tempo;
            Tone.Transport.swing = 0;
            
            // Calculate timing values
            const timePerStep = (60 / tempo) / STEPS_PER_BEAT;
            const timePerBar = timePerStep * STEPS_PER_BAR;
            
            // Find the maximum note position
            const maxNotePosition = Math.max(
                ...tracks.flatMap(track => 
                    track.notes.map(note => note.x)
                ),
                0
            );
            
            // Set up looping
            const loopEnd = (maxNotePosition + 1) * timePerStep;
            Tone.Transport.loop = isLooping;
            Tone.Transport.loopStart = 0;
            Tone.Transport.loopEnd = loopEnd;
            Tone.Transport.seconds = 0;
            
            // Clean up existing parts
            Object.values(partRefs.current).forEach(parts => {
                parts.forEach(part => part?.dispose?.());
            });
            partRefs.current = {};

            // Create a master part to handle all tracks
            const masterPart = new Tone.Part((time, event) => {
                const { trackId, note, effects, offset } = event;
                const synth = synthRefs.current[trackId];
                if (!synth) return;

                const track = tracks.find(t => t.id === trackId);
                if (!track) return;

                // Ensure effects is always an array
                const safeEffects = Array.isArray(effects) ? effects : [];

                // Handle effects
                if (safeEffects.length > 0) {
                    safeEffects.forEach(effectName => {
                        if (!effectName || typeof effectName !== 'string') return;
                        
                        const effect = EFFECTS[effectName];
                        if (effect && !effectRefs.current[`${trackId}-${effectName}`]) {
                            const effectInstance = effect.effect();
                            effectRefs.current[`${trackId}-${effectName}`] = effectInstance;
                            
                            try {
                                if (synth.output) {
                                    synth.disconnect();
                                    synth.chain(effectInstance, Tone.getDestination());
                                }
                            } catch (error) {
                                console.error('Error connecting effect:', error);
                            }
                        }
                    });
                } else {
                    try {
                        if (synth.output && !synth.output.connection) {
                            synth.connect(Tone.getDestination());
                        }
                    } catch (error) {
                        console.error('Error connecting synth to destination:', error);
                    }
                }

                // Calculate the actual start time with the offset
                const startTime = time + offset;

                if (INSTRUMENTS[track.instrument]?.isDrum) {
                    const drumType = INSTRUMENTS[track.instrument]?.drumMap[note.pitch];
                    if (drumType) {
                        try {
                            if (typeof synth.player === 'function') {
                                synth.player(drumType).start(startTime);
                            } else if (typeof synth.triggerAttackRelease === 'function') {
                                synth.triggerAttackRelease(drumType, '8n', startTime);
                            }
                        } catch (error) {
                            console.error('Error playing drum:', error);
                        }
                    }
                } else {
                    const noteLength = (60 / tempo) * 
                        (note.length === '1n' ? 4 : 
                         note.length === '2n' ? 2 :
                         note.length === '4n' ? 1 :
                         note.length === '8n' ? 0.5 :
                         note.length === '16n' ? 0.25 : 0.5);
                    
                    try {
                        synth.triggerAttackRelease(note.pitch, Math.max(0.1, noteLength), startTime);
                    } catch (error) {
                        console.error('Error playing note:', error);
                    }
                }
            }, []);

            // Schedule notes for each track
            for (const track of tracks) {
                if (track.muted) continue;

                // Initialize synth if needed
                if (!synthRefs.current[track.id]) {
                    const instrument = INSTRUMENTS[track.instrument];
                    const synth = instrument.synth();
                    synthRefs.current[track.id] = synth;
                    
                    // Ensure track.effects is initialized as an array
                    if (!Array.isArray(track.effects)) {
                        track.effects = [];
                    }
                    
                    // Connect to destination if no effects
                    if (track.effects.length === 0) {
                        synth.connect(Tone.getDestination());
                    }
                }

                // Group notes by their start time
                const notesByTime = new Map();
                track.notes.forEach(note => {
                    const time = note.x * timePerStep;
                    if (!notesByTime.has(time)) {
                        notesByTime.set(time, []);
                    }
                    notesByTime.get(time).push(note);
                });

                // Sort times and schedule notes with small offsets
                const sortedTimes = Array.from(notesByTime.keys()).sort((a, b) => a - b);
                sortedTimes.forEach(time => {
                    const notes = notesByTime.get(time);
                    notes.forEach((note, index) => {
                        // Add a small offset (1ms) for each note at the same time
                        const offset = index * 0.001;
                        masterPart.add(time, { 
                            trackId: track.id, 
                            note,
                            effects: Array.isArray(track.effects) ? track.effects : [],
                            offset
                        });
                    });
                });
            }

            // Start the master part
            masterPart.start(0);
            masterPart.loop = isLooping;
            masterPart.loopEnd = loopEnd;

            // Store the master part
            partRefs.current.master = [masterPart];

            // Start playback with a small delay to ensure everything is ready
            setIsPlaying(true);
            await new Promise(resolve => setTimeout(resolve, 50));
            await Tone.Transport.start('+0.1');

        } catch (error) {
            console.error('Playback error:', error);
            setIsPlaying(false);
            Tone.Transport.stop();
            Tone.Transport.cancel();
            
            // Clean up
            Object.values(partRefs.current).forEach(parts => {
                parts.forEach(part => part?.dispose?.());
            });
            partRefs.current = {};
        }
    };

    // Update the effect that handles transport position updates
    useEffect(() => {
        if (!isPlaying) return;

        let lastUpdateTime = 0;
        const updateInterval = 16; // 60fps for smooth updates
        let animationFrameId = null;

        const handleTransport = () => {
            try {
                const currentTime = Tone.Transport.seconds;
                const timePerStep = (60 / tempo) / STEPS_PER_BEAT;
                
                // Calculate the maximum note position across all tracks
                const maxNotePosition = Math.max(
                    ...tracks.flatMap(track => 
                        track.notes.map(note => note.x)
                    ),
                    0
                );
                
                // Calculate loop end point in seconds
                const loopEnd = (maxNotePosition + 1) * timePerStep;
                
                let adjustedTime = currentTime;
                let currentStep;
                let currentCol;

                if (isLooping) {
                    // If looping, wrap the time within the loop boundaries
                    adjustedTime = currentTime % loopEnd;
                    currentStep = Math.floor(adjustedTime / timePerStep);
                    currentCol = Math.min(currentStep, maxNotePosition);
                    
                    // Force transport position to stay within loop boundaries
                    if (currentTime >= loopEnd) {
                        Tone.Transport.seconds = adjustedTime;
                            }
                        } else {
                    // If not looping, stop at the last note
                    currentStep = Math.floor(currentTime / timePerStep);
                    currentCol = Math.min(currentStep, maxNotePosition);
                    
                    // Stop playback if we've reached the end
                    if (currentTime >= loopEnd) {
                        stopPlayback();
                        return;
                    }
                }
                
                // Update the current column and playback position
                setCurrentColumn(currentCol);
                setPlaybackPosition(adjustedTime.toFixed(2));
                lastUpdateTime = currentTime;

                // Schedule next update
                if (isPlaying) {
                    animationFrameId = requestAnimationFrame(handleTransport);
                        }
                    } catch (error) {
                console.error('Error in transport handler:', error);
                if (isPlaying) {
                    stopPlayback();
                }
            }
        };

        // Start the transport position updates
        handleTransport();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying, tempo, tracks, isLooping]);

    // Update the toggleLoop function to properly handle loop state
    const toggleLoop = () => {
        const newLoopState = !isLooping;
        setIsLooping(newLoopState);
        
        // Update transport loop state
        Tone.Transport.loop = newLoopState;
        
        if (isPlaying) {
            // Update all parts' loop state
            Object.values(partRefs.current).forEach(parts => {
                parts.forEach(part => {
                    if (part) {
                        part.loop = newLoopState;
                    }
                    });
                });

            // If turning off loop, ensure transport continues past loop point
            if (!newLoopState) {
                const timePerStep = (60 / tempo) / STEPS_PER_BEAT;
                const maxNotePosition = Math.max(
                    ...tracks.flatMap(track => 
                        track.notes.map(note => note.x)
                    ),
                    0
                );
                const loopEnd = (maxNotePosition + 1) * timePerStep;
                
                if (Tone.Transport.seconds >= loopEnd) {
                    Tone.Transport.seconds = loopEnd;
                }
            }
        }
    };

    // Update the stopPlayback function to properly clean up
    const stopPlayback = () => {
        console.log('Stopping playback...');
        setIsPlaying(false);
        
        // Stop transport and cancel all events
        Tone.Transport.stop();
        Tone.Transport.cancel();
        
        // Clean up parts
        Object.values(partRefs.current).forEach(parts => {
            parts.forEach(part => {
                if (part && typeof part.dispose === 'function') {
                    part.dispose();
                }
            });
        });
        partRefs.current = {};
        
        // Reset transport position
        Tone.Transport.seconds = 0;
        
        // Reset current column and playback position
        setCurrentColumn(null);
        setPlaybackPosition('0.00');
    };

    const clearNotes = () => {
        setTracks(tracks.map(track => 
            track.id === selectedTrack ? { ...track, notes: [] } : track
        ));
        setPianoRollNotes([]); // Clear piano roll notes
    };

    const saveComposition = () => {
        const composition = {
            notes: tracks[selectedTrack - 1].notes,
            tempo,
            instrument: tracks[selectedTrack - 1].instrument,
            scale: selectedScale,
            effects: Array.isArray(tracks[selectedTrack - 1].effects) ? tracks[selectedTrack - 1].effects : [], // Ensure effects is an array
            date: new Date().toISOString()
        };
        setSavedCompositions([...savedCompositions, composition]);
        localStorage.setItem('compositions', JSON.stringify([...savedCompositions, composition]));
    };

    const loadComposition = (composition) => {
        setTracks(tracks.map(track => 
            track.id === selectedTrack ? { 
                ...track, 
                notes: composition.notes,
                effects: Array.isArray(composition.effects) ? composition.effects : [] // Ensure effects is an array
            } : track
        ));
        setTempo(composition.tempo);
        setSelectedScale(composition.scale);
    };

    const deleteComposition = (index) => {
        const newCompositions = savedCompositions.filter((_, i) => i !== index);
        setSavedCompositions(newCompositions);
        localStorage.setItem('compositions', JSON.stringify(newCompositions));
    };

    const clearAllCompositions = () => {
        setSavedCompositions([]);
        localStorage.removeItem('compositions');
    };

    const handlePlayButtonClick = useCallback(async () => {
        try {
            console.log('Play button clicked');
            
            const audioInitialized = await initializeAudio();
            if (!audioInitialized) {
                throw new Error('Failed to initialize audio');
            }

            // Initialize audio and transport
            const initialized = await initializeAudioAndTransport();
            if (!initialized) {
                throw new Error('Failed to initialize audio and transport');
            }

            // Set tempo
            Tone.Transport.bpm.value = tempo;
            console.log(`Tempo set to ${tempo} BPM`);

            // Start playback
            await playSequence();
            console.log('Playback started');

        } catch (error) {
            console.error('Error starting playback:', error);
            // Reset state on error
            setIsPlaying(false);
            Tone.Transport.stop();
            Tone.Transport.cancel();
        }
    }, [tempo, tracks, isLooping, initializeAudio, initializeAudioAndTransport, playSequence]);

    useEffect(() => {
        // Initialize AudioContext on component mount
        initializeAudioContext();

        // Add event listener for user interaction
        const handleUserInteraction = () => {
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };

        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            cleanupAudioContext();
        };
    }, [initializeAudioContext, cleanupAudioContext]);

    // Add cleanup for effects when component unmounts or track changes
    useEffect(() => {
        return () => {
            // Clean up effects
            Object.entries(effectRefs.current).forEach(([key, effect]) => {
                try {
                    if (Array.isArray(effect)) {
                        effect.forEach(e => {
                            if (e && typeof e.dispose === 'function') {
                                e.dispose();
                            }
                        });
                    } else if (effect && typeof effect.dispose === 'function') {
                        effect.dispose();
                    }
                } catch (error) {
                    console.error(`Error disposing effect ${key}:`, error);
                }
            });
            effectRefs.current = {};

            // Clean up synths
            Object.values(synthRefs.current).forEach(synth => {
                if (synth && typeof synth.dispose === 'function') {
                    try {
                        synth.dispose();
                    } catch (error) {
                        console.error('Error disposing synth:', error);
                    }
                }
            });
            synthRefs.current = {};

            // Clean up parts
            Object.values(partRefs.current).forEach(parts => {
                if (Array.isArray(parts)) {
                    parts.forEach(part => {
                        if (part && typeof part.dispose === 'function') {
                            try {
                                part.dispose();
                            } catch (error) {
                                console.error('Error disposing part:', error);
                            }
                        }
                    });
                }
            });
            partRefs.current = {};

            // Stop transport and reset state
            try {
                Tone.Transport.stop();
                Tone.Transport.cancel();
            } catch (error) {
                console.error('Error stopping transport:', error);
            }
        };
    }, []);

    // Update the track change effect to handle effects safely
    useEffect(() => {
        if (!tracks || !Array.isArray(tracks)) return;

        tracks.forEach(track => {
            if (!track || typeof track !== 'object') return;

            const synth = synthRefs.current[track.id];
            if (!synth) return;

            // Ensure effects is always an array
            const trackEffects = Array.isArray(track.effects) ? track.effects : [];
            
            // Clean up existing effects for this track
            trackEffects.forEach(effectName => {
                if (!effectName || typeof effectName !== 'string') return;
                
                const effectKey = `${track.id}-${effectName}`;
                const effect = effectRefs.current[effectKey];
                if (effect && typeof effect.dispose === 'function') {
                    try {
                        effect.dispose();
                        delete effectRefs.current[effectKey];
                    } catch (error) {
                        console.error(`Error cleaning up effect ${effectName} for track ${track.id}:`, error);
                    }
                }
            });

            // Reconnect synth to destination if no effects
            if (trackEffects.length === 0) {
                try {
                    if (synth.output) {
                        synth.disconnect();
                        synth.connect(Tone.getDestination());
                    }
                } catch (error) {
                    console.error(`Error connecting synth for track ${track.id}:`, error);
                }
            }
        });
    }, [tracks]);

    const cleanupAudioResources = () => {
        try {
            // Clean up effects
            Object.entries(effectRefs.current).forEach(([key, effect]) => {
                try {
                    if (effect && typeof effect.dispose === 'function') {
                        effect.dispose();
                    }
                } catch (error) {
                    console.error(`Error disposing effect ${key}:`, error);
                }
            });
            effectRefs.current = {};

            // Clean up synths
            Object.entries(synthRefs.current).forEach(([key, synth]) => {
                try {
                    if (synth && typeof synth.dispose === 'function') {
                        synth.dispose();
                    }
                } catch (error) {
                    console.error(`Error disposing synth ${key}:`, error);
                }
            });
            synthRefs.current = {};

            // Clean up parts
            Object.entries(partRefs.current).forEach(([key, parts]) => {
                parts.forEach(part => {
                    try {
                        if (part && typeof part.dispose === 'function') {
                            part.dispose();
                        }
                    } catch (error) {
                        console.error(`Error disposing part ${key}:`, error);
                    }
                });
            });
            partRefs.current = {};

            // Stop transport and reset state
            try {
                Tone.Transport.stop();
                Tone.Transport.cancel();
            } catch (error) {
                console.error('Error stopping transport:', error);
            }

            // Clean up audio context if it exists
            if (audioContextRef.current) {
                try {
                    if (audioContextRef.current.state !== 'closed') {
                        audioContextRef.current.close();
                    }
                } catch (error) {
                    console.error('Error closing audio context:', error);
                }
            }
        } catch (error) {
            console.error('Error in cleanupAudioResources:', error);
        }
    };

    // Update the cleanup effect
    useEffect(() => {
        return () => {
            cleanupAudioResources();
        };
    }, []);

    // Update the track change effect
    useEffect(() => {
        if (!tracks || !Array.isArray(tracks)) return;

        const cleanupTrackResources = (trackId) => {
            try {
                // Clean up effects for this track
                Object.entries(effectRefs.current).forEach(([key, effect]) => {
                    if (key.startsWith(`${trackId}-`)) {
                        try {
                            if (effect && typeof effect.dispose === 'function') {
                                effect.dispose();
                            }
                            delete effectRefs.current[key];
                        } catch (error) {
                            console.error(`Error cleaning up effect ${key} for track ${trackId}:`, error);
                        }
                    }
                });

                // Clean up synth for this track
                const synth = synthRefs.current[trackId];
                if (synth) {
                    try {
                        if (typeof synth.dispose === 'function') {
                            synth.dispose();
                        }
                        delete synthRefs.current[trackId];
                    } catch (error) {
                        console.error(`Error cleaning up synth for track ${trackId}:`, error);
                    }
                }
            } catch (error) {
                console.error(`Error in cleanupTrackResources for track ${trackId}:`, error);
            }
        };

        tracks.forEach(track => {
            if (!track || typeof track !== 'object') return;

            const synth = synthRefs.current[track.id];
            if (!synth) return;

            // Ensure effects is always an array
            const trackEffects = Array.isArray(track.effects) ? track.effects : [];
            
            // Clean up existing effects for this track
            trackEffects.forEach(effectName => {
                if (!effectName || typeof effectName !== 'string') return;
                
                const effectKey = `${track.id}-${effectName}`;
                const effect = effectRefs.current[effectKey];
                if (effect && typeof effect.dispose === 'function') {
                    try {
                        effect.dispose();
                        delete effectRefs.current[effectKey];
                    } catch (error) {
                        console.error(`Error cleaning up effect ${effectName} for track ${track.id}:`, error);
                    }
                }
            });

            // Reconnect synth to destination if no effects
            if (trackEffects.length === 0) {
                try {
                    if (synth.output) {
                        synth.disconnect();
                        synth.connect(Tone.getDestination());
                    }
                } catch (error) {
                    console.error(`Error connecting synth for track ${track.id}:`, error);
                }
            }
        });

        return () => {
            tracks.forEach(track => {
                if (track && track.id) {
                    cleanupTrackResources(track.id);
                }
            });
        };
    }, [tracks]);

    const clearTrack = (trackId) => {
        setTracks(tracks.map(track => 
            track.id === trackId 
                ? { ...track, notes: [] }
                : track
        ));
    };

    return (
        <div className="flex flex-col items-center space-y-4 p-4">
            <div className="flex flex-wrap gap-4 justify-center">
                <button
                    onClick={handlePlayButtonClick}
                    disabled={isPlaying}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-700 flex items-center gap-2"
                >
                    <FaPlay /> {isPlaying ? 'Playing...' : 'Play'}
                </button>
                <button
                    onClick={stopPlayback}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                >
                    <FaStop /> Stop
                </button>
                <button
                    onClick={clearNotes}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                >
                    <FaTrash /> Clear
                </button>
                <button
                    onClick={addTrack}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <FaPlus /> Add Track
                </button>
                <button
                    onClick={handleExport}
                    disabled={isExporting || tracks.every(track => track.notes.length === 0)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-700 flex items-center gap-2"
                >
                    <FaDownload /> {isExporting ? 'Exporting...' : 'Export'}
                </button>
                <select
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded"
                >
                    <option value={60}>60 BPM</option>
                    <option value={80}>80 BPM</option>
                    <option value={100}>100 BPM</option>
                    <option value={120}>120 BPM</option>
                    <option value={140}>140 BPM</option>
                </select>
                <select
                    value={selectedScale}
                    onChange={(e) => setSelectedScale(e.target.value)}
                    className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded"
                >
                    {Object.keys(SCALES).map(scale => (
                        <option key={scale} value={scale}>{scale}</option>
                    ))}
                </select>
                <select
                    value={noteLength}
                    onChange={(e) => setNoteLength(e.target.value)}
                    className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded"
                >
                    {Object.entries(NOTE_LENGTHS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <button
                    onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                    className={`px-4 py-2 ${metronomeEnabled ? 'bg-yellow-600' : 'bg-gray-700'} text-white rounded hover:bg-yellow-700 flex items-center gap-2`}
                >
                    <FaMusic /> {metronomeEnabled ? 'Metronome On' : 'Metronome Off'}
                </button>
                <button
                    onClick={() => setShowVisualizer(!showVisualizer)}
                    className={`px-4 py-2 ${showVisualizer ? 'bg-purple-600' : 'bg-gray-700'} text-white rounded hover:bg-purple-700 flex items-center gap-2`}
                >
                    <FaChartLine /> {showVisualizer ? 'Hide Visualizer' : 'Show Visualizer'}
                </button>
                <button
                    onClick={() => setMidiEnabled(!midiEnabled)}
                    className={`px-4 py-2 ${midiEnabled ? 'bg-green-600' : 'bg-gray-700'} text-white rounded hover:bg-green-700 flex items-center gap-2`}
                >
                    <FaKeyboard /> {midiEnabled ? 'MIDI On' : 'MIDI Off'}
                </button>
                <button
                    onClick={() => setShowPianoRoll(!showPianoRoll)}
                    className={`px-4 py-2 ${showPianoRoll ? 'bg-blue-600' : 'bg-gray-700'} text-white rounded hover:bg-blue-700 flex items-center gap-2`}
                >
                    <FaMusic /> {showPianoRoll ? 'Hide Piano Roll' : 'Show Piano Roll'}
                </button>
                <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-4 py-2 ${isRecording ? 'bg-red-600' : 'bg-gray-700'} text-white rounded hover:bg-red-700 flex items-center gap-2`}
                >
                    <FaRecordVinyl /> {isRecording ? 'Stop Recording' : 'Record MIDI'}
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            if (selectedNotes.length > 0) {
                                setCopiedNotes(selectedNotes);
                            }
                        }}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2"
                    >
                        <FaCopy /> Copy
                    </button>
                    <button
                        onClick={() => {
                            if (copiedNotes.length > 0) {
                                const offset = Math.max(...pianoRollNotes.map(n => n.x)) + 1;
                                const newNotes = copiedNotes.map(note => ({
                                    ...note,
                                    x: note.x + offset,
                                    id: Date.now() + Math.random()
                                }));
                                setPianoRollNotes(prev => [...prev, ...newNotes]);
                            }
                        }}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2"
                    >
                        <FaPaste /> Paste
                    </button>
                </div>
                <select
                    value={quantizeValue}
                    onChange={(e) => setQuantizeValue(Number(e.target.value))}
                    className="px-4 py-2 bg-gray-700 text-white rounded"
                >
                    <option value={1}>No Quantization</option>
                    <option value={2}>1/2</option>
                    <option value={4}>1/4</option>
                    <option value={8}>1/8</option>
                    <option value={16}>1/16</option>
                </select>
                <button
                    onClick={toggleLoop}
                    className={`px-4 py-2 ${isLooping ? 'bg-green-600' : 'bg-gray-700'} text-white rounded hover:bg-green-700 flex items-center gap-2`}
                >
                    <FaSync /> {isLooping ? 'Loop On' : 'Loop Off'}
                </button>
            </div>

            {/* Track Controls */}
            <div className="w-full max-w-4xl space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Tracks ({tracks.length}/7)</h2>
                </div>
                {tracks.map(track => (
                    <div key={track.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <input
                                    type="text"
                                    value={track.name}
                                    onChange={(e) => setTracks(tracks.map(t => 
                                        t.id === track.id ? { ...t, name: e.target.value } : t
                                    ))}
                                    className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded w-32"
                                    placeholder="Track name"
                                />
                                <select
                                    value={track.instrument}
                                    onChange={(e) => setTracks(tracks.map(t => 
                                        t.id === track.id ? { ...t, instrument: e.target.value } : t
                                    ))}
                                    className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded"
                                >
                                    {Object.entries(INSTRUMENTS).map(([key, { name }]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setSelectedTrack(track.id)}
                                    className={`px-3 py-1 rounded flex items-center gap-1 ${
                                        selectedTrack === track.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                                    }`}
                                >
                                    <FaCheck /> Select
                                </button>
                                <button
                                    onClick={() => clearTrack(track.id)}
                                    className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-1"
                                >
                                    <FaEraser /> Clear
                                </button>
                                {tracks.length > 1 && (
                                    <button
                                        onClick={() => removeTrack(track.id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                                    >
                                        <FaTrash /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Effects */}
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(EFFECTS).map(effectName => (
                                    <button
                                        key={effectName}
                                        onClick={() => {
                                            if (track.effects.includes(effectName)) {
                                                removeEffect(track.id, effectName);
                                            } else {
                                                addEffect(track.id, effectName);
                                            }
                                        }}
                                        className={`px-2 py-1 rounded ${
                                            track.effects.includes(effectName) ? 'bg-purple-600 text-white' : 'bg-gray-700 text-white'
                                        }`}
                                    >
                                        {EFFECTS[effectName].name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Canvas for selected track */}
                        {selectedTrack === track.id && (
                            <canvas
                                ref={canvasRef}
                                width={800}
                                height={400}
                                className="border border-gray-700 rounded cursor-pointer bg-gray-900"
                                onClick={handleCanvasClick}
                            />
                        )}
                    </div>
                ))}
                {tracks.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <p>No tracks yet. Click "Add Track" to get started!</p>
                    </div>
                )}
            </div>

            {/* Drum Volume Controls */}
            {selectedTrack && INSTRUMENTS[tracks.find(t => t.id === selectedTrack)?.instrument]?.isDrum && (
                <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-white">Drum Volumes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(INSTRUMENTS.drums.volumeControls).map(([name, { min, max }]) => (
                            <div key={name} className="flex flex-col space-y-2">
                                <label className="text-white capitalize">{name}</label>
                                <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    value={drumVolumes[name]}
                                    onChange={(e) => updateDrumVolume(name, parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <span className="text-white text-sm">{drumVolumes[name]} dB</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {savedCompositions.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={clearAllCompositions}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                    >
                        <FaTrash /> Clear All Compositions
                    </button>
                </div>
            )}

            {savedCompositions.length > 0 && (
                <div className="w-full max-w-4xl mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-white">Saved Compositions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedCompositions.map((comp, index) => (
                            <div
                                key={index}
                                className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 relative group bg-gray-800"
                            >
                                <div 
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteComposition(index);
                                    }}
                                >
                                    <button className="p-1 text-red-500 hover:text-red-700">
                                        <FaTrash />
                                    </button>
                                </div>
                                <div 
                                    className="cursor-pointer"
                                    onClick={() => loadComposition(comp)}
                                >
                                    <div className="flex items-center gap-2">
                                        <FaMusic className="text-gray-400" />
                                        <span className="font-medium text-white">
                                            Composition {index + 1}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        {new Date(comp.date).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {comp.notes.length} notes • {comp.tempo} BPM • {comp.instrument}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Visualizer */}
            {showVisualizer && (
                <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Audio Visualizer</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowVisualizer(false)}
                                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <canvas
                            ref={visualizerRef}
                            width={800}
                            height={300}
                            className="w-full h-48 bg-gray-900 rounded-lg shadow-inner"
                        />
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-50 rounded-lg" />
                        </div>
                    </div>
                </div>
            )}

            {/* Playback Position Indicator */}
            {isPlaying && (
                <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                        <div className="text-white">Position: {playbackPosition}</div>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-100"
                                style={{
                                    width: `${(() => {
                                        try {
                                            // Safely parse the position
                                            const positionStr = typeof playbackPosition === 'string' ? playbackPosition : playbackPosition.toString();
                                            const bars = parseInt(positionStr.split(':')[0] || '0');
                                            return Math.min(100, (bars / 16) * 100);
                                        } catch (error) {
                                            console.error('Error calculating position:', error);
                                            return 0;
                                        }
                                    })()}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Beat Indicator */}
            {metronomeEnabled && (
                <div className="flex gap-2">
                    {[0, 1, 2, 3].map((beat) => (
                        <div
                            key={beat}
                            className={`w-4 h-4 rounded-full ${
                                currentBeat === beat ? 'bg-yellow-500' : 'bg-gray-700'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* MIDI Input Selector */}
            {midiEnabled && (
                <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg">
                    <select
                        value={selectedMidiInput?.id || ''}
                        onChange={(e) => {
                            const input = midiInputs.find(i => i.id === e.target.value);
                            setSelectedMidiInput(input);
                        }}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                    >
                        <option value="">Select MIDI Input</option>
                        {midiInputs.map(input => (
                            <option key={input.id} value={input.id}>
                                {input.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Piano Roll */}
            {showPianoRoll && (
                <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg">
                    <canvas
                        ref={pianoRollRef}
                        width={800}
                        height={400}
                        className="w-full h-96 bg-gray-900 rounded cursor-pointer"
                        onMouseDown={handlePianoRollMouseDown}
                        onMouseMove={handlePianoRollMouseMove}
                        onMouseUp={handlePianoRollMouseUp}
                        onMouseLeave={handlePianoRollMouseUp}
                    />
                </div>
            )}

            {/* Keyboard Shortcuts Help */}
            <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-white">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-gray-300">
                        <p><span className="font-mono bg-gray-700 px-2 py-1 rounded">Space</span> Play/Stop</p>
                        <p><span className="font-mono bg-gray-700 px-2 py-1 rounded">R</span> Toggle Recording</p>
                        <p><span className="font-mono bg-gray-700 px-2 py-1 rounded">Ctrl+C</span> Copy Notes</p>
                    </div>
                    <div className="text-gray-300">
                        <p><span className="font-mono bg-gray-700 px-2 py-1 rounded">Ctrl+V</span> Paste Notes</p>
                        <p><span className="font-mono bg-gray-700 px-2 py-1 rounded">Delete</span> Delete Notes</p>
                        <p><span className="font-mono bg-gray-700 px-2 py-1 rounded">Ctrl+Q</span> Quantize</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 