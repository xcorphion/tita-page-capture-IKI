import { MongoClient } from 'mongodb';

let client;
let clientPromise;

export async function connectToDatabase(workspace = 'research') {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI não definida.');

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  const conn = await clientPromise;
  return conn.db(workspace === 'platform' ? 'Xcorphion_Platform' : 'Research_System');
}
