import { connectToDatabase } from '../../lib/mongodb';
import { hashParticipantId } from '../../lib/participant';
import { validateSessionToken } from '../../lib/sessionAuth';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const session_id = body.session_id;
    const participant_code = body.participant_code;
    const session_token = body.session_token;
    if (typeof session_id !== 'string' || typeof participant_code !== 'string' || typeof session_token !== 'string')
        return res.status(400).json({ error: 'Parâmetros inválidos.' });
    if (!/^[A-Z0-9]{1,20}$/.test(participant_code))
        return res.status(400).json({ error: 'participant_code inválido.' });

    const v = Number(body.valence);
    const a = Number(body.arousal);
    const pi = Number(body.prompt_index);
    const cc = Number(body.character_count);
    const ts = Number(body.timestamp_rel_ms);
    if (!Number.isFinite(v) || v < 0 || v > 100 || !Number.isFinite(a) || a < 0 || a > 100)
        return res.status(400).json({ error: 'Valência e arousal devem ser inteiros entre 0 e 100.' });
    if (!Number.isInteger(pi) || pi < 0 || pi > 9)
        return res.status(400).json({ error: 'prompt_index inválido.' });
    if (!Number.isFinite(cc) || cc < 0 || cc > 20_000)
        return res.status(400).json({ error: 'character_count inválido.' });
    if (!Number.isFinite(ts) || ts < 0 || ts > 3_600_000)
        return res.status(400).json({ error: 'timestamp_rel_ms inválido.' });

    const participant_id = hashParticipantId(participant_code);

    try {
        const db = await connectToDatabase();
        if (!await validateSessionToken(db, session_id, session_token))
            return res.status(401).json({ error: 'Token de sessão inválido.' });
        await db.collection('emas').insertOne({
            session_id,
            participant_id,
            prompt_index: pi,
            character_count: cc,
            valence: v,
            arousal: a,
            timestamp_rel_ms: ts,
            created_at: new Date()
        });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to store EMA' });
    }
}
