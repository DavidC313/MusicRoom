import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Check for required environment variables
const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Properly handle the private key by replacing escaped newlines
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

const firebaseAdminConfig = {
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
};

let app;
let auth;
let db;

try {
    // Initialize Firebase Admin
    if (getApps().length === 0) {
        console.log('Initializing Firebase Admin app...');
        app = initializeApp(firebaseAdminConfig);
        console.log('Firebase Admin app initialized successfully');
    } else {
        console.log('Using existing Firebase Admin app');
        app = getApps()[0];
    }

    // Initialize Auth
    console.log('Initializing Firebase Auth...');
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully');

    // Initialize Firestore
    console.log('Initializing Firestore...');
    db = getFirestore(app);
    console.log('Firestore initialized successfully');

    // Test Firestore connection
    console.log('Testing Firestore connection...');
    try {
        const testDoc = await db.collection('test').doc('test').get();
        console.log('Firestore connection test successful');
    } catch (error) {
        console.error('Firestore connection test failed:', error);
        throw new Error('Firestore connection failed. Please check if Firestore is enabled in your Firebase project.');
    }

} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    if (error instanceof Error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
    }
    throw error;
}

export { auth, db }; 