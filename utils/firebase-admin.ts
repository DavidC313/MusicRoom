import * as admin from 'firebase-admin';

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

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase admin initialization error:', error);
    }
}

export const auth = admin.auth();
export const firestore = admin.firestore();

    // Test Firestore connection
    console.log('Testing Firestore connection...');
    try {
    const testDoc = await firestore.collection('test').doc('test').get();
        console.log('Firestore connection test successful');
    } catch (error) {
        console.error('Firestore connection test failed:', error);
        throw new Error('Firestore connection failed. Please check if Firestore is enabled in your Firebase project.');
    }