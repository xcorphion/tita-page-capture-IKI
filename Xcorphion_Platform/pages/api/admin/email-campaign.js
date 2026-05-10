import { connectToDatabase } from '../../../lib/mongodb';
import { checkAdminAuth } from '../../../lib/adminAuth';
import { sendMail } from '../../../lib/mailer';
import { asString } from '../../../lib/security';

const SEGMENTS = ['waitlist', 'all_participants', 's1_complete', 's2_complete', 'all_complete'];
const MAX_RECIPIENTS = 10_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getRecipients(db, segment) {
  const opts = { maxTimeMS: 10_000 };
  switch (segment) {
    case 'waitlist':
      return (await db.collection('research_waitlist').find({}, { projection: { email: 1 }, ...opts }).limit(MAX_RECIPIENTS).toArray())
        .map(d => d.email).filter(e => typeof e === 'string' && EMAIL_RE.test(e));
    case 'all_participants':
      return (await db.collection('participants').find(
        { contact_email: { $exists: true, $ne: null }, status: 'ATIVO' },
        { projection: { contact_email: 1 }, ...opts }
      ).limit(MAX_RECIPIENTS).toArray()).map(d => d.contact_email).filter(e => typeof e === 'string' && EMAIL_RE.test(e));
    case 's1_complete':
      return (await db.collection('participants').find(
        { session_1_status: 'CONCLUIDA', contact_email: { $exists: true, $ne: null } },
        { projection: { contact_email: 1 }, ...opts }
      ).limit(MAX_RECIPIENTS).toArray()).map(d => d.contact_email).filter(e => typeof e === 'string' && EMAIL_RE.test(e));
    case 's2_complete':
      return (await db.collection('participants').find(
        { session_2_status: 'CONCLUIDA', contact_email: { $exists: true, $ne: null } },
        { projection: { contact_email: 1 }, ...opts }
      ).limit(MAX_RECIPIENTS).toArray()).map(d => d.contact_email).filter(e => typeof e === 'string' && EMAIL_RE.test(e));
    case 'all_complete':
      return (await db.collection('participants').find(
        { sessions_completed: 3, contact_email: { $exists: true, $ne: null } },
        { projection: { contact_email: 1 }, ...opts }
      ).limit(MAX_RECIPIENTS).toArray()).map(d => d.contact_email).filter(e => typeof e === 'string' && EMAIL_RE.test(e));
    default:
      return [];
  }
}

export default async function handler(req, res) {
  if (!(await checkAdminAuth(req, res))) return;
  if (req.method !== 'POST') return res.status(405).end();

  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const segment = asString(body.segment, 32);
  const subject = asString(body.subject, 200);
  const html_body = typeof body.html_body === 'string' ? body.html_body : '';

  if (!segment || !SEGMENTS.includes(segment))
    return res.status(400).json({ error: 'Segmento inválido. Opções: ' + SEGMENTS.join(', ') });
  if (!subject)
    return res.status(400).json({ error: 'Assunto obrigatório.' });
  if (!html_body.trim() || html_body.length > 500_000)
    return res.status(400).json({ error: 'Corpo do e-mail obrigatório (até 500KB).' });

  try {
    const db = await connectToDatabase();
    const recipients = await getRecipients(db, segment);

    if (recipients.length === 0)
      return res.status(200).json({ sent: 0, failed: 0, total: 0 });

    let sent = 0;
    let failed = 0;

    for (const to of recipients) {
      try {
        await sendMail({ to, subject, html: html_body });
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
