import { connectToDatabase } from '../../../lib/mongodb';
import crypto from 'crypto';
import { rateLimit } from '../../../lib/rateLimit';
import { checkAdminAuth } from '../../../lib/adminAuth';
import { SESSION_STATUS } from '../../../lib/schema';

export default async function handler(req, res) {
    if (await rateLimit(req, { max: 10, windowMs: 5 * 60_000, bucket: 'unlock' }))
        return res.status(429).json({ error: 'Muitas tentativas. Aguarde.' });

    const code = typeof req.query.code === 'string' ? req.query.code : '';
    if (!/^[a-f0-9]{64}$/.test(code))
        return res.status(400).json({ error: 'participant_id inválido.' });

    if (req.method === 'GET') {
        if (!(await checkAdminAuth(req, res))) return;
        try {
            const db = await connectToDatabase();
            const doc = await db.collection('participants').findOne({ participant_id: code });
            if (!doc) return res.status(404).json({ error: 'Participante não encontrado.' });
            return res.json({
                participant_id: code,
                sessions_completed:   doc.sessions_completed || 0,
                admin_authorized_s2:  !!doc.admin_authorized_s2,
                admin_authorized_s3:  !!doc.admin_authorized_s3,
                session_1_status:     doc.session_1_status,
                session_2_status:     doc.session_2_status,
                session_3_status:     doc.session_3_status,
                fingerprint:          doc.fingerprint || null,
            });
        } catch {
            return res.status(500).json({ error: 'DB error' });
        }
    }

    if (req.method === 'POST') {
        // Programmatic session unlock — alternative to admin panel authorize_s2/s3 actions.
        // Requires UNLOCK_SECRET env var for authentication.
        const { secret, session_number } = req.body || {};
        const expected = process.env.UNLOCK_SECRET || '';
        if (!expected) return res.status(500).json({ error: 'UNLOCK_SECRET não configurado.' });

        const provided = typeof secret === 'string' ? secret : '';
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
            return res.status(403).json({ error: 'Forbidden' });

        const sn = Number(session_number);
        if (sn !== 2 && sn !== 3)
            return res.status(400).json({ error: 'session_number deve ser 2 ou 3.' });

        const authField   = `admin_authorized_s${sn}`;
        const statusField = `session_${sn}_status`;

        try {
            const db = await connectToDatabase();
            const result = await db.collection('participants').updateOne(
                { participant_id: code },
                { $set: { [authField]: true, [statusField]: SESSION_STATUS.LIBERADA, unlocked_at: new Date() } }
            );
            if (result.matchedCount === 0)
                return res.status(404).json({ error: 'Participante não encontrado.' });
            return res.json({ ok: true, participant_id: code, [authField]: true });
        } catch {
            return res.status(500).json({ error: 'DB error' });
        }
    }

    return res.status(405).end();
}
