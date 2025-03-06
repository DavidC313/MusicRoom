'use client';

import React, { useState, useEffect } from 'react';
import { playNote, applyEffect, toggleMetronome } from '../utils/toneSetup';
import { FaGuitar, FaMusic, FaDrum } from 'react-icons/fa';

export default function MusicControls() {
    const [instrument, setInstrument] = useState('Electric Guitar');
    const [volume, setVolume] = useState(50);
    const [effect, setEffect] = useState('None');

    useEffect(() => {
        import('tone').then((Tone) => {
            Tone.start();
        });
    }, []);

    const handlePlay = (instrumentType) => {
        const noteMap = {
            guitar: 'C4',
            bass: 'E2',
            drums: 'C1',
        };
        playNote(instrumentType, noteMap[instrumentType]);
    };

    const handleEffectChange = (e) => {
        setEffect(e.target.value);
        applyEffect(e.target.value);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Guitar Panel */}
            <div className="bg-gray-200 p-6 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                    <FaGuitar className="text-red-500" /> Guitar
                </h2>
                <label className="block text-sm mt-2">Select Guitar Type</label>
                <select className="w-full p-2 mt-1 border rounded" value={instrument} onChange={(e) => setInstrument(e.target.value)}>
                    <option>Electric Guitar</option>
                    <option>Acoustic Guitar</option>
                </select>
                <div className="mt-4 flex flex-col gap-2">
                    {['Play', 'Record', 'Loop', 'Stop', 'Download', 'Play Recording'].map(action => (
                        <button key={action} onClick={() => handlePlay('guitar')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">{action}</button>
                    ))}
                </div>
                <label className="block text-sm mt-4">Volume</label>
                <input type="range" min="0" max="100" value={volume} className="w-full" onChange={(e) => setVolume(e.target.value)} />
                <label className="block text-sm mt-4">Effects</label>
                <select className="w-full p-2 mt-1 border rounded" value={effect} onChange={handleEffectChange}>
                    <option>None</option>
                    <option>Chorus</option>
                    <option>Distortion</option>
                    <option>Phaser</option>
                </select>
            </div>

            {/* Bass Panel */}
            <div className="bg-gray-200 p-6 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                    <FaMusic className="text-purple-500" /> Bass
                </h2>
                <div className="mt-4 flex flex-col gap-2">
                    {['Play', 'Record', 'Loop', 'Stop', 'Download', 'Play Recording'].map(action => (
                        <button key={action} onClick={() => handlePlay('bass')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">{action}</button>
                    ))}
                </div>
                <label className="block text-sm mt-4">Volume</label>
                <input type="range" min="0" max="100" value={volume} className="w-full" onChange={(e) => setVolume(e.target.value)} />
                <label className="block text-sm mt-4">Effects</label>
                <select className="w-full p-2 mt-1 border rounded" value={effect} onChange={handleEffectChange}>
                    <option>None</option>
                    <option>Chorus</option>
                    <option>Distortion</option>
                    <option>Phaser</option>
                </select>
            </div>

            {/* Drums Panel */}
            <div className="bg-gray-200 p-6 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                    <FaDrum className="text-orange-500" /> Drums
                </h2>
                <div className="mt-4 flex flex-col gap-2">
                    {['Play', 'Record', 'Loop', 'Stop', 'Download', 'Play Recording'].map(action => (
                        <button key={action} onClick={() => handlePlay('drums')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">{action}</button>
                    ))}
                </div>
                <label className="block text-sm mt-4">Volume</label>
                <input type="range" min="0" max="100" value={volume} className="w-full" onChange={(e) => setVolume(e.target.value)} />
                <label className="block text-sm mt-4">Effects</label>
                <select className="w-full p-2 mt-1 border rounded" value={effect} onChange={handleEffectChange}>
                    <option>None</option>
                    <option>Chorus</option>
                    <option>Distortion</option>
                    <option>Phaser</option>
                </select>
            </div>
        </div>
    );
}
