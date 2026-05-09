import { connectToDatabase } from '../../../lib/mongodb';
import { hashParticipantId, hashFingerprint, extractIp } from '../../../lib/participant';
import { rateLimit } from '../../../lib/rateLimit';
import geoip from 'geoip-lite';

const CODE_RE = /^[A-Z0-9]{1,20}$/;

export default async function handler(req, res) {
    if (rateLimit(req, { max: 20, windowMs: 60_000 }))
        return res.status(429).json({ error: 'Muitas requisições. Aguarde um momento.' });

    const raw = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : '';
    if (!CODE_RE.test(raw))
        return res.status(400).json({ error: 'Código inválido.' });
    const code = raw;

    const db = await connectToDatabase();
    const participants = db.collection('participants');
    const participant_id = hashParticipantId(code);
    const ip = extractIp(req);

    if (req.method === 'POST') {
        const { wpm_baseline, device_profile } = req.body;
        try {
            const existing = await participants.findOne({ participant_id });
            if (existing?.onboarding_complete)
                return res.status(409).json({ error: 'Onboarding já concluído.' });

            const fingerprint_hash = hashFingerprint(device_profile);
            const geo = (ip && ip !== 'unknown') ? (geoip.lookup(ip) || null) : null;

            await participants.updateOne(
                { participant_id },
                {
                    $set: {
                        wpm_baseline,
                        device_profile,
                        device_fingerprint_hash: fingerprint_hash,
                        onboarding_complete: true,
                        'fingerprint.user_agent': device_profile?.userAgent || '',
                        'fingerprint.captured_at': new Date(),
                        'fingerprint.ip': ip,
                        'fingerprint.geo': geo,
                    },
                    $addToSet: { known_ips: ip },
                }
            );
            return res.json({ ok: true });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Failed to update onboarding' });
        }
    }

    if (req.method !== 'GET') return res.status(405).end();

    try {
        if (ip && ip !== 'unknown') {
            await participants.updateOne({ participant_id }, { $addToSet: { known_ips: ip } });
        }

        let doc = await participants.findOne({ participant_code: code });
        if (!doc) {
            return res.status(404).json({ error: 'Convite não encontrado.' });
        }

        if (doc.status === 'BLOQUEADO') {
            return res.status(403).json({ error: 'BLOQUEADO' });
        }

        if (ip && ip !== 'unknown') {
            const blocked = await db.collection('ip_blocklist').findOne({ ip });
            if (blocked) {
                if (blocked.source_participant_id !== participant_id) {
                    await participants.updateOne(
                        { participant_id },
                        { $addToSet: { suspicious_ip_attempts: ip } }
                    );
                }
                return res.status(403).json({ error: 'IP_BLOQUEADO' });
            }
        }

        const sessionsCompleted = doc.sessions_completed || 0;
        const isLocked = (sessionsCompleted === 1 && !doc.admin_authorized_s2) ||
                         (sessionsCompleted === 2 && !doc.admin_authorized_s3);

        res.json({
            participant_id,
            sessions_completed: sessionsCompleted,
            next_prompt_id: sessionsCompleted + 1,
            onboarding_complete: doc.onboarding_complete,
            locked: isLocked,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
