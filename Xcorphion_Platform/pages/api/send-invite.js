import { connectToDatabase } from '../../lib/mongodb';
import { hashParticipantId } from '../../lib/participant';
import { sendMail } from '../../lib/mailer';
import { tplReferralInvite } from '../../lib/emailTemplates';
import { rateLimit } from '../../lib/rateLimit';
import { SESSION_STATUS, PARTICIPANT_STATUS } from '../../lib/schema';
import { asString, stripHtml } from '../../lib/security';

const MAX_INVITES = 3;
const PARTICIPANT_CODE_RE = /^[A-Z0-9]{1,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Per-IP throttle is the *outer* gate. Per-participant cap (MAX_INVITES)
  // sits below — together they limit both anonymous spam and abuse via
  // legitimately-obtained codes.
  if (await rateLimit(req, { max: 5, windowMs: 60 * 60_000, bucket: 'send_invite_ip' }))
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde.' });

  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const codeRaw = asString(body.participant_code, 32);
  if (!codeRaw) return res.status(400).json({ error: 'Código de participante inválido.' });
  const code = codeRaw.toUpperCase();
  if (!PARTICIPANT_CODE_RE.test(code))
    return res.status(400).json({ error: 'Código de participante inválido.' });

  const friendEmailRaw = asString(body.friend_email, 254);
  if (!friendEmailRaw || !EMAIL_RE.test(friendEmailRaw))
    return res.status(400).json({ error: 'E-mail inválido.' });
  const friendEmail = friendEmailRaw.toLowerCase();

  // Per-participant rate limit — prevents one valid code from being used to
  // burst through the global per-IP gate from multiple IPs.
  if (await rateLimit(req, { max: 3, windowMs: 60 * 60_000, bucket: `send_invite_p:${code}` }))
    return res.status(429).json({ error: 'Muitas tentativas para este código. Aguarde.' });

  try {
    const db = await connectToDatabase();
    const participant_id = hashParticipantId(code);
    const participant = await db.collection('participants').findOne(
      { participant_id },
      { projection: { participant_name: 1, session_1_status: 1, status: 1, invites_sent: 1, contact_email: 1, locale: 1 } }
    );

    if (!participant || participant.status === PARTICIPANT_STATUS.BLOQUEADO)
      return res.status(404).json({ error: 'Participante não encontrado.' });
    if (participant.status !== PARTICIPANT_STATUS.ATIVO)
      return res.status(403).json({ error: 'Participante inativo.' });
    if (participant.session_1_status !== SESSION_STATUS.CONCLUIDA)
      return res.status(403).json({ error: 'Complete a Sessão 1 antes de convidar.' });
    // Require participant to have completed E03 (contact_email registered) — proves
    // they actually went through the welcome flow before they can spam invites.
    if (!participant.contact_email)
      return res.status(403).json({ error: 'Cadastre seu e-mail antes de convidar.' });
    if (friendEmail === String(participant.contact_email).toLowerCase())
      return res.status(400).json({ error: 'Não é possível convidar o próprio e-mail.' });
    if ((participant.invites_sent || 0) >= MAX_INVITES)
      return res.status(403).json({ error: 'Limite de convites atingido.' });

    const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online';
    const inviteLink = `${PLATFORM_URL}/study?referrer=${encodeURIComponent(code)}`;
    const safeName = stripHtml(participant.participant_name).slice(0, 80) || 'Um participante';

    const { subject, html } = tplReferralInvite({
      referrerName: safeName,
      inviteLink,
      locale: participant.locale || 'pt',
    });
    await sendMail({ to: friendEmail, subject, html });

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
