import { connectToDatabase } from '../../../lib/mongodb';
import { hashParticipantId, hashFingerprint, extractIp } from '../../../lib/participant';
import { rateLimit } from '../../../lib/rateLimit';
import { PARTICIPANT_STATUS } from '../../../lib/schema';

function geoLookup(ip) {
    try { return require('geoip-lite').lookup(ip) || null; } catch (_) { return null; }
}

// Whitelist device_profile fields — prevents arbitrary payloads reaching the DB.
function sanitizeDeviceProfile(p) {
    if (!p || typeof p !== 'object') return null;
    const num = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
    const kb = p.has_physical_keyboard;
    return {
        userAgent: typeof p.userAgent === 'string' ? p.userAgent.slice(0, 512) : '',
        platform:  typeof p.platform  === 'string' ? p.platform.slice(0, 64)   : '',
        language:  typeof p.language  === 'string' ? p.language.slice(0, 16)   : '',
        timezone:  typeof p.timezone  === 'string' ? p.timezone.slice(0, 64)   : '',
        screen: { w: num(p.screen?.w), h: num(p.screen?.h), depth: num(p.screen?.depth), dpr: num(p.screen?.dpr) },
        hw:     { cores: num(p.hw?.cores), mem: num(p.hw?.mem) },
        has_physical_keyboard: kb === true ? true : (kb === false ? false : null),
    };
}

const CODE_RE = /^[A-Z0-9]{1,20}$/;

export default async function handler(req, res) {
    if (await rateLimit(req, { max: 20, windowMs: 60_000, bucket: 'participant' }))
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
        const { wpm_baseline } = req.body;
        if (!Number.isFinite(Number(wpm_baseline)) || Number(wpm_baseline) < 0 || Number(wpm_baseline) > 300)
            return res.status(400).json({ error: 'wpm_baseline inválido.' });
        const device_profile = sanitizeDeviceProfile(req.body.device_profile);
        try {
            const existing = await participants.findOne({ participant_id });
            if (existing?.onboarding_complete)
                return res.status(409).json({ error: 'Onboarding já concluído.' });

            // Web users (source defined via register-participant) must declare a physical keyboard.
            const isWebUser = !!(existing?.source);
            if (isWebUser && device_profile?.has_physical_keyboard !== true)
                return res.status(400).json({ error: 'KEYBOARD_REQUIRED' });

            const fingerprint_hash = hashFingerprint(device_profile);
            const geo = (ip && ip !== 'unknown') ? geoLookup(ip) : null;
            const locality = geo
                ? { country: geo.country || null, region: geo.region || null, city: geo.city || null, ll: geo.ll || null }
                : null;

            await participants.updateOne(
                { participant_id },
                {
                    $set: {
                        wpm_baseline,
                        device_profile,
                        device_fingerprint_hash: fingerprint_hash,
                        onboarding_complete: true,
                        locality,
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
        const doc = await participants.findOne({ participant_code: code });
        if (!doc) return res.status(404).json({ error: 'Convite não encontrado.' });
        if (doc.status === PARTICIPANT_STATUS.BLOQUEADO) return res.status(403).json({ error: 'BLOQUEADO' });

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
            // Only write if IP is genuinely new — avoids a write on every read.
            if (!doc.known_ips?.includes(ip)) {
                await participants.updateOne({ participant_id }, { $addToSet: { known_ips: ip } });
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
            is_web_user: !!(doc.source),
            respondent_number: doc.respondent_number ?? null,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
