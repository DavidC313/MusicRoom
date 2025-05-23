'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as Tone from 'tone';
import { FaPlay, FaStop, FaTrash, FaSave, FaUpload, FaMusic, FaDownload, FaPlus, FaChartLine, FaKeyboard, FaRecordVinyl, FaCut, FaCopy, FaPaste, FaSync, FaCheck, FaEraser } from 'react-icons/fa';

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
    const [tracks, setTracks] = useState([
        {
            id: 1,
            name: 'Track 1',
            notes: [],
            instrument: 'piano',
            effects: [], // Explicitly initialize as empty array
            volume: 0,
            muted: false,
            solo: false
        }
    ]);
    const [selectedTrack, setSelectedTrack] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [tempo, setTempo] = useState(120);
    const [selectedScale, setSelectedScale] = useState('C Major');
    const [noteLength, setNoteLength] = useState('8n');
    const [currentNote, setCurrentNote] = useState(null);
    const [savedCompositions, setSavedCompositions] = useState([]);
    const [showPianoRoll, setShowPianoRoll] = useState(false);
    const canvasRef = useRef(null);
    const synthRefs = useRef({});
    const effectRefs = useRef({});
    const animationFrameRef = useRef(null);
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
    const [audioContext, setAudioContext] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const partRefs = useRef({});
    const [isLooping, setIsLooping] = useState(false);
    const [loopEnd, setLoopEnd] = useState(0);

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

    const exportToMP3 = async () => {
        if (isExporting || tracks.every(track => track.notes.length === 0)) {
            console.log('Export skipped: already exporting or no notes');
            return;
        }

        let offlineContext = null;
        let originalContext = null;
        let masterVolume = null;
        let synths = {};
        let effects = {};

        try {
            console.log('Starting export process...');
            setIsExporting(true);
            
            // Ensure audio context is running
            if (Tone.context.state !== 'running') {
                console.log('Starting audio context for export...');
                await Tone.start();
                console.log('Audio context started');
            }

            // Calculate timing values with safety checks
            const beatsPerMinute = Math.max(20, Math.min(300, tempo)); // Ensure tempo is within reasonable bounds
            const secondsPerBeat = 60 / beatsPerMinute;
            const timePerStep = secondsPerBeat / STEPS_PER_BEAT;
            const timePerBar = timePerStep * STEPS_PER_BAR;
            console.log(`BPM: ${beatsPerMinute}, Time per beat: ${secondsPerBeat}s, Time per step: ${timePerStep}s, Time per bar: ${timePerBar}s`);

            // Calculate duration with padding and minimum duration
            const maxNoteTime = Math.max(...tracks.flatMap(track => 
                track.notes.map(note => note.x)
            ));
            const minDuration = 10; // Minimum 10 seconds
            const duration = Math.max(minDuration, (maxNoteTime * timePerStep) + 4);
            console.log(`Export duration: ${duration} seconds, Tempo: ${tempo} BPM`);

            // Create offline context with higher sample rate
            console.log('Creating offline context...');
            offlineContext = new Tone.OfflineContext(2, duration, 44100);
            originalContext = Tone.context;
            Tone.setContext(offlineContext);
            console.log('Offline context created and set');

            // Create a master volume with proper gain staging
            masterVolume = new Tone.Volume(-6).toDestination();
            console.log('Master volume created for export');
            
            // Initialize all synths and effects
            console.log('Initializing synths and effects for export...');
            tracks.forEach(track => {
                if (track.muted) {
                    console.log(`Track ${track.id} is muted, skipping`);
                    return;
                }
                
                const instrument = INSTRUMENTS[track.instrument];
                if (instrument.isDrum) {
                    const drumPlayer = instrument.synth();
                    synths[track.id] = drumPlayer;
                    
                    // Initialize drum volumes
                    if (drumPlayer.volumes) {
                        Object.entries(drumPlayer.volumes).forEach(([name, volume]) => {
                            if (volume && !volume.volume) {
                                const volumeNode = new Tone.Volume(drumVolumes[name] || 0);
                                volume.connect(volumeNode);
                                volumeNode.connect(masterVolume);
                                volume.volume = volumeNode;
                            }
                        });
                    } else {
                        drumPlayer.connect(masterVolume);
                    }
                    console.log(`Drum player initialized for track ${track.id}`);
                } else {
                    const synth = instrument.synth();
                    synths[track.id] = synth;
                    
                    // Initialize effects chain
                    if (track.effects && track.effects.length > 0) {
                        let lastNode = synth;
                        track.effects.forEach(effectName => {
                            const effect = EFFECTS[effectName];
                            if (effect) {
                                const effectInstance = effect.effect();
                                effects[`${track.id}-${effectName}`] = effectInstance;
                                lastNode.chain(effectInstance);
                                lastNode = effectInstance;
                            }
                        });
                        lastNode.connect(masterVolume);
                    } else {
                        synth.connect(masterVolume);
                    }
                    console.log(`Synth initialized for track ${track.id}`);
                }
            });

            // Collect all notes and group them by time
            console.log('Collecting and grouping notes...');
            const noteGroups = new Map();
            tracks.forEach(track => {
                if (track.muted) return;
                
                const synth = synths[track.id];
                const instrument = INSTRUMENTS[track.instrument];
                
                track.notes.forEach(note => {
                    const time = note.x * timePerStep;
                    const scaleNotes = SCALES[selectedScale];
                    const noteIndex = scaleNotes.length - 1 - (note.y % scaleNotes.length);
                    const octave = Math.floor(note.y / scaleNotes.length) + 4;
                    const noteName = `${scaleNotes[noteIndex]}${octave}`;
                    
                    const group = noteGroups.get(time) || [];
                    group.push({
                        time,
                        noteName,
                        synth,
                        instrument,
                        length: note.length || noteLength,
                        velocity: 0.8 + (Math.random() * 0.2) // Add slight velocity variation
                    });
                    noteGroups.set(time, group);
                });
            });

            // Sort times and schedule notes with proper timing
            console.log('Scheduling notes for export...');
            const sortedTimes = Array.from(noteGroups.keys()).sort((a, b) => a - b);
            
            // Schedule notes in chronological order with proper timing
            for (let i = 0; i < sortedTimes.length; i++) {
                const time = sortedTimes[i];
                const notes = noteGroups.get(time);
                
                // Add small offsets to notes that start at the same time
                notes.forEach((note, index) => {
                    const offsetTime = time + (index * 0.001); // Small offset to prevent timing conflicts
                    
                    if (note.instrument.isDrum) {
                        const drumType = note.instrument.drumMap[note.noteName];
                        if (drumType && typeof note.synth.player === 'function') {
                            note.synth.player(drumType).start(offsetTime);
                            console.log(`Scheduled drum ${drumType} at time ${offsetTime}`);
                        }
                    } else if (typeof note.synth.triggerAttackRelease === 'function') {
                        // Calculate note length in seconds based on tempo and note length
                        const noteLengthInSeconds = secondsPerBeat * 
                            (note.length === '1n' ? 4 : 
                             note.length === '2n' ? 2 :
                             note.length === '4n' ? 1 :
                             note.length === '8n' ? 0.5 :
                             note.length === '16n' ? 0.25 : 0.5);
                        
                        // Ensure minimum note length
                        const minNoteLength = 0.1; // 100ms minimum
                        const finalNoteLength = Math.max(minNoteLength, noteLengthInSeconds);
                        
                        try {
                            note.synth.triggerAttackRelease(
                                note.noteName, 
                                finalNoteLength, 
                                offsetTime,
                                note.velocity
                            );
                            console.log(`Scheduled note ${note.noteName} at time ${offsetTime} for ${finalNoteLength} seconds`);
                        } catch (error) {
                            console.error(`Error scheduling note at time ${offsetTime}:`, error);
                        }
                    }
                });
            }

            // Render the audio with proper timing
            console.log('Rendering audio...');
            const buffer = await offlineContext.render();
            console.log('Audio rendered successfully');

            // Convert the buffer to a WAV file
            console.log('Converting to WAV format...');
            const wavBuffer = new ArrayBuffer(44 + buffer.length * 2);
            const view = new DataView(wavBuffer);
            
            // Write WAV header
            const writeString = (offset, string) => {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            };
            
            writeString(0, 'RIFF');
            view.setUint32(4, 36 + buffer.length * 2, true);
            writeString(8, 'WAVE');
            writeString(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 2, true);
            view.setUint32(24, 44100, true);
            view.setUint32(28, 44100 * 2 * 2, true);
            view.setUint16(32, 2 * 2, true);
            view.setUint16(34, 16, true);
            writeString(36, 'data');
            view.setUint32(40, buffer.length * 2, true);
            
            // Write the audio data
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < channelData.length; i++) {
                const sample = Math.max(-1, Math.min(1, channelData[i]));
                view.setInt16(44 + i * 2, sample * 0x7FFF, true);
            }
            console.log('WAV file created');
            
            // Create a blob from the WAV buffer
            const blob = new Blob([wavBuffer], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            console.log('Blob created and URL generated');
            
            // Create download link with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const anchor = document.createElement('a');
            anchor.download = `composition-${timestamp}.wav`;
            anchor.href = url;
            anchor.click();
            console.log('Download initiated');

        } catch (error) {
            console.error('Error during export:', error);
        } finally {
            // Clean up resources
            if (masterVolume) {
                masterVolume.dispose();
            }
            Object.values(synths).forEach(synth => {
                if (synth && typeof synth.dispose === 'function') {
                    synth.dispose();
                }
            });
            Object.values(effects).forEach(effect => {
                if (effect && typeof effect.dispose === 'function') {
                    effect.dispose();
                }
            });
            if (offlineContext) {
                offlineContext.dispose();
            }
            if (originalContext) {
                Tone.setContext(originalContext);
            }
            setIsExporting(false);
            console.log('Export process completed, resources cleaned up');
        }
    };

    const updateDrumVolume = (drumName, value) => {
        setDrumVolumes(prev => ({
            ...prev,
            [drumName]: value
        }));
        
        // Update the volume in the audio context
        const synth = synthRefs.current[selectedTrack];
        if (synth && synth.volumes && synth.volumes[drumName]) {
            synth.volumes[drumName].volume.value = value;
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('compositions');
        if (saved) {
            setSavedCompositions(JSON.parse(saved));
        }
    }, []);

    // Add visualizer
    useEffect(() => {
        if (!showVisualizer || !visualizerRef.current) return;

        const canvas = visualizerRef.current;
        const ctx = canvas.getContext('2d');
        let analyser = null;
        let animationFrameId = null;
        
        const initVisualizer = async () => {
            try {
                // Create analyser node
                analyser = new Tone.Analyser({
                    type: "waveform",
                    size: 2048,
                    smoothing: 0.8
                });
                
                // Connect master output to analyser
                Tone.getDestination().connect(analyser);
                console.log('Analyser connected to master output');

                // Create gradient for the visualizer
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(0.5, '#8b5cf6');
                gradient.addColorStop(1, '#ec4899');

                const draw = () => {
                    if (!showVisualizer) return;

                    try {
                        // Get the waveform data
                        const waveform = analyser.getValue();

                        const width = canvas.width;
                        const height = canvas.height;

                        // Clear canvas with a fade effect
                        ctx.fillStyle = 'rgba(17, 24, 39, 0.3)';
                        ctx.fillRect(0, 0, width, height);

                        // Draw the waveform
                        ctx.beginPath();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = gradient;
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = '#3b82f6';

                        const sliceWidth = width / waveform.length;
                        let x = 0;

                        // Draw the main waveform with smoothing
                        for (let i = 0; i < waveform.length; i++) {
                            const v = waveform[i];
                            const y = (v + 1) / 2 * height;

                            if (i === 0) {
                                ctx.moveTo(x, y);
                            } else {
                                const prevX = x - sliceWidth;
                                const prevY = (waveform[i - 1] + 1) / 2 * height;
                                const cpX = (x + prevX) / 2;
                                ctx.quadraticCurveTo(cpX, prevY, x, y);
                            }

                            x += sliceWidth;
                        }

                        ctx.stroke();

                        // Mirror effect
                        ctx.save();
                        ctx.scale(1, -1);
                        ctx.translate(0, -height);
                        ctx.globalAlpha = 0.3;
                        ctx.stroke();
                        ctx.restore();

                        // Request next frame
                        animationFrameId = requestAnimationFrame(draw);
                    } catch (error) {
                        console.error('Error in visualizer draw function:', error);
                        // Stop the animation if there's an error
                        if (animationFrameId) {
                            cancelAnimationFrame(animationFrameId);
                        }
                    }
                };

                // Start drawing
                console.log('Starting visualizer drawing');
                draw();

            } catch (error) {
                console.error('Error initializing visualizer:', error);
            }
        };

        initVisualizer();

        return () => {
            try {
                // Clean up animation frame
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
                
                // Clean up audio nodes
                if (analyser) {
                    try {
                        Tone.getDestination().disconnect(analyser);
                        analyser.dispose();
                    } catch (error) {
                        console.error('Error cleaning up analyser:', error);
                    }
                }
                
                // Clear canvas
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                
                console.log('Visualizer cleaned up');
            } catch (error) {
                console.error('Error in visualizer cleanup:', error);
            }
        };
    }, [showVisualizer]);

    // MIDI Setup
    useEffect(() => {
        let midiAccess = null;
        let midiInputs = [];

        const setupMidi = async () => {
            try {
                if (navigator.requestMIDIAccess) {
                    midiAccess = await navigator.requestMIDIAccess();
                    midiInputs = Array.from(midiAccess.inputs.values());
                    setMidiInputs(midiInputs);

                    midiAccess.onstatechange = (e) => {
                        try {
                            if (e.port.type === 'input') {
                                const updatedInputs = Array.from(midiAccess.inputs.values());
                                setMidiInputs(updatedInputs);
                                
                                // Handle device disconnection
                                if (e.port.state === 'disconnected' && selectedMidiInput?.id === e.port.id) {
                                    setSelectedMidiInput(null);
                                    console.warn('MIDI device disconnected:', e.port.name);
                                }
                            }
                        } catch (error) {
                            console.error('Error handling MIDI state change:', error);
                        }
                    };
                }
            } catch (error) {
                console.error('Error setting up MIDI:', error);
                setMidiEnabled(false);
            }
        };

        setupMidi();

        return () => {
            try {
                // Clean up MIDI resources
                if (midiAccess) {
                    midiAccess.onstatechange = null;
                    // Close all MIDI ports
                    midiInputs.forEach(input => {
                        try {
                            if (input && typeof input.close === 'function') {
                                input.close();
                            }
                        } catch (error) {
                            console.error('Error closing MIDI input:', error);
                        }
                    });
                }
            } catch (error) {
                console.error('Error in MIDI cleanup:', error);
            }
        };
    }, []);

    // MIDI Input Handler
    useEffect(() => {
        if (!selectedMidiInput || !midiEnabled) return;

        let lastNoteTime = 0;
        const handleMidiMessage = (message) => {
            try {
                const [status, note, velocity] = message.data;
                const command = status >> 4;
                const channel = status & 0xf;

                if (command === 9 && velocity > 0) { // Note on
                    const synth = synthRefs.current[selectedTrack];
                    if (synth) {
                        try {
                            const noteName = Tone.Frequency(note, "midi").toNote();
                            const currentTime = Tone.now();
                            
                            // Add a small offset if the current time is the same as the last note time
                            const playTime = currentTime <= lastNoteTime ? lastNoteTime + 0.001 : currentTime;
                            lastNoteTime = playTime;

                            if (INSTRUMENTS[tracks.find(t => t.id === selectedTrack)?.instrument].isDrum) {
                                const drumType = INSTRUMENTS[tracks.find(t => t.id === selectedTrack)?.instrument].drumMap[noteName];
                                if (drumType && typeof synth.player === 'function') {
                                    synth.player(drumType).start(playTime);
                                }
                            } else if (typeof synth.triggerAttackRelease === 'function') {
                                synth.triggerAttackRelease(noteName, '8n', playTime);
                            }
                        } catch (error) {
                            console.error('Error processing MIDI note:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('Error handling MIDI message:', error);
            }
        };

        try {
            selectedMidiInput.onmidimessage = handleMidiMessage;
        } catch (error) {
            console.error('Error setting up MIDI message handler:', error);
        }

        return () => {
            try {
                if (selectedMidiInput) {
                    selectedMidiInput.onmidimessage = null;
                }
            } catch (error) {
                console.error('Error cleaning up MIDI message handler:', error);
            }
        };
    }, [selectedMidiInput, midiEnabled, selectedTrack, tracks]);

    // Piano Roll Setup
    useEffect(() => {
        if (!showPianoRoll || !pianoRollRef.current) return;

        const canvas = pianoRollRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const gridSize = 20;
        const labelWidth = 40;
        const playableWidth = width - labelWidth;
        const rows = Math.floor(height / gridSize);
        const cols = Math.floor(playableWidth / gridSize);

        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw scale notes with alternating colors and labels
        const scaleNotes = SCALES[selectedScale];
        const octaves = Math.ceil(rows / scaleNotes.length);
        
        // Draw background and labels
        for (let octave = 0; octave < octaves; octave++) {
            scaleNotes.forEach((note, index) => {
                const y = rows - (octave * scaleNotes.length + index) - 1;
                if (y < 0) return;
                
                // Draw alternating background colors
                ctx.fillStyle = (octave * scaleNotes.length + index) % 2 === 0 ? '#2a2a2a' : '#1f1f1f';
                ctx.fillRect(0, y * gridSize, width, gridSize);
                
                // Draw note label with octave number
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${note}${octave + 4}`, labelWidth / 2, y * gridSize + gridSize / 2);
            });
        }

        // Draw grid lines
        ctx.strokeStyle = '#333';
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

        // Draw notes
        pianoRollNotes.forEach(note => {
            // Calculate note position and size
            const noteX = note.x * gridSize + labelWidth;
            const noteY = note.y * gridSize;
            let noteWidth = note.width * gridSize;
            
            // Ensure note stays within bounds
            if (noteX + noteWidth > width) {
                noteWidth = width - noteX;
            }
            
            ctx.fillStyle = note.color || '#3b82f6';
            ctx.fillRect(noteX, noteY, noteWidth, gridSize);
        });
    }, [showPianoRoll, pianoRollNotes, selectedScale]);

    const handlePianoRollMouseDown = (e) => {
        if (!showPianoRoll || !pianoRollRef.current) return;

        const canvas = pianoRollRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridSize = 20;
        const labelWidth = 40;
        const playableWidth = canvas.width - labelWidth;

        // Adjust x coordinate to account for label width
        const adjustedX = x - labelWidth;
        if (adjustedX < 0 || adjustedX > playableWidth) return;

        // Calculate grid position
        const gridX = Math.floor(adjustedX / gridSize);
        const gridY = Math.floor(y / gridSize);

        // Find clicked note
        const clickedNote = pianoRollNotes.find(note => {
            const noteStartX = note.x * gridSize;
            const noteEndX = noteStartX + (note.width * gridSize);
            return adjustedX >= noteStartX && 
                   adjustedX <= noteEndX && 
                   gridY === note.y;
        });

        if (clickedNote) {
            // Check if clicking on the right edge for resizing
            const noteRightEdge = (clickedNote.x + clickedNote.width) * gridSize;
            if (Math.abs(adjustedX - noteRightEdge) < 10) {
                setIsResizing(true);
                setResizeStart({ x: gridX, note: clickedNote });
            } else {
                setIsDragging(true);
                setDragStart({ x: gridX, y: gridY, note: clickedNote });
                if (!e.ctrlKey) {
                    setSelectedNotes([clickedNote]);
                } else {
                    setSelectedNotes(prev => [...prev, clickedNote]);
                }
            }
        } else {
            // Add new note
            const scaleNotes = SCALES[selectedScale];
            const noteIndex = scaleNotes.length - 1 - (gridY % scaleNotes.length);
            const octave = Math.floor(gridY / scaleNotes.length) + 4;
            const pitch = `${scaleNotes[noteIndex]}${octave}`;

            const newNote = {
                x: gridX,
                y: gridY,
                pitch,
                width: 1,
                color: '#3b82f6',
                id: Date.now() + Math.random()
            };

            setPianoRollNotes(prev => [...prev, newNote]);
            setSelectedNotes([newNote]);

            // Play the note
            playNote(pitch);
        }
    };

    const handlePianoRollMouseMove = (e) => {
        if (!showPianoRoll || !pianoRollRef.current) return;

        const canvas = pianoRollRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridSize = 20;
        const labelWidth = 40;
        const playableWidth = canvas.width - labelWidth;

        // Adjust x coordinate to account for label width
        const adjustedX = x - labelWidth;
        if (adjustedX < 0 || adjustedX > playableWidth) return;

        // Calculate grid position
        const gridX = Math.floor(adjustedX / gridSize);
        const gridY = Math.floor(y / gridSize);

        if (isDragging && dragStart) {
            // Calculate maximum allowed position
            const maxX = Math.floor(playableWidth / gridSize) - 1;
            const deltaX = Math.min(maxX - dragStart.note.x, Math.max(0, gridX - dragStart.x));
            const deltaY = gridY - dragStart.y;

            setPianoRollNotes(prev => 
                prev.map(note => 
                    selectedNotes.includes(note)
                        ? { ...note, x: note.x + deltaX, y: note.y + deltaY }
                        : note
                )
            );

            setDragStart({ x: gridX, y: gridY, note: dragStart.note });
        } else if (isResizing && resizeStart) {
            // Calculate maximum allowed width
            const maxWidth = Math.floor(playableWidth / gridSize) - resizeStart.note.x;
            const deltaX = Math.min(maxWidth - resizeStart.note.width, Math.max(1, gridX - resizeStart.x));
            const newWidth = Math.max(1, resizeStart.note.width + deltaX);

            setPianoRollNotes(prev => 
                prev.map(note => 
                    note === resizeStart.note
                        ? { ...note, width: newWidth }
                        : note
                )
            );

            setResizeStart({ x: gridX, note: resizeStart.note });
        }
    };

    // Helper function to play a note
    const playNote = (pitch) => {
        const track = tracks.find(t => t.id === selectedTrack);
        if (!track) return;

        // Initialize synth if needed
        if (!synthRefs.current[selectedTrack]) {
            const instrument = INSTRUMENTS[track.instrument];
            if (instrument.isDrum) {
                synthRefs.current[selectedTrack] = instrument.synth();
            } else {
                const synth = instrument.synth();
                synthRefs.current[selectedTrack] = synth;
                synth.toDestination();
            }
        }

        const synth = synthRefs.current[selectedTrack];
        if (synth) {
            try {
                if (INSTRUMENTS[track.instrument].isDrum) {
                    const drumType = INSTRUMENTS[track.instrument].drumMap[pitch];
                    if (drumType && typeof synth.player === 'function') {
                        synth.player(drumType).start(Tone.now());
                    }
                } else if (typeof synth.triggerAttackRelease === 'function') {
                    synth.triggerAttackRelease(pitch, '8n', Tone.now());
                }
            } catch (error) {
                console.error('Error playing note:', error);
            }
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Play/Stop
            if (e.key === ' ') {
                e.preventDefault();
                if (isPlaying) {
                    stopPlayback();
                } else {
                    playSequence();
                }
            }
            // Record
            if (e.key === 'r' && !e.ctrlKey) {
                e.preventDefault();
                setIsRecording(!isRecording);
            }
            // Copy
            if (e.key === 'c' && e.ctrlKey) {
                e.preventDefault();
                if (selectedNotes.length > 0) {
                    setCopiedNotes(selectedNotes);
                }
            }
            // Paste
            if (e.key === 'v' && e.ctrlKey) {
                e.preventDefault();
                if (copiedNotes.length > 0) {
                    const offset = Math.max(...pianoRollNotes.map(n => n.x)) + 1;
                    const newNotes = copiedNotes.map(note => ({
                        ...note,
                        x: note.x + offset,
                        id: Date.now() + Math.random()
                    }));
                    setPianoRollNotes(prev => [...prev, ...newNotes]);
                }
            }
            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                setPianoRollNotes(prev => prev.filter(note => !selectedNotes.includes(note)));
                setSelectedNotes([]);
            }
            // Quantize
            if (e.key === 'q' && e.ctrlKey) {
                e.preventDefault();
                if (selectedNotes.length > 0) {
                    const quantizedNotes = selectedNotes.map(note => ({
                        ...note,
                        x: Math.round(note.x / quantizeValue) * quantizeValue
                    }));
                    setPianoRollNotes(prev => 
                        prev.map(note => 
                            selectedNotes.includes(note) 
                                ? quantizedNotes.find(n => n.id === note.id) 
                                : note
                        )
                    );
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isRecording, selectedNotes, copiedNotes, quantizeValue, pianoRollNotes]);

    // MIDI Recording
    useEffect(() => {
        if (!isRecording || !selectedMidiInput) return;

        const startTime = Tone.now();
        const notes = [];
        const gridSize = 20; // Size of each grid cell
        const timePerStep = (60 / tempo) / STEPS_PER_BEAT; // Time per step in seconds
        const currentScale = selectedScale; // Capture current scale
        const currentTrackId = selectedTrack; // Capture current track ID

        const handleMidiMessage = (message) => {
            const [status, note, velocity] = message.data;
            const command = status >> 4;
            const channel = status & 0xf;

            if (command === 9 && velocity > 0) { // Note on
                const noteName = Tone.Frequency(note, "midi").toNote();
                const time = Tone.now() - startTime;
                notes.push({
                    note: noteName,
                    time,
                    velocity,
                    duration: 0
                });
            } else if (command === 8 || (command === 9 && velocity === 0)) { // Note off
                const noteName = Tone.Frequency(note, "midi").toNote();
                const noteIndex = notes.findIndex(n => n.note === noteName && n.duration === 0);
                if (noteIndex !== -1) {
                    notes[noteIndex].duration = Tone.now() - startTime - notes[noteIndex].time;
                }
            }
        };

        selectedMidiInput.onmidimessage = handleMidiMessage;

        return () => {
            if (selectedMidiInput) {
                selectedMidiInput.onmidimessage = null;
            }
            if (notes.length > 0) {
                // Convert recorded notes to piano roll format
                const pianoRollNotes = notes.map(note => {
                    // Convert time to grid position
                    const x = Math.floor(note.time / timePerStep);
                    // Find the note's position in the scale
                    const scaleNotes = SCALES[currentScale];
                    const noteIndex = scaleNotes.findIndex(n => note.note.startsWith(n));
                    const octave = parseInt(note.note.slice(-1));
                    const y = (octave - 4) * scaleNotes.length + (scaleNotes.length - 1 - noteIndex);
                    
                    return {
                        x,
                        y,
                        pitch: note.note,
                        width: Math.max(1, Math.floor(note.duration / timePerStep)),
                        color: '#3b82f6',
                        id: Date.now() + Math.random()
                    };
                });

                // Add notes to piano roll
                setPianoRollNotes(prev => [...prev, ...pianoRollNotes]);

                // Add notes to the current track
                setTracks(prevTracks => prevTracks.map(track => {
                    if (track.id === currentTrackId) {
                        const newNotes = pianoRollNotes.map(note => ({
                            x: note.x,
                            y: note.y,
                            pitch: note.pitch,
                            time: note.x * 16,
                            length: '8n'
                        }));
                        return {
                            ...track,
                            notes: [...track.notes, ...newNotes]
                        };
                    }
                    return track;
                }));
            }
        };
    }, [isRecording, selectedMidiInput]); // Only depend on these two values

    // Note Editing
    const handlePianoRollMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setDragStart(null);
        setResizeStart(null);
    };

    // Add a new effect to handle track changes
    useEffect(() => {
        const track = tracks.find(t => t.id === selectedTrack);
        if (!track) return;

        const initTrackSynth = async () => {
            try {
                if (Tone.context.state !== 'running') {
                    await Tone.start();
                }

                if (!synthRefs.current[selectedTrack]) {
                    const instrument = INSTRUMENTS[track.instrument];
                    if (instrument.isDrum) {
                        const drumPlayer = instrument.synth();
                        synthRefs.current[selectedTrack] = drumPlayer;
                    } else {
                        const synth = instrument.synth();
                        synthRefs.current[selectedTrack] = synth;
                        synth.toDestination();
                    }
                }

                // Update track volume based on mute/solo state
                const synth = synthRefs.current[selectedTrack];
                if (synth) {
                    const volumeValue = track.muted ? -Infinity : track.volume;
                    if (synth.volume && typeof synth.volume.value !== 'undefined') {
                        synth.volume.value = volumeValue;
                    }
                }
            } catch (error) {
                console.error('Error initializing track synth:', error);
            }
        };

        initTrackSynth();
    }, [selectedTrack, tracks]);

    // Add a new effect to handle real-time track volume updates during playback
    useEffect(() => {
        const updateTrackVolumes = () => {
            try {
            // Check if any track is soloed
            const anySoloed = tracks.some(t => t.solo);
            
            tracks.forEach(track => {
                    try {
                const synth = synthRefs.current[track.id];
                        const instrument = INSTRUMENTS[track.instrument];
                        
                        // Skip if no synth or if synth is not properly initialized
                        if (!synth || !instrument) {
                            console.log(`Skipping volume update for track ${track.id} - synth or instrument not ready`);
                            return;
                        }

                        const volumeValue = anySoloed 
                            ? (track.solo ? 0 : -Infinity)
                            : (track.muted ? -Infinity : 0);

                        if (instrument.isDrum && synth.volumes) {
                            // Handle drum synth volumes
                            Object.entries(synth.volumes).forEach(([name, volume]) => {
                                if (volume && volume.volume) {
                                    try {
                                        if (typeof volume.volume.setValueAtTime === 'function') {
                                            volume.volume.setValueAtTime(volumeValue, Tone.context.currentTime);
                                        } else if (typeof volume.volume.value !== 'undefined') {
                                            volume.volume.value = volumeValue;
                                        }
                                    } catch (error) {
                                        console.error(`Error setting volume for drum ${name}:`, error);
                    }
                }
            });
                        } else if (synth.volume) {
                            // Handle regular synth volume
                            try {
                                if (typeof synth.volume.setValueAtTime === 'function') {
                                    synth.volume.setValueAtTime(volumeValue, Tone.context.currentTime);
                                } else if (typeof synth.volume.value !== 'undefined') {
                                    synth.volume.value = volumeValue;
                                }
                            } catch (error) {
                                console.error(`Error setting volume for track ${track.id}:`, error);
                            }
                        }
                    } catch (trackError) {
                        console.error(`Error updating volume for track ${track.id}:`, trackError);
                    }
                });
            } catch (error) {
                console.error('Error in updateTrackVolumes:', error);
            }
        };

        // Update volumes immediately
        updateTrackVolumes();

        // Set up an interval to update volumes during playback
        const intervalId = setInterval(() => {
            if (isPlaying) {
                updateTrackVolumes();
            }
        }, 100);

        return () => {
            clearInterval(intervalId);
        };
    }, [tracks, isPlaying]);

    // Add back the missing functions
    const addTrack = () => {
        if (tracks.length >= 7) {
            alert('Maximum of 7 tracks reached. Please remove a track before adding a new one.');
            return;
        }
        const newTrack = {
            id: Date.now(),
            name: `Track ${tracks.length + 1}`,
            instrument: 'pluckSynth',
            notes: [],
            effects: [],
            volume: 0
        };
        setTracks([...tracks, newTrack]);
        setSelectedTrack(newTrack.id);
    };

    const removeTrack = (trackId) => {
        if (tracks.length > 1) {
            setTracks(tracks.filter(track => track.id !== trackId));
            if (selectedTrack === trackId) {
                setSelectedTrack(tracks[0].id);
            }
        }
    };

    const addEffect = (trackId, effectName) => {
        if (!trackId || !effectName) return;

        setTracks(tracks.map(track => {
            if (track.id === trackId) {
                // Ensure effects is an array
                const currentEffects = Array.isArray(track.effects) ? track.effects : [];
                if (!currentEffects.includes(effectName)) {
                    return {
                        ...track,
                        effects: [...currentEffects, effectName]
                    };
                }
            }
            return track;
        }));
    };

    const removeEffect = (trackId, effectName) => {
        try {
            // First, clean up the effect instance
            const effectKey = `${trackId}-${effectName}`;
            const effect = effectRefs.current[effectKey];
            if (effect) {
                try {
                    effect.dispose();
                    delete effectRefs.current[effectKey];
                } catch (error) {
                    console.error(`Error disposing effect ${effectName}:`, error);
                }
            }

            // Then update the track's effects array
            setTracks(tracks.map(track => {
                if (track.id === trackId) {
                    // Ensure effects is an array before filtering
                    const currentEffects = Array.isArray(track.effects) ? track.effects : [];
                    return {
                        ...track,
                        effects: currentEffects.filter(effect => effect !== effectName)
                    };
                }
                return track;
            }));

            // Reconnect the synth to destination if no effects left
            const track = tracks.find(t => t.id === trackId);
            if (track) {
                const synth = synthRefs.current[trackId];
                if (synth) {
                    const remainingEffects = Array.isArray(track.effects) ? 
                        track.effects.filter(effect => effect !== effectName) : 
                        [];
                    
                    if (remainingEffects.length === 0) {
                        try {
                            synth.disconnect();
                            synth.connect(Tone.getDestination());
                        } catch (error) {
                            console.error('Error reconnecting synth:', error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error removing effect:', error);
        }
    };

    // Update drum volumes with proper timing
    useEffect(() => {
        const updateDrumVolumes = () => {
            tracks.forEach(track => {
                const synth = synthRefs.current[track.id];
                if (synth && INSTRUMENTS[track.instrument]?.isDrum) {
                    Object.entries(drumVolumes).forEach(([drumName, volume]) => {
                        try {
                            if (synth.volumes && synth.volumes[drumName]) {
                                synth.volumes[drumName].volume.value = volume;
                            }
                        } catch (error) {
                            console.error(`Error updating ${drumName} volume:`, error);
                        }
                    });
                }
            });
        };

        updateDrumVolumes();
    }, [drumVolumes, tracks]);

    // Add error boundary for audio initialization
    const initializeAudio = useCallback(async () => {
        try {
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }, []);

    // Update play button click handler to handle errors
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
        const initAudioContext = () => {
            if (!audioContext) {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                setAudioContext(ctx);
            }
        };

        // Add event listener for user interaction
        const handleUserInteraction = () => {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        };

        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };
    }, [audioContext]);

    const handlePlay = () => {
        if (!audioContext) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            setAudioContext(ctx);
        }
        setIsPlaying(true);
    };

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
            if (audioContext) {
                try {
                    if (audioContext.state !== 'closed') {
                        audioContext.close();
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
                    onClick={exportToMP3}
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
                                <input
                                    type="range"
                                    min="-60"
                                    max="0"
                                    value={track.volume}
                                    onChange={(e) => {
                                        const newVolume = parseFloat(e.target.value);
                                        setTracks(tracks.map(t => t.id === track.id ? { ...t, volume: newVolume } : t));
                                    }}
                                    className="w-24"
                                />
                                <button
                                    onClick={() => {
                                        setTracks(tracks.map(t => t.id === track.id ? { ...t, solo: !t.solo } : t));
                                    }}
                                    className={`px-2 py-1 rounded ${track.solo ? 'bg-green-500' : 'bg-gray-500'}`}
                                >
                                    Solo
                                </button>
                                <button
                                    onClick={() => {
                                        setTracks(tracks.map(t => t.id === track.id ? { ...t, muted: !t.muted } : t));
                                    }}
                                    className={`px-2 py-1 rounded ${track.muted ? 'bg-red-500' : 'bg-gray-500'}`}
                                >
                                    Mute
                                </button>
                                <button
                                    onClick={() => setSelectedTrack(track.id)}
                                    className={`px-3 py-1 rounded flex items-center gap-1 ${
                                        selectedTrack === track.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                                    }`}
                                >
                                    <FaCheck /> Select
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