import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    // #1/#12 — timestamp_rel_ms arrives pre-calculated from the browser.
    // The server NEVER recomputes it. Only persist what the client sends.
    const { session_id, participant_code, character_count, valence, arousal, timestamp_rel_ms } = req.body;
    try {
        const db = await connectToDatabase();
        await db.collection('emas').insertOne({
            session_id,
            participant_id: participant_code,
            character_count,
            valence,
            arousal,
            timestamp_rel_ms,   // #12 — from browser, not Date.now()
            created_at: new Date()
        });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to store EMA' });
    }
}
