import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { uid, email } = await request.json();
    
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('your-database-name');
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ uid });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Insert new user
    await db.collection('users').insertOne({
      uid,
      email,
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      message: 'User registered successfully',
      uid 
    });
  } catch (error: any) {
    console.error('API registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
} 