const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Adicione a variável de ambiente MONGODB_URI');
    }

    if (!cachedClient) {
        cachedClient = new MongoClient(uri);
        await cachedClient.connect();
    }

    // Conecta a um banco de dados opcionalmente fornecido na URI, ou usa default 'study_db'
    const db = cachedClient.db();
    cachedDb = db;
    return db;
}

module.exports = { connectToDatabase };
