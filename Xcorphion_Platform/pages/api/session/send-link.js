import { connectToDatabase } from '../../../lib/mongodb';
import { sendMail } from '../../../lib/mailer';
import { tplSessionLink } from '../../../lib/emailTemplates';
import { rateLimit } from '../../../lib/rateLimit';
import { SESSION_STATUS } from '../../../lib/schema';

const CONSENT_TEXT = 'SIM, EU ACEITO';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (rateLimit(req, { max: 3, windowMs: 60 * 60_000 }))
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' });

  const { participant_code, email, consent_text } = req.body || {};

  if (consent_text !== CONSENT_TEXT)
    return res.status(400).json({ error: 'Consentimento inválido.' });

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return res.status(400).json({ error: 'E-mail inválido.' });

  const code = typeof participant_code === 'string' ? participant_code.trim().toUpperCase() : '';
  if (!code)
    return res.status(400).json({ error: 'Código de participante ausente.' });

  try {
    const db = await connectToDatabase();
    const participant = await db.collection('participants').findOne({ participant_code: code });

    if (!participant)
      return res.status(404).json({ error: 'Participante não encontrado.' });

    if (participant.session_1_status !== SESSION_STATUS.CONCLUIDA)
      return res.status(403).json({ error: 'Sessão 1 não concluída.' });

    await db.collection('participants').updateOne(
      { participant_code: code },
      { $set: { contact_email: email.trim().toLowerCase(), link_sent_at: new Date() } }
    );

    const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online';
    const studyLink = `${platformUrl}/study?code=${code}`;

    await sendMail({
      to: email.trim(),
      subject: 'Seu acesso à pesquisa OMMΩ — Xcorphion',
      html: tplSessionLink({ code, studyLink }),
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[send-link]', e.message);
    return res.status(500).json({ error: 'Erro ao enviar. Tente novamente.' });
  }
}
