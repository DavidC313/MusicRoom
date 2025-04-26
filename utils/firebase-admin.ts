import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set');
}

if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error('FIREBASE_CLIENT_EMAIL environment variable is not set');
}

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID environment variable is not set');
}

// Properly handle the private key by replacing escaped newlines
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      projectId: process.env.FIREBASE_PROJECT_ID,
    } as admin.ServiceAccount),
  });
}

export const auth = admin.auth();
export const firestore = admin.firestore(); 