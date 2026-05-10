import { connectToDatabase } from '../../../lib/mongodb';
import { checkAdminAuth } from '../../../lib/adminAuth';
import { sendMail } from '../../../lib/mailer';

const SEGMENTS = ['waitlist', 'all_participants', 's1_complete', 's2_complete', 'all_complete'];

async function getRecipients(db, segment) {
  switch (segment) {
    case 'waitlist':
      return (await db.collection('research_waitlist').find({}, { projection: { email: 1 } }).toArray())
        .map(d => d.email).filter(Boolean);
    case 'all_participants':
      return (await db.collection('participants').find(
        { contact_email: { $exists: true, $ne: null }, status: 'ATIVO' },
        { projection: { contact_email: 1 } }
      ).toArray()).map(d => d.contact_email).filter(Boolean);
    case 's1_complete':
      return (await db.collection('participants').find(
        { session_1_status: 'CONCLUIDA', contact_email: { $exists: true, $ne: null } },
        { projection: { contact_email: 1 } }
      ).toArray()).map(d => d.contact_email).filter(Boolean);
    case 's2_complete':
      return (await db.collection('participants').find(
        { session_2_status: 'CONCLUIDA', contact_email: { $exists: true, $ne: null } },
        { projection: { contact_email: 1 } }
      ).toArray()).map(d => d.contact_email).filter(Boolean);
    case 'all_complete':
      return (await db.collection('participants').find(
        { sessions_completed: 3, contact_email: { $exists: true, $ne: null } },
        { projection: { contact_email: 1 } }
      ).toArray()).map(d => d.contact_email).filter(Boolean);
    default:
      return [];
  }
}

export default async function handler(req, res) {
  if (!checkAdminAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const { segment, subject, html_body } = req.body || {};

  if (!SEGMENTS.includes(segment))
    return res.status(400).json({ error: 'Segmento inválido. Opções: ' + SEGMENTS.join(', ') });
  if (!subject || typeof subject !== 'string' || !subject.trim())
    return res.status(400).json({ error: 'Assunto obrigatório.' });
  if (!html_body || typeof html_body !== 'string' || !html_body.trim())
    return res.status(400).json({ error: 'Corpo do e-mail obrigatório.' });

  try {
    const db = await connectToDatabase();
    const recipients = await getRecipients(db, segment);

    if (recipients.length === 0)
      return res.status(200).json({ sent: 0, failed: 0, total: 0 });

    let sent = 0;
    let failed = 0;

    for (const to of recipients) {
      try {
        await sendMail({ to, subject: subject.trim(), html: html_body });
        sent++;
      } catch {
        failed++;
      }
      // 50ms between sends to avoid SMTP throttle
      await new Promise(r => setTimeout(r, 50));
    }

    return res.status(200).json({ sent, failed, total: recipients.length });
  } catch (e) {
    console.error('[email-campaign]', e.message);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
}
