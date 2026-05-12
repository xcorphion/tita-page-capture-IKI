import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const db = await connectToDatabase();
    const doc = await db.collection('site_config').findOne({ _id: 'influences_config' });
    return res.json({ config: doc?.data || null });
  } catch {
    return res.json({ config: null });
  }
}
