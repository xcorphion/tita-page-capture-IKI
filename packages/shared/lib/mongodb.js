import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Carregar .env apenas em desenvolvimento. No Vercel, as variáveis já estão no ambiente.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const options = {};
let client;
let clientPromise;

export async function connectToDatabase(workspace = 'research') {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
        throw new Error('ERRO DE INFRAESTRUTURA: MONGODB_URI não definida. Certifique-se de adicioná-la ao Dashboard do Vercel.');
    }

    if (!clientPromise) {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }
    
    const conn = await clientPromise;
    // Segregação de Workspaces no MongoDB Atlas
    const dbName = workspace === 'platform' ? 'Xcorphion_Platform' : 'Research_System';
    return conn.db(dbName);
}
