import { connectToDatabase } from '../../lib/mongodb';
import { hashParticipantId } from '../../lib/participant';
import { sendMail } from '../../lib/mailer';
import { tplReferralInvite } from '../../lib/emailTemplates';
import { rateLimit } from '../../lib/rateLimit';
import { SESSION_STATUS, PARTICIPANT_STATUS } from '../../lib/schema';

const MAX_INVITES = 5;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (rateLimit(req, { max: 10, windowMs: 60 * 60_000 }))
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde.' });

  const { participant_code, friend_email } = req.body || {};

  const code = typeof participant_code === 'string' ? participant_code.trim().toUpperCase() : '';
  if (!code) return res.status(400).json({ error: 'Código de participante inválido.' });

  if (!friend_email || typeof friend_email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friend_email.trim()))
    return res.status(400).json({ error: 'E-mail inválido.' });

  const friendEmail = friend_email.trim().toLowerCase();

  try {
    const db = await connectToDatabase();
    const participant_id = hashParticipantId(code);
    const participant = await db.collection('participants').findOne(
      { participant_id },
      { projection: { participant_name: 1, session_1_status: 1, status: 1, invites_sent: 1 } }
    );

    if (!participant || participant.status === PARTICIPANT_STATUS.BLOQUEADO)
      return res.status(404).json({ error: 'Participante não encontrado.' });
    if (participant.session_1_status !== SESSION_STATUS.CONCLUIDA)
      return res.status(403).json({ error: 'Complete a Sessão 1 antes de convidar.' });
    if ((participant.invites_sent || 0) >= MAX_INVITES)
      return res.status(403).json({ error: 'Limite de convites atingido.' });

    const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online';
    const inviteLink = `${PLATFORM_URL}/study?referrer=${code}`;

    await sendMail({
      to: friendEmail,
      subject: `${participant.participant_name} te convidou para a pesquisa OMMΩ`,
      html: tplReferralInvite({ referrerName: participant.participant_name, inviteLink }),
    });

    await db.collection('participants').updateOne(
      { participant_id },
      { $inc: { invites_sent: 1 } }
    );

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[send-invite]', e.message);
    return res.status(500).json({ error: 'Erro ao enviar. Tente novamente.' });
  }
}
