// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isReady: true,
      isPreview: false,
      isLocaleDomain: false,
      basePath: '',
      locale: 'en',
      locales: ['en'],
      defaultLocale: 'en',
      domainLocales: [],
    };
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock performance API
global.performance = {
  now: jest.fn(() => 1234567890),
  memory: {
    jsHeapSizeLimit: 2172649472,
    totalJSHeapSize: 1563574272,
    usedJSHeapSize: 1048576000
  }
};

// Mock MIDI API
global.navigator.requestMIDIAccess = jest.fn().mockResolvedValue({
  inputs: {
    size: 2,
    values: () => [
      { name: 'MIDI Input 1', manufacturer: 'Test Manufacturer' },
      { name: 'MIDI Input 2', manufacturer: 'Test Manufacturer' }
    ]
  },
  outputs: {
    size: 1,
    values: () => [
      { name: 'MIDI Output 1', manufacturer: 'Test Manufacturer' }
    ]
  }
});

// Mock Tone.js
jest.mock('tone', () => ({
  start: jest.fn(),
  Transport: {
    start: jest.fn(),
    stop: jest.fn(),
    bpm: { value: 120 },
    position: '0:0:0',
    scheduleRepeat: jest.fn(),
    clear: jest.fn(),
  },
  Player: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    start: jest.fn(),
    stop: jest.fn(),
    volume: { value: 0 },
  })),
  Sampler: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
    volume: { value: 0 },
  })),
  Volume: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    volume: { value: 0 },
  })),
  Reverb: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    wet: { value: 0 },
  })),
  Delay: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    wet: { value: 0 },
  })),
  context: {
    resume: jest.fn(),
    state: 'running',
  },
})); 