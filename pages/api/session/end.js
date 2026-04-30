import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    // #2  — engagement_rating is integer 1–5, not boolean
    // #15 — engagement_genuine is boolean (separate binary question)
    const { session_id, participant_code, engagement_rating, engagement_genuine, text_final } = req.body;

    // Capture fingerprint for session-lock identification
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';

    try {
        const db = await connectToDatabase();

        await db.collection('sessions').updateOne(
            { session_id },
            {
                $set: {
                    engagement_rating: Number(engagement_rating),  // #2 — coerce to int
                    engagement_genuine: Boolean(engagement_genuine), // #15 — explicit boolean
                    text_final,
                    status: 'completed',
                    completed_at: new Date()
                }
            }
        );

        // Retrieve current sessions count before increment to decide if this is session 1's end
        const participant = await db.collection('participants').findOne({ participant_id: participant_code });
        const sessionsBeforeEnd = participant?.sessions_completed || 0;
        const currentSession = sessionsBeforeEnd + 1; // 1, 2, or 3

        const participantUpdate = { 
            $inc: { sessions_completed: 1 },
            $set: {}
        };
        
        if (sessionsBeforeEnd === 0) {
            participantUpdate.$set.fingerprint = { ip, user_agent: ua, captured_at: new Date() };
        }

        const isEngaged = Boolean(engagement_genuine);
        
        // Ativar engajamento e status de sessões
        if (currentSession === 1) {
            participantUpdate.$set.session_1_engagement = isEngaged;
            participantUpdate.$set.session_1_status = 'CONCLUIDA';
            if (!isEngaged) {
                participantUpdate.$set.status = 'INATIVO';
                participantUpdate.$set.session_2_status = 'BLOQUEADA';
                participantUpdate.$set.session_3_status = 'BLOQUEADA';
            }
        } else if (currentSession === 2) {
            participantUpdate.$set.session_2_engagement = isEngaged;
            participantUpdate.$set.session_2_status = 'CONCLUIDA';
            if (!isEngaged) {
                participantUpdate.$set.status = 'INATIVO';
                participantUpdate.$set.session_3_status = 'BLOQUEADA';
            }
        } else if (currentSession === 3) {
            participantUpdate.$set.session_3_engagement = isEngaged;
            participantUpdate.$set.session_3_status = 'CONCLUIDA';
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
