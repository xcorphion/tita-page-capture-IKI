import { connectToDatabase } from '../../lib/mongodb';
import { sendMailSilent } from '../../lib/mailer';
import { tplCodeReminder } from '../../lib/emailTemplates';
import { rateLimit } from '../../lib/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (await rateLimit(req, { max: 3, windowMs: 60 * 60_000, bucket: 'code_reminder' }))
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' });

  const { email } = req.body || {};
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return res.status(400).json({ error: 'E-mail inválido.' });

  try {
    const db = await connectToDatabase();
    const participant = await db.collection('participants').findOne(
      { contact_email: email.trim().toLowerCase() },
      { projection: { participant_name: 1, participant_code: 1 } }
    );

    if (participant?.participant_code) {
      const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online';
      const sessionLink = `${PLATFORM_URL}/study?code=${participant.participant_code}`;
      sendMailSilent({
        to: email.trim(),
        subject: 'Seu código de acesso — Xcorphion',
        html: tplCodeReminder({ name: participant.participant_name, code: participant.participant_code, sessionLink }),
      });
    }

    // Always respond the same to prevent email enumeration
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[code-reminder]', e.message);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
}
