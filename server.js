const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db } = require('./firestore');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper to get participant ref
const getParticipantRef = (code) => db.collection('participants').doc(code);

// Routes
app.get('/favicon.ico', (req, res) => res.status(204).end());

// GET /participant/:code
app.get('/participant/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const participantRef = getParticipantRef(code);
        const doc = await participantRef.get();

        if (!doc.exists) {
            // Initialize participant if not exists
            await participantRef.set({
                participant_id: code,
                sessions_completed: 0,
                created_at: new Date()
            });
            return res.json({ participant_id: code, sessions_completed: 0, next_prompt_id: 1 });
        }

        const data = doc.data();
        const sessionsCompleted = data.sessions_completed || 0;

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
        const sessionRef = getParticipantRef(participant_code).collection('sessions').doc(sessionId);
        await sessionRef.set({
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
    const { session_id, participant_code, events } = req.body; // Added participant_code for path
    try {
        const batch = db.batch();
        const eventsRef = getParticipantRef(participant_code).collection('sessions').doc(session_id).collection('events');

        events.forEach(event => {
            const docRef = eventsRef.doc();
            batch.set(docRef, {
                event_type: event.event_type,
                key_code: event.key_code,
                timestamp_rel_ms: event.timestamp_rel_ms
            });
        });

        await batch.commit();
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
        const emaRef = getParticipantRef(participant_code).collection('sessions').doc(session_id).collection('emas').doc();
        await emaRef.set({
            character_count,
            valence,
            arousal,
            timestamp_rel_ms: Date.now() // Relative to session start would be better if passed from client
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
        const participantRef = getParticipantRef(participant_code);
        const sessionRef = participantRef.collection('sessions').doc(session_id);

        await sessionRef.update({
            engagement_rating,
            text_final,
            status: 'completed',
            completed_at: new Date()
        });

        // Increment completed sessions
        const doc = await participantRef.get();
        const currentCompleted = doc.data().sessions_completed || 0;
        await participantRef.update({
            sessions_completed: currentCompleted + 1
        });

        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
