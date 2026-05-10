import { connectToDatabase } from '../../lib/mongodb';
import { rateLimit } from '../../lib/rateLimit';
import { sendMailSilent } from '../../lib/mailer';
import { tplWaitlistConfirm } from '../../lib/emailTemplates';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  if (await rateLimit(req, { max: 10, windowMs: 60 * 60_000, bucket: 'waitlist' }))
    return res.status(429).json({ success: false, error: 'Muitas requisições. Aguarde.' });

  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, error: 'E-mail inválido.' });
  if (email.length > 254)
    return res.status(400).json({ success: false, error: 'E-mail inválido.' });

  const code = typeof body.participant_code === 'string' ? body.participant_code.trim().toUpperCase() : '';
  if (!code || !/^[A-Z0-9]{1,20}$/.test(code))
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

    sendMailSilent({
      to: email.trim(),
      subject: 'Você está na lista — OMMΩ · Xcorphion',
      html: tplWaitlistConfirm(),
    });

    return res.status(201).json({ success: true, already: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Erro interno. Tente novamente.' });
  }
}
