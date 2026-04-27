import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();
    const { code } = req.query;
    try {
        const db = await connectToDatabase();
        const participants = db.collection('participants');
        let doc = await participants.findOne({ participant_id: code });
        if (!doc) {
            await participants.insertOne({ participant_id: code, sessions_completed: 0, created_at: new Date() });
            return res.json({ participant_id: code, sessions_completed: 0, next_prompt_id: 1 });
        }
        const sessionsCompleted = doc.sessions_completed || 0;
        res.json({ participant_id: code, sessions_completed: sessionsCompleted, next_prompt_id: sessionsCompleted + 1 });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}
