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
        if (globalWithMongo.mongo) {
            console.log('Using existing MongoDB connection');
            return globalWithMongo.mongo;
        }

        if (typeof MONGODB_URI !== 'string') {
            throw new Error('MONGODB_URI must be a string');
        }

        console.log('Connecting to MongoDB...');
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB successfully');
        
        const db = client.db(MONGODB_DB);
        globalWithMongo.mongo = { client, db };

        return { client, db };
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }
} 