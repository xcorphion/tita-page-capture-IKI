
import { connectToDatabase } from '../../../lib/mongodb';
import { format } from 'd3-dsv';

export default async function handler(req, res) {
    const password = (req.headers['x-admin-password'] || req.headers.authorization || req.query?.pwd || '').trim();
    const envPassword = (process.env.ADMIN_PASSWORD || '').trim();
    if (password !== envPassword) return res.status(401).json({ error: 'Senha incorreta' });

    if (req.method !== 'GET') return res.status(405).end();

    try {
        const db = await connectToDatabase();
        
        // Buscar todos os eventos e sessões
        const sessions = await db.collection('sessions').find({ status: 'completed' }).toArray();
        const sessionIds = sessions.map(s => s.session_id);
        
        const allEvents = await db.collection('events')
            .find({ session_id: { $in: sessionIds } })
            .sort({ session_id: 1, timestamp_rel_ms: 1 })
            .toArray();

        const allEmas = await db.collection('emas')
            .find({ session_id: { $in: sessionIds } })
            .toArray();

        // Mapear EMAs por sessão para busca rápida
        const emaMap = allEmas.reduce((acc, ema) => {
            if (!acc[ema.session_id]) acc[ema.session_id] = [];
            acc[ema.session_id].push(ema);
            return acc;
        }, {});

        const csvData = [];
        
        // Iterar sessões para calcular IKIs e associar EMAs
        for (const session of sessions) {
            const events = allEvents.filter(e => e.session_id === session.session_id);
            const emas = (emaMap[session.session_id] || []).sort((a,b) => a.character_count - b.character_count);
            
            let charCount = 0;
            let currentEmaIndex = 0;

            for (let i = 1; i < events.length; i++) {
                const e1 = events[i-1];
                const e2 = events[i];
                const iki = e2.timestamp_rel_ms - e1.timestamp_rel_ms;
                
                // Ignorar IKIs negativos ou extremos (pausas gigantes > 30s)
                if (iki <= 0 || iki > 30000) continue;

                if (e2.event_type === 'keydown') {
                    charCount++;
                    // Identificar qual EMA estava ativa neste momento
                    while (currentEmaIndex < emas.length && charCount > emas[currentEmaIndex].character_count) {
                        currentEmaIndex++;
                    }
                    const currentEma = emas[currentEmaIndex] || emas[emas.length - 1];

                    csvData.push({
                        participant_id: session.participant_id,
                        session_id: session.session_id,
                        timestamp_rel_ms: e2.timestamp_rel_ms,
                        iki_ms: iki,
                        iki_log1p: Math.log1p(iki),
                        key_code: e2.key_code,
                        valence: currentEma?.valence || '',
                        arousal: currentEma?.arousal || '',
                        ema_index: currentEmaIndex
                    });
                }
            }
        }

        const csvString = format(csvData);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=somatic_transformer_dataset.csv');
        res.status(200).send(csvString);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao exportar CSV' });
    }
}
