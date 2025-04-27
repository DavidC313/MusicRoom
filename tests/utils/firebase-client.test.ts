import { getApps, initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Mock Firebase modules
const mockInitializeApp = jest.fn(() => ({ name: 'test-app' }));
const mockGetApps = jest.fn(() => []);
const mockGetStorage = jest.fn(() => ({ type: 'storage' }));

jest.mock('firebase/app', () => ({
  getApps: mockGetApps,
  initializeApp: mockInitializeApp,
}));

jest.mock('firebase/storage', () => ({
  getStorage: mockGetStorage,
}));

describe('Firebase Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset modules to clear cached imports
    jest.resetModules();
    // Clear module cache
    delete require.cache[require.resolve('../../utils/firebase-client')];
  });

  it('should initialize Firebase only once when no apps exist', () => {
    // Mock getApps to return empty array
    mockGetApps.mockReturnValue([]);
    
    // Import the module
    require('../../utils/firebase-client');
    
    // Verify initializeApp was called once with correct config
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).toHaveBeenCalledWith({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    });
  });

  it('should not initialize Firebase if already initialized', () => {
    // Mock getApps to return an array with one app
    const mockApp = { name: 'existing-app' };
    mockGetApps.mockReturnValue([mockApp]);
    
    // Import the module
    require('../../utils/firebase-client');
    
    // Verify initializeApp was not called
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it('should export storage object', () => {
    // Mock getApps to return an array with one app
    const mockApp = { name: 'existing-app' };
    mockGetApps.mockReturnValue([mockApp]);
    
    // Mock storage object
    const mockStorage = { type: 'storage' };
    mockGetStorage.mockReturnValue(mockStorage);
    
    // Import the module
    const { storage } = require('../../utils/firebase-client');
    
    // Verify storage is exported correctly
    expect(storage).toBeDefined();
    expect(storage).toEqual(mockStorage);
  });
}); 