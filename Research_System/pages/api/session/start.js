import { connectToDatabase } from '@xcorphion/shared';
import { randomUUID } from 'crypto';
import { hashParticipantId, hashFingerprint, extractIp } from '../../../lib/participant';
import { generateSessionToken } from '../../../lib/sessionAuth';
import { rateLimit } from '../../../lib/rateLimit';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    if (rateLimit(req, { max: 10, windowMs: 10 * 60_000 }))
        return res.status(429).json({ error: 'Muitas requisições. Aguarde antes de tentar novamente.' });
    const { participant_code, prompt_id, jitter_benchmark_ms, device_profile } = req.body;
    const participant_id = hashParticipantId(participant_code);
    const sessionId = randomUUID();
    const sessionStartEpochMs = Date.now();
    const ip = extractIp(req);

    // #14 — Standardized prompt anchored on emotional decision-making
    const promptText = "Descreva uma decisão difícil que você tomou recentemente — o que você sentiu enquanto decidia, não apenas o que decidiu.";

    try {
        const db = await connectToDatabase();

        // For sessions 2+, verify device fingerprint and IP continuity
        const mismatchUpdate = {};
        if (prompt_id > 1 && device_profile) {
            const participant = await db.collection('participants').findOne({ participant_id });
            if (participant) {
                const incomingHash = hashFingerprint(device_profile);
                if (participant.device_fingerprint_hash && incomingHash !== participant.device_fingerprint_hash) {
                    mismatchUpdate[`session_${prompt_id}_device_mismatch`] = true;
                    console.warn(`[SessionStart] Device fingerprint mismatch for ${participant_id}, session ${prompt_id}`);
                }
                const knownIp = participant.fingerprint?.ip;
                if (knownIp && knownIp !== 'unknown' && ip !== 'unknown' && ip !== knownIp) {
                    mismatchUpdate[`session_${prompt_id}_ip_mismatch`] = true;
                    console.warn(`[SessionStart] IP mismatch for ${participant_id}: was ${knownIp}, now ${ip}`);
                }
                if (Object.keys(mismatchUpdate).length > 0) {
                    await db.collection('participants').updateOne(
                        { participant_id },
                        { $set: mismatchUpdate }
                    );
                }
            }
        }

        const { token, hash: token_hash } = generateSessionToken();

        await db.collection('sessions').insertOne({
            session_id: sessionId,
            participant_id,
            prompt_id,
            session_start_epoch_ms: sessionStartEpochMs,
            jitter_benchmark_ms: jitter_benchmark_ms !== undefined ? Number(jitter_benchmark_ms) : null,
            token_hash,   // SHA-256 do token — plaintext nunca persiste
            status: 'started',
            created_at: new Date()
        });

        res.json({ session_id: sessionId, session_start_epoch_ms: sessionStartEpochMs, prompt_text: promptText, session_token: token });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to start session' });
    }
}
