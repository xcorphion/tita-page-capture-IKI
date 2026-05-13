import { connectToDatabase } from '../../../lib/mongodb';
import { checkAdminAuth } from '../../../lib/adminAuth';
import { asString } from '../../../lib/security';

export default async function handler(req, res) {
    if (!(await checkAdminAuth(req, res))) return;

    const db = await connectToDatabase();
    const blocklist = db.collection('ip_blocklist');

    if (req.method === 'GET') {
        try {
            const docs = await blocklist
                .find({})
                .sort({ blocked_at: -1 })
                .limit(500)
                .toArray();
            return res.json({ ips: docs });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Database error' });
        }
    }

    if (req.method === 'DELETE') {
        const ip = asString((req.body || {}).ip, 64);
        if (!ip) return res.status(400).json({ error: 'IP inválido.' });
        try {
            const result = await blocklist.deleteMany({ ip });
            return res.json({ ok: true, deleted: result.deletedCount });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Database error' });
        }
    }

    res.status(405).end();
}
