// Distributed rate limit backed by MongoDB.
// In-memory Maps don't survive serverless cold starts and can be bypassed
// by spawning new lambdas. Persist counters in `rate_limits` with a TTL index.

import { connectToDatabase } from './mongodb';
import { extractIp } from './security';

let _ttlEnsured = false;
async function ensureTtl(db) {
  if (_ttlEnsured) return;
  try {
    await db.collection('rate_limits').createIndex(
      { expires_at: 1 },
      { expireAfterSeconds: 0, name: 'idx_rl_ttl' }
    );
    _ttlEnsured = true;
  } catch (_) { /* createIndex is idempotent; ignore */ }
}

// Returns true if the caller is rate-limited.
export async function rateLimit(req, { max = 30, windowMs = 60_000, bucket = 'default' } = {}) {
  try {
    const ip = extractIp(req);
    const key = `${bucket}:${ip}`;
    const db = await connectToDatabase();
    await ensureTtl(db);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + windowMs);

    const result = await db.collection('rate_limits').findOneAndUpdate(
      { _id: key, expires_at: { $gt: now } },
      { $inc: { count: 1 }, $setOnInsert: { expires_at: expiresAt } },
      { upsert: true, returnDocument: 'after' }
    );

    // First hit in a new window — pin its expires_at.
    if (result && result.count === 1) {
      await db.collection('rate_limits').updateOne(
        { _id: key },
        { $set: { expires_at: expiresAt } }
      );
    }

    return (result?.count || 1) > max;
  } catch (e) {
    // Fail-open on DB issues. Log so we can detect abuse if DB is degraded.
    console.error('[rateLimit]', e.message);
    return false;
  }
}
