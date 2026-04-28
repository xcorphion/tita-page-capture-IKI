import { connectToDatabase } from '../../../lib/mongodb';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { participant_code, prompt_id, jitter_benchmark_ms } = req.body;
    const sessionId = randomUUID();
    const sessionStartEpochMs = Date.now();
    const promptText = "Escreva sobre algo que você fez recentemente e que deixou uma marca. Foque no que fez e no que sentiu — não precisa explicar o contexto.";
    try {
        const db = await connectToDatabase();
        await db.collection('sessions').insertOne({
            session_id: sessionId, participant_id: participant_code,
            prompt_id, session_start_epoch_ms: sessionStartEpochMs,
            jitter_benchmark_ms, status: 'started'
        });
        res.json({ session_id: sessionId, session_start_epoch_ms: sessionStartEpochMs, prompt_text: promptText });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to start session' });
    }
}
