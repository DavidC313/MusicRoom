'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { FaPlay, FaStop, FaTrash, FaSave, FaUpload, FaMusic, FaDownload, FaPlus, FaChartLine, FaKeyboard, FaRecordVinyl, FaCut, FaCopy, FaPaste } from 'react-icons/fa';

const SCALES = {
    'C Major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'A Minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    'G Major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'E Minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
    'Pentatonic': ['C', 'D', 'E', 'G', 'A']
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
                        }
                    }
                }),
                dispose: () => {
                    [kick, snare, hihat, tomLow, tomMid, tomHigh, crash, ride, clap, cowbell].forEach(synth => {
                        synth.dispose();
                    });
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
            'F4': 'cowbell'
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
    noiseSynth: {
        name: 'Noise Synth',
        synth: () => new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.1 }
        })
    },
    monoSynth: {
        name: 'Mono Synth',
        synth: () => new Tone.MonoSynth({
            oscillator: { type: "sawtooth" },
            filter: { Q: 6, type: "lowpass", rolloff: -24 },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.9, release: 1 },
            filterEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.5, release: 2 }
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
            effects: [],
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

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw scale notes
        const scaleNotes = SCALES[selectedScale];
        ctx.fillStyle = '#f3f4f6';
        scaleNotes.forEach((_, index) => {
            const y = rows - index - 1;
            ctx.fillRect(0, y * gridSize, width, gridSize);
        });

        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;

        for (let i = 0; i <= rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(width, i * gridSize);
            ctx.stroke();
        }

        for (let i = 0; i <= cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, height);
            ctx.stroke();
        }

        // Draw notes for the selected track
        const selectedTrackData = tracks.find(t => t.id === selectedTrack);
        if (selectedTrackData) {
            selectedTrackData.notes.forEach(note => {
                ctx.fillStyle = note === currentNote ? '#ef4444' : '#3b82f6';
                ctx.fillRect(
                    note.x * gridSize,
                    note.y * gridSize,
                    gridSize,
                    gridSize
                );
            });
        }
    }, [tracks, currentNote, selectedScale, selectedTrack]);

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

    // Initialize audio
    useEffect(() => {
        let isMounted = true;
        
        const initAudio = async () => {
            try {
                console.log('Initializing audio...');
                if (Tone.context.state !== 'running') {
                    await Tone.start();
                    console.log('Audio context started');
                }
                
                if (isMounted) {
                    // Create a master volume control with proper gain staging
                    const masterVolume = new Tone.Volume(-6).toDestination();
                    console.log('Master volume created');
                    
                    // Initialize synths and effects for each track with proper timing
                    tracks.forEach(track => {
                        console.log(`Initializing track ${track.id} with instrument ${track.instrument}`);
                        if (!synthRefs.current[track.id]) {
                            const instrument = INSTRUMENTS[track.instrument];
                            if (instrument.isDrum) {
                                const drumPlayer = instrument.synth();
                                synthRefs.current[track.id] = drumPlayer;
                                console.log(`Drum player initialized for track ${track.id}`);
                            } else {
                                const synth = instrument.synth();
                                synthRefs.current[track.id] = synth;
                                synth.connect(masterVolume);
                                console.log(`Synth initialized and connected for track ${track.id}`);
                            }
                        }
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
            }
        };
    }, [tracks]);

    const handleCanvasClick = (e) => {
        console.log('Canvas clicked');
        const canvas = canvasRef.current;
        if (!canvas) {
            console.log('Canvas not found');
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridSize = 20;

        // Convert click coordinates to grid positions
        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);

        const scaleNotes = SCALES[selectedScale];
        const noteIndex = scaleNotes.length - 1 - (gridY % scaleNotes.length);
        const octave = Math.floor(gridY / scaleNotes.length) + 4;
        const pitch = `${scaleNotes[noteIndex]}${octave}`;
        console.log(`Note clicked: ${pitch} at position (${gridX}, ${gridY})`);

        // Update tracks with the new note
        setTracks(tracks.map(track => {
            if (track.id === selectedTrack) {
                const existingNoteIndex = track.notes.findIndex(
                    note => note.x === gridX && note.y === gridY
                );

                if (existingNoteIndex !== -1) {
                    return {
                        ...track,
                        notes: track.notes.filter((_, index) => index !== existingNoteIndex)
                    };
                } else {
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
        if (!track) {
            console.log('Track not found');
            return;
        }

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
                    if (INSTRUMENTS[track.instrument].isDrum) {
                        const drumType = INSTRUMENTS[track.instrument].drumMap[pitch];
                        if (drumType && typeof synth.player === 'function') {
                            console.log(`Playing drum type: ${drumType}`);
                            synth.player(drumType).start(Tone.now());
                        }
                    } else if (typeof synth.triggerAttackRelease === 'function') {
                        console.log(`Playing note: ${pitch}`);
                        synth.triggerAttackRelease(pitch, '8n', Tone.now());
                    }
                } else {
                    console.log('Synth not found for track');
                }
            } catch (error) {
                console.error('Error playing note:', error);
            }
        };

        playNote();
    };

    const playSequence = async () => {
        try {
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }

            // Stop any existing playback
            Tone.Transport.stop();
            Tone.Transport.cancel();

            // Set the tempo
            Tone.Transport.bpm.value = tempo;

            // Calculate time per step based on tempo
            const stepsPerBeat = 4; // 16th notes per beat
            const beatsPerBar = 4;
            const stepsPerBar = stepsPerBeat * beatsPerBar;
            const timePerStep = (60 / tempo) / stepsPerBeat;

            // Schedule all notes for all tracks
            for (const track of tracks) {
                if (!synthRefs.current[track.id]) {
                    const instrument = INSTRUMENTS[track.instrument];
                    if (instrument.isDrum) {
                        // Initialize drum player with proper timing
                        const drumPlayer = instrument.synth();
                        synthRefs.current[track.id] = drumPlayer;
                        
                        // Initialize effects array for this track
                        effectRefs.current[track.id] = [];
                        
                        // Connect effects if any
                        if (track.effects.length > 0) {
                            const effects = track.effects.map(effectName => 
                                EFFECTS[effectName].effect()
                            );
                            effectRefs.current[track.id] = effects;
                            
                            // Connect effects in chain with proper timing
                            let lastNode = Tone.Destination;
                            effects.forEach(effect => {
                                if (typeof effect.connect === 'function') {
                                    effect.connect(lastNode);
                                }
                            });
                        }
                    } else {
                        const synth = instrument.synth();
                        synthRefs.current[track.id] = synth;
                        effectRefs.current[track.id] = [];
                        
                        let lastNode = synth;
                        track.effects.forEach(effectName => {
                            const effect = EFFECTS[effectName].effect();
                            effectRefs.current[track.id].push(effect);
                            effect.connect(lastNode);
                            lastNode = effect;
                        });
                        lastNode.toDestination();
                    }
                }

                // Sort notes by time and group by position
                const sortedNotes = [...track.notes].sort((a, b) => a.time - b.time);
                const noteGroups = new Map();
                
                sortedNotes.forEach(note => {
                    const group = noteGroups.get(note.time) || [];
                    group.push(note);
                    noteGroups.set(note.time, group);
                });

                noteGroups.forEach((notes, time) => {
                    const bar = Math.floor(time / stepsPerBar);
                    const step = time % stepsPerBar;
                    const baseTime = `${bar}:${step}`;
                    
                    notes.forEach((note, index) => {
                        const offset = index * 0.0001;
                        const noteTime = `${baseTime}:${offset}`;
                        
                        Tone.Transport.schedule((time) => {
                            if (!track.muted) {
                                try {
                                    const synth = synthRefs.current[track.id];
                                    if (INSTRUMENTS[track.instrument].isDrum) {
                                        const drumType = INSTRUMENTS[track.instrument].drumMap[note.pitch];
                                        if (drumType && synth && typeof synth.player === 'function') {
                                            synth.player(drumType).start(time);
                                        }
                                    } else if (synth && typeof synth.triggerAttackRelease === 'function') {
                                        const noteLengthInSeconds = (60 / tempo) * 
                                            (note.length === '1n' ? 4 : 
                                             note.length === '2n' ? 2 :
                                             note.length === '4n' ? 1 :
                                             note.length === '8n' ? 0.5 :
                                             note.length === '16n' ? 0.25 : 0.5);
                                        
                                        synth.triggerAttackRelease(
                                            note.pitch,
                                            noteLengthInSeconds,
                                            time
                                        );
                                    }
                                } catch (error) {
                                    console.error('Error playing note:', error);
                                }
                            }
                        }, noteTime);
                    });
                });
            }

            // Start playback immediately
            setIsPlaying(true);
            Tone.Transport.start('+0.1'); // Start with a small offset to ensure proper timing
        } catch (error) {
            console.error('Playback error:', error);
            setIsPlaying(false);
        }
    };

    const stopPlayback = () => {
        setIsPlaying(false);
        Tone.Transport.stop();
        Tone.Transport.cancel();
        
        // Clean up synths with proper timing
        Object.values(synthRefs.current).forEach(synth => {
            if (synth && typeof synth.disconnect === 'function') {
                synth.disconnect();
                synth.dispose();
            }
        });

        // Clean up effects with proper timing
        Object.values(effectRefs.current).forEach(effectsArray => {
            if (Array.isArray(effectsArray)) {
                effectsArray.forEach(effect => {
                    if (effect && typeof effect.disconnect === 'function') {
                        effect.disconnect();
                        effect.dispose();
                    }
                });
            } else if (effectsArray && typeof effectsArray.disconnect === 'function') {
                effectsArray.disconnect();
                effectsArray.dispose();
            }
        });
        
        synthRefs.current = {};
        effectRefs.current = {};
    };

    const clearNotes = () => {
        setTracks(tracks.map(track => 
            track.id === selectedTrack ? { ...track, notes: [] } : track
        ));
    };

    const saveComposition = () => {
        const composition = {
            notes: tracks[selectedTrack - 1].notes,
            tempo,
            instrument: tracks[selectedTrack - 1].instrument,
            scale: selectedScale,
            date: new Date().toISOString()
        };
        setSavedCompositions([...savedCompositions, composition]);
        localStorage.setItem('compositions', JSON.stringify([...savedCompositions, composition]));
    };

    const loadComposition = (composition) => {
        setTracks(tracks.map(track => 
            track.id === selectedTrack ? { ...track, notes: composition.notes } : track
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
        if (isExporting || tracks.every(track => track.notes.length === 0)) return;

        try {
            setIsExporting(true);
            await Tone.start();
            
            // Create a temporary synth for recording
            const recordingSynth = INSTRUMENTS[tracks[0].instrument].synth();
            const recorder = new Tone.Recorder();
            recordingSynth.connect(recorder);
            
            // Start recording
            await recorder.start();
            
            // Play all tracks
            const startTime = Tone.now();
            
            tracks.forEach(track => {
                if (track.muted) return;
                
                const sortedNotes = [...track.notes].sort((a, b) => a.x - b.x);
                const trackSynth = INSTRUMENTS[track.instrument].synth();
                
                for (const note of sortedNotes) {
                    const noteTime = note.x * (60 / tempo);
                    const scaleNotes = SCALES[selectedScale];
                    const noteIndex = scaleNotes.length - 1 - (note.y % scaleNotes.length);
                    const octave = Math.floor(note.y / scaleNotes.length) + 4;
                    const noteName = `${scaleNotes[noteIndex]}${octave}`;
                    
                    setTimeout(() => {
                        trackSynth.triggerAttackRelease(
                            noteName,
                            note.length || noteLength
                        );
                    }, noteTime * 1000);
                }
            });
            
            // Wait for the last note to finish plus buffer
            const lastNote = Math.max(...tracks.map(track => 
                track.notes.length > 0 ? 
                Math.max(...track.notes.map(n => n.x)) : 0
            ));
            const totalDuration = (lastNote * (60 / tempo)) + 2.0;
            
            setTimeout(async () => {
                try {
                    // Stop recording
                    const recording = await recorder.stop();
                    
                    // Create download link
                    const url = URL.createObjectURL(recording);
                    const anchor = document.createElement('a');
                    anchor.download = `composition-${new Date().toISOString()}.wav`;
                    anchor.href = url;
                    anchor.click();
                    
                    // Clean up
                    URL.revokeObjectURL(url);
                    recordingSynth.dispose();
                    recorder.dispose();
                    setIsExporting(false);
                } catch (error) {
                    console.error('Error stopping recording:', error);
                    setIsExporting(false);
                }
            }, totalDuration * 1000);
            
        } catch (error) {
            console.error('Error during export:', error);
            setIsExporting(false);
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
        canvas.width = 800;
        canvas.height = 300;
        
        const ctx = canvas.getContext('2d');
        
        // Create analyser node
        const analyser = new Tone.Analyser({
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

        let animationFrameId;

        const draw = () => {
            if (!showVisualizer) return;

            try {
                // Get the waveform data
                const waveform = analyser.getValue();
                console.log('Waveform data:', waveform);

                const width = canvas.width;
                const height = canvas.height;

                // Clear canvas with a fade effect
                ctx.fillStyle = 'rgba(17, 24, 39, 0.3)'; // Increased alpha for longer trails
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
                        // Use quadratic curves for smoother lines
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
            }
        };

        // Start drawing
        console.log('Starting visualizer drawing');
        draw();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            // Clean up audio nodes
            Tone.getDestination().disconnect(analyser);
            analyser.dispose();
            console.log('Visualizer cleaned up');
        };
    }, [showVisualizer]);

    // Update playback position
    useEffect(() => {
        if (!isPlaying) return;

        const updatePosition = () => {
            const position = Tone.Transport.position;
            // Convert position to a string if it's not already
            const positionStr = typeof position === 'string' ? position : position.toString();
            setPlaybackPosition(positionStr);
        };

        const interval = setInterval(updatePosition, 100);
        return () => clearInterval(interval);
    }, [isPlaying]);

    // MIDI Setup
    useEffect(() => {
        const setupMidi = async () => {
            try {
                if (navigator.requestMIDIAccess) {
                    const midiAccess = await navigator.requestMIDIAccess();
                    const inputs = Array.from(midiAccess.inputs.values());
                    setMidiInputs(inputs);

                    midiAccess.onstatechange = (e) => {
                        if (e.port.type === 'input') {
                            const updatedInputs = Array.from(midiAccess.inputs.values());
                            setMidiInputs(updatedInputs);
                        }
                    };
                }
            } catch (error) {
                console.error('Error setting up MIDI:', error);
            }
        };

        setupMidi();
    }, []);

    // MIDI Input Handler
    useEffect(() => {
        if (!selectedMidiInput || !midiEnabled) return;

        const handleMidiMessage = (message) => {
            const [status, note, velocity] = message.data;
            const command = status >> 4;
            const channel = status & 0xf;

            if (command === 9 && velocity > 0) { // Note on
                const synth = synthRefs.current[selectedTrack];
                if (synth) {
                    const noteName = Tone.Frequency(note, "midi").toNote();
                    if (INSTRUMENTS[tracks.find(t => t.id === selectedTrack)?.instrument].isDrum) {
                        const drumType = INSTRUMENTS[tracks.find(t => t.id === selectedTrack)?.instrument].drumMap[noteName];
                        if (drumType && typeof synth.player === 'function') {
                            synth.player(drumType).start();
                        }
                    } else if (typeof synth.triggerAttackRelease === 'function') {
                        synth.triggerAttackRelease(noteName, '8n');
                    }
                }
            }
        };

        selectedMidiInput.onmidimessage = handleMidiMessage;

        return () => {
            selectedMidiInput.onmidimessage = null;
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
        const rows = Math.floor(height / gridSize);
        const cols = Math.floor(width / gridSize);

        const drawPianoRoll = () => {
            // Clear canvas
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, width, height);

            // Draw grid
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;

            for (let i = 0; i <= rows; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * gridSize);
                ctx.lineTo(width, i * gridSize);
                ctx.stroke();
            }

            for (let i = 0; i <= cols; i++) {
                ctx.beginPath();
                ctx.moveTo(i * gridSize, 0);
                ctx.lineTo(i * gridSize, height);
                ctx.stroke();
            }

            // Draw notes
            pianoRollNotes.forEach(note => {
                ctx.fillStyle = note.color || '#3b82f6';
                ctx.fillRect(
                    note.x * gridSize,
                    note.y * gridSize,
                    note.width * gridSize,
                    gridSize
                );
            });
        };

        drawPianoRoll();
    }, [showPianoRoll, pianoRollNotes]);

    const handlePianoRollClick = (e) => {
        if (!showPianoRoll || !pianoRollRef.current) return;

        const canvas = pianoRollRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridSize = 20;

        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);

        const scaleNotes = SCALES[selectedScale];
        const noteIndex = scaleNotes.length - 1 - (gridY % scaleNotes.length);
        const octave = Math.floor(gridY / scaleNotes.length) + 4;
        const pitch = `${scaleNotes[noteIndex]}${octave}`;

        setPianoRollNotes(prev => [
            ...prev,
            {
                x: gridX,
                y: gridY,
                pitch,
                width: 1,
                color: '#3b82f6'
            }
        ]);

        // Play the note
        const synth = synthRefs.current[selectedTrack];
        if (synth) {
            if (INSTRUMENTS[tracks.find(t => t.id === selectedTrack)?.instrument].isDrum) {
                const drumType = INSTRUMENTS[tracks.find(t => t.id === selectedTrack)?.instrument].drumMap[pitch];
                if (drumType && typeof synth.player === 'function') {
                    synth.player(drumType).start();
                }
            } else if (typeof synth.triggerAttackRelease === 'function') {
                synth.triggerAttackRelease(pitch, '8n');
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
                setRecordedNotes(notes);
            }
        };
    }, [isRecording, selectedMidiInput]);

    // Note Editing
    const handlePianoRollMouseDown = (e) => {
        if (!showPianoRoll || !pianoRollRef.current) return;

        const canvas = pianoRollRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridSize = 20;

        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);

        // Check if clicking on a note
        const clickedNote = pianoRollNotes.find(note => 
            gridX >= note.x && 
            gridX <= note.x + note.width && 
            gridY === note.y
        );

        if (clickedNote) {
            // Check if clicking on the right edge for resizing
            if (Math.abs(x - (clickedNote.x + clickedNote.width) * gridSize) < 10) {
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

            // Play the note immediately
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
        }
    };

    const handlePianoRollMouseMove = (e) => {
        if (!showPianoRoll || !pianoRollRef.current) return;

        const canvas = pianoRollRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridSize = 20;

        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);

        if (isDragging && dragStart) {
            const deltaX = gridX - dragStart.x;
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
            const deltaX = gridX - resizeStart.x;
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
            } catch (error) {
                console.error('Error initializing track synth:', error);
            }
        };

        initTrackSynth();
    }, [selectedTrack, tracks]);

    // Add back the missing functions
    const addTrack = () => {
        const newTrack = {
            id: tracks.length + 1,
            name: `Track ${tracks.length + 1}`,
            notes: [],
            instrument: 'piano',
            effects: [],
            volume: 0,
            muted: false,
            solo: false
        };
        setTracks([...tracks, newTrack]);
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
        setTracks(tracks.map(track => {
            if (track.id === trackId && !track.effects.includes(effectName)) {
                return {
                    ...track,
                    effects: [...track.effects, effectName]
                };
            }
            return track;
        }));
    };

    const removeEffect = (trackId, effectName) => {
        setTracks(tracks.map(track => {
            if (track.id === trackId) {
                return {
                    ...track,
                    effects: track.effects.filter(effect => effect !== effectName)
                };
            }
            return track;
        }));
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

    return (
        <div className="flex flex-col items-center space-y-4 p-4">
            <div className="flex flex-wrap gap-4 justify-center">
                <button
                    onClick={playSequence}
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
            </div>

            {/* Track Controls */}
            <div className="w-full max-w-4xl space-y-4">
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
                                    className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded"
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
                                <button
                                    onClick={() => setSelectedTrack(track.id)}
                                    className={`px-2 py-1 rounded ${
                                        selectedTrack === track.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                                    }`}
                                >
                                    Select
                                </button>
                                {tracks.length > 1 && (
                                    <button
                                        onClick={() => removeTrack(track.id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setTracks(tracks.map(t => 
                                        t.id === track.id ? { ...t, muted: !t.muted } : t
                                    ))}
                                    className={`px-2 py-1 rounded ${
                                        track.muted ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'
                                    }`}
                                >
                                    Mute
                                </button>
                                <button
                                    onClick={() => setTracks(tracks.map(t => 
                                        t.id === track.id ? { ...t, solo: !t.solo } : t
                                    ))}
                                    className={`px-2 py-1 rounded ${
                                        track.solo ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-white'
                                    }`}
                                >
                                    Solo
                                </button>
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