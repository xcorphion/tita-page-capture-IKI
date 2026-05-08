import { connectToDatabase } from '@xcorphion/shared';

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ eligible: false, error: 'Method Not Allowed' });

  const code = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : '';

  if (!code)
    return res.status(400).json({ eligible: false, reason: 'no_code' });

  try {
    const db = await connectToDatabase('research');
    const participant = await db.collection('participants').findOne({ participant_code: code });

    if (!participant)
      return res.status(200).json({ eligible: false, reason: 'not_found' });

    if (participant.status === 'INATIVO')
      return res.status(200).json({ eligible: false, reason: 'inactive' });

    const s1done = participant.session_1_status === 'CONCLUIDA';
    const s1engaged = participant.session_1_engagement === true;

    if (!s1done)
      return res.status(200).json({ eligible: false, reason: 'session_not_completed' });

    if (!s1engaged)
      return res.status(200).json({ eligible: false, reason: 'not_engaged' });

    return res.status(200).json({ eligible: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ eligible: false, reason: 'server_error' });
  }
}
