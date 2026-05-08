import crypto from 'crypto';

const attempts = new Map();

function getIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const WINDOW = 5 * 60 * 1000;
  const MAX = 10;
  const entry = attempts.get(ip) || { count: 0, resetAt: now + WINDOW };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW; }
  entry.count++;
  attempts.set(ip, entry);
  return entry.count > MAX;
}

export function checkAdminAuth(req, res) {
  const ip = getIp(req);

  if (isRateLimited(ip)) {
    res.status(429).json({ error: 'Muitas tentativas. Aguarde 5 minutos.' });
    return false;
  }

  const provided = (req.headers['x-admin-password'] || req.headers.authorization || '').trim();
  const expected = (process.env.ADMIN_PASSWORD || '').trim();

  if (!expected) {
    res.status(500).json({ error: 'ADMIN_PASSWORD não configurado.' });
    return false;
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const safeEqual = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!safeEqual) {
    res.status(401).json({ error: 'Senha incorreta.' });
    return false;
  }

  return true;
}
