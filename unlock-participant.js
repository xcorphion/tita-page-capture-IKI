#!/usr/bin/env node
/**
 * unlock-participant.js — CLI tool to unlock session 2 for a participant
 *
 * Usage:
 *   node unlock-participant.js <PARTICIPANT_CODE>
 *
 * Requires MONGODB_URI in .env (same as the app).
 * Uses UNLOCK_SECRET from .env (default: "tita-admin").
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const secret = process.env.UNLOCK_SECRET || 'tita-admin';
const code = process.argv[2]?.toUpperCase().trim();

if (!code) {
    console.error('\n  ❌  Uso: node unlock-participant.js <CÓDIGO_DO_PARTICIPANTE>\n');
    process.exit(1);
}

if (!uri) {
    console.error('\n  ❌  MONGODB_URI não definido no .env\n');
    process.exit(1);
}

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const participants = db.collection('participants');

        const doc = await participants.findOne({ participant_id: code });
        if (!doc) {
            console.error(`\n  ❌  Participante "${code}" não encontrado no banco.\n`);
            process.exit(1);
        }

        const sessionsCompleted = doc.sessions_completed || 0;
        console.log(`\n  ℹ️   Participante: ${code}`);
        console.log(`  ℹ️   Sessões concluídas: ${sessionsCompleted}`);

        if (doc.fingerprint) {
            console.log(`  🔍  Fingerprint capturada:`);
            console.log(`       IP           : ${doc.fingerprint.ip}`);
            console.log(`       User-Agent   : ${doc.fingerprint.user_agent}`);
            console.log(`       Capturado em : ${doc.fingerprint.captured_at}`);
        } else {
            console.log(`  ℹ️   Nenhuma fingerprint registrada ainda.`);
        }

        if (doc.session2_unlocked) {
            console.log(`\n  ✅  Sessão 2 já estava liberada para "${code}".\n`);
            process.exit(0);
        }

        await participants.updateOne(
            { participant_id: code },
            { $set: { session2_unlocked: true, unlocked_at: new Date(), unlocked_by: 'cli' } }
        );

        console.log(`\n  ✅  Sessão 2 liberada com sucesso para "${code}"!\n`);
    } finally {
        await client.close();
    }
}

main().catch(err => {
    console.error('\n  ❌  Erro:', err.message, '\n');
    process.exit(1);
});
