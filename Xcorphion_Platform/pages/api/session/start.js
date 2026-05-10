import { connectToDatabase } from '../../../lib/mongodb';
import { randomUUID } from 'crypto';
import { hashParticipantId, hashFingerprint, extractIp } from '../../../lib/participant';
import { generateSessionToken } from '../../../lib/sessionAuth';
import { rateLimit } from '../../../lib/rateLimit';
import { SESSION_STATUS, SESSION_DOC_STATUS, PARTICIPANT_STATUS } from '../../../lib/schema';

// One prompt per session. Index matches prompt_id (1-based; index 0 unused).
const PROMPTS = [
  null,
  "Descreva uma decisão difícil que você tomou recentemente — o que você sentiu enquanto decidia, não apenas o que decidiu.",
  "Escreva sobre um momento em que você teve que escolher entre o que era certo e o que era fácil.",
  "Descreva uma situação em que você precisou confiar em alguém. Como isso afetou suas ações e pensamentos?",
];

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    if (rateLimit(req, { max: 10, windowMs: 10 * 60_000 }))
        return res.status(429).json({ error: 'Muitas requisições. Aguarde antes de tentar novamente.' });

    const { participant_code, prompt_id, jitter_benchmark_ms, device_profile } = req.body;
    const pid = Number(prompt_id);

    if (!Number.isInteger(pid) || pid < 1 || pid > 3)
        return res.status(400).json({ error: 'prompt_id inválido.' });

    try {
        const participant_id = hashParticipantId(participant_code);
        const sessionStatusField = `session_${pid}_status`;
        const ip = extractIp(req);
        const db = await connectToDatabase();
        const participant = await db.collection('participants').findOne({ participant_id });

        if (!participant)
            return res.status(404).json({ error: 'Participante não encontrado.' });
        if (participant.status !== PARTICIPANT_STATUS.ATIVO)
            return res.status(403).json({ error: 'Participante inativo ou bloqueado.' });
        if (participant[sessionStatusField] === SESSION_STATUS.EM_ANDAMENTO) {
            // Session was started but not completed — re-issue token so the participant can resume.
            const existing = await db.collection('sessions').findOne(
                { participant_id, prompt_id: pid, status: SESSION_DOC_STATUS.STARTED },
                { projection: { session_id: 1, session_start_epoch_ms: 1 } }
            );
            if (existing) {
                const { token, hash: token_hash } = generateSessionToken();
                await db.collection('sessions').updateOne(
                    { session_id: existing.session_id },
                    { $set: { token_hash, resumed_at: new Date(), session_interrupted: true } }
                );
                return res.json({
                    session_id: existing.session_id,
                    session_start_epoch_ms: existing.session_start_epoch_ms,
                    prompt_text: PROMPTS[pid],
                    session_token: token,
                    resumed: true,
                    server_now_ms: Date.now(),
                });
            }
            // Orphaned EM_ANDAMENTO (no matching session doc) — reset to LIBERADA.
            await db.collection('participants').updateOne(
                { participant_id },
                { $set: { [sessionStatusField]: SESSION_STATUS.LIBERADA } }
            );
        } else if (participant[sessionStatusField] !== SESSION_STATUS.LIBERADA) {
            return res.status(403).json({ error: 'Sessão não autorizada.' });
        }

        // Device + IP mismatch detection for sessions 2 and 3
        if (pid > 1 && device_profile) {
            const mismatchUpdate = {};
            const incomingHash = hashFingerprint(device_profile);
            if (participant.device_fingerprint_hash && incomingHash !== participant.device_fingerprint_hash) {
                mismatchUpdate[`session_${pid}_device_mismatch`] = true;
            }
            const knownIp = participant.fingerprint?.ip;
            if (knownIp && knownIp !== 'unknown' && ip !== 'unknown' && ip !== knownIp) {
                mismatchUpdate[`session_${pid}_ip_mismatch`] = true;
            }
            if (Object.keys(mismatchUpdate).length > 0) {
                await db.collection('participants').updateOne({ participant_id }, { $set: mismatchUpdate });
            }
        }

        const sessionId = randomUUID();
        const sessionStartEpochMs = Date.now();
        const { token, hash: token_hash } = generateSessionToken();

        const jitterMs = Number.isFinite(Number(jitter_benchmark_ms)) ? Number(jitter_benchmark_ms) : null;

        await db.collection('sessions').insertOne({
            session_id: sessionId,
            participant_id,
            prompt_id: pid,
            session_start_epoch_ms: sessionStartEpochMs,
            jitter_benchmark_ms: jitterMs,
            token_hash,
            status: SESSION_DOC_STATUS.STARTED,
            created_at: new Date(),
        });

        await db.collection('participants').updateOne(
            { participant_id },
            { $set: { [sessionStatusField]: SESSION_STATUS.EM_ANDAMENTO } }
        );

        res.json({
            session_id: sessionId,
            session_start_epoch_ms: sessionStartEpochMs,
            prompt_text: PROMPTS[pid],
            session_token: token,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to start session' });
    }
}
