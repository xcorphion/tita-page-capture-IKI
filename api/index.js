const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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
    const promptText = "Descreva uma decisão difícil que você tomou recentemente — o que você sentiu enquanto decidia, não apenas o que decidiu.";

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
    try {
        const db = await connectToDatabase();

        // Update Session
        await db.collection('sessions').updateOne(
            { session_id: session_id },
            { $set: { engagement_rating, text_final, status: 'completed', completed_at: new Date() } }
        );

        // Update Participant incrementing completed sessions
        await db.collection('participants').updateOne(
            { participant_id: participant_code },
            { $inc: { sessions_completed: 1 } }
        );

        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

module.exports = app;
