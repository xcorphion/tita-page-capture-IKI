import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { session_id, participant_code, engagement_rating, text_final } = req.body;
    try {
        const db = await connectToDatabase();
        await db.collection('sessions').updateOne(
            { session_id },
            { $set: { engagement_rating, text_final, status: 'completed', completed_at: new Date() } }
        );
        await db.collection('participants').updateOne(
            { participant_id: participant_code },
            { $inc: { sessions_completed: 1 } }
        );
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to end session' });
    }
}
