import { connectToDatabase } from '../../lib/mongodb';
import { hashParticipantId } from '../../lib/participant';
import { createParticipantDoc, PARTICIPANT_STATUS } from '../../lib/schema';
import crypto from 'crypto';
import { rateLimit } from '../../lib/rateLimit';
import { sendMailSilent } from '../../lib/mailer';
import { tplReferralConfirmed, tplAdminAlert } from '../../lib/emailTemplates';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem O, 0, I, 1

function generateCode() {
  let code = '';
  for (let i = 0; i < 8; i++)
    code += CODE_CHARS.charAt(crypto.randomInt(0, CODE_CHARS.length));
  return code;
}

function generateConnectCode() {
  let code = '';
  for (let i = 0; i < 6; i++)
    code += CODE_CHARS.charAt(crypto.randomInt(0, CODE_CHARS.length));
  return code;
}

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  if (await rateLimit(req, { max: 5, windowMs: 10 * 60_000, bucket: 'register' }))
    return res.status(429).json({ success: false, error: 'Muitas requisições. Aguarde antes de tentar novamente.' });

  const { participant_name, referrer_code } = req.body || {};

  if (!participant_name || typeof participant_name !== 'string')
    return res.status(400).json({ success: false, error: 'Nome inválido.' });

  const name = participant_name.trim();
  if (name.length < 2)
    return res.status(400).json({ success: false, error: 'Nome muito curto.' });
  if (name.length > 80)
    return res.status(400).json({ success: false, error: 'Nome muito longo (máx. 80 caracteres).' });
  if (!/^[\p{L}\p{M} '-]+$/u.test(name))
    return res.status(400).json({ success: false, error: 'Nome contém caracteres inválidos.' });

  try {
    const db = await connectToDatabase();
    const col = db.collection('participants');

    // Gera código único com até 10 tentativas
    let code = null;
    for (let i = 0; i < 10; i++) {
      const candidate = generateCode();
      const exists = await col.findOne({ participant_code: candidate });
      if (!exists) { code = candidate; break; }
    }
    if (!code)
      return res.status(500).json({ success: false, error: 'Falha ao gerar código único. Tente novamente.' });

    const participant_id = hashParticipantId(code);

    // Verificação de colisão de hash (improvável, mas validado)
    const hashConflict = await col.findOne({ participant_id });
    if (hashConflict)
      return res.status(500).json({ success: false, error: 'Conflito de integridade. Tente novamente.' });

    // connect_code: 6-char, used by /conect for cross-device session resume
    let connectCode = null;
    for (let i = 0; i < 10; i++) {
      const candidate = generateConnectCode();
      const exists = await col.findOne({ connect_code: candidate });
      if (!exists) { connectCode = candidate; break; }
    }
    if (!connectCode)
      return res.status(500).json({ success: false, error: 'Falha ao gerar código de acesso. Tente novamente.' });

    // respondent_number: atomic sequential ID via counters collection
    const counterResult = await db.collection('counters').findOneAndUpdate(
      { _id: 'participant_seq' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    const respondent_number = counterResult.seq;

    // Resolve referrer — organic path uses 'system', referrer path captures real name.
    let referrer_name = 'system';
    let source = 'organic';
    let referrer = null;

    if (referrer_code) {
      const rawRef = typeof referrer_code === 'string' ? referrer_code.trim().toUpperCase() : '';
      if (!/^[A-Z0-9]{1,20}$/.test(rawRef))
        return res.status(400).json({ success: false, error: 'Código de referência inválido.' });

      const referrerId = hashParticipantId(rawRef);
      referrer = await col.findOne(
        { participant_id: referrerId, status: { $ne: PARTICIPANT_STATUS.BLOQUEADO } },
        { projection: { participant_name: 1, contact_email: 1 } }
      );
      if (!referrer)
        return res.status(400).json({ success: false, error: 'Código de referência não encontrado.' });

      referrer_name = referrer.participant_name;
      source = 'referrer';
    }

    await col.insertOne(createParticipantDoc({
      participant_id,
      participant_code: code,
      participant_name: name,
      referrer_name,
      source,
      connect_code: connectCode,
      respondent_number,
    }));

    if (source === 'referrer' && referrer?.contact_email) {
      sendMailSilent({
        to: referrer.contact_email,
        subject: 'Seu convite foi aceito — Xcorphion',
        html: tplReferralConfirmed({ referrerName: referrer.participant_name, newParticipantName: name }),
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendMailSilent({
        to: adminEmail,
        subject: `[Xcorphion] Novo participante — ${code}`,
        html: tplAdminAlert({
          event: 'Novo registro',
          participantCode: code,
          details: `Nome: ${name} | Fonte: ${source}`,
        }),
      });
    }

    return res.status(201).json({ success: true, code });
  } catch (err) {
    console.error('[register-participant]', err);
    return res.status(500).json({ success: false, error: 'Erro interno. Tente novamente.' });
  }
}
