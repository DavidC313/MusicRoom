import { auth } from '@/lib/firebase-admin';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
    request: Request,
    context: { params: { uid: string } }
): Promise<Response> {
    try {
        const { uid } = context.params;
        console.log('GET /api/users/[uid] - Request received for UID:', uid);
        
        // Verify Firebase token
        const authHeader = request.headers.get('authorization');
        console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
        
        if (!authHeader?.startsWith('Bearer ')) {
            console.error('Invalid authorization header format');
            return Response.json({ error: 'Unauthorized - Invalid header format' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        console.log('Token extracted, length:', token.length);
        
        let decodedToken;
        try {
            decodedToken = await auth.verifyIdToken(token);
            console.log('Token verified successfully for user:', decodedToken.uid);
            
            // Verify token matches requested user
            if (decodedToken.uid !== uid) {
                console.error('Token UID does not match requested UID:', { tokenUid: decodedToken.uid, requestedUid: uid });
                return Response.json({ error: 'Unauthorized - Token mismatch' }, { status: 401 });
            }
        } catch (tokenError) {
            console.error('Token verification failed:', tokenError);
            return Response.json({ error: 'Invalid token', details: tokenError instanceof Error ? tokenError.message : 'Unknown error' }, { status: 401 });
        }

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        const { db } = await connectToDatabase();
        console.log('Connected to MongoDB, fetching user...');
        
        const user = await db.collection('users').findOne({ uid });
        console.log('MongoDB query result:', user ? 'User found' : 'User not found');

        if (!user) {
            // Create new user document if it doesn't exist
            console.log('Creating new user document for:', decodedToken.email);
            const newUser = {
                uid,
                email: decodedToken.email,
                displayName: decodedToken.displayName || decodedToken.name || '',
                photoURL: decodedToken.picture || '',
                createdAt: new Date(),
                updatedAt: new Date(),
                aboutMe: '',
                favoriteArtists: '',
                musicGenres: [],
                socialLinks: {
                    twitter: '',
                    github: '',
                    linkedin: '',
                    instagram: '',
                    facebook: '',
                    youtube: ''
                }
            };
            
            try {
                await db.collection('users').insertOne(newUser);
                console.log('New user document created successfully');
                return Response.json(newUser);
            } catch (dbError) {
                console.error('Failed to create new user document:', dbError);
                return Response.json({ error: 'Failed to create user profile', details: dbError instanceof Error ? dbError.message : 'Unknown error' }, { status: 500 });
            }
        }

        console.log('Returning existing user data');
        return Response.json(user);
    } catch (error) {
        console.error('Error in GET /api/users/[uid]:', error);
        return Response.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    context: { params: { uid: string } }
): Promise<Response> {
    try {
        const { uid } = context.params;
        console.log('Updating user data for:', uid);
        
        // Verify Firebase token
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            console.error('No valid authorization header');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        console.log('Token verified for user:', decodedToken.uid);

        // Only allow users to update their own profile or admins
        if (decodedToken.uid !== uid && !decodedToken.admin) {
            console.error('User not authorized to update this profile');
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updates = await request.json();
        console.log('Received updates:', updates);

        // Connect to MongoDB
        const { db } = await connectToDatabase();
        console.log('Connected to MongoDB, updating user...');
        
        // First check if user exists
        const userExists = await db.collection('users').findOne({ uid });
        if (!userExists) {
            console.error('User not found for update');
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Update user in MongoDB
        const result = await db
            .collection('users')
            .updateOne(
                { uid },
                { 
                    $set: {
                        ...updates,
                        updatedAt: new Date()
                    }
                }
            );

        if (result.matchedCount === 0) {
            console.error('Failed to update user in MongoDB');
            return Response.json({ error: 'Failed to update user' }, { status: 500 });
        }

        console.log('User updated successfully in MongoDB');
        return Response.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error in PUT /api/users/[uid]:', error);
        return Response.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    context: { params: { uid: string } }
): Promise<Response> {
    try {
        const { uid } = context.params;
        console.log('Deleting user:', uid);
        
        // Verify Firebase token
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            console.error('No valid authorization header');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        console.log('Token verified for user:', decodedToken.uid);

        // Only admins can delete users
        if (decodedToken.uid !== 'XbJ8BBGIJsTTJeaGrMwXilEdOkc2') {
            console.error('User not authorized to delete profiles');
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        // First check if user exists in Firebase
        try {
            await auth.getUser(uid);
        } catch (error) {
            console.error('User not found in Firebase:', error);
            return Response.json({ error: 'User not found in Firebase' }, { status: 404 });
        }

        // Connect to MongoDB
        const { db } = await connectToDatabase();
        console.log('Connected to MongoDB, deleting user...');
        
        // Check if user exists in MongoDB
        const userExists = await db.collection('users').findOne({ uid });
        if (!userExists) {
            console.log('User not found in MongoDB');
            // Still try to delete from Firebase since we know they exist there
            try {
                await auth.deleteUser(uid);
                console.log('User deleted from Firebase (was not in MongoDB)');
                return Response.json({ message: 'User deleted from Firebase' });
            } catch (firebaseError) {
                console.error('Error deleting user from Firebase:', firebaseError);
                return Response.json({ error: 'Failed to delete user from Firebase' }, { status: 500 });
            }
        }

        // Delete user from MongoDB
        const result = await db.collection('users').deleteOne({ uid });
        if (result.deletedCount === 0) {
            console.error('Failed to delete user from MongoDB');
            return Response.json({ error: 'Failed to delete user from MongoDB' }, { status: 500 });
        }

        // Delete user from Firebase
        try {
            await auth.deleteUser(uid);
            console.log('User deleted successfully from Firebase');
        } catch (firebaseError) {
            console.error('Error deleting user from Firebase:', firebaseError);
            // Rollback MongoDB deletion since Firebase deletion failed
            await db.collection('users').insertOne(userExists);
            return Response.json({ error: 'Failed to delete user from Firebase' }, { status: 500 });
        }

        console.log('User deleted successfully from both MongoDB and Firebase');
        return Response.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /api/users/[uid]:', error);
        return Response.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 