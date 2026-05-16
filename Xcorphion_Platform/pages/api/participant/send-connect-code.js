import { connectToDatabase } from '../../../lib/mongodb';
import { sendMailSilent } from '../../../lib/mailer';
import { tplConnectCode } from '../../../lib/emailTemplates';
import { rateLimit } from '../../../lib/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (await rateLimit(req, { max: 2, windowMs: 60 * 60_000, bucket: 'connect_email' }))
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde.' });

  const { participant_code } = req.body || {};
  const code = typeof participant_code === 'string' ? participant_code.trim().toUpperCase() : '';
  if (!/^[A-Z0-9]{1,20}$/.test(code)) return res.status(400).json({ error: 'Código inválido.' });

  try {
    const db = await connectToDatabase();
    const participant = await db.collection('participants').findOne(
      { participant_code: code },
      { projection: { contact_email: 1, participant_name: 1, connect_code: 1, locale: 1 } }
    );

    if (participant?.contact_email && participant?.connect_code) {
      const { subject, html } = tplConnectCode({
        name: participant.participant_name,
        connectCode: participant.connect_code,
        locale: participant.locale || 'pt',
      });
      sendMailSilent({ to: participant.contact_email, subject, html });
    }

    // Return the connect_code in the response so the equipment modal can display
    // it immediately without reading it from the initial GET /api/participant/[code].
    // The caller must already know the participant_code — no new surface is opened.
    return res.status(200).json({ ok: true, connect_code: participant?.connect_code || null });
  } catch (e) {
    console.error('[send-connect-code]', e.message);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}
