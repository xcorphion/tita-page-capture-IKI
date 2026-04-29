import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
    const { code } = req.query;
    const db = await connectToDatabase();
    const participants = db.collection('participants');

    if (req.method === 'POST') {
        const { wpm_baseline, device_profile } = req.body;
        try {
            await participants.updateOne(
                { participant_id: code },
                { $set: { wpm_baseline, device_profile, onboarding_complete: true } }
            );
            return res.json({ ok: true });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Failed to update onboarding' });
        }
    }

    if (req.method !== 'GET') return res.status(405).end();
    
    try {
        let doc = await participants.findOne({ participant_id: code });
        if (!doc) {
            await participants.insertOne({ participant_id: code, sessions_completed: 0, created_at: new Date(), onboarding_complete: false });
            return res.json({ participant_id: code, sessions_completed: 0, next_prompt_id: 1, onboarding_complete: false });
        }
        const sessionsCompleted = doc.sessions_completed || 0;

        // After session 1, block access until admin unlocks
        if (sessionsCompleted >= 1 && !doc.session2_unlocked) {
            return res.json({
                participant_id: code,
                sessions_completed: sessionsCompleted,
                next_prompt_id: sessionsCompleted + 1,
                locked: true,
                onboarding_complete: doc.onboarding_complete
            });
        }

        res.json({ 
            participant_id: code, 
            sessions_completed: sessionsCompleted, 
            next_prompt_id: sessionsCompleted + 1,
            onboarding_complete: doc.onboarding_complete
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}
