import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
    const password = req.headers.authorization || req.body.password;

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    const participants = db.collection('participants');

    if (req.method === 'GET') {
        try {
            const list = await participants.find({}).sort({ created_at: -1 }).toArray();
            return res.json({ participants: list });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Database error' });
        }
    }

    if (req.method === 'POST') {
        const { action, participant_code } = req.body;
        
        try {
            if (action === 'authorize_s2') {
                await participants.updateOne(
                    { participant_id: participant_code },
                    { 
                        $set: { 
                            admin_authorized_s2: true,
                            session_2_status: 'LIBERADA'
                        }
                    }
                );
            } else if (action === 'authorize_s3') {
                await participants.updateOne(
                    { participant_id: participant_code },
                    { 
                        $set: { 
                            admin_authorized_s3: true,
                            session_3_status: 'LIBERADA'
                        }
                    }
                );
            } else if (action === 'deactivate') {
                await participants.updateOne(
                    { participant_id: participant_code },
                    { 
                        $set: { 
                            status: 'INATIVO',
                            admin_deactivated: true,
                            session_2_status: 'BLOQUEADA',
                            session_3_status: 'BLOQUEADA'
                        }
                    }
                );
            }

            return res.json({ ok: true });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Action failed' });
        }
    }

    res.status(405).end();
}
