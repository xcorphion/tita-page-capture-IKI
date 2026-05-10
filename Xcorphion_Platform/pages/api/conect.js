import { connectToDatabase } from '../../lib/mongodb';
import { rateLimit } from '../../lib/rateLimit';
import { PARTICIPANT_STATUS } from '../../lib/schema';

const CONNECT_CODE_RE = /^[A-Z0-9]{6}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ valid: false, reason: 'method_not_allowed' });

  if (rateLimit(req, { max: 10, windowMs: 5 * 60_000 }))
    return res.status(429).json({ valid: false, reason: 'rate_limited' });

  const raw = typeof req.body?.connect_code === 'string' ? req.body.connect_code.trim().toUpperCase() : '';
  if (!CONNECT_CODE_RE.test(raw))
    return res.status(400).json({ valid: false, reason: 'invalid_code' });

  try {
    const db = await connectToDatabase();
    const doc = await db.collection('participants').findOne({ connect_code: raw });

    if (!doc)
      return res.json({ valid: false, reason: 'invalid_code' });

    if (doc.status === PARTICIPANT_STATUS.BLOQUEADO)
      return res.json({ valid: false, reason: 'blocked' });

    if (doc.sessions_completed >= 3)
      return res.json({ valid: false, reason: 'completed' });

    return res.json({
      valid: true,
      participant_code: doc.participant_code,
      respondent_number: doc.respondent_number ?? null,
    });
  } catch (err) {
    console.error('[api/conect]', err);
    return res.status(500).json({ valid: false, reason: 'server_error' });
  }
}
