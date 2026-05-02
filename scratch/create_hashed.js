const { MongoClient } = require('mongodb');
const { hashParticipantId } = require('../lib/participant');
require('dotenv').config();

async function main() {
    const uri = process.env.MONGODB_URI;
    const code = 'TEST1';
    const participant_id = hashParticipantId(code);
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    const newParticipant = {
        participant_id,
        participant_code: code,
        participant_name: 'Agente Teste',
        referrer_name: 'Agente',
        status: 'ATIVO',
        session_1_status: 'LIBERADA',
        session_2_status: 'AGUARDANDO',
        session_3_status: 'AGUARDANDO',
        sessions_completed: 0,
        onboarding_complete: false,
        created_at: new Date()
    };
    await db.collection('participants').insertOne(newParticipant);
    console.log('Created:', code);
    await client.close();
}
main();
