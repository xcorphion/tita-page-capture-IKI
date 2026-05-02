import { connectToDatabase } from '../../../lib/mongodb';
const { hashParticipantId } = require('../../../lib/participant');

export default async function handler(req, res) {
    const { code } = req.query;
    const db = await connectToDatabase();
    const participants = db.collection('participants');
    const participant_id = hashParticipantId(code);

    if (req.method === 'POST') {
        const { wpm_baseline, device_profile } = req.body;
        try {
            await participants.updateOne(
                { participant_id },
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
        let doc = await participants.findOne({ participant_code: code });
        if (!doc) {
            return res.status(404).json({ error: 'Convite não encontrado.' });
        }
        const sessionsCompleted = doc.sessions_completed || 0;

        // Check if session is locked (waiting for admin)
        const isLocked = (sessionsCompleted === 1 && !doc.admin_authorized_s2) || 
                         (sessionsCompleted === 2 && !doc.admin_authorized_s3);

        res.json({ 
            participant_id, 
            sessions_completed: sessionsCompleted, 
            next_prompt_id: sessionsCompleted + 1,
            onboarding_complete: doc.onboarding_complete,
            locked: isLocked
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}
