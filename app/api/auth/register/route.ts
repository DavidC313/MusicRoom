import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    
    const db = client.db('musicroom');
    console.log('Using database: musicroom');
    
    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Insert new user
    console.log('Inserting new user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, user: { uid: user.uid, email, username } });
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