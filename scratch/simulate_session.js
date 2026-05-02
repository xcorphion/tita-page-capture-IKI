const { hashParticipantId } = require('../lib/participant');
require('dotenv').config();

async function runTest() {
    const code = 'TEST1';
    const participant_id = hashParticipantId(code);
    const appUrl = 'https://tita-page-capture-iki.vercel.app'; // Or localhost if running

    console.log('--- Phase 1: Onboarding ---');
    await fetch(`${appUrl}/api/participant/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wpm_baseline: 45, device_profile: { test: true } })
    });

    console.log('--- Phase 2: Start Session ---');
    const startRes = await fetch(`${appUrl}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_code: code, prompt_id: 1, jitter_benchmark_ms: 5 })
    });
    const startData = await startRes.json();
    const sessionId = startData.session_id;
    console.log('Session ID:', sessionId);

    console.log('--- Phase 3: Send Events ---');
    const events = [];
    for (let i = 0; i < 10; i++) {
        events.push({
            event_type: 'keydown',
            key_code: 'KeyA',
            timestamp_rel_ms: i * 100,
            timestamp_abs_ms: Date.now() + (i * 100),
            event_repeat: false
        });
    }
    await fetch(`${appUrl}/api/events/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, participant_code: code, events })
    });

    console.log('--- Phase 4: Send EMA ---');
    await fetch(`${appUrl}/api/ema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            participant_code: code,
            character_count: 10,
            valence: 70,
            arousal: 40,
            timestamp_rel_ms: 1000,
            prompt_index: 0
        })
    });

    console.log('--- Phase 5: End Session ---');
    await fetch(`${appUrl}/api/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            participant_code: code,
            engagement_rating: 5,
            engagement_genuine: true,
            text_final: 'Test text'
        })
    });

    console.log('--- Test Complete ---');
}

runTest().catch(console.error);
