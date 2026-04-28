import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { session_id, participant_code, engagement_rating, text_final } = req.body;

    // Capture fingerprint for session-lock identification
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';

    try {
        const db = await connectToDatabase();

        await db.collection('sessions').updateOne(
            { session_id },
            { $set: { engagement_rating, text_final, status: 'completed', completed_at: new Date() } }
        );

        // Retrieve current sessions count before increment to decide if this is session 1's end
        const participant = await db.collection('participants').findOne({ participant_id: participant_code });
        const sessionsBeforeEnd = participant?.sessions_completed || 0;

        const participantUpdate = { $inc: { sessions_completed: 1 } };
        if (sessionsBeforeEnd === 0) {
            // First session completed — store fingerprint for lock review
            participantUpdate.$set = {
                fingerprint: { ip, user_agent: ua, captured_at: new Date() }
            };
        }

        await db.collection('participants').updateOne(
            { participant_id: participant_code },
            participantUpdate
        );

        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to end session' });
    }
}

