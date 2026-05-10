import { connectToDatabase } from '../../../lib/mongodb';
import { hashParticipantId } from '../../../lib/participant';
import { validateSessionToken } from '../../../lib/sessionAuth';

const MAX_BATCH = 200;
// Events older than 2 hours relative to session start are outside any plausible writing window.
const MAX_EVENT_TS_MS = 7_200_000;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const session_id = body.session_id;
    const participant_code = body.participant_code;
    const session_token = body.session_token;
    const events = body.events;
    if (typeof session_id !== 'string' || typeof session_token !== 'string')
        return res.status(400).json({ error: 'Parâmetros inválidos.' });
    if (typeof participant_code !== 'string' || !/^[A-Z0-9]{1,20}$/.test(participant_code))
        return res.status(400).json({ error: 'participant_code ausente.' });
    if (!events || !Array.isArray(events) || events.length === 0) return res.json({ received: 0 });
    if (events.length > MAX_BATCH)
        return res.status(400).json({ error: `Batch excede o limite de ${MAX_BATCH} eventos.` });

    const VALID_EVENT_TYPES = new Set(['keydown', 'keyup']);
    const outOfWindow = events.some(
        e => !Number.isFinite(e.timestamp_rel_ms) || e.timestamp_rel_ms < 0 || e.timestamp_rel_ms > MAX_EVENT_TS_MS
            || !VALID_EVENT_TYPES.has(e.event_type)
            || typeof e.key_code !== 'string' || e.key_code.length === 0 || e.key_code.length > 64
    );
    if (outOfWindow)
        return res.status(400).json({ error: 'Evento com timestamp fora da janela permitida.' });

    try {
        const participant_id = hashParticipantId(participant_code);
        const db = await connectToDatabase();

        if (!await validateSessionToken(db, session_id, session_token))
            return res.status(401).json({ error: 'Token de sessão inválido.' });

        // Verify session belongs to the requesting participant — prevents cross-session event injection.
        const session = await db.collection('sessions').findOne(
            { session_id },
            { projection: { participant_id: 1 } }
        );
        if (!session || session.participant_id !== participant_id)
            return res.status(403).json({ error: 'Sessão não pertence a este participante.' });

        const docs = events.map(e => ({
            session_id,
            participant_id,
            // keydown → IKI pipeline (fase 1: inter-keystroke intervals)
            // keyup   → dwell time / flight time pipeline (fase 2: not yet implemented)
            event_type: e.event_type,
            key_code: e.key_code,
            timestamp_rel_ms: e.timestamp_rel_ms,
            timestamp_abs_ms: e.timestamp_abs_ms,
            event_repeat: Boolean(e.event_repeat),
            created_at: new Date(),
        }));

        await db.collection('events').insertMany(docs);
        res.json({ received: events.length });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to store events' });
    }
}
