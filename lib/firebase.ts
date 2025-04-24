'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with error handling
let db;
try {
  // Initialize Firestore with unlimited cache size
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true
  });
} catch (error) {
  console.error('Error initializing Firestore:', error);
  // Create a mock db object to prevent app crashes
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error('Firestore connection failed')),
        set: () => Promise.reject(new Error('Firestore connection failed')),
        update: () => Promise.reject(new Error('Firestore connection failed')),
        delete: () => Promise.reject(new Error('Firestore connection failed')),
      }),
      get: () => Promise.reject(new Error('Firestore connection failed')),
      add: () => Promise.reject(new Error('Firestore connection failed')),
    }),
  };
}

export { app, auth, db }; 