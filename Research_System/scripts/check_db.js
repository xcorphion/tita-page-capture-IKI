
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("ERRO: MONGODB_URI não encontrada no .env");
        process.exit(1);
    }

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();

        console.log("\n--- Últimas 5 Sessões ---");
        const sessions = await db.collection('sessions')
            .find({})
            .sort({ created_at: -1 })
            .limit(5)
            .toArray();

        sessions.forEach(s => {
            console.log(`ID: ${s.session_id} | Status: ${s.status} | Jitter: ${s.jitter_benchmark_ms}ms | Criada em: ${s.created_at}`);
        });

        console.log("\n--- Últimos 5 Participantes ---");
        const participants = await db.collection('participants')
            .find({})
            .sort({ created_at: -1 })
            .limit(5)
            .toArray();

        participants.forEach(p => {
            console.log(`Código: ${p.participant_code} | Sessões Concluídas: ${p.sessions_completed} | Status: ${p.status}`);
        });

        console.log("\n--- Últimas 5 EMAs ---");
        const emas = await db.collection('emas')
            .find({})
            .sort({ created_at: -1 })
            .limit(5)
            .toArray();
        
        emas.forEach(e => {
            console.log(`Sessão: ${e.session_id} | Index: ${e.prompt_index} | V: ${e.valence} A: ${e.arousal}`);
        });

    } catch (e) {
        console.error("Erro ao conectar ou consultar o banco:", e);
    } finally {
        await client.close();
    }
}

checkDatabase();
