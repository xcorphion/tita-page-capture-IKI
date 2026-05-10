import { connectToDatabase } from '../../../lib/mongodb';
import { checkAdminAuth } from '../../../lib/adminAuth';
import { SESSION_STATUS, SESSION_DOC_STATUS, PARTICIPANT_STATUS } from '../../../lib/schema';

function geoLookup(ip) {
    try { return require('geoip-lite').lookup(ip) || null; } catch (_) { return null; }
}

export default async function handler(req, res) {
    if (!checkAdminAuth(req, res)) return;

    const db = await connectToDatabase();
    const participants = db.collection('participants');

    if (req.method === 'GET') {
        try {
            const list = await participants.find({})
                .project({ device_profile: 0, contact_email: 0 })
                .sort({ created_at: -1 }).toArray();
            return res.json({ participants: list });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Database error' });
        }
    }

    if (req.method === 'POST') {
        const { action, participant_code } = req.body;

        try {
            if (action === 'authorize_s2') {
                await participants.updateOne(
                    { participant_id: participant_code },
                    { $set: { admin_authorized_s2: true, session_2_status: SESSION_STATUS.LIBERADA } }
                );
            } else if (action === 'authorize_s3') {
                await participants.updateOne(
                    { participant_id: participant_code },
                    { $set: { admin_authorized_s3: true, session_3_status: SESSION_STATUS.LIBERADA } }
                );
            } else if (action === 'reactivate') {
                const participant = await participants.findOne({ participant_id: participant_code });
                if (!participant) {
                    return res.status(404).json({ error: 'Participante não encontrado' });
                }

                // Restore sessions_completed from CONCLUIDA statuses — deactivate unsets this field.
                const sessionsCompleted =
                    (participant.session_1_status === SESSION_STATUS.CONCLUIDA ? 1 : 0) +
                    (participant.session_2_status === SESSION_STATUS.CONCLUIDA ? 1 : 0) +
                    (participant.session_3_status === SESSION_STATUS.CONCLUIDA ? 1 : 0);

                const setFields = {
                    status: PARTICIPANT_STATUS.ATIVO,
                    reactivated_at: new Date(),
                    sessions_completed: sessionsCompleted,
                };
                if (participant.session_2_status === SESSION_STATUS.BLOQUEADA) setFields.session_2_status = SESSION_STATUS.AGUARDANDO;
                if (participant.session_3_status === SESSION_STATUS.BLOQUEADA) setFields.session_3_status = SESSION_STATUS.AGUARDANDO;

                await participants.updateOne(
                    { participant_id: participant_code },
                    {
                        $set: setFields,
                        $unset: { blocked_at: '', admin_deactivated: '', cleanup_complete: '' },
                    }
                );

                // Remove IPs do blocklist que vieram apenas deste participante
                if (participant.known_ips?.length > 0) {
                    await db.collection('ip_blocklist').deleteMany({
                        ip: { $in: participant.known_ips },
                        source_participant_id: participant_code,
                    });
                }
            } else if (action === 'deactivate') {
                const participant = await participants.findOne({ participant_id: participant_code });
                if (!participant) {
                    return res.status(404).json({ error: 'Participante não encontrado' });
                }

                const knownIps = participant.known_ips || [];
                if (participant.fingerprint?.ip && !knownIps.includes(participant.fingerprint.ip)) {
                    knownIps.push(participant.fingerprint.ip);
                }

                // Step 1: mark in-progress — if the process dies here, a retry skips re-deletion.
                await participants.updateOne(
                    { participant_id: participant_code },
                    { $set: { cleanup_in_progress: true } }
                );

                // Step 2: delete subcollections (deleteMany is idempotent on retry).
                await Promise.all([
                    db.collection('events').deleteMany({ participant_id: participant_code }),
                    db.collection('emas').deleteMany({ participant_id: participant_code }),
                    db.collection('sessions').deleteMany({ participant_id: participant_code }),
                ]);

                // Step 3: finalize — clear flag and set terminal state.
                await participants.updateOne(
                    { participant_id: participant_code },
                    {
                        $set: {
                            status: PARTICIPANT_STATUS.BLOQUEADO,
                            blocked_at: new Date(),
                            cleanup_complete: true,
                            session_2_status: SESSION_STATUS.BLOQUEADA,
                            session_3_status: SESSION_STATUS.BLOQUEADA,
                            admin_deactivated: true,
                        },
                        $unset: {
                            wpm_baseline: '',
                            device_profile: '',
                            device_fingerprint_hash: '',
                            onboarding_complete: '',
                            sessions_completed: '',
                            cleanup_in_progress: '',
                        }
                    }
                );

                if (knownIps.length > 0) {
                    const ipBlocklist = db.collection('ip_blocklist');
                    const blockedAt = new Date();
                    const ipDocs = knownIps
                        .filter(ip => ip && ip !== 'unknown')
                        .map(ip => ({
                            ip,
                            blocked_at: blockedAt,
                            source_participant_id: participant_code,
                            geo: geoLookup(ip),
                        }));

                    if (ipDocs.length > 0) {
                        await ipBlocklist.bulkWrite(
                            ipDocs.map(doc => ({
                                updateOne: {
                                    filter: { ip: doc.ip },
                                    update: { $setOnInsert: doc },
                                    upsert: true,
                                }
                            }))
                        );
                    }
                }
            }

            return res.json({ ok: true });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Action failed' });
        }
    }

    res.status(405).end();
}
