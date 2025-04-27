import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
    throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

interface MongoConnection {
    client: MongoClient;
    db: Db;
}

const globalWithMongo = global as typeof globalThis & {
    mongo: MongoConnection | null;
};

export async function connectToDatabase(): Promise<MongoConnection> {
    try {
        // Check if we have a cached connection
        if (globalWithMongo.mongo) {
            console.log('Checking existing MongoDB connection...');
            
            // Verify the connection is still alive
            try {
                await globalWithMongo.mongo.client.db().command({ ping: 1 });
                console.log('Using existing MongoDB connection');
                return globalWithMongo.mongo;
            } catch (pingError) {
                console.warn('Cached connection is stale, creating new connection:', pingError);
                // Connection is stale, close it and create a new one
                await globalWithMongo.mongo.client.close();
                globalWithMongo.mongo = null;
            }
        }

        if (typeof MONGODB_URI !== 'string') {
            throw new Error('MONGODB_URI must be a string');
        }

        console.log('Creating new MongoDB connection...');
        const client = new MongoClient(MONGODB_URI, {
            connectTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000,  // 45 seconds
        });

        try {
            await client.connect();
            console.log('Connected to MongoDB successfully');
            
            // Test the connection
            await client.db().command({ ping: 1 });
            console.log('MongoDB connection verified');
            
            const db = client.db(MONGODB_DB);
            
            // Cache the connection
            globalWithMongo.mongo = { client, db };
            
            return { client, db };
        } catch (connectionError) {
            console.error('Error establishing MongoDB connection:', connectionError);
            // Ensure client is closed on connection error
            await client.close();
            throw connectionError;
        }
    } catch (error) {
        console.error('Error in connectToDatabase:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to connect to MongoDB');
    }
} 