import Head from 'next/head';
import { useEffect } from 'react';

export default function Home() {
    useEffect(() => {
        // Load Phosphor Icons
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@phosphor-icons/web';
        document.head.appendChild(script);

        // Client logic
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

        function handleKey(e) {
            if (!sessionId) return;
            const event = { event_type: e.type, key_code: e.code, timestamp_rel_ms: Math.round(e.timeStamp) };
            eventBuffer.push(event);
            if (eventBuffer.length >= BATCH_SIZE) sendBatch();
            if (e.type === 'keyup') {
                const currentLen = writingArea.value.length;
                // Update live character counter
                const counter = document.getElementById('char-counter');
                if (counter) counter.innerText = `${currentLen} caracteres`;
                if (currentLen - charCountAtLastEMA >= EMA_INTERVAL) triggerEMA(currentLen);
            }
        }

        function triggerEMA(charCount) {
            writingArea.disabled = true;
            emaOverlay.classList.remove('hidden');
            charCountAtLastEMA = charCount;
        }

        function triggerEnd() {
            writingArea.disabled = true;
            endOverlay.classList.remove('hidden');
        }

        async function startSession(promptId) {
            try {
                const res = await fetch('/api/session/start', {
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
                setInterval(checkBatchTimeout, 1000);
            } catch (e) { console.error(e); }
        }

        async function endSession(engaged) {
            try {
                await fetch('/api/session/end', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId, participant_code: participantCode, engagement_rating: engaged, text_final: writingArea.value })
                });
                endOverlay.classList.add('hidden');
                document.getElementById('final-screen').classList.remove('hidden');
                writingArea.classList.add('hidden');
                document.getElementById('prompt-box').classList.add('hidden');
            } catch (e) { console.error(e); }
        }

        // Login
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
                    document.getElementById('login-msg').innerText = 'Máximo de sessões atingido.'; return;
                }
                if (data.locked) {
                    // Session 2 locked — show locked overlay and reveal fingerprint info
                    loginContainer.classList.add('hidden');
                    document.getElementById('locked-overlay').classList.remove('hidden');
                    return;
                }
                startSession(data.next_prompt_id);
            } catch (e) { document.getElementById('login-msg').innerText = 'Erro ao conectar ao servidor.'; }
        });

        writingArea?.addEventListener('keydown', handleKey);
        writingArea?.addEventListener('keyup', handleKey);

        document.getElementById('btn-ema-submit').addEventListener('click', async () => {
            const valence = document.getElementById('valence-slider').value;
            const arousal = document.getElementById('arousal-slider').value;
            try {
                await fetch('/api/ema', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId, participant_code: participantCode, character_count: writingArea.value.length, valence: parseInt(valence), arousal: parseInt(arousal) })
                });
                emaOverlay.classList.add('hidden');
                writingArea.disabled = false;
                writingArea.focus();
                if (writingArea.value.length >= 600) triggerEnd();
            } catch (e) { console.error(e); }
        });

        document.getElementById('btn-engaged-yes').addEventListener('click', () => endSession(true));
        document.getElementById('btn-engaged-no').addEventListener('click', () => endSession(false));
    }, []);

    return (
        <>
            <Head>
                <title>Tita — Estudo Somático</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" href="data:," />
            </Head>

            <div id="login-container" className="center-container">
                <div style={{ maxWidth: 420, marginBottom: 28, padding: '18px 22px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, borderLeft: '3px solid #7c6fff', textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Experimento Anônimo</p>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.55 }}>
                        Você vai escrever por alguns minutos sobre uma experiência pessoal.
                        Duas vezes durante a escrita, vamos pausar por 10 segundos para você registrar como está se sentindo — ação e emoção, não o enredo.
                    </p>
                    <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: '#888' }}>Nenhum dado identificável é coletado. Seu código é o único vínculo.</p>
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

            <div id="study-container" className="hidden">
                <div id="prompt-box">
                    <h3 className="icon-text" style={{ marginBottom: 10 }}><i className="ph ph-brain"></i> Tema de Hoje</h3>
                    <p id="prompt-text"></p>
                </div>

                <textarea id="writing-area" placeholder="Comece a digitar aqui..."></textarea>
                <div id="char-counter" style={{ textAlign: 'right', fontSize: '0.8rem', color: '#888', marginTop: 4 }}>0 caracteres</div>

                <div id="ema-overlay" className="hidden">
                    <div id="ema-box">
                        <h3 className="icon-text"><i className="ph ph-heart-beat"></i> Pausa rápida — como você está agora?</h3>
                        <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '-6px 0 14px' }}>Foque no que sente nesse momento. Não pense no contexto.</p>
                        <div className="slider-group">
                            <label className="icon-text"><i className="ph ph-smiley-sad"></i> O que sente? <i className="ph ph-smiley"></i></label>
                            <div className="slider-labels"><span>Ruim / Pesado</span><span>Bom / Leve</span></div>
                            <input type="range" id="valence-slider" min="0" max="100" defaultValue="50" />
                        </div>
                        <div className="slider-group">
                            <label className="icon-text"><i className="ph ph-moon"></i> Como está seu corpo? <i className="ph ph-lightning"></i></label>
                            <div className="slider-labels"><span>Paralisado / Lento</span><span>Agitado / Intenso</span></div>
                            <input type="range" id="arousal-slider" min="0" max="100" defaultValue="50" />
                        </div>
                        <button id="btn-ema-submit" className="icon-btn">CONTINUAR <i className="ph ph-arrow-right"></i></button>
                    </div>
                </div>

                <div id="end-overlay" className="hidden">
                    <div id="end-box">
                        <p className="icon-text" style={{ marginBottom: 8 }}><i className="ph ph-question"></i> Enquanto escrevia, você estava presente?</p>
                        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: 18 }}>Suas palavras vinham de um lugar real — não era só cumprir a tarefa.</p>
                        <div className="btn-group">
                            <button id="btn-engaged-yes" className="icon-btn"><i className="ph ph-check-circle"></i> SIM, estava</button>
                            <button id="btn-engaged-no" className="icon-btn"><i className="ph ph-x-circle"></i> NÃO, estava no automático</button>
                        </div>
                    </div>
                </div>

                <div id="final-screen" className="hidden">
                    <h2 className="icon-text"><i className="ph ph-confetti"></i> Sessão Concluída</h2>
                    <p>Obrigado pela sua participação.</p>
                </div>

                <div id="locked-overlay" className="hidden">
                    <div id="end-box">
                        <h3 className="icon-text"><i className="ph ph-lock"></i> Aguardando Liberação</h3>
                        <p>Sua 1ª sessão foi concluída. A 2ª sessão será liberada pelo pesquisador. Aguarde.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
