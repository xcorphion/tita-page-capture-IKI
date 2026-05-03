import { connectToDatabase } from '../../../lib/mongodb';
import { randomUUID } from 'crypto';
const { hashParticipantId } = require('../../../lib/participant');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { participant_code, prompt_id, jitter_benchmark_ms } = req.body;
    const participant_id = hashParticipantId(participant_code);
    const sessionId = randomUUID();
    const sessionStartEpochMs = Date.now();

    // #14 — Standardized prompt anchored on emotional decision-making
    const promptText = "Descreva uma decisão difícil que você tomou recentemente — o que você sentiu enquanto decidia, não apenas o que decidiu.";

    try {
        const db = await connectToDatabase();
        await db.collection('sessions').insertOne({
            session_id: sessionId,
            participant_id,
            prompt_id,
            session_start_epoch_ms: sessionStartEpochMs,
            // #5 — jitter_benchmark_ms arrives from real microbenchmark, not hardcoded 0
            jitter_benchmark_ms: jitter_benchmark_ms !== undefined ? Number(jitter_benchmark_ms) : null,
            status: 'started',
            created_at: new Date()
        });
        res.json({ session_id: sessionId, session_start_epoch_ms: sessionStartEpochMs, prompt_text: promptText });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to start session' });
    }
}
