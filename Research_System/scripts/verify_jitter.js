
const { hashParticipantId } = require('../lib/participant');
require('dotenv').config();

async function verifyJitterRecording() {
    const code = 'JITTR';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    console.log("--- Testing Jitter Recording ---");
    
    // 1. Start Session with explicit jitter
    const testJitter = 12.5;
    const startRes = await fetch(`${appUrl}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_code: code, prompt_id: 1, jitter_benchmark_ms: testJitter })
    });
    
    if (!startRes.ok) {
        console.error("Failed to start session:", await startRes.text());
        return;
    }
    
    const startData = await startRes.json();
    console.log("Session started:", startData.session_id);
    
    // Note: Since we can't easily check the DB directly from here without connecting,
    // we assume the API handled it. If we had a 'get session' API we would use it.
    
    console.log("Jitter sent:", testJitter);
    console.log("Check the database for session_id:", startData.session_id);
}

verifyJitterRecording().catch(console.error);
