import { connectToDatabase } from '@xcorphion/shared';
import { hashParticipantId } from '../../lib/participant';
import { validateSessionToken } from '../../lib/sessionAuth';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { session_id, participant_code, session_token, character_count, valence, arousal, timestamp_rel_ms, prompt_index } = req.body;
    const participant_id = hashParticipantId(participant_code);
    const v = Number(valence);
    const a = Number(arousal);
    const pi = Number(prompt_index);
    const cc = Number(character_count);
    const ts = Number(timestamp_rel_ms);
    if (!Number.isFinite(v) || v < 0 || v > 100 || !Number.isFinite(a) || a < 0 || a > 100)
        return res.status(400).json({ error: 'Valência e arousal devem ser inteiros entre 0 e 100.' });
    if (!Number.isInteger(pi) || pi < 0 || pi > 50)
        return res.status(400).json({ error: 'prompt_index inválido.' });
    if (!Number.isFinite(cc) || cc < 0 || cc > 20_000)
        return res.status(400).json({ error: 'character_count inválido.' });
    if (!Number.isFinite(ts) || ts < 0 || ts > 3_600_000)
        return res.status(400).json({ error: 'timestamp_rel_ms inválido.' });

    try {
        const db = await connectToDatabase();
        if (!await validateSessionToken(db, session_id, session_token))
            return res.status(401).json({ error: 'Token de sessão inválido.' });
        await db.collection('emas').insertOne({
            session_id,
            participant_id,
            prompt_index: Number(prompt_index), // #4.3 — required field
            character_count: Number(character_count),
            valence: Number(valence),
            arousal: Number(arousal),
            timestamp_rel_ms: Number(timestamp_rel_ms),   // #12 — from browser, not Date.now()
            created_at: new Date()
        });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to store EMA' });
    }
}
