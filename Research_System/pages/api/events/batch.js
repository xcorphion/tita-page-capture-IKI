import { connectToDatabase } from '@xcorphion/shared';
const { hashParticipantId } = require('../../../lib/participant');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { session_id, participant_code, events } = req.body;
    const participant_id = hashParticipantId(participant_code);
    if (!events || events.length === 0) return res.json({ received: 0 });
    try {
        const db = await connectToDatabase();
        const eventsCol = db.collection('events');

        // #11 — schema includes timestamp_abs_ms and event_repeat
        const docs = events.map(e => ({
            session_id,
            participant_id,
            event_type: e.event_type,
            key_code: e.key_code,             // #8  — event.code (layout-independent)
            timestamp_rel_ms: e.timestamp_rel_ms, // #12 — pre-calculated on browser
            timestamp_abs_ms: e.timestamp_abs_ms, // #11 — absolute epoch ms
            event_repeat: Boolean(e.event_repeat), // #9  — held-key marker
            created_at: new Date()
        }));

        await eventsCol.insertMany(docs);

        // #13 — Ensure compound index exists (idempotent — no-op after first creation)
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
