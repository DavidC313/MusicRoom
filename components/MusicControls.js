'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaGuitar, FaMusic, FaDrum, FaChartBar, FaMobileAlt } from 'react-icons/fa';
import * as Tone from 'tone';

const MusicControls = ({ 
  isPlaying, 
  setIsPlaying, 
  tempo, 
  setTempo,
  volume,
  setVolume,
  selectedTrack,
  setSelectedTrack,
  tracks,
  setTracks,
  isLooping,
  setIsLooping,
  playSequence,
  cleanupAudioResources
}) => {
  const [instrument, setInstrument] = useState('Electric Guitar');
  const [effect, setEffect] = useState('None');
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const canvasRef = useRef(null);
  const recorderRef = useRef(null);
  const synthsRef = useRef([]);
  const masterVolumeRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const containerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const initializeAudio = async () => {
    if (hasInitializedRef.current) return;
    
    try {
      console.log('Starting audio initialization...');
      
      // Create audio context
      const context = new (window.AudioContext || window.webkitAudioContext)();
      
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

      setIsInitialized(true);
      setInitError(null);
      hasInitializedRef.current = true;
      setIsAudioReady(true);
      setShowAudioPrompt(false);
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      setInitError(error.message);
    }
  };

  const handleUserInteraction = async (e) => {
    if (!hasInitializedRef.current) {
      console.log('User interaction detected, initializing audio...');
      await initializeAudio();
    }
  };

  useEffect(() => {
    // Add click event listener to the container
    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleUserInteraction);
      container.addEventListener('touchstart', handleUserInteraction);
    }

    // Cleanup function
    return () => {
      if (container) {
        container.removeEventListener('click', handleUserInteraction);
        container.removeEventListener('touchstart', handleUserInteraction);
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

  const handlePlay = () => {
    if (!isAudioReady) {
      console.log('Audio not ready, waiting for user interaction...');
      setShowAudioPrompt(true);
      return;
    }
    setIsPlaying(true);
    playSequence();
  };

  const handleStop = () => {
    setIsPlaying(false);
    cleanupAudioResources();
  };

  const handleRecord = () => {
    if (!isAudioReady) {
      console.log('Audio not ready, waiting for user interaction...');
      setShowAudioPrompt(true);
      return;
    }
    setIsRecording(!isRecording);
  };

  const handleMute = () => {
    if (!isAudioReady) {
      console.log('Audio not ready, waiting for user interaction...');
      setShowAudioPrompt(true);
      return;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center space-y-4">
      {showAudioPrompt && !isAudioReady && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Audio Initialization Required</p>
          <p>Click anywhere to initialize audio features</p>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <button
          onClick={handlePlay}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!isAudioReady}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleStop}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!isAudioReady}
        >
          Stop
        </button>
        <button
          onClick={handleRecord}
          className={`${isRecording ? 'bg-red-500' : 'bg-gray-500'} text-white px-4 py-2 rounded disabled:opacity-50`}
          disabled={!isAudioReady}
        >
          {isRecording ? 'Stop Recording' : 'Record'}
        </button>
        <button
          onClick={handleMute}
          className={`${isMuted ? 'bg-yellow-500' : 'bg-gray-500'} text-white px-4 py-2 rounded disabled:opacity-50`}
          disabled={!isAudioReady}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label>Tempo:</label>
          <input
            type="range"
            min="40"
            max="200"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-32"
            disabled={!isAudioReady}
          />
          <span>{tempo} BPM</span>
        </div>
        <div className="flex items-center space-x-2">
          <label>Volume:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-32"
            disabled={!isAudioReady}
          />
          <span>{volume}%</span>
        </div>
      </div>
    </div>
  );
};

export default MusicControls;
