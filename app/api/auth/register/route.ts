import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

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

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    console.log('Connected to MongoDB');
    
    const db = client.db('musicroom');
    console.log('Using database: musicroom');
    
    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await db.collection('users').findOne({ uid });
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
      uid,
      email,
      createdAt: new Date(),
    });
    console.log('User inserted successfully:', result.insertedId);

    return NextResponse.json({ 
      message: 'User registered successfully',
      uid 
    });
  } catch (error: any) {
    console.error('API registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
} 