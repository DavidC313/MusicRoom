import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/firebase-admin';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        // Check if user is admin
        const { admin } = decodedToken;
        if (!admin) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const { db } = await connectToDatabase();
        const users = await db.collection('users').find().toArray();

        return NextResponse.json(users);
    } catch (error: unknown) {
        console.error('Error fetching users:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
} 