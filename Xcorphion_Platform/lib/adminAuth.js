import crypto from 'crypto';
import { rateLimit } from './rateLimit';

export async function checkAdminAuth(req, res) {
  if (await rateLimit(req, { max: 10, windowMs: 5 * 60_000, bucket: 'admin_login' })) {
    res.status(429).json({ error: 'Muitas tentativas. Aguarde 5 minutos.' });
    return false;
  }

  const provided = typeof req.headers['x-admin-password'] === 'string'
    ? req.headers['x-admin-password'].trim()
    : '';
  const expected = (process.env.ADMIN_PASSWORD || '').trim();

  if (!expected) {
    res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' });
    return false;
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const safeEqual = a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);

  if (!safeEqual) {
    res.status(401).json({ error: 'Senha incorreta.' });
    return false;
  }

  return true;
}
