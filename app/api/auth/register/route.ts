import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { auth } from '@/utils/firebase-admin';

export async function POST(request: Request) {
  try {
    console.log('Starting registration process...');
    
    // Verify Firebase token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    const { email, name } = await request.json();
    
    if (!email || !name) {
      console.error('Missing required fields:', { email, name });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Connecting to MongoDB...');
    const { db } = await connectToDatabase();
    console.log('Connected to MongoDB');
    
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
    const result = await db.collection('users').insertOne({
      uid: decodedToken.uid,
      email: email,
      name: name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('User inserted successfully:', result.insertedId);

    return NextResponse.json({ 
      message: 'User registered successfully',
      uid: decodedToken.uid 
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
} 