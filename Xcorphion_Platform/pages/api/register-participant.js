import { connectToDatabase } from '../../lib/mongodb';
import crypto from 'crypto';
import { rateLimit } from '../../lib/rateLimit';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem O, 0, I, 1
  let code = '';
  for (let i = 0; i < 8; i++)
    code += chars.charAt(crypto.randomInt(0, chars.length)); // CSPRNG — não Math.random()
  return code;
}

function hashParticipantId(code) {
  const salt = process.env.PARTICIPANT_SALT;
  if (!salt) throw new Error('PARTICIPANT_SALT não configurado.');
  return crypto.createHash('sha256').update(code + salt).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  if (rateLimit(req, { max: 5, windowMs: 10 * 60_000 }))
    return res.status(429).json({ success: false, error: 'Muitas requisições. Aguarde antes de tentar novamente.' });

  const { participant_name } = req.body || {};

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
    const db = await connectToDatabase('research');
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

    await col.insertOne({
      participant_id,                          // string — SHA-256 hex
      participant_code: code,                  // string — 5 chars alfanuméricos
      participant_name: name,                  // string — nome fornecido
      referrer_name: 'system',                 // string
      status: 'ATIVO',                         // 'ATIVO' | 'INATIVO'
      session_1_status: 'LIBERADA',            // 'LIBERADA' | 'CONCLUIDA' | 'BLOQUEADA'
      session_2_status: 'AGUARDANDO',          // 'AGUARDANDO' | 'LIBERADA' | 'CONCLUIDA' | 'BLOQUEADA'
      session_3_status: 'AGUARDANDO',          // 'AGUARDANDO' | 'LIBERADA' | 'CONCLUIDA' | 'BLOQUEADA'
      session_1_engagement: null,
      session_2_engagement: null,
      session_3_engagement: null,
      admin_authorized_s2: false,
      admin_authorized_s3: false,
      sessions_completed: 0,
      onboarding_complete: false,
      source: 'study_page',
      created_at: new Date(),
    });

    return res.status(201).json({ success: true, code });
  } catch (err) {
    console.error('[register-participant]', err);
    return res.status(500).json({ success: false, error: 'Erro interno. Tente novamente.', _dbg: err?.message ?? String(err) });
  }
}
