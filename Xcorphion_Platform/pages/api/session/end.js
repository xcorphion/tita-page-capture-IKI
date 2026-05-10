import { connectToDatabase } from '../../../lib/mongodb';
import { hashParticipantId } from '../../../lib/participant';
import { validateSessionToken } from '../../../lib/sessionAuth';
import { SESSION_STATUS, SESSION_DOC_STATUS, PARTICIPANT_STATUS } from '../../../lib/schema';

const MAX_TEXT = 20_000;

const EXCLUDED_KEYS = [
    'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight',
    'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Home', 'End', 'PageUp', 'PageDown',
    'CapsLock', 'Tab', 'Escape', 'ContextMenu', 'ScrollLock', 'Pause',
    'Insert', 'Delete', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    'NumLock', 'AudioVolumeUp', 'AudioVolumeDown', 'AudioVolumeMute', 'MediaTrackNext', 'MediaTrackPrevious', 'MediaPlayPause'
];

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { session_id, participant_code, session_token, engagement_rating, engagement_genuine, text_final } = req.body;
    if (typeof text_final === 'string' && text_final.length > MAX_TEXT)
        return res.status(400).json({ error: 'Texto excede o tamanho máximo permitido.' });
    const rating = Number(engagement_rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
        return res.status(400).json({ error: 'engagement_rating deve ser um inteiro entre 1 e 5.' });
    if (typeof engagement_genuine !== 'boolean')
        return res.status(400).json({ error: 'engagement_genuine inválido.' });

    try {
        const participant_id = hashParticipantId(participant_code);
        const db = await connectToDatabase();
        if (!await validateSessionToken(db, session_id, session_token))
            return res.status(401).json({ error: 'Token de sessão inválido.' });

        const allEvents = await db.collection('events')
            .find({ session_id, event_type: 'keydown' })
            .sort({ timestamp_rel_ms: 1 })
            .toArray();

        const events = allEvents.filter(e => !EXCLUDED_KEYS.includes(e.key_code));

        let iki_log_mean = 0;
        let iki_log_std = 0;

        if (events.length > 1) {
            const ikis = [];
            for (let i = 1; i < events.length; i++) {
                const iki = events[i].timestamp_rel_ms - events[i - 1].timestamp_rel_ms;
                if (iki > 0) ikis.push(Math.log1p(iki));
            }
            if (ikis.length > 0) {
                iki_log_mean = ikis.reduce((a, b) => a + b, 0) / ikis.length;
                const variance = ikis.reduce((a, b) => a + Math.pow(b - iki_log_mean, 2), 0) / ikis.length;
                iki_log_std = Math.sqrt(variance);
            }
        }

        await db.collection('sessions').updateOne(
            { session_id },
            {
                $set: {
                    engagement_rating: Number(engagement_rating),
                    engagement_genuine: Boolean(engagement_genuine),
                    text_final,
                    status: SESSION_DOC_STATUS.COMPLETED,
                    completed_at: new Date(),
                    normalizer_params: { iki_log_mean, iki_log_std }
                }
            }
        );

        const participant = await db.collection('participants').findOne({ participant_id });
        if (!participant) return res.status(404).json({ error: 'Participante não encontrado.' });
        const sessionsBeforeEnd = participant.sessions_completed || 0;
        const currentSession = sessionsBeforeEnd + 1;

        const participantUpdate = {
            $inc: { sessions_completed: 1 },
            $set: {}
        };

        const isEngaged = Boolean(engagement_genuine);

        if (currentSession === 1) {
            participantUpdate.$set.session_1_engagement = isEngaged;
            participantUpdate.$set.session_1_status = SESSION_STATUS.CONCLUIDA;
            if (!isEngaged) {
                participantUpdate.$set.status = PARTICIPANT_STATUS.INATIVO;
                participantUpdate.$set.session_2_status = SESSION_STATUS.BLOQUEADA;
                participantUpdate.$set.session_3_status = SESSION_STATUS.BLOQUEADA;
            }
        } else if (currentSession === 2) {
            participantUpdate.$set.session_2_engagement = isEngaged;
            participantUpdate.$set.session_2_status = SESSION_STATUS.CONCLUIDA;
            if (!isEngaged) {
                participantUpdate.$set.status = PARTICIPANT_STATUS.INATIVO;
                participantUpdate.$set.session_3_status = SESSION_STATUS.BLOQUEADA;
            }
        } else if (currentSession === 3) {
            participantUpdate.$set.session_3_engagement = isEngaged;
            participantUpdate.$set.session_3_status = SESSION_STATUS.CONCLUIDA;
        }

        await db.collection('participants').updateOne({ participant_id }, participantUpdate);

        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to end session' });
    }
}
