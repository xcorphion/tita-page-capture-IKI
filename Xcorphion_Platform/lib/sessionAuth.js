import crypto from 'crypto';

export function generateSessionToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export async function validateSessionToken(db, session_id, token) {
  if (!session_id || !token) return false;
  const session = await db.collection('sessions').findOne(
    { session_id },
    { projection: { token_hash: 1 } }
  );
  if (!session?.token_hash) return false;
  const incoming = Buffer.from(crypto.createHash('sha256').update(token).digest('hex'));
  const stored   = Buffer.from(session.token_hash);
  return incoming.length === stored.length && crypto.timingSafeEqual(incoming, stored);
}
