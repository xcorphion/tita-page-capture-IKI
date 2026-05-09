import { connectToDatabase } from '../../../lib/mongodb';
import { hashParticipantId } from '../../../lib/participant';
import { validateSessionToken } from '../../../lib/sessionAuth';

const MAX_BATCH = 200;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { session_id, participant_code, session_token, events } = req.body;
    const participant_id = hashParticipantId(participant_code);
    if (!events || events.length === 0) return res.json({ received: 0 });
    if (events.length > MAX_BATCH)
        return res.status(400).json({ error: `Batch excede o limite de ${MAX_BATCH} eventos.` });
    try {
        const db = await connectToDatabase();
        if (!await validateSessionToken(db, session_id, session_token))
            return res.status(401).json({ error: 'Token de sessão inválido.' });
        const eventsCol = db.collection('events');

        const docs = events.map(e => ({
            session_id,
            participant_id,
            event_type: e.event_type,
            key_code: e.key_code,
            timestamp_rel_ms: e.timestamp_rel_ms,
            timestamp_abs_ms: e.timestamp_abs_ms,
            event_repeat: Boolean(e.event_repeat),
            created_at: new Date()
        }));

        await eventsCol.insertMany(docs);

        await eventsCol.createIndex(
            { session_id: 1, timestamp_rel_ms: 1 },
            { background: true, name: 'idx_session_rel_ts' }
        );

        res.json({ received: events.length });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to store events' });
    }
}
