import { connectToDatabase } from '../../../lib/mongodb';
import { checkAdminAuth } from '../../../lib/adminAuth';

export default async function handler(req, res) {
  if (!(await checkAdminAuth(req, res))) return;

  const db = await connectToDatabase();
  const col = db.collection('site_config');

  if (req.method === 'GET') {
    const doc = await col.findOne({ _id: 'influences_config' });
    return res.json({ config: doc?.data || null });
  }

  if (req.method === 'PUT') {
    const data = req.body;
    if (!data || typeof data !== 'object')
      return res.status(400).json({ error: 'Payload inválido.' });

    await col.updateOne(
      { _id: 'influences_config' },
      { $set: { _id: 'influences_config', data, updated_at: new Date() } },
      { upsert: true }
    );
    return res.json({ ok: true });
  }

  return res.status(405).end();
}
