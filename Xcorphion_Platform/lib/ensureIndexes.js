// MongoDB index definitions for the Research_System database.
// Called once per process lifetime from connectToDatabase().
// createIndex is idempotent — safe to call on every cold start.

let ensurePromise = null;

export function ensureIndexes(db) {
  if (ensurePromise) return ensurePromise;

  ensurePromise = _run(db).catch(err => {
    console.error('[ensureIndexes]', err);
    ensurePromise = null; // allow retry on next connect
  });

  return ensurePromise;
}

async function _run(db) {
  await Promise.all([
    db.collection('participants').createIndex(
      { participant_id: 1 }, { unique: true, name: 'idx_participant_id' }
    ),
    db.collection('participants').createIndex(
      { participant_code: 1 }, { unique: true, name: 'idx_participant_code' }
    ),
    db.collection('sessions').createIndex(
      { session_id: 1 }, { unique: true, name: 'idx_session_id' }
    ),
    db.collection('sessions').createIndex(
      { participant_id: 1 }, { name: 'idx_session_participant' }
    ),
    // Compound index used by session/end.js event fetch and analysis/report.js
    db.collection('events').createIndex(
      { session_id: 1, timestamp_rel_ms: 1 }, { name: 'idx_events_session_ts' }
    ),
    db.collection('emas').createIndex(
      { session_id: 1 }, { name: 'idx_emas_session' }
    ),
    db.collection('ip_blocklist').createIndex(
      { ip: 1 }, { unique: true, name: 'idx_ip_blocklist' }
    ),
  ]);
}
