require('dotenv').config();
const { MongoClient } = require('mongodb');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const { hashParticipantId } = require('../lib/participant');

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI não está definido no .env");
        process.exit(1);
    }

    const participant_name = await askQuestion("Nome do participante: ");
    const referrer_name = await askQuestion("Nome do indicador (quem indicou): ");
    console.log("Gerando convite...");

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const participants = db.collection('participants');

        let code;
        let isUnique = false;
        while (!isUnique) {
            code = generateCode();
            const existing = await participants.findOne({ participant_code: code });
            if (!existing) {
                isUnique = true;
            }
        }

        const participant_id = hashParticipantId(code);

        const newParticipant = {
            participant_id, // #17 — SHA-256 hash with salt
            participant_code: code,
            participant_name,
            referrer_name,
            status: 'ATIVO',
            session_1_status: 'LIBERADA',
            session_2_status: 'AGUARDANDO',
            session_3_status: 'AGUARDANDO',
            session_1_engagement: null,
            session_2_engagement: null,
            session_3_engagement: null,
            admin_authorized_s2: false,
            admin_authorized_s3: false,
            sessions_completed: 0,
            onboarding_complete: false,
            created_at: new Date()
        };

        await participants.insertOne(newParticipant);

        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        console.log(`✓ Código de acesso: ${code}`);
        console.log(`✓ Participante criado no banco com status: ATIVO`);
        console.log(`✓ Sessão 1: LIBERADA`);
        console.log(`✓ Sessão 2: AGUARDANDO (requer admin)`);
        console.log(`✓ Sessão 3: AGUARDANDO (requer admin)`);
        console.log(`Link de convite: ${appUrl}/convite/${code}`);

    } catch (e) {
        console.error("Erro ao criar participante:", e);
    } finally {
        await client.close();
        rl.close();
    }
}

main();
