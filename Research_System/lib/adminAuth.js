import crypto from 'crypto';

// In-memory rate limiter — 10 tentativas por IP em 5 minutos
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

// Retorna true se autenticado; envia resposta e retorna false caso contrário
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

  // Timing-safe comparison — evita ataques de timing em comparação de strings
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const lengthMatch = a.length === b.length;
  const safeEqual = lengthMatch && crypto.timingSafeEqual(a, b);

  if (!safeEqual) {
    res.status(401).json({ error: 'Senha incorreta.' });
    return false;
  }

  return true;
}
