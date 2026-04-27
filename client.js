const API_BASE = ''; // Same origin

let participantCode = '';
let sessionId = '';
let eventBuffer = [];
let lastBatchTime = Date.now();
let charCountAtLastEMA = 0;
const EMA_INTERVAL = 200;
const BATCH_SIZE = 50;
const BATCH_TIMEOUT = 5000;

const loginContainer = document.getElementById('login-container');
const studyContainer = document.getElementById('study-container');
const writingArea = document.getElementById('writing-area');
const emaOverlay = document.getElementById('ema-overlay');
const endOverlay = document.getElementById('end-overlay');
const promptText = document.getElementById('prompt-text');

// Login
document.getElementById('btn-login').addEventListener('click', async () => {
    const codeInput = document.getElementById('participant-code');
    participantCode = codeInput.value.toUpperCase().trim();

    if (participantCode.length !== 5) {
        document.getElementById('login-msg').innerText = 'Código inválido (5 caracteres).';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/participant/${participantCode}`);
        const data = await res.json();

        if (data.sessions_completed >= 3) {
            document.getElementById('login-msg').innerText = 'Máximo de sessões atingido.';
            return;
        }

        startSession(data.next_prompt_id);
    } catch (e) {
        console.error(e);
        document.getElementById('login-msg').innerText = 'Erro ao conectar ao servidor.';
    }
});

async function startSession(promptId) {
    try {
        const res = await fetch(`${API_BASE}/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participant_code: participantCode, prompt_id: promptId, jitter_benchmark_ms: 0 })
        });
        const data = await res.json();

        sessionId = data.session_id;
        promptText.innerText = data.prompt_text;

        loginContainer.classList.add('hidden');
        studyContainer.classList.remove('hidden');
        writingArea.focus();

        // Start checking for batch timeout
        setInterval(checkBatchTimeout, 1000);
    } catch (e) {
        console.error(e);
    }
}

// Event Capture
writingArea.addEventListener('keydown', handleKey);
writingArea.addEventListener('keyup', handleKey);

function handleKey(e) {
    const event = {
        event_type: e.type,
        key_code: e.code,
        timestamp_rel_ms: Math.round(e.timeStamp)
    };

    eventBuffer.push(event);

    if (eventBuffer.length >= BATCH_SIZE) {
        sendBatch();
    }

    // EMA Trigger check on keyup
    if (e.type === 'keyup') {
        const currentLen = writingArea.value.length;
        if (currentLen - charCountAtLastEMA >= EMA_INTERVAL) {
            triggerEMA(currentLen);
        }
    }
}

async function sendBatch() {
    if (eventBuffer.length === 0) return;

    const batch = [...eventBuffer];
    eventBuffer = [];
    lastBatchTime = Date.now();

    try {
        await fetch(`${API_BASE}/events/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, participant_code: participantCode, events: batch })
        });
    } catch (e) {
        console.error('Batch error:', e);
        // Push back to buffer or log? For now just log.
    }
}

function checkBatchTimeout() {
    if (Date.now() - lastBatchTime >= BATCH_TIMEOUT) {
        sendBatch();
    }
}

// EMA
function triggerEMA(charCount) {
    writingArea.disabled = true;
    emaOverlay.classList.remove('hidden');
    charCountAtLastEMA = charCount;
}

document.getElementById('btn-ema-submit').addEventListener('click', async () => {
    const valence = document.getElementById('valence-slider').value;
    const arousal = document.getElementById('arousal-slider').value;

    try {
        await fetch(`${API_BASE}/ema`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                participant_code: participantCode,
                character_count: writingArea.value.length,
                valence: parseInt(valence),
                arousal: parseInt(arousal)
            })
        });

        emaOverlay.classList.add('hidden');
        writingArea.disabled = false;
        writingArea.focus();

        // Check if finished (mock check - user didn't specify exact length, but usually session ends after time or goal)
        // For this demo, let's say after 600 chars we end.
        if (writingArea.value.length >= 600) {
            triggerEnd();
        }
    } catch (e) {
        console.error(e);
    }
});

function triggerEnd() {
    writingArea.disabled = true;
    endOverlay.classList.remove('hidden');
}

document.getElementById('btn-engaged-yes').addEventListener('click', () => endSession(true));
document.getElementById('btn-engaged-no').addEventListener('click', () => endSession(false));

async function endSession(engaged) {
    try {
        await fetch(`${API_BASE}/session/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                participant_code: participantCode,
                engagement_rating: engaged,
                text_final: writingArea.value
            })
        });

        endOverlay.classList.add('hidden');
        document.getElementById('final-screen').classList.remove('hidden');
        writingArea.classList.add('hidden');
        document.getElementById('prompt-box').classList.add('hidden');
    } catch (e) {
        console.error(e);
    }
}
