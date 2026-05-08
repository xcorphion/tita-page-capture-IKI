import { connectToDatabase } from '@xcorphion/shared';
import crypto from 'crypto';
import { rateLimit } from '../../../lib/rateLimit';
import { checkAdminAuth } from '../../../lib/adminAuth';

export default async function handler(req, res) {
    if (rateLimit(req, { max: 10, windowMs: 5 * 60_000 }))
        return res.status(429).json({ error: 'Muitas tentativas. Aguarde.' });

    const { code } = req.query;

    if (req.method === 'GET') {
        if (!checkAdminAuth(req, res)) return;
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
        const expected = process.env.UNLOCK_SECRET || '';
        if (!expected) return res.status(500).json({ error: 'UNLOCK_SECRET não configurado.' });
        const provided = typeof secret === 'string' ? secret : '';
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
        if (!valid) return res.status(403).json({ error: 'Forbidden' });
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
