import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { session_id, participant_code, character_count, valence, arousal } = req.body;
    try {
        const db = await connectToDatabase();
        await db.collection('emas').insertOne({
            session_id, participant_id: participant_code,
            character_count, valence, arousal, timestamp_rel_ms: Date.now()
        });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to store EMA' });
    }
}
