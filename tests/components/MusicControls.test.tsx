import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MusicControls from '../../components/MusicControls';

// Mock Tone.js
jest.mock('tone', () => ({
  start: jest.fn().mockResolvedValue(undefined),
  Transport: {
    start: jest.fn(),
    stop: jest.fn(),
    bpm: { value: 120 }
  },
  Synth: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    toDestination: jest.fn(),
    triggerAttackRelease: jest.fn().mockResolvedValue(undefined)
  })),
  MembraneSynth: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    toDestination: jest.fn()
  })),
  Volume: jest.fn().mockImplementation(() => ({
    value: 0,
    connect: jest.fn(),
    disconnect: jest.fn(),
    toDestination: jest.fn(),
    set: jest.fn()
  })),
  Recorder: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn().mockResolvedValue(new Blob())
  }))
}));

// Mock AudioContext
const mockAudioContext = {
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 0 }
  }),
  destination: {},
  sampleRate: 44100,
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined)
};

global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
global.webkitAudioContext = jest.fn().mockImplementation(() => mockAudioContext);

// Suppress console messages
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('MusicControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders instrument controls', () => {
    render(<MusicControls />);
    expect(screen.getByText('Electric Guitar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play guitar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /record/i })).toBeInTheDocument();
  });

  it('toggles recording state when record button is clicked', async () => {
    render(<MusicControls />);
    const recordButton = screen.getByRole('button', { name: /record/i });
    
    // Simulate user interaction to initialize audio
    fireEvent.click(recordButton);
    
    // Wait for initialization
    await waitFor(() => {
      expect(screen.queryByText(/error initializing audio/i)).not.toBeInTheDocument();
    });
  });

  it('toggles metronome when metronome button is clicked', async () => {
    render(<MusicControls />);
    const metronomeButton = screen.getByRole('button', { name: /metronome/i });
    
    // Simulate user interaction to initialize audio
    fireEvent.click(metronomeButton);
    
    // Wait for initialization
    await waitFor(() => {
      expect(screen.queryByText(/error initializing audio/i)).not.toBeInTheDocument();
    });
  });

  it('updates volume when volume slider is changed', async () => {
    render(<MusicControls />);
    const volumeSlider = screen.getByRole('slider', { name: /volume/i });
    
    fireEvent.change(volumeSlider, { target: { value: '50' } });
    expect(volumeSlider).toHaveValue('50');
  });

  it('updates tempo using number input', async () => {
    render(<MusicControls />);
    const tempoInput = screen.getByRole('spinbutton', { name: /tempo/i });
    
    fireEvent.change(tempoInput, { target: { value: '140' } });
    expect(tempoInput).toHaveValue(140);
  });

  it('shows error message when audio initialization fails', () => {
    // Mock AudioContext to throw an error
    const mockError = new Error('Failed to initialize audio');
    global.AudioContext = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    render(<MusicControls />);
    const button = screen.getByRole('button', { name: /play guitar/i });
    
    fireEvent.click(button);
    expect(screen.getByText(/error initializing audio/i)).toBeInTheDocument();
  });
});