import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/firebase-admin';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: { uid: string } }
) {
    try {
        const { uid } = params;
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        // Check if user is requesting their own data or is an admin
        if (decodedToken.uid !== uid && !decodedToken.admin) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne({ uid });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error: unknown) {
        console.error('Error fetching user:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { uid: string } }
) {
    try {
        const { uid } = params;
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        // Only admins can delete users
        if (!decodedToken.admin) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        // Delete user from Firebase Auth
        await auth.deleteUser(uid);

        // Delete user from MongoDB
        const { db } = await connectToDatabase();
        const result = await db.collection('users').deleteOne({ uid });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: unknown) {
        console.error('Error deleting user:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
} 