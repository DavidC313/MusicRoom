import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemHealthMonitor from '../../components/SystemHealthMonitor';

// Mock AudioContext
const mockAudioContext = {
  state: 'running',
  sampleRate: 44100,
  destination: {},
  createOscillator: jest.fn(),
  createGain: jest.fn(),
};

// Mock Tone.js
jest.mock('tone', () => ({
  start: jest.fn(),
  getContext: () => mockAudioContext,
  Transport: {
    bpm: { value: 120 },
  },
}));

describe('SystemHealthMonitor', () => {
  beforeEach(() => {
    // Mock window.AudioContext
    window.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
    
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays audio system information', async () => {
    render(<SystemHealthMonitor />);

    await waitFor(() => {
      expect(screen.getByText('Audio System Status')).toBeInTheDocument();
      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('44100 Hz')).toBeInTheDocument();
    });
  });

  it('displays MIDI device information', async () => {
    render(<SystemHealthMonitor />);

    await waitFor(() => {
      expect(screen.getByText('MIDI System Status')).toBeInTheDocument();
      expect(screen.getByText('Active Inputs:')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/MIDI Input 1/)).toBeInTheDocument();
      expect(screen.getByText(/MIDI Input 2/)).toBeInTheDocument();
    });
  });

  it('handles browser compatibility check', async () => {
    const mockUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    const originalUserAgent = window.navigator.userAgent;
    Object.defineProperty(window.navigator, 'userAgent', {
      value: mockUserAgent,
      configurable: true
    });

    render(<SystemHealthMonitor />);

    expect(screen.getByText('Current Browser:')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('Web Audio API:')).toBeInTheDocument();
    expect(screen.getByText('MIDI Support:')).toBeInTheDocument();

    // Restore original userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
  });

  it('updates system metrics periodically', async () => {
    jest.useFakeTimers();
    
    render(<SystemHealthMonitor />);

    await waitFor(() => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText(/Memory Usage:/)).toBeInTheDocument();
      expect(screen.getByText(/CPU Usage:/)).toBeInTheDocument();
      expect(screen.getByText(/Audio Latency:/)).toBeInTheDocument();
    });

    // Advance timers to trigger updates
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Memory Usage:/)).toBeInTheDocument();
      expect(screen.getByText(/CPU Usage:/)).toBeInTheDocument();
      expect(screen.getByText(/Audio Latency:/)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
}); 