import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../src/components/xcorphion/Layout';

export default function IKIResearchPage() {
    const router = useRouter();
    const { respondentId } = router.query;
    const [status, setStatus] = useState('loading'); // loading, onboarding, writing, locked, completed
    const [participantData, setParticipantData] = useState(null);

    useEffect(() => {
        if (!respondentId) return;

        // Load Phosphor Icons
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@phosphor-icons/web';
        document.head.appendChild(script);

        // ── State Variables (Refactored for React) ────────────────────────────────
        let sessionId = '';
        let sessionStartEpochMs = 0;
        let sessionStartHighRes = 0;
        let eventBuffer = [];
        let lastBatchTime = Date.now();
        let currentPromptIndex = 0;
        let charsTypedInCurrentSegment = 0;
        let emasInCurrentSegment = 0;
        let pendingEngagementRating = null;

        const EMA_CHAR_INTERVAL = 200;
        const BATCH_SIZE = 50;
        const BATCH_TIMEOUT = 5000;

        const studyContainer = document.getElementById('study-container');
        const writingArea = document.getElementById('writing-area');
        const emaOverlay = document.getElementById('ema-overlay');
        const endOverlay = document.getElementById('end-overlay');
        const promptText = document.getElementById('prompt-text');

        // ── Helper Functions ──────────────────────────────────────────────────────

        async function runJitterBenchmark() {
            const samples = 24;
            const expectedInterval = 100;
            const delays = [];
            for (let i = 0; i < samples; i++) {
                const start = performance.now();
                await new Promise(r => setTimeout(r, expectedInterval));
                const end = performance.now();
                delays.push(Math.abs((end - start) - expectedInterval));
            }
            delays.sort((a, b) => a - b);
            const trimmed = delays.slice(0, Math.floor(samples * 0.75));
            return Math.max(1, Math.round(trimmed.reduce((a, b) => a + b) / trimmed.length));
        }

        async function sendBatch() {
            if (eventBuffer.length === 0) return;
            const batch = [...eventBuffer];
            eventBuffer = [];
            lastBatchTime = Date.now();
            try {
                await fetch('/api/events/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId, participant_code: respondentId, events: batch })
                });
            } catch (e) { console.error('Batch error:', e); }
        }

        function checkBatchTimeout() {
            if (Date.now() - lastBatchTime >= BATCH_TIMEOUT) sendBatch();
        }

        function handleKey(e) {
            if (!sessionId) return;
            const timestamp_rel_ms = Math.round(e.timeStamp - sessionStartHighRes);
            const event = {
                event_type: e.type,
                key_code: e.code,
                timestamp_rel_ms,
                timestamp_abs_ms: sessionStartEpochMs + timestamp_rel_ms,
                event_repeat: e.repeat
            };
            eventBuffer.push(event);
            if (eventBuffer.length >= BATCH_SIZE) sendBatch();

            if (e.type === 'keydown') {
                if (e.code !== 'Backspace' && e.code !== 'Delete' && e.key.length === 1) {
                    charsTypedInCurrentSegment++;
                }
            }

            if (e.type === 'keyup') {
                const currentLen = writingArea.value.length;
                const counter = document.getElementById('char-counter');
                if (counter) counter.innerText = `${currentLen} caracteres`;
                
                if (charsTypedInCurrentSegment >= EMA_CHAR_INTERVAL) {
                    writingArea.disabled = true;
                    document.getElementById('valence-slider').value = 50;
                    document.getElementById('arousal-slider').value = 50;
                    emaOverlay.classList.remove('hidden');
                    charsTypedInCurrentSegment = 0;
                }
            }
        }

        async function startSession(promptId) {
            const jitter = await runJitterBenchmark();
            if (jitter > 30) {
                alert(`Aviso: Qualidade de sinal baixa (Jitter: ${jitter}ms).`);
            }

            try {
                const res = await fetch('/api/session/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ participant_code: respondentId, prompt_id: promptId, jitter_benchmark_ms: jitter })
                });
                const data = await res.json();
                sessionId = data.session_id;
                sessionStartEpochMs = data.session_start_epoch_ms;
                sessionStartHighRes = performance.now();

                promptText.innerText = data.prompt_text;
                setStatus('writing');
                studyContainer.classList.remove('hidden');
                writingArea.focus();
                
                setInterval(checkBatchTimeout, 1000);
            } catch (e) { console.error(e); }
        }

        async function endSession(engagementRating, engagementGenuine) {
            await sendBatch();
            try {
                await fetch('/api/session/end', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: sessionId,
                        participant_code: respondentId,
                        engagement_rating: engagementRating,
                        engagement_genuine: engagementGenuine,
                        text_final: writingArea.value
                    })
                });
                setStatus('completed');
            } catch (e) { console.error(e); }
        }

        // ── Initialization Logic ──────────────────────────────────────────────────

        const checkParticipant = async () => {
            try {
                const res = await fetch(`/api/participant/${respondentId}`);
                const data = await res.json();
                setParticipantData(data);

                if (data.sessions_completed >= 3) {
                    setStatus('completed');
                    return;
                }
                if (data.locked) {
                    setStatus('locked');
                    return;
                }

                if (data.sessions_completed === 0 && !data.onboarding_complete) {
                    setStatus('onboarding');
                } else {
                    startSession(data.next_prompt_id || 1);
                }
            } catch (e) {
                console.error("Erro ao carregar participante", e);
                setStatus('error');
            }
        };

        checkParticipant();

        // ── Event Listeners (Setup via DOM since we're porting legacy code) ────────

        const setupListeners = () => {
            document.getElementById('btn-consent-agree')?.addEventListener('click', () => {
                document.getElementById('consent-step').classList.add('hidden');
                document.getElementById('wpm-step').classList.remove('hidden');
            });

            const wpmInput = document.getElementById('wpm-input');
            let wpmStartTime = 0;
            wpmInput?.addEventListener('focus', () => {
                if (wpmStartTime) return;
                wpmStartTime = Date.now();
                const interval = setInterval(() => {
                    const elapsed = (Date.now() - wpmStartTime) / 1000;
                    const remaining = Math.max(0, 60 - Math.floor(elapsed));
                    const timer = document.getElementById('wpm-timer');
                    if (timer) timer.innerText = `Tempo: ${remaining}s`;

                    const chars = wpmInput.value.length;
                    const currentWPM = Math.round((chars / 5) / (elapsed / 60)) || 0;
                    const counter = document.getElementById('wpm-counter');
                    if (counter) counter.innerText = `${currentWPM} WPM`;

                    if (remaining <= 0) {
                        clearInterval(interval);
                        finishOnboarding(currentWPM);
                    }
                }, 500);
            }, { once: true });

            async function finishOnboarding(wpmBaseline) {
                try {
                    await fetch(`/api/participant/${respondentId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            wpm_baseline: wpmBaseline, 
                            device_profile: { userAgent: navigator.userAgent, platform: navigator.platform } 
                        })
                    });
                    startSession(1);
                } catch (e) { console.error(e); }
            }

            writingArea?.addEventListener('keydown', handleKey);
            writingArea?.addEventListener('keyup', handleKey);

            document.getElementById('btn-ema-submit')?.addEventListener('click', async () => {
                const valence = parseInt(document.getElementById('valence-slider').value);
                const arousal = parseInt(document.getElementById('arousal-slider').value);
                const timestamp_rel_ms = Math.round(performance.now() - sessionStartHighRes);
                try {
                    await fetch('/api/ema', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            session_id: sessionId,
                            participant_code: respondentId,
                            character_count: writingArea.value.length,
                            valence,
                            arousal,
                            timestamp_rel_ms,
                            prompt_index: currentPromptIndex
                        })
                    });
                    emaOverlay.classList.add('hidden');
                    writingArea.disabled = false;
                    writingArea.focus();

                    emasInCurrentSegment++;
                    if (emasInCurrentSegment >= 3) {
                        emasInCurrentSegment = 0;
                        currentPromptIndex++;
                        if (currentPromptIndex >= 3) {
                            writingArea.disabled = true;
                            endOverlay.classList.remove('hidden');
                        } else {
                            alert(`Segmento ${currentPromptIndex} concluído. Continue.`);
                        }
                    }
                } catch (e) { console.error(e); }
            });

            for (let r = 1; r <= 5; r++) {
                document.getElementById(`btn-rating-${r}`)?.addEventListener('click', () => {
                    pendingEngagementRating = r;
                    document.getElementById('rating-step').classList.add('hidden');
                    document.getElementById('genuine-step').classList.remove('hidden');
                });
            }

            document.getElementById('btn-engaged-yes')?.addEventListener('click', () => endSession(pendingEngagementRating, true));
            document.getElementById('btn-engaged-no')?.addEventListener('click', () => endSession(pendingEngagementRating, false));
        };

        // Wait a bit for DOM to be ready
        const timeout = setTimeout(setupListeners, 500);
        return () => clearTimeout(timeout);

    }, [respondentId]);

    return (
        <Layout>
            <Head>
                <title>Unidade de Pesquisa IKI | XCORPION</title>
            </Head>

            <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center font-inter">
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B0000]"></div>
                        <span className="text-sm tracking-widest text-white/50 uppercase">Autenticando Identidade</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <h2 className="text-2xl font-space mb-4">Acesso Negado</h2>
                        <p className="text-white/50">Código de participante inválido ou expirado.</p>
                    </div>
                )}

                {status === 'onboarding' && (
                    <div id="onboarding-container" className="center-container" style={{ maxWidth: 600 }}>
                        <div id="consent-step">
                            <h2 className="icon-text"><i className="ph ph-shield-check"></i> Termo de Consentimento</h2>
                            <div className="text-left text-sm bg-white/5 p-6 rounded-xl my-6 leading-relaxed">
                                <p><strong>1. Finalidade:</strong> Seus dados de digitação serão usados exclusivamente para pesquisa científica sobre estados emocionais.</p>
                                <p><strong>2. Anonimização:</strong> Sua identidade permanece oculta através de criptografia.</p>
                                <p><strong>3. Voluntariado:</strong> Você pode interromper a qualquer momento.</p>
                            </div>
                            <button id="btn-consent-agree" className="icon-btn w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition">ACEITO E DESEJO CONTINUAR</button>
                        </div>

                        <div id="wpm-step" className="hidden">
                            <h2 className="icon-text"><i className="ph ph-keyboard"></i> Teste de Calibração</h2>
                            <p className="text-white/50 mb-6">Digite o texto abaixo o mais rápido e preciso que puder por 60 segundos.</p>
                            <div className="bg-[#111] p-6 rounded-xl mb-6 italic border border-white/10 text-white/80">
                                "A técnica de Keystroke Dynamics estuda o ritmo individual de digitação. Cada pessoa possui um padrão único de pressionamento e liberação de teclas."
                            </div>
                            <textarea id="wpm-input" className="w-full h-32 bg-black border border-white/20 rounded-xl p-4 text-white focus:border-[#8B0000] outline-none transition" placeholder="Comece a digitar aqui..."></textarea>
                            <div className="flex justify-between mt-4 font-mono text-xs tracking-widest">
                                <span id="wpm-timer" className="text-[#8B0000]">Tempo: 60s</span>
                                <span id="wpm-counter" className="text-white/40">0 WPM</span>
                            </div>
                        </div>
                    </div>
                )}

                <div id="study-container" className="hidden w-full max-w-4xl">
                    <div id="prompt-box" className="mb-8 border-b border-white/10 pb-6">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-[#8B0000] mb-2">Tema da Sessão</h3>
                        <p id="prompt-text" className="text-xl font-space leading-relaxed text-white/90"></p>
                    </div>

                    <textarea id="writing-area" className="w-full h-[50vh] bg-transparent border-none text-xl leading-relaxed text-white/80 outline-none resize-none" placeholder="Sua narrativa começa aqui..."></textarea>
                    <div id="char-counter" className="text-right text-[10px] font-mono text-white/20 uppercase tracking-widest mt-4">0 caracteres</div>

                    {/* EMA Overlay */}
                    <div id="ema-overlay" className="hidden fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center">
                        <div id="ema-box" className="w-full max-w-md p-10 border border-white/10 rounded-[2rem] bg-[#050505]">
                            <h3 className="text-center font-space text-2xl mb-8">Pausa para Registro</h3>
                            
                            <div className="slider-group mb-10">
                                <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 mb-2">
                                    <span>Desprazer</span>
                                    <span>Prazer</span>
                                </div>
                                <input type="range" id="valence-slider" min="0" max="100" defaultValue="50" className="w-full accent-[#8B0000]" />
                            </div>

                            <div className="slider-group mb-12">
                                <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 mb-2">
                                    <span>Calma</span>
                                    <span>Agitação</span>
                                </div>
                                <input type="range" id="arousal-slider" min="0" max="100" defaultValue="50" className="w-full accent-[#8B0000]" />
                            </div>

                            <button id="btn-ema-submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition uppercase tracking-widest text-xs">Continuar Narração</button>
                        </div>
                    </div>

                    {/* End Overlay */}
                    <div id="end-overlay" className="hidden fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center">
                        <div id="end-box" className="w-full max-w-md p-10 border border-white/10 rounded-[2rem] bg-[#050505] text-center">
                            <div id="rating-step">
                                <h3 className="font-space text-2xl mb-4">Sessão Finalizada</h3>
                                <p className="text-white/50 text-sm mb-8">Como foi sua experiência de escrita hoje?</p>
                                <div className="flex justify-center gap-4">
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <button key={r} id={`btn-rating-${r}`} className="w-12 h-12 rounded-full border border-white/10 hover:bg-[#8B0000] transition flex items-center justify-center font-bold">{r}</button>
                                    ))}
                                </div>
                            </div>
                            <div id="genuine-step" className="hidden">
                                <h3 className="font-space text-2xl mb-4">Validação de Engajamento</h3>
                                <p className="text-white/50 text-sm mb-8">Suas palavras vieram de um lugar real e honesto?</p>
                                <div className="flex gap-4">
                                    <button id="btn-engaged-yes" className="flex-1 py-4 bg-white text-black font-bold rounded-xl hover:bg-green-500 transition">SIM</button>
                                    <button id="btn-engaged-no" className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-red-500 transition">NÃO</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {status === 'completed' && (
                    <div className="text-center max-w-md">
                        <div className="text-5xl mb-6">✓</div>
                        <h2 className="text-3xl font-space mb-4">Contribuição Registrada</h2>
                        <p className="text-white/50 leading-relaxed">Seus padrões de digitação foram coletados com sucesso para análise somática. Obrigado por ajudar a construir o futuro da comunicação IA.</p>
                        <button onClick={() => router.push('/')} className="mt-10 text-xs uppercase tracking-widest text-white/30 hover:text-white transition">Retornar ao Início</button>
                    </div>
                )}

                {status === 'locked' && (
                    <div className="text-center max-w-md">
                        <div className="text-5xl mb-6">⏳</div>
                        <h2 className="text-3xl font-space mb-4">Aguardando Autorização</h2>
                        <p className="text-white/50 leading-relaxed">Sua sessão anterior foi enviada. O pesquisador revisará seu engajamento antes de liberar a próxima etapa.</p>
                    </div>
                )}

            </div>

            <style jsx global>{`
                .center-container {
                    text-align: center;
                }
                .icon-text {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 1.5rem;
                    margin-bottom: 20px;
                }
                .hidden {
                    display: none !important;
                }
                input[type="range"] {
                    -webkit-appearance: none;
                    height: 4px;
                    background: #222;
                    border-radius: 2px;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(139,0,0,0.5);
                }
            `}</style>
        </Layout>
    );
}
