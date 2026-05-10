import { connectToDatabase } from '../../../lib/mongodb';
import { sendMailSilent } from '../../../lib/mailer';
import { tplSessionReminder } from '../../../lib/emailTemplates';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  // Vercel cron injects `Authorization: Bearer <CRON_SECRET>` automatically.
  // x-cron-secret header is kept as a manual-trigger fallback (e.g. local test).
  // Query-string secrets are rejected — they leak into HTTP logs, referers, and history.
  const cronSecret = process.env.CRON_SECRET;
  const provided = typeof req.headers['x-cron-secret'] === 'string'
    ? req.headers['x-cron-secret']
    : (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : '');
  if (!cronSecret) return res.status(500).json({ error: 'CRON_SECRET não configurado.' });
  const a = Buffer.from(provided);
  const b = Buffer.from(cronSecret);
  const crypto = await import('crypto');
  const ok = a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
  if (!ok) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const db = await connectToDatabase();
    const now = new Date();
    const cutoff = new Date(now.getTime() - THREE_DAYS_MS);

    // S2 reminders: participants with S2 authorized but not started/done, last reminder > 3 days ago
    const s2Pending = await db.collection('participants').find({
      session_2_status: 'LIBERADA',
      contact_email: { $exists: true, $ne: null },
      $or: [
        { last_s2_reminder: { $exists: false } },
        { last_s2_reminder: { $lt: cutoff } },
      ],
    }, {
      projection: { contact_email: 1, participant_name: 1, participant_code: 1 }
    }).toArray();

    // S3 reminders: participants with S3 authorized but not started/done, last reminder > 3 days ago
    const s3Pending = await db.collection('participants').find({
      session_3_status: 'LIBERADA',
      contact_email: { $exists: true, $ne: null },
      $or: [
        { last_s3_reminder: { $exists: false } },
        { last_s3_reminder: { $lt: cutoff } },
      ],
    }, {
      projection: { contact_email: 1, participant_name: 1, participant_code: 1 }
    }).toArray();

    const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online';

    for (const p of s2Pending) {
      const studyLink = `${PLATFORM_URL}/study?code=${p.participant_code}`;
      sendMailSilent({
        to: p.contact_email,
        subject: 'Sua Sessão 2 ainda está disponível — Xcorphion',
        html: tplSessionReminder({ name: p.participant_name, session: 2, studyLink }),
      });
      await db.collection('participants').updateOne(
        { participant_code: p.participant_code },
        { $set: { last_s2_reminder: now } }
      );
    }

    for (const p of s3Pending) {
      const studyLink = `${PLATFORM_URL}/study?code=${p.participant_code}`;
      sendMailSilent({
        to: p.contact_email,
        subject: 'Sua Sessão 3 ainda está disponível — Xcorphion',
        html: tplSessionReminder({ name: p.participant_name, session: 3, studyLink }),
      });
      await db.collection('participants').updateOne(
        { participant_code: p.participant_code },
        { $set: { last_s3_reminder: now } }
      );
    }

    return res.status(200).json({ s2: s2Pending.length, s3: s3Pending.length });
  } catch (e) {
    console.error('[session-reminders]', e.message);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}
