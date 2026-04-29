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

        // ── #3 Jitter Benchmark (Obrigatório) ──────────────────────────────────
        // Mede a latência do loop de eventos do navegador.
        // Retorna o desvio médio em ms. Descarte se > 30ms.
        async function runJitterBenchmark() {
            const timestamps = [];
            // Simula 12 keydowns sintéticos com espaçamento de 200ms
            for (let i = 0; i < 12; i++) {
                await new Promise(r => setTimeout(r, 200));
                timestamps.push(performance.now());
            }
            const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
            const deviations = intervals.map(v => Math.abs(v - 200));
            const avgJitter = deviations.reduce((a, b) => a + b, 0) / deviations.length;
            return Math.round(avgJitter);
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

            if (e.type === 'keydown') {
                // #4.1 — count chars excluding Backspace/Delete for EMA trigger
                if (e.code !== 'Backspace' && e.code !== 'Delete' && e.key.length === 1) {
                    charsTypedInCurrentSegment++;
                }
            }

            if (e.type === 'keyup') {
                const currentLen = writingArea.value.length;
                const counter = document.getElementById('char-counter');
                if (counter) counter.innerText = `${currentLen} caracteres`;
                
                // #4.1 — EMA triggered by every 200 non-correction chars typed
                if (charsTypedInCurrentSegment >= EMA_CHAR_INTERVAL) {
                    triggerEMA(currentLen);
                    charsTypedInCurrentSegment = 0; // Reset for next segment
                }
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

        let currentPromptIndex = 0;       // #4.3 — track which prompt (0, 1, 2)
        let charsTypedInCurrentSegment = 0; // #4.1 — count chars excluding Backspace/Delete

        // ── Session start ────────────────────────────────────────────────────────
        async function startSession(promptId) {
            // #3 — run real jitter benchmark before session starts
            const jitter_benchmark_ms = await runJitterBenchmark();

            // #3 — Rule: Descarte se jitter > 30ms
            if (jitter_benchmark_ms > 30) {
                alert(`Qualidade de sinal insuficiente (Jitter: ${jitter_benchmark_ms}ms). Por favor, use um dispositivo mais potente ou feche outras abas.`);
                return;
            }

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

        // ── #7 Onboarding Logic ──────────────────────────────────────────────
        function captureDeviceProfile() {
            return {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                touchPoints: navigator.maxTouchPoints,
                screenWidth: window.screen.width,
                captured_at: new Date()
            };
        }

        let wpmStartTime = 0;
        let wpmInterval = null;
        const wpmInput = document.getElementById('wpm-input');

        function startWPMTest() {
            wpmStartTime = Date.now();
            wpmInterval = setInterval(() => {
                const elapsed = (Date.now() - wpmStartTime) / 1000;
                const remaining = Math.max(0, 60 - Math.floor(elapsed));
                document.getElementById('wpm-timer').innerText = `Tempo: ${remaining}s`;

                // Calculate WPM: (chars / 5) / (minutes)
                const chars = wpmInput.value.length;
                const currentWPM = Math.round((chars / 5) / (elapsed / 60)) || 0;
                document.getElementById('wpm-counter').innerText = `${currentWPM} WPM`;

                if (remaining <= 0) {
                    clearInterval(wpmInterval);
                    finishOnboarding(currentWPM);
                }
            }, 500);
        }

        wpmInput?.addEventListener('focus', () => {
            if (!wpmStartTime) startWPMTest();
        }, { once: true });

        async function finishOnboarding(wpmBaseline) {
            const deviceProfile = captureDeviceProfile();
            try {
                await fetch(`/api/participant/${participantCode}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wpm_baseline: wpmBaseline, device_profile: deviceProfile })
                });
                document.getElementById('onboarding-container').classList.add('hidden');
                startSession(1); // Start first session after onboarding
            } catch (e) { console.error('Onboarding save failed', e); }
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

                // Check if needs onboarding
                if (data.sessions_completed === 0 && !data.onboarding_complete) {
                    loginContainer.classList.add('hidden');
                    document.getElementById('onboarding-container').classList.remove('hidden');
                } else {
                    startSession(data.next_prompt_id);
                }
            } catch (e) { document.getElementById('login-msg').innerText = 'Erro ao conectar ao servidor.'; }
        });

        document.getElementById('btn-consent-agree').addEventListener('click', () => {
            document.getElementById('consent-step').classList.add('hidden');
            document.getElementById('wpm-step').classList.remove('hidden');
        });

        writingArea?.addEventListener('keydown', handleKey);
        writingArea?.addEventListener('keyup', handleKey);

        // ── EMA submit ───────────────────────────────────────────────────────────
        // #1 — timestamp_rel_ms is calculated here in the browser and sent to API
        let emasInCurrentSegment = 0;

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
                        timestamp_rel_ms,
                        prompt_index: currentPromptIndex // #4.3 — required field
                    })
                });
                emaOverlay.classList.add('hidden');
                writingArea.disabled = false;
                writingArea.focus();

                emasInCurrentSegment++;
                
                // #4.1 — 3 EMAs per segment (prompt)
                if (emasInCurrentSegment >= 3) {
                    emasInCurrentSegment = 0;
                    currentPromptIndex++;
                    
                    if (currentPromptIndex >= 3) {
                        // All 3 segments (9 EMAs total) completed
                        triggerEnd();
                    } else {
                        // Move to next prompt segment
                        alert(`Segmento ${currentPromptIndex} concluído. Continue escrevendo sobre o mesmo tema ou aprofunde seu relato.`);
                        // Note: In a real multi-prompt scenario, we'd update promptText here.
                        // For now, we'll maintain the current standardized prompt for all segments.
                    }
                }
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
            {/* ── Onboarding ── */}
            <div id="onboarding-container" className="hidden center-container" style={{ maxWidth: 600 }}>
                {/* Step 1: LGPD Consent */}
                <div id="consent-step">
                    <h2 className="icon-text"><i className="ph ph-shield-check"></i> Termo de Consentimento</h2>
                    <div style={{ textAlign: 'left', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 8, margin: '20px 0', lineHeight: 1.6 }}>
                        <p><strong>1. Finalidade:</strong> Seus dados de digitação serão usados exclusivamente para treinar modelos de ML para detecção de estados emocionais. Não haverá identificação pessoal.</p>
                        <p><strong>2. Anonimização:</strong> Seu ID é um hash criptográfico sem relação com seus dados pessoais.</p>
                        <p><strong>3. Retirada:</strong> Você pode solicitar a exclusão dos seus dados a qualquer momento.</p>
                        <p><strong>4. Uso em ML:</strong> Os dados anonimizados podem ser compartilhados em repositórios científicos públicos.</p>
                        <p><strong>5. Retenção:</strong> Os dados serão mantidos por até 5 anos para fins de pesquisa.</p>
                    </div>
                    <button id="btn-consent-agree" className="icon-btn">ACEITO E DESEJO CONTINUAR</button>
                </div>

                {/* Step 2: WPM Test */}
                <div id="wpm-step" className="hidden">
                    <h2 className="icon-text"><i className="ph ph-keyboard"></i> Teste de Velocidade</h2>
                    <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Para calibrar o sistema, digite o texto abaixo o mais rápido e preciso que puder por 60 segundos.</p>
                    <div id="wpm-text-to-copy" style={{ background: '#111', padding: 15, borderRadius: 8, margin: '15px 0', fontStyle: 'italic', border: '1px solid #333' }}>
                        "A técnica de Keystroke Dynamics estuda o ritmo individual de digitação. Cada pessoa possui um padrão único de pressionamento e liberação de teclas, que pode revelar estados cognitivos e emocionais subjacentes durante o processo de escrita criativa ou técnica."
                    </div>
                    <textarea id="wpm-input" placeholder="Comece a digitar aqui para iniciar o cronômetro..." style={{ height: 120, width: '100%' }}></textarea>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                        <span id="wpm-timer" style={{ color: '#7c6fff', fontWeight: 'bold' }}>Tempo: 60s</span>
                        <span id="wpm-counter">0 WPM</span>
                    </div>
                </div>
            </div>

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
