import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        // Check if the user is an admin
        if (decodedToken.uid !== 'XbJ8BBGIJsTTJeaGrMwXilEdOkc2') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all users from Firebase Auth
        const { users } = await auth.listUsers();
        
        // Get user data from MongoDB
        const { db } = await connectToDatabase();
        const mongoUsers = await db.collection('users').find({}).toArray();
        
        // Create a map of MongoDB user data for quick lookup
        const mongoUserMap = new Map(mongoUsers.map(user => [user.uid, user]));

        // Format the users data combining Firebase and MongoDB data
        const formattedUsers = users.map(user => {
            const mongoUser = mongoUserMap.get(user.uid);
            return {
            uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || mongoUser?.displayName || '',
                photoURL: user.photoURL || mongoUser?.photoURL || '',
            metadata: {
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime
            }
            };
        });

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
} 