const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const last = await db.collection('participants').find().sort({ created_at: -1 }).limit(1).toArray();
    console.log(JSON.stringify(last[0], null, 2));
    await client.close();
}
main();
