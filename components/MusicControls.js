'use client';

import React, { useState, useEffect, useRef } from 'react';
import { playNote, applyEffect, toggleMetronome } from '../utils/toneSetup';
import { FaGuitar, FaMusic, FaDrum, FaChartBar, FaMobileAlt } from 'react-icons/fa';
import * as Tone from 'tone';

export default function MusicControls() {
    const [instrument, setInstrument] = useState('Electric Guitar');
    const [volume, setVolume] = useState(50);
    const [effect, setEffect] = useState('None');
    const [metronomeEnabled, setMetronomeEnabled] = useState(false);
    const [tempo, setTempo] = useState(120);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('tone').then((Tone) => {
                Tone.start();
            });
        }
    }, []);

    const handlePlay = (instrumentType) => {
        const noteMap = {
            Guitar: 'C4',
            Bass: 'E2',
            Drums: 'C1',
        };
        playNote(instrumentType.toLowerCase(), noteMap[instrumentType]);
    };

    const handlePlayAll = () => {
        handlePlay('Guitar');
        handlePlay('Bass');
        handlePlay('Drums');
    };

    const handleLoopAll = () => {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.scheduleRepeat(() => {
            handlePlayAll();
        }, '1m');
        Tone.Transport.start();
    };

    const handleStopAll = () => {
        Tone.Transport.stop();
        Tone.Transport.cancel();
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        {['Play', 'Record', 'Loop', 'Stop', 'Download', 'Play Recording'].map(action => (
                            <button key={action} onClick={() => handlePlay(instrument.name)} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700">{action}</button>
                        ))}
                    </div>
                    <label className="block text-sm mt-4">Volume</label>
                    <input type="range" min="0" max="100" value={volume} className="w-full" onChange={(e) => setVolume(e.target.value)} />
                    <label className="block text-sm mt-4">Effects</label>
                    <select className="w-full p-2 mt-1 border rounded">
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
                    <button onClick={handlePlayAll} className="px-4 py-2 bg-black text-white rounded-lg">Play All</button>
                    <button onClick={handleLoopAll} className="px-4 py-2 bg-black text-white rounded-lg">Loop All</button>
                    <button onClick={handleStopAll} className="px-4 py-2 bg-black text-white rounded-lg">Stop All</button>
                </div>
                <div className="mt-4">
                    <input type="checkbox" checked={metronomeEnabled} onChange={() => setMetronomeEnabled(!metronomeEnabled)} className="mr-2" />
                    Enable Metronome
                </div>
                <div className="mt-2">
                    <label className="text-sm mr-2">Tempo (BPM)</label>
                    <input type="number" value={tempo} onChange={(e) => setTempo(e.target.value)} className="w-16 border p-1 rounded" />
                </div>
            </div>
        </div>
    );
}
