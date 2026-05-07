import { connectToDatabase } from '@xcorphion/shared';

// Simple token check — set UNLOCK_SECRET in .env
const UNLOCK_SECRET = process.env.UNLOCK_SECRET || 'tita-admin';

export default async function handler(req, res) {
    const { code } = req.query;

    if (req.method === 'GET') {
        // Return lock status for this participant
        try {
            const db = await connectToDatabase();
            const doc = await db.collection('participants').findOne({ participant_id: code });
            if (!doc) return res.status(404).json({ error: 'Participant not found' });
            return res.json({
                participant_id: code,
                sessions_completed: doc.sessions_completed || 0,
                session2_unlocked: !!doc.session2_unlocked,
                fingerprint: doc.fingerprint || null
            });
        } catch (e) {
            return res.status(500).json({ error: 'DB error' });
        }
    }

    if (req.method === 'POST') {
        const { secret } = req.body || {};
        if (secret !== UNLOCK_SECRET) return res.status(403).json({ error: 'Forbidden' });
        try {
            const db = await connectToDatabase();
            const result = await db.collection('participants').updateOne(
                { participant_id: code },
                { $set: { session2_unlocked: true, unlocked_at: new Date() } }
            );
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Participant not found' });
            return res.json({ ok: true, participant_id: code, session2_unlocked: true });
        } catch (e) {
            return res.status(500).json({ error: 'DB error' });
        }
    }

    return res.status(405).end();
}
