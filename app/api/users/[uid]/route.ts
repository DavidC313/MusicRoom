import { NextResponse } from 'next/server';
import { auth, db } from '@/utils/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function GET(
    request: Request,
    { params }: { params: { uid: string } }
) {
    try {
        // Await the params to ensure they're available
        const { uid } = await Promise.resolve(params);
        console.log('Starting GET request for user:', uid);
        
        // Verify the user is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            console.log('No Authorization header found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            console.log('No token found in Authorization header');
            return NextResponse.json({ error: 'Invalid Authorization header format' }, { status: 401 });
        }

        console.log('Verifying token...');
        let decodedToken;
        try {
            decodedToken = await auth.verifyIdToken(token);
            console.log('Token verified successfully');
        } catch (tokenError) {
            console.error('Token verification failed:', tokenError);
            return NextResponse.json({ 
                error: 'Invalid token',
                details: tokenError instanceof Error ? tokenError.message : 'Unknown error'
            }, { status: 401 });
        }

        // Check if the requested user ID matches the authenticated user
        if (decodedToken.uid !== uid) {
            console.log('User ID mismatch:', { requestedUid: uid, tokenUid: decodedToken.uid });
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get user profile data from Firestore
        console.log('Fetching user document from Firestore...');
        let userDoc;
        try {
            userDoc = await db.collection('users').doc(uid).get();
            console.log('Firestore document retrieved successfully');
        } catch (firestoreError) {
            console.error('Firestore fetch error:', firestoreError);
            return NextResponse.json({ 
                error: 'Database error',
                details: firestoreError instanceof Error ? firestoreError.message : 'Unknown error'
            }, { status: 500 });
        }
        
        if (!userDoc.exists) {
            console.log('User document does not exist, creating default profile');
            const defaultProfile = {
                displayName: '',
                aboutMe: '',
                favoriteGenres: '',
                instruments: '',
                profileImage: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            try {
                await db.collection('users').doc(uid).set(defaultProfile);
                console.log('Default profile created successfully');
                return NextResponse.json(defaultProfile);
            } catch (createError) {
                console.error('Error creating default profile:', createError);
                return NextResponse.json({ 
                    error: 'Failed to create default profile',
                    details: createError instanceof Error ? createError.message : 'Unknown error'
                }, { status: 500 });
            }
        }

        console.log('User document found, returning data');
        const data = userDoc.data();
        if (!data) {
            console.log('No data found in document');
            return NextResponse.json({ 
                error: 'No data found',
                details: 'The document exists but contains no data'
            }, { status: 500 });
        }

        return NextResponse.json({
            displayName: data.displayName || '',
            aboutMe: data.aboutMe || '',
            favoriteGenres: data.favoriteGenres || '',
            instruments: data.instruments || '',
            profileImage: data.profileImage || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
        });
    } catch (error) {
        console.error('Unexpected error in GET handler:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { uid: string } }
) {
    try {
        // Await the params to ensure they're available
        const { uid } = await Promise.resolve(params);
        
        // Verify the user is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Invalid Authorization header format' }, { status: 401 });
        }

        let decodedToken;
        try {
            decodedToken = await auth.verifyIdToken(token);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Check if the requested user ID matches the authenticated user
        if (decodedToken.uid !== uid) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Parse the request body
        const body = await request.json();
        
        // Validate the request body
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Update the user profile
        const updateData = {
            ...body,
            updatedAt: new Date().toISOString()
        };

        try {
            await db.collection('users').doc(uid).update(updateData);
            return NextResponse.json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ 
                error: 'Failed to update profile',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Unexpected error in PUT handler:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { uid: string } }
) {
    try {
        // Await the params to ensure they're available
        const { uid } = await Promise.resolve(params);
        
        // Verify the user is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Invalid Authorization header format' }, { status: 401 });
        }

        let decodedToken;
        try {
            decodedToken = await auth.verifyIdToken(token);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Check if the requested user ID matches the authenticated user
        if (decodedToken.uid !== uid) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            await db.collection('users').doc(uid).delete();
            return NextResponse.json({ message: 'Profile deleted successfully' });
        } catch (error) {
            console.error('Error deleting profile:', error);
            return NextResponse.json({ 
                error: 'Failed to delete profile',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Unexpected error in DELETE handler:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 