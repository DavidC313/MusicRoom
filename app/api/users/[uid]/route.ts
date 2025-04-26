import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/firebase-admin';

export const runtime = 'edge';

interface RouteContext {
    params: {
        uid: string;
    };
}

export async function GET(
    request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {
    try {
        const { uid } = context.params;
        const userRecord = await auth.getUser(uid);
        
        return NextResponse.json({ user: userRecord }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {
    try {
        const { uid } = context.params;
        const data = await request.json();
        
        // Verify the request is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        if (decodedToken.uid !== uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update user data in Firestore
        await auth.updateUser(uid, data);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {
    try {
        const { uid } = context.params;
        
        // Verify the request is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        if (decodedToken.uid !== uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete user
        await auth.deleteUser(uid);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 