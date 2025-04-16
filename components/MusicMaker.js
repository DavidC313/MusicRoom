'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { FaPlay, FaStop, FaTrash, FaSave, FaUpload, FaMusic } from 'react-icons/fa';

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
        synth: () => new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
        })
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

export default function MusicMaker() {
    const [notes, setNotes] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(120);
    const [selectedInstrument, setSelectedInstrument] = useState('piano');
    const [selectedScale, setSelectedScale] = useState('C Major');
    const [noteLength, setNoteLength] = useState('8n');
    const [currentNote, setCurrentNote] = useState(null);
    const [savedCompositions, setSavedCompositions] = useState([]);
    const canvasRef = useRef(null);
    const synthRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Initialize the synth
    useEffect(() => {
        let isMounted = true;
        
        const initSynth = async () => {
            try {
                await Tone.start();
                if (isMounted) {
                    synthRef.current = INSTRUMENTS[selectedInstrument].synth().toDestination();
                }
            } catch (error) {
                console.error('Error initializing synth:', error);
            }
        };

        initSynth();

        return () => {
            isMounted = false;
            if (synthRef.current) {
                try {
                    synthRef.current.dispose();
                } catch (error) {
                    console.error('Error disposing synth:', error);
                }
            }
        };
    }, [selectedInstrument]);

    // Draw the grid and notes
    useEffect(() => {
        const canvas = canvasRef.current;
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

        // Draw notes
        notes.forEach(note => {
            ctx.fillStyle = note === currentNote ? '#ef4444' : '#3b82f6';
            ctx.fillRect(
                note.x * gridSize,
                note.y * gridSize,
                gridSize,
                gridSize
            );
        });

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [notes, currentNote, selectedScale]);

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 20);
        const y = Math.floor((e.clientY - rect.top) / 20);

        // Check if the note is in the selected scale
        const scaleNotes = SCALES[selectedScale];
        const noteIndex = scaleNotes.length - 1 - (y % scaleNotes.length);
        if (noteIndex >= 0 && noteIndex < scaleNotes.length) {
            // Toggle note
            const noteIndex = notes.findIndex(n => n.x === x && n.y === y);
            if (noteIndex === -1) {
                setNotes([...notes, { x, y, length: noteLength }]);
            } else {
                setNotes(notes.filter((_, i) => i !== noteIndex));
            }
        }
    };

    const playNote = async (note) => {
        if (synthRef.current) {
            try {
                const scaleNotes = SCALES[selectedScale];
                const noteIndex = scaleNotes.length - 1 - (note.y % scaleNotes.length);
                const octave = Math.floor(note.y / scaleNotes.length) + 4;
                const noteName = `${scaleNotes[noteIndex]}${octave}`;
                
                setCurrentNote(note);
                await Tone.start();
                await synthRef.current.triggerAttackRelease(
                    noteName,
                    note.length || noteLength,
                    Tone.now()
                );
                setCurrentNote(null);
            } catch (error) {
                console.error('Error playing note:', error);
                setCurrentNote(null);
            }
        }
    };

    const playSequence = async () => {
        if (isPlaying) return;
        
        try {
            setIsPlaying(true);
            await Tone.start();
            
            const sortedNotes = [...notes].sort((a, b) => a.x - b.x);
            const startTime = Tone.now() + 0.1; // Add a small buffer
            
            for (const note of sortedNotes) {
                const noteTime = startTime + (note.x * (60 / tempo));
                const scaleNotes = SCALES[selectedScale];
                const noteIndex = scaleNotes.length - 1 - (note.y % scaleNotes.length);
                const octave = Math.floor(note.y / scaleNotes.length) + 4;
                const noteName = `${scaleNotes[noteIndex]}${octave}`;
                
                synthRef.current.triggerAttackRelease(
                    noteName,
                    note.length || noteLength,
                    noteTime
                );
            }

            // Schedule the end of playback
            const lastNote = sortedNotes[sortedNotes.length - 1];
            const endTime = startTime + (lastNote.x * (60 / tempo)) + 0.1;
            
            setTimeout(() => {
                setIsPlaying(false);
            }, (endTime - Tone.now()) * 1000);
            
        } catch (error) {
            console.error('Error playing sequence:', error);
            setIsPlaying(false);
        }
    };

    const stopPlayback = () => {
        if (synthRef.current) {
            try {
                synthRef.current.triggerRelease();
            } catch (error) {
                console.error('Error stopping playback:', error);
            }
        }
        setIsPlaying(false);
        setCurrentNote(null);
    };

    const clearNotes = () => {
        setNotes([]);
    };

    const saveComposition = () => {
        const composition = {
            notes,
            tempo,
            instrument: selectedInstrument,
            scale: selectedScale,
            date: new Date().toISOString()
        };
        setSavedCompositions([...savedCompositions, composition]);
        localStorage.setItem('compositions', JSON.stringify([...savedCompositions, composition]));
    };

    const loadComposition = (composition) => {
        setNotes(composition.notes);
        setTempo(composition.tempo);
        setSelectedInstrument(composition.instrument);
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

    useEffect(() => {
        const saved = localStorage.getItem('compositions');
        if (saved) {
            setSavedCompositions(JSON.parse(saved));
        }
    }, []);

    return (
        <div className="flex flex-col items-center space-y-4 p-4">
            <div className="flex flex-wrap gap-4 justify-center">
                <button
                    onClick={playSequence}
                    disabled={isPlaying}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
                >
                    <FaPlay /> {isPlaying ? 'Playing...' : 'Play'}
                </button>
                <button
                    onClick={stopPlayback}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                >
                    <FaStop /> Stop
                </button>
                <button
                    onClick={clearNotes}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                >
                    <FaTrash /> Clear
                </button>
                <button
                    onClick={saveComposition}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                >
                    <FaSave /> Save
                </button>
                <select
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    className="px-4 py-2 border rounded"
                >
                    <option value={60}>60 BPM</option>
                    <option value={80}>80 BPM</option>
                    <option value={100}>100 BPM</option>
                    <option value={120}>120 BPM</option>
                    <option value={140}>140 BPM</option>
                </select>
                <select
                    value={selectedInstrument}
                    onChange={(e) => setSelectedInstrument(e.target.value)}
                    className="px-4 py-2 border rounded"
                >
                    {Object.entries(INSTRUMENTS).map(([key, { name }]) => (
                        <option key={key} value={key}>{name}</option>
                    ))}
                </select>
                <select
                    value={selectedScale}
                    onChange={(e) => setSelectedScale(e.target.value)}
                    className="px-4 py-2 border rounded"
                >
                    {Object.keys(SCALES).map(scale => (
                        <option key={scale} value={scale}>{scale}</option>
                    ))}
                </select>
                <select
                    value={noteLength}
                    onChange={(e) => setNoteLength(e.target.value)}
                    className="px-4 py-2 border rounded"
                >
                    {Object.entries(NOTE_LENGTHS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="border border-gray-300 rounded cursor-pointer"
                onClick={handleCanvasClick}
            />

            {savedCompositions.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={clearAllCompositions}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                    >
                        <FaTrash /> Clear All Compositions
                    </button>
                </div>
            )}

            {savedCompositions.length > 0 && (
                <div className="w-full max-w-4xl mt-4">
                    <h3 className="text-lg font-semibold mb-2">Saved Compositions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedCompositions.map((comp, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg hover:bg-gray-50 relative group"
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
                                        <FaMusic className="text-gray-500" />
                                        <span className="font-medium">
                                            Composition {index + 1}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {new Date(comp.date).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {comp.notes.length} notes • {comp.tempo} BPM • {comp.instrument}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 