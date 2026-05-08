import { connectToDatabase } from '@xcorphion/shared';
import geoip from 'geoip-lite';

export default async function handler(req, res) {
    const password = (req.headers['x-admin-password'] || req.headers.authorization || req.body?.password || '').trim();
    const envPassword = (process.env.ADMIN_PASSWORD || '').trim();

    if (!envPassword) {
        return res.status(500).json({ error: 'Erro de Configuração: A variável ADMIN_PASSWORD não está definida.' });
    }
    if (password !== envPassword) {
        return res.status(401).json({ error: 'Senha incorreta' });
    }

    const db = await connectToDatabase();
    const participants = db.collection('participants');

    if (req.method === 'GET') {
        try {
            const list = await participants.find({}).sort({ created_at: -1 }).toArray();
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
                    { $set: { admin_authorized_s2: true, session_2_status: 'LIBERADA' } }
                );
            } else if (action === 'authorize_s3') {
                await participants.updateOne(
                    { participant_id: participant_code },
                    { $set: { admin_authorized_s3: true, session_3_status: 'LIBERADA' } }
                );
            } else if (action === 'deactivate') {
                // Fetch participant to get known IPs before cleanup
                const participant = await participants.findOne({ participant_id: participant_code });
                if (!participant) {
                    return res.status(404).json({ error: 'Participante não encontrado' });
                }

                const knownIps = participant.known_ips || [];
                // Also include the fingerprint IP from session 1 if present
                if (participant.fingerprint?.ip && !knownIps.includes(participant.fingerprint.ip)) {
                    knownIps.push(participant.fingerprint.ip);
                }

                // Delete all data linked to this participant
                const [eventsResult, emasResult, sessionsResult] = await Promise.all([
                    db.collection('events').deleteMany({ participant_id: participant_code }),
                    db.collection('emas').deleteMany({ participant_id: participant_code }),
                    db.collection('sessions').deleteMany({ participant_id: participant_code }),
                ]);

                console.log(`[Deactivate] Deleted: ${eventsResult.deletedCount} events, ${emasResult.deletedCount} emas, ${sessionsResult.deletedCount} sessions`);

                // Update participant status — keep identifying info, remove data fields
                await participants.updateOne(
                    { participant_id: participant_code },
                    {
                        $set: {
                            status: 'BLOQUEADO',
                            blocked_at: new Date(),
                            cleanup_complete: true,
                            session_2_status: 'BLOQUEADA',
                            session_3_status: 'BLOQUEADA',
                            admin_deactivated: true,
                        },
                        $unset: {
                            wpm_baseline: '',
                            device_profile: '',
                            device_fingerprint_hash: '',
                            onboarding_complete: '',
                            sessions_completed: '',
                        }
                    }
                );

                // Add all known IPs to blocklist with geolocation
                if (knownIps.length > 0) {
                    const ipBlocklist = db.collection('ip_blocklist');
                    const blockedAt = new Date();
                    const ipDocs = knownIps
                        .filter(ip => ip && ip !== 'unknown')
                        .map(ip => ({
                            ip,
                            blocked_at: blockedAt,
                            source_participant_id: participant_code,
                            geo: geoip.lookup(ip) || null,
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
                        console.log(`[Deactivate] Blocked ${ipDocs.length} IPs in ip_blocklist`);
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
