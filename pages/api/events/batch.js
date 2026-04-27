import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { session_id, participant_code, events } = req.body;
    if (!events || events.length === 0) return res.json({ received: 0 });
    try {
        const db = await connectToDatabase();
        const docs = events.map(e => ({
            session_id, participant_id: participant_code,
            event_type: e.event_type, key_code: e.key_code,
            timestamp_rel_ms: e.timestamp_rel_ms, inserted_at: new Date()
        }));
        await db.collection('events').insertMany(docs);
        res.json({ received: events.length });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to store events' });
    }
}
