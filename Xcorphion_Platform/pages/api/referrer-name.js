import { connectToDatabase } from '../../lib/mongodb';
import { PARTICIPANT_STATUS } from '../../lib/schema';

const CODE_RE = /^[A-Z0-9]{1,20}$/;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const raw = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : '';
  if (!CODE_RE.test(raw)) return res.status(400).json({ error: 'Código inválido.' });

  try {
    const db = await connectToDatabase();
    const doc = await db.collection('participants').findOne(
      { participant_code: raw, status: PARTICIPANT_STATUS.ATIVO },
      { projection: { participant_name: 1 } }
    );
    if (!doc) return res.status(404).json({ error: 'Não encontrado.' });
    return res.json({ name: doc.participant_name });
  } catch {
    return res.status(500).end();
  }
}
