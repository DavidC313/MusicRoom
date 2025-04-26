import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    console.log('Starting registration process...');
    const { uid, email } = await request.json();
    
    if (!uid || !email) {
      console.error('Missing required fields:', { uid, email });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('Checking for existing user...');
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user document
    console.log('Creating new user document...');
    await setDoc(doc(db, 'users', uid), {
      email,
      createdAt: new Date().toISOString(),
    });
    console.log('User document created successfully');

    return NextResponse.json({ 
      message: 'User registered successfully',
      uid 
    });
  } catch (error: any) {
    console.error('API registration error:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 