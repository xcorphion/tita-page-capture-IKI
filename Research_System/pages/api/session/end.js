import { connectToDatabase } from '@xcorphion/shared';
import { hashParticipantId } from '../../../lib/participant';
import { validateSessionToken } from '../../../lib/sessionAuth';

const MAX_TEXT = 20_000;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { session_id, participant_code, session_token, engagement_rating, engagement_genuine, text_final } = req.body;
    if (typeof text_final === 'string' && text_final.length > MAX_TEXT)
        return res.status(400).json({ error: 'Texto excede o tamanho máximo permitido.' });
    const rating = Number(engagement_rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
        return res.status(400).json({ error: 'engagement_rating deve ser um inteiro entre 1 e 5.' });
    const participant_id = hashParticipantId(participant_code);

    try {
        const sid = session_id?.slice(0, 8);
        console.log(`[SessionEnd] Iniciando fim de sessão para ${sid}…`);
        const db = await connectToDatabase();
        if (!await validateSessionToken(db, session_id, session_token))
            return res.status(401).json({ error: 'Token de sessão inválido.' });

        // #19 — normalizer_params gravado por sessão (iki_log_mean, iki_log_std)
        const allEvents = await db.collection('events')
            .find({ session_id, event_type: 'keydown' })
            .sort({ timestamp_rel_ms: 1 })
            .toArray();

        // FILTRO DE PRÉ-PROCESSAMENTO: Excluir teclas não-textuais para o cálculo de IKI
        const EXCLUDED_KEYS = [
            'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight',
            'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight',
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Home', 'End', 'PageUp', 'PageDown',
            'CapsLock', 'Tab', 'Escape', 'ContextMenu', 'ScrollLock', 'Pause',
            'Insert', 'Delete', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
            'NumLock', 'AudioVolumeUp', 'AudioVolumeDown', 'AudioVolumeMute', 'MediaTrackNext', 'MediaTrackPrevious', 'MediaPlayPause'
        ];

        const events = allEvents.filter(e => !EXCLUDED_KEYS.includes(e.key_code));

        let iki_log_mean = 0;
        let iki_log_std = 0;

        if (events.length > 1) {
            const ikis = [];
            for (let i = 1; i < events.length; i++) {
                const iki = events[i].timestamp_rel_ms - events[i - 1].timestamp_rel_ms;
                // #19 — Only positive IKIs contribute to the log distribution
                if (iki > 0) {
                    ikis.push(Math.log1p(iki));
                }
            }
            if (ikis.length > 0) {
                iki_log_mean = ikis.reduce((a, b) => a + b, 0) / ikis.length;
                const variance = ikis.reduce((a, b) => a + Math.pow(b - iki_log_mean, 2), 0) / ikis.length;
                iki_log_std = Math.sqrt(variance);
            }
        }

        const sessionUpdate = await db.collection('sessions').updateOne(
            { session_id },
            {
                $set: {
                    engagement_rating: Number(engagement_rating),  // #2 — coerce to int
                    engagement_genuine: Boolean(engagement_genuine), // #15 — explicit boolean
                    text_final,
                    status: 'completed',
                    completed_at: new Date(),
                    normalizer_params: { iki_log_mean, iki_log_std } // #19 — required for calibration
                }
            }
        );

        console.log(`[SessionEnd] Update sessions sid=${sid}: matched=${sessionUpdate.matchedCount}, modified=${sessionUpdate.modifiedCount}`);

        // Retrieve current sessions count before increment to decide if this is session 1's end
        const participant = await db.collection('participants').findOne({ participant_id });
        if (!participant) {
            console.error(`[SessionEnd] Participante não encontrado (pid=${participant_id?.slice(0, 8)}…)`);
            // Se não encontrar pelo hash, tenta buscar pelo código plano se disponível
            // Mas o ideal é que o hash funcione.
        }
        
        const sessionsBeforeEnd = participant?.sessions_completed || 0;
        const currentSession = sessionsBeforeEnd + 1; // 1, 2, or 3
        console.log(`[SessionEnd] pid=${participant_id?.slice(0, 8)}… sessões antes=${sessionsBeforeEnd} atual=${currentSession}`);

        const participantUpdate = { 
            $inc: { sessions_completed: 1 },
            $set: {}
        };
        
        const isEngaged = Boolean(engagement_genuine);
        
        // Ativar engajamento e status de sessões
        if (currentSession === 1) {
            participantUpdate.$set.session_1_engagement = isEngaged;
            participantUpdate.$set.session_1_status = 'CONCLUIDA';
            if (!isEngaged) {
                participantUpdate.$set.status = 'INATIVO';
                participantUpdate.$set.session_2_status = 'BLOQUEADA';
                participantUpdate.$set.session_3_status = 'BLOQUEADA';
            }
        } else if (currentSession === 2) {
            participantUpdate.$set.session_2_engagement = isEngaged;
            participantUpdate.$set.session_2_status = 'CONCLUIDA';
            if (!isEngaged) {
                participantUpdate.$set.status = 'INATIVO';
                participantUpdate.$set.session_3_status = 'BLOQUEADA';
            }
        } else if (currentSession === 3) {
            participantUpdate.$set.session_3_engagement = isEngaged;
            participantUpdate.$set.session_3_status = 'CONCLUIDA';
        }

        const partUpdateResult = await db.collection('participants').updateOne(
            { participant_id },
            participantUpdate
        );

        console.log(`[SessionEnd] Update participants: matched=${partUpdateResult.matchedCount}, modified=${partUpdateResult.modifiedCount}`);

        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to end session' });
    }
}
