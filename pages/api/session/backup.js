
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { session_id, text } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    try {
        const db = await connectToDatabase();
        await db.collection('sessions').updateOne(
            { session_id },
            { 
                $set: { 
                    text_backup: text, 
                    last_backup_at: new Date() 
                } 
            }
        );
        res.json({ ok: true });
    } catch (e) {
        console.error('[Backup] Error:', e);
        res.status(500).json({ error: 'Failed to save backup' });
    }
}
