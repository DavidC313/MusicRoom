import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth, db } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    console.log('Starting registration process...');
    const { email, password, username } = await request.json();
    
    if (!email || !password || !username) {
      console.error('Missing required fields:', { email, password, username });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    console.log('Connected to MongoDB');
    
    const mongoDb = client.db('musicroom');
    console.log('Using database: musicroom');
    
    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await mongoDb.collection('users').findOne({ email });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user in Firebase Auth
    console.log('Creating new user in Firebase Auth...');
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username,
    });
    
    // Create user document in Firestore
    console.log('Creating user document in Firestore...');
    await db.collection('users').doc(userRecord.uid).set({
      email,
      username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      user: { 
        uid: userRecord.uid, 
        email, 
        username 
      } 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('API registration error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'An unknown error occurred' }, { status: 400 });
  }
} 