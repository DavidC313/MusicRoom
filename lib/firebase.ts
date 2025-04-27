'use client';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

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

export { db };

export default app; 