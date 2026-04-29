import Head from 'next/head';
import { useEffect } from 'react';

export default function Home() {
    useEffect(() => {
        // Load Phosphor Icons
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@phosphor-icons/web';
        document.head.appendChild(script);

        // ── State ────────────────────────────────────────────────────────────────
        let participantCode = '';
        let sessionId = '';
        let sessionStartEpochMs = 0;      // Date.now() at session start (for abs timestamps)
        let sessionStartHighRes = 0;      // performance.now() at session start (for rel timestamps)
        let eventBuffer = [];
        let lastBatchTime = Date.now();
        let charCountAtLastEMA = 0;
        const EMA_CHAR_INTERVAL = 200;    // #3 — trigger EMA every 200 chars typed
        const BATCH_SIZE = 50;            // #7 — batch 50 events
        const BATCH_TIMEOUT = 5000;       // #7 — or every 5 seconds

        const loginContainer = document.getElementById('login-container');
        const studyContainer = document.getElementById('study-container');
        const writingArea = document.getElementById('writing-area');
        const emaOverlay = document.getElementById('ema-overlay');
        const endOverlay = document.getElementById('end-overlay');
        const promptText = document.getElementById('prompt-text');

        // ── #5 Jitter Benchmark ──────────────────────────────────────────────────
        // Runs 10 synthetic keydown dispatches and measures the round-trip time.
        // Returns average latency in ms (float, rounded to 3 decimals).
        async function runJitterBenchmark() {
            const times = [];
            // Temporary no-op listener so the event actually propagates
            const noop = () => {};
            document.addEventListener('keydown', noop, { capture: true });
            for (let i = 0; i < 10; i++) {
                const t0 = performance.now();
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', code: 'KeyJ', bubbles: true }));
                times.push(performance.now() - t0);
                // Small gap between synthetic events
                await new Promise(r => setTimeout(r, 5));
            }
            document.removeEventListener('keydown', noop, { capture: true });
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            return Math.round(avg * 1000) / 1000; // 3 decimal places
        }

        // ── #7 Batch flush ───────────────────────────────────────────────────────
        async function sendBatch() {
            if (eventBuffer.length === 0) return;
            const batch = [...eventBuffer];
            eventBuffer = [];
            lastBatchTime = Date.now();
            try {
                await fetch('/api/events/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId, participant_code: participantCode, events: batch })
                });
            } catch (e) { console.error('Batch error:', e); }
        }

        function checkBatchTimeout() {
            if (Date.now() - lastBatchTime >= BATCH_TIMEOUT) sendBatch();
        }

        // ── #6 #8 #9 #10 Event capture ───────────────────────────────────────────
        // • Uses event.timeStamp (DOMHighResTimeStamp, monotonic ~1ms resolution)
        // • Captures event.code (layout-independent)
        // • Records event.repeat to flag held keys
        // • Does NOT filter Backspace / Delete — post-processing concern
        function handleKey(e) {
            if (!sessionId) return;

            // #1/#12 — timestamp_rel_ms calculated in browser, never on server
            const timestamp_rel_ms = Math.round(e.timeStamp - sessionStartHighRes);
            // timestamp_abs_ms = epoch at session start + relative offset
            const timestamp_abs_ms = sessionStartEpochMs + timestamp_rel_ms;

            const event = {
                event_type: e.type,
                key_code: e.code,           // #8 — event.code, not event.key
                timestamp_rel_ms,           // #12 — calculated client-side
                timestamp_abs_ms,           // #11 — abs for cross-stream correlation
                event_repeat: e.repeat      // #9 — flag held keys
            };
            eventBuffer.push(event);
            if (eventBuffer.length >= BATCH_SIZE) sendBatch(); // #7

            if (e.type === 'keyup') {
                const currentLen = writingArea.value.length;
                const counter = document.getElementById('char-counter');
                if (counter) counter.innerText = `${currentLen} caracteres`;
                // #3 — EMA triggered by character count, not time
                if (currentLen - charCountAtLastEMA >= EMA_CHAR_INTERVAL) triggerEMA(currentLen);
            }
        }

        function triggerEMA(charCount) {
            writingArea.disabled = true;
            // Reset sliders to 50 (neutral) on each EMA
            document.getElementById('valence-slider').value = 50;
            document.getElementById('arousal-slider').value = 50;
            emaOverlay.classList.remove('hidden');
            charCountAtLastEMA = charCount;
        }

        function triggerEnd() {
            writingArea.disabled = true;
            endOverlay.classList.remove('hidden');
        }

        // ── Session start ────────────────────────────────────────────────────────
        async function startSession(promptId) {
            // #5 — run real jitter benchmark before session starts
            const jitter_benchmark_ms = await runJitterBenchmark();

            try {
                const res = await fetch('/api/session/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ participant_code: participantCode, prompt_id: promptId, jitter_benchmark_ms })
                });
                const data = await res.json();
                sessionId = data.session_id;
                sessionStartEpochMs = data.session_start_epoch_ms;   // epoch from server
                sessionStartHighRes = performance.now();               // local monotonic anchor

                promptText.innerText = data.prompt_text;
                loginContainer.classList.add('hidden');
                studyContainer.classList.remove('hidden');
                writingArea.focus();
                setInterval(checkBatchTimeout, 1000); // #7 — periodic batch flush
            } catch (e) { console.error(e); }
        }

        // ── Session end ──────────────────────────────────────────────────────────
        // #2  engagement_rating: integer 1–5 (stored in closure from rating step)
        // #15 engagement_genuine: boolean from binary question
        let pendingEngagementRating = null;

        async function endSession(engagementRating, engagementGenuine) {
            // Flush any remaining events before ending
            await sendBatch();
            try {
                await fetch('/api/session/end', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: sessionId,
                        participant_code: participantCode,
                        engagement_rating: engagementRating,     // #2 — int 1–5
                        engagement_genuine: engagementGenuine,   // #15 — boolean
                        text_final: writingArea.value
                    })
                });
                endOverlay.classList.add('hidden');
                document.getElementById('final-screen').classList.remove('hidden');
                writingArea.classList.add('hidden');
                document.getElementById('prompt-box').classList.add('hidden');
                document.getElementById('char-counter').classList.add('hidden');
            } catch (e) { console.error(e); }
        }

        // ── Login ────────────────────────────────────────────────────────────────
        document.getElementById('btn-login').addEventListener('click', async () => {
            const codeInput = document.getElementById('participant-code');
            participantCode = codeInput.value.toUpperCase().trim();
            if (participantCode.length !== 5) {
                document.getElementById('login-msg').innerText = 'Código inválido (5 caracteres).'; return;
            }
            try {
                const res = await fetch(`/api/participant/${participantCode}`);
                const data = await res.json();
                if (data.sessions_completed >= 3) {
                    document.getElementById('login-msg').innerText = 'Máximo de 3 sessões atingido.'; return;
                }
                if (data.locked) {
                    loginContainer.classList.add('hidden');
                    document.getElementById('locked-overlay').classList.remove('hidden');
                    return;
                }
                startSession(data.next_prompt_id);
            } catch (e) { document.getElementById('login-msg').innerText = 'Erro ao conectar ao servidor.'; }
        });

        writingArea?.addEventListener('keydown', handleKey);
        writingArea?.addEventListener('keyup', handleKey);

        // ── EMA submit ───────────────────────────────────────────────────────────
        // #1 — timestamp_rel_ms is calculated here in the browser and sent to API
        document.getElementById('btn-ema-submit').addEventListener('click', async () => {
            const valence = parseInt(document.getElementById('valence-slider').value);
            const arousal = parseInt(document.getElementById('arousal-slider').value);
            // #1/#12 — timestamp_rel_ms relative to session start, calculated client-side
            const timestamp_rel_ms = Math.round(performance.now() - sessionStartHighRes);
            try {
                await fetch('/api/ema', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: sessionId,
                        participant_code: participantCode,
                        character_count: writingArea.value.length,
                        valence,
                        arousal,
                        timestamp_rel_ms  // #1 — sent from browser, NOT computed on server
                    })
                });
                emaOverlay.classList.add('hidden');
                writingArea.disabled = false;
                writingArea.focus();
                if (writingArea.value.length >= 600) triggerEnd();
            } catch (e) { console.error(e); }
        });

        // ── End overlay — two-step: rating (1–5) then genuine (binary) ───────────
        // Step 1: rating buttons 1–5 — #2
        for (let r = 1; r <= 5; r++) {
            document.getElementById(`btn-rating-${r}`)?.addEventListener('click', () => {
                pendingEngagementRating = r;
                // Show genuine question, hide rating step
                document.getElementById('rating-step').classList.add('hidden');
                document.getElementById('genuine-step').classList.remove('hidden');
            });
        }
        // Step 2: binary genuine question — #15
        document.getElementById('btn-engaged-yes')?.addEventListener('click', () => endSession(pendingEngagementRating, true));
        document.getElementById('btn-engaged-no')?.addEventListener('click', () => endSession(pendingEngagementRating, false));

    }, []);

    return (
        <>
            <Head>
                <title>Titã — Estudo Somático</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" href="data:," />
            </Head>

            {/* ── Login ── */}
            <div id="login-container" className="center-container">
                <div style={{ maxWidth: 420, marginBottom: 28, padding: '18px 22px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, borderLeft: '3px solid #7c6fff', textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Experimento Anônimo</p>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.55 }}>
                        Você vai escrever por alguns minutos sobre uma decisão pessoal difícil.
                        Duas vezes durante a escrita, vamos pausar para você registrar como está se sentindo — dois controles deslizantes, sem categorias.
                    </p>
                    <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: '#888' }}>Nenhum dado identificável é coletado. Seu código é o único vínculo. Meta: 3 sessões em dias diferentes.</p>
                </div>
                <h1 className="icon-text"><i className="ph ph-fingerprint"></i> LOGIN</h1>
                <p>Insira seu código de participante:</p>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <i className="ph ph-identification-card" style={{ position: 'absolute', left: 10, fontSize: 20, color: '#555' }}></i>
                    <input type="text" id="participant-code" maxLength={5} placeholder="XXXXX" style={{ paddingLeft: 36 }} />
                </div>
                <button id="btn-login" className="icon-btn"><i className="ph ph-sign-in"></i> ENTRAR</button>
                <p id="login-msg"></p>
            </div>

            {/* ── Study container ── */}
            <div id="study-container" className="hidden">
                {/* #14 — prompt is now set dynamically by the server (standardized text) */}
                <div id="prompt-box">
                    <h3 className="icon-text" style={{ marginBottom: 10 }}><i className="ph ph-brain"></i> Tema de Hoje</h3>
                    <p id="prompt-text"></p>
                </div>

                <textarea id="writing-area" placeholder="Comece a digitar aqui..."></textarea>
                <div id="char-counter" style={{ textAlign: 'right', fontSize: '0.8rem', color: '#888', marginTop: 4 }}>0 caracteres</div>

                {/* ── #4 EMA overlay — two sliders, no emotion labels ── */}
                <div id="ema-overlay" className="hidden">
                    <div id="ema-box">
                        <h3 className="icon-text"><i className="ph ph-heart-beat"></i> Pausa rápida</h3>

                        {/* Valence slider — #4 */}
                        <div className="slider-group">
                            <div className="slider-labels">
                                <span>muito negativo</span>
                                <span>muito positivo</span>
                            </div>
                            <input type="range" id="valence-slider" min="0" max="100" defaultValue="50" />
                        </div>

                        {/* Arousal slider — #4 */}
                        <div className="slider-group">
                            <div className="slider-labels">
                                <span>muito calmo</span>
                                <span>muito agitado</span>
                            </div>
                            <input type="range" id="arousal-slider" min="0" max="100" defaultValue="50" />
                        </div>

                        <button id="btn-ema-submit" className="icon-btn">CONTINUAR <i className="ph ph-arrow-right"></i></button>
                    </div>
                </div>

                {/* ── End overlay — two steps ── */}
                <div id="end-overlay" className="hidden">
                    <div id="end-box">
                        {/* Step 1: engagement rating 1–5 — #2 */}
                        <div id="rating-step">
                            <p className="icon-text" style={{ marginBottom: 8 }}><i className="ph ph-star"></i> Como foi sua experiência de escrita?</p>
                            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: 18 }}>1 = muito ruim &nbsp;·&nbsp; 5 = muito boa</p>
                            <div className="btn-group">
                                {[1, 2, 3, 4, 5].map(r => (
                                    <button key={r} id={`btn-rating-${r}`} className="icon-btn" style={{ minWidth: 42 }}>{r}</button>
                                ))}
                            </div>
                        </div>
                        {/* Step 2: genuine engagement binary — #15 */}
                        <div id="genuine-step" className="hidden">
                            <p className="icon-text" style={{ marginBottom: 8 }}><i className="ph ph-question"></i> Você estava genuinamente engajado ao escrever?</p>
                            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: 18 }}>Suas palavras vinham de um lugar real — não era só cumprir a tarefa.</p>
                            <div className="btn-group">
                                <button id="btn-engaged-yes" className="icon-btn"><i className="ph ph-check-circle"></i> SIM</button>
                                <button id="btn-engaged-no" className="icon-btn"><i className="ph ph-x-circle"></i> NÃO</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="final-screen" className="hidden">
                    <h2 className="icon-text"><i className="ph ph-confetti"></i> Sessão Concluída</h2>
                    <p>Obrigado pela sua participação. Volte em outro dia para a próxima sessão.</p>
                    {/* #16 — reinforce 3-session goal */}
                    <p style={{ fontSize: '0.82rem', color: '#888' }}>Meta: 3 sessões em dias diferentes.</p>
                </div>

                {/* #16 — updated lock message for 3-session protocol */}
                <div id="locked-overlay" className="hidden">
                    <div id="end-box">
                        <h3 className="icon-text"><i className="ph ph-lock"></i> Aguardando Liberação</h3>
                        <p>Sua sessão anterior foi concluída. A próxima sessão será liberada pelo pesquisador. Volte em outro dia.</p>
                        <p style={{ fontSize: '0.82rem', color: '#888' }}>Meta: 3 sessões em dias diferentes.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
