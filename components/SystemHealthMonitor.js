import React, { useState, useEffect } from 'react';

const SystemHealthMonitor = () => {
    const [audioStatus, setAudioStatus] = useState({
        contextState: 'unknown',
        sampleRate: 0,
        bufferSize: 0,
        activeNodes: 0,
        memoryUsage: 0
    });

    const [midiStatus, setMidiStatus] = useState({
        devices: [],
        lastMessage: null,
        activeInputs: 0,
        error: null
    });

    const [performanceStatus, setPerformanceStatus] = useState({
        memory: 0,
        cpu: 0,
        latency: 0,
        frameRate: 0
    });

    const [systemResources, setSystemResources] = useState({
        currentBrowser: 'Unknown',
        audioFeatures: {},
        memoryStatus: 'unknown'
    });

    // Update audio status
    useEffect(() => {
        const updateAudioStatus = () => {
            try {
                const context = window.AudioContext || window.webkitAudioContext;
                if (context) {
                    const audioContext = new context();
                    setAudioStatus(prev => ({
                        ...prev,
                        contextState: audioContext.state,
                        sampleRate: audioContext.sampleRate,
                        bufferSize: audioContext.destination.maxChannelCount,
                        activeNodes: document.querySelectorAll('audio, video').length
                    }));
                    audioContext.close();
                }
            } catch (error) {
                console.error('Error updating audio status:', error);
            }
        };

        const interval = setInterval(updateAudioStatus, 2000);
        updateAudioStatus();

        return () => clearInterval(interval);
    }, []);

    // Update MIDI status
    useEffect(() => {
        const updateMidiStatus = async () => {
            try {
                if (navigator.requestMIDIAccess) {
                    try {
                        const midiAccess = await navigator.requestMIDIAccess();
                        const inputs = Array.from(midiAccess.inputs.values());
                        setMidiStatus(prev => ({
                            ...prev,
                            devices: inputs.map(input => ({
                                name: input.name,
                                manufacturer: input.manufacturer,
                                state: input.state
                            })),
                            activeInputs: inputs.length,
                            error: null
                        }));
                    } catch (error) {
                        // Handle Firefox WebMIDI permission error
                        if (error.message.includes('permission')) {
                            setMidiStatus(prev => ({
                                ...prev,
                                error: 'WebMIDI requires a site permission add-on in Firefox. Please install the WebMIDI API extension.',
                                devices: [],
                                activeInputs: 0
                            }));
                        } else {
                            throw error;
                        }
                    }
                } else {
                    setMidiStatus(prev => ({
                        ...prev,
                        error: 'WebMIDI is not supported in this browser',
                        devices: [],
                        activeInputs: 0
                    }));
                }
            } catch (error) {
                console.error('Error updating MIDI status:', error);
                setMidiStatus(prev => ({
                    ...prev,
                    error: error.message,
                    devices: [],
                    activeInputs: 0
                }));
            }
        };

        const interval = setInterval(updateMidiStatus, 2000);
        updateMidiStatus();

        return () => clearInterval(interval);
    }, []);

    // Update performance metrics
    useEffect(() => {
        const updatePerformance = () => {
            try {
                if (performance.memory) {
                    setPerformanceStatus(prev => ({
                        ...prev,
                        memory: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                        cpu: performance.now()
                    }));
                }
            } catch (error) {
                console.error('Error updating performance metrics:', error);
            }
        };

        const interval = setInterval(updatePerformance, 1000);
        updatePerformance();

        return () => clearInterval(interval);
    }, []);

    // Update system resources
    useEffect(() => {
        const updateSystemResources = () => {
            try {
                const audioContext = window.AudioContext || window.webkitAudioContext;
                const features = {
                    audioContext: !!audioContext,
                    getUserMedia: !!navigator.mediaDevices?.getUserMedia,
                    webAudio: !!window.AudioContext || !!window.webkitAudioContext,
                    midi: !!navigator.requestMIDIAccess
                };

                // Detect current browser
                let currentBrowser = 'Unknown';
                const userAgent = navigator.userAgent.toLowerCase();
                
                if (userAgent.includes('firefox')) {
                    currentBrowser = 'Firefox';
                } else if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
                    currentBrowser = 'Chrome';
                } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
                    currentBrowser = 'Safari';
                } else if (userAgent.includes('edg')) {
                    currentBrowser = 'Edge';
                } else if (userAgent.includes('opera') || userAgent.includes('opr')) {
                    currentBrowser = 'Opera';
                } else if (userAgent.includes('msie') || userAgent.includes('trident')) {
                    currentBrowser = 'Internet Explorer';
                } else if (userAgent.includes('brave')) {
                    currentBrowser = 'Brave';
                }

                setSystemResources(prev => ({
                    ...prev,
                    currentBrowser,
                    audioFeatures: features,
                    memoryStatus: performance.memory ? 
                        (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2) + '%' : 
                        'unknown'
                }));
            } catch (error) {
                console.error('Error updating system resources:', error);
            }
        };

        const interval = setInterval(updateSystemResources, 5000);
        updateSystemResources();

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'running':
            case 'active':
                return 'bg-green-500';
            case 'suspended':
            case 'inactive':
                return 'bg-yellow-500';
            case 'closed':
            case 'disconnected':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Audio System Status */}
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">Audio System Status</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-300">Context State:</span>
                        <span className={`px-2 py-1 rounded ${getStatusColor(audioStatus.contextState)}`}>
                            {audioStatus.contextState}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">Sample Rate:</span>
                        <span className="text-white">{audioStatus.sampleRate} Hz</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">Buffer Size:</span>
                        <span className="text-white">{audioStatus.bufferSize}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">Active Nodes:</span>
                        <span className="text-white">{audioStatus.activeNodes}</span>
                    </div>
                </div>
            </div>

            {/* MIDI System Status */}
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">MIDI System Status</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-300">Active Inputs:</span>
                        <span className="text-white">{midiStatus.activeInputs}</span>
                    </div>
                    {midiStatus.error ? (
                        <div className="bg-yellow-500/20 text-yellow-300 p-2 rounded text-sm">
                            {midiStatus.error}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {midiStatus.devices.map((device, index) => (
                                <div key={index} className="flex justify-between">
                                    <span className="text-gray-300">{device.name}:</span>
                                    <span className={`px-2 py-1 rounded ${getStatusColor(device.state)}`}>
                                        {device.state}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">Performance Metrics</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-300">Memory Usage:</span>
                        <span className="text-white">{performanceStatus.memory} MB</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">CPU Usage:</span>
                        <span className="text-white">{performanceStatus.cpu.toFixed(2)} ms</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">Audio Latency:</span>
                        <span className="text-white">{performanceStatus.latency.toFixed(2)} ms</span>
                    </div>
                </div>
            </div>

            {/* System Resources */}
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">System Resources</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-300">Memory Status:</span>
                        <span className="text-white">{systemResources.memoryStatus}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">Current Browser:</span>
                        <span className="text-white">{systemResources.currentBrowser}</span>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-gray-300">Audio Features:</h4>
                        <div className="flex justify-between">
                            <span className="text-gray-300">Web Audio API:</span>
                            <span className={`px-2 py-1 rounded ${systemResources.audioFeatures.webAudio ? 'bg-green-500' : 'bg-red-500'}`}>
                                {systemResources.audioFeatures.webAudio ? 'Supported' : 'Not Supported'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">MIDI Support:</span>
                            <span className={`px-2 py-1 rounded ${systemResources.audioFeatures.midi ? 'bg-green-500' : 'bg-red-500'}`}>
                                {systemResources.audioFeatures.midi ? 'Supported' : 'Not Supported'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemHealthMonitor; 