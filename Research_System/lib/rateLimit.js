const buckets = new Map();

function getIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

export function rateLimit(req, { max = 30, windowMs = 60_000 } = {}) {
  const ip = getIp(req);
  const now = Date.now();
  const entry = buckets.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
  entry.count++;
  buckets.set(ip, entry);
  return entry.count > max;
}
