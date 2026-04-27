import { MongoClient } from 'mongodb';

let cachedDb = null;
let cachedClient = null;

export async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Variável de ambiente MONGODB_URI não definida');
    if (!cachedClient) {
        cachedClient = new MongoClient(uri);
        await cachedClient.connect();
    }
    cachedDb = cachedClient.db();
    return cachedDb;
}
