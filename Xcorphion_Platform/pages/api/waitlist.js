import { connectToDatabase } from '../../lib/mongodb';
import { rateLimit } from '../../lib/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  if (rateLimit(req, { max: 10, windowMs: 60 * 60_000 }))
    return res.status(429).json({ success: false, error: 'Muitas requisições. Aguarde.' });

  const { email, participant_code } = req.body || {};

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return res.status(400).json({ success: false, error: 'E-mail inválido.' });

  const code = typeof participant_code === 'string' ? participant_code.trim().toUpperCase() : '';
  if (!code)
    return res.status(403).json({ success: false, error: 'Código de participante ausente.' });

  try {
    const researchDb = await connectToDatabase('research');
    const participant = await researchDb.collection('participants').findOne({ participant_code: code });

    if (!participant || participant.status === 'INATIVO' || participant.session_1_status !== 'CONCLUIDA' || !participant.session_1_engagement)
      return res.status(403).json({ success: false, error: 'Participação na Sessão 1 necessária.' });

    const platformDb = await connectToDatabase('platform');
    const col = platformDb.collection('research_waitlist');

    const existing = await col.findOne({ email: email.trim().toLowerCase() });
    if (existing)
      return res.status(200).json({ success: true, already: true });

    await col.insertOne({
      email: email.trim().toLowerCase(),
      participant_code: code,
      source: 'study_page',
      registered_at: new Date(),
    });

    return res.status(201).json({ success: true, already: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Erro interno. Tente novamente.' });
  }
}
