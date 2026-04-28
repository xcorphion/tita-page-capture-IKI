const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { connectToDatabase } = require('./mongodb');
const { randomUUID } = require('crypto');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// GET /participant/:code
app.get('/participant/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const db = await connectToDatabase();
        const participants = db.collection('participants');
        let doc = await participants.findOne({ participant_id: code });

        if (!doc) {
            const newParticipant = {
                participant_id: code,
                sessions_completed: 0,
                created_at: new Date()
            };
            await participants.insertOne(newParticipant);
            return res.json({ participant_id: code, sessions_completed: 0, next_prompt_id: 1 });
        }

        const sessionsCompleted = doc.sessions_completed || 0;

        // After session 1, block access until admin unlocks
        if (sessionsCompleted >= 1 && !doc.session2_unlocked) {
            return res.json({
                participant_id: code,
                sessions_completed: sessionsCompleted,
                next_prompt_id: sessionsCompleted + 1,
                locked: true
            });
        }

        res.json({
            participant_id: code,
            sessions_completed: sessionsCompleted,
            next_prompt_id: sessionsCompleted + 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /session/start
app.post('/session/start', async (req, res) => {
    const { participant_code, prompt_id, jitter_benchmark_ms } = req.body;
    const sessionId = randomUUID();
    const sessionStartEpochMs = Date.now();
    const promptText = "Escreva sobre algo que você fez recentemente e que deixou uma marca. Foque no que fez e no que sentiu — não precisa explicar o contexto.";

    try {
        const db = await connectToDatabase();
        const sessions = db.collection('sessions');

        await sessions.insertOne({
            session_id: sessionId,
            participant_id: participant_code,
            prompt_id,
            session_start_epoch_ms: sessionStartEpochMs,
            jitter_benchmark_ms,
            status: 'started'
        });

        res.json({ session_id: sessionId, session_start_epoch_ms: sessionStartEpochMs, prompt_text: promptText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// POST /events/batch
app.post('/events/batch', async (req, res) => {
    const { session_id, participant_code, events } = req.body;
    try {
        if (!events || events.length === 0) {
            return res.json({ received: 0 });
        }

        const db = await connectToDatabase();
        const eventsCol = db.collection('events');

        const docs = events.map(event => ({
            session_id,
            participant_id: participant_code,
            event_type: event.event_type,
            key_code: event.key_code,
            timestamp_rel_ms: event.timestamp_rel_ms,
            inserted_at: new Date()
        }));

        await eventsCol.insertMany(docs);
        res.json({ received: events.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to store events' });
    }
});

// POST /ema
app.post('/ema', async (req, res) => {
    const { session_id, participant_code, character_count, valence, arousal } = req.body;
    try {
        const db = await connectToDatabase();
        const emasCol = db.collection('emas');

        await emasCol.insertOne({
            session_id,
            participant_id: participant_code,
            character_count,
            valence,
            arousal,
            timestamp_rel_ms: Date.now()
        });

        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to store EMA' });
    }
});

// POST /session/end
app.post('/session/end', async (req, res) => {
    const { session_id, participant_code, engagement_rating, text_final } = req.body;

    // Capture fingerprint for session-lock identification
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';

    try {
        const db = await connectToDatabase();

        // Update Session
        await db.collection('sessions').updateOne(
            { session_id: session_id },
            { $set: { engagement_rating, text_final, status: 'completed', completed_at: new Date() } }
        );

        const participant = await db.collection('participants').findOne({ participant_id: participant_code });
        const sessionsBeforeEnd = participant?.sessions_completed || 0;

        const participantUpdate = { $inc: { sessions_completed: 1 } };
        if (sessionsBeforeEnd === 0) {
            participantUpdate.$set = { fingerprint: { ip, user_agent: ua, captured_at: new Date() } };
        }

        // Update Participant incrementing completed sessions
        await db.collection('participants').updateOne(
            { participant_id: participant_code },
            participantUpdate
        );

        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

// POST /unlock/:code
app.post('/unlock/:code', async (req, res) => {
    const { code } = req.params;
    const { secret } = req.body || {};
    const UNLOCK_SECRET = process.env.UNLOCK_SECRET || 'tita-admin';
    if (secret !== UNLOCK_SECRET) return res.status(403).json({ error: 'Forbidden' });
    try {
        const db = await connectToDatabase();
        const result = await db.collection('participants').updateOne(
            { participant_id: code },
            { $set: { session2_unlocked: true, unlocked_at: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Participant not found' });
        res.json({ ok: true, participant_id: code, session2_unlocked: true });
    } catch (error) {
        res.status(500).json({ error: 'DB error' });
    }
});

module.exports = app;
