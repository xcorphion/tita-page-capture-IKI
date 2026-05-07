
import { connectToDatabase, getPearsonCorrelation, getCohensD, getTerciles } from '@xcorphion/shared';

export default async function handler(req, res) {
    const password = (req.headers['x-admin-password'] || req.headers.authorization || '').trim();
    const envPassword = (process.env.ADMIN_PASSWORD || '').trim();
    if (password !== envPassword) return res.status(401).json({ error: 'Senha incorreta' });

    if (req.method !== 'GET') return res.status(405).end();
    const { session_id } = req.query; // Se fornecido, foca no gráfico lognormal e timeline dessa sessão

    try {
        const db = await connectToDatabase();
        
        // 1. Carregar todas as sessões concluídas
        const sessions = await db.collection('sessions')
            .find({ status: 'completed' })
            .sort({ completed_at: 1 })
            .toArray();

        if (sessions.length === 0) return res.json({ error: 'Nenhuma sessão concluída encontrada.' });

        // 2. Carregar todas as EMAs
        const allEmas = await db.collection('emas').find({}).toArray();

        // 3. Cálculos Acumulados (Pearson e Cohen)
        const participantsProcessed = [];
        const cumulativePearson = [];
        const cumulativeCohensD = [];

        // Para cada sessão, vamos agregar dados para as métricas acumuladas
        // Nota: O ideal é agrupar por participante, mas aqui faremos por ordem de conclusão de sessão
        const analysisData = sessions.map(s => {
            const sessionEmas = allEmas.filter(e => e.session_id === s.session_id);
            if (sessionEmas.length === 0) return null;
            
            // Média de valência/arousal da sessão
            const avgValence = sessionEmas.reduce((a, b) => a + b.valence, 0) / sessionEmas.length;
            const avgArousal = sessionEmas.reduce((a, b) => a + b.arousal, 0) / sessionEmas.length;
            
            return {
                session_id: s.session_id,
                iki_mean: s.normalizer_params?.iki_log_mean || 0,
                iki_std: s.normalizer_params?.iki_log_std || 0,
                valence: avgValence,
                arousal: avgArousal,
                completed_at: s.completed_at
            };
        }).filter(d => d !== null);

        for (let i = 1; i <= analysisData.length; i++) {
            const subset = analysisData.slice(0, i);
            
            // Pearson: IKI Std vs Valence
            const rValence = getPearsonCorrelation(subset.map(d => d.iki_std), subset.map(d => d.valence));
            
            // Cohen's d: Comparando terços de valência
            const { superior, inferior } = getTerciles(subset, 'valence', 'iki_std');
            const dValence = getCohensD(superior, inferior);
            
            cumulativePearson.push({ n: i, r: rValence });
            cumulativeCohensD.push({ n: i, d: dValence });
        }

        // 4. Dados para Gráficos de Sessão Específica (ou última)
        const targetSessionId = session_id || sessions[sessions.length - 1].session_id;
        const targetSession = sessions.find(s => s.session_id === targetSessionId);
        const targetEmas = allEmas.filter(e => e.session_id === targetSessionId).sort((a,b) => a.character_count - b.character_count);
        
        // Buscar eventos apenas para a timeline da sessão alvo
        const targetEvents = await db.collection('events')
            .find({ session_id: targetSessionId, event_type: 'keydown' })
            .sort({ timestamp_rel_ms: 1 })
            .toArray();

        // Calcular IKIs brutos para Plot 2 e Plot 3
        const EXCLUDED_KEYS = ['ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'CapsLock', 'Tab', 'Escape', 'Delete', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
        const filteredEvents = targetEvents.filter(e => !EXCLUDED_KEYS.includes(e.key_code));
        
        const ikis = [];
        for (let i = 1; i < filteredEvents.length; i++) {
            const diff = filteredEvents[i].timestamp_rel_ms - filteredEvents[i-1].timestamp_rel_ms;
            if (diff > 0) ikis.push({ t: filteredEvents[i].timestamp_rel_ms, v: Math.log1p(diff) });
        }

        res.json({
            plots: {
                russell: targetEmas.map(e => ({ v: e.valence, a: e.arousal, char: e.character_count })),
                timeline: {
                    ikis: ikis, // Pontos brutos
                    emas: targetEmas.map(e => ({ t: e.timestamp_rel_ms, v: e.valence, a: e.arousal })) // Marcadores verticais
                },
                distribution: ikis.map(i => i.v),
                pearson: cumulativePearson,
                cohensD: cumulativeCohensD
            },
            stats: {
                total_sessions: sessions.length,
                current_pearson: cumulativePearson[cumulativePearson.length - 1]?.r || 0,
                current_cohens_d: cumulativeCohensD[cumulativeCohensD.length - 1]?.d || 0
            }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
}
