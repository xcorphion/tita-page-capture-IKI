import { connectToDatabase } from '@xcorphion/shared';
const { hashParticipantId } = require('../../lib/participant');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    // #1/#12 — timestamp_rel_ms arrives pre-calculated from the browser.
    // The server NEVER recomputes it. Only persist what the client sends.
    const { session_id, participant_code, character_count, valence, arousal, timestamp_rel_ms, prompt_index } = req.body;
    const participant_id = hashParticipantId(participant_code);
    try {
        const db = await connectToDatabase();
        await db.collection('emas').insertOne({
            session_id,
            participant_id,
            prompt_index: Number(prompt_index), // #4.3 — required field
            character_count: Number(character_count),
            valence: Number(valence),
            arousal: Number(arousal),
            timestamp_rel_ms: Number(timestamp_rel_ms),   // #12 — from browser, not Date.now()
            created_at: new Date()
        });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to store EMA' });
    }
}
