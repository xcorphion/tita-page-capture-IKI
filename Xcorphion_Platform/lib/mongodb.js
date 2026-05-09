import { MongoClient } from 'mongodb';
import { ensureIndexes } from './ensureIndexes';

let client;
let clientPromise;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI não definida.');

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  const conn = await clientPromise;
  const db = conn.db('Research_System');
  ensureIndexes(db);
  return db;
}
