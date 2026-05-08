import { connectToDatabase } from '@xcorphion/shared';
import { hashParticipantId } from '../../../lib/participant';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    // #2  — engagement_rating is integer 1–5, not boolean
    // #15 — engagement_genuine is boolean (separate binary question)
    const { session_id, participant_code, engagement_rating, engagement_genuine, text_final } = req.body;
    const participant_id = hashParticipantId(participant_code);

    try {
        console.log(`[SessionEnd] Iniciando fim de sessão para ${session_id}`);
        const db = await connectToDatabase();

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

        console.log(`[SessionEnd] Update sessions: matched=${sessionUpdate.matchedCount}, modified=${sessionUpdate.modifiedCount}`);

        // Retrieve current sessions count before increment to decide if this is session 1's end
        const participant = await db.collection('participants').findOne({ participant_id });
        if (!participant) {
            console.error(`[SessionEnd] Participante ${participant_id} não encontrado!`);
            // Se não encontrar pelo hash, tenta buscar pelo código plano se disponível
            // Mas o ideal é que o hash funcione.
        }
        
        const sessionsBeforeEnd = participant?.sessions_completed || 0;
        const currentSession = sessionsBeforeEnd + 1; // 1, 2, or 3
        console.log(`[SessionEnd] Participante: ${participant_id}, Sessões antes: ${sessionsBeforeEnd}, Sessão atual: ${currentSession}`);

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
