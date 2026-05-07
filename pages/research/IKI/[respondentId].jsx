import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../src/components/xcorphion/Layout';

export default function IKIResearchPage() {
    const router = useRouter();
    const { respondentId } = router.query;

    // ── Estados de UI ────────────────────────────────────────────────────────
    const [status, setStatus] = useState('loading'); // loading, unauthorized, ready, completed, locked
    const [step, setStep] = useState('consent'); // consent, wpm, writing
    const [wpmTimer, setWpmTimer] = useState(60);
    const [wpmValue, setWpmValue] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [showEma, setShowEma] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [endStep, setEndStep] = useState('rating'); // rating, genuine
    
    // ── Refs para Lógica de Coleta (Evitar Re-renders) ───────────────────────
    const sessionIdRef = useRef('');
    const sessionStartEpochMsRef = useRef(0);
    const sessionStartHighResRef = useRef(0);
    const eventBufferRef = useRef([]);
    const lastBatchTimeRef = useRef(Date.now());
    const currentPromptIndexRef = useRef(0);
    const charsTypedInCurrentSegmentRef = useRef(0);
    const emasInCurrentSegmentRef = useRef(0);
    const pendingRatingRef = useRef(null);
    const writingAreaRef = useRef(null);
    const wpmStartTimeRef = useRef(0);

    const EMA_CHAR_INTERVAL = 200;
    const BATCH_SIZE = 50;
    const BATCH_TIMEOUT = 5000;

    // ── Efeitos e Inicialização ──────────────────────────────────────────────
    useEffect(() => {
        if (!respondentId) return;

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@phosphor-icons/web';
        document.head.appendChild(script);

        const checkParticipant = async () => {
            try {
                const res = await fetch(`/api/participant/${respondentId}`);
                if (!res.ok) throw new Error();
                const data = await res.json();

                if (data.sessions_completed >= 3) {
                    setStatus('completed');
                } else if (data.locked) {
                    setStatus('locked');
                } else if (data.sessions_completed === 0 && !data.onboarding_complete) {
                    setStatus('ready');
                    setStep('consent');
                } else {
                    setStatus('ready');
                    setStep('writing');
                    startSession(data.next_prompt_id || 1);
                }
            } catch (e) {
                setStatus('unauthorized');
            }
        };

        checkParticipant();

        const batchInterval = setInterval(() => {
            if (Date.now() - lastBatchTimeRef.current >= BATCH_TIMEOUT) flushBatch();
        }, 1000);

        return () => clearInterval(batchInterval);
    }, [respondentId]);

    // ── Lógica de Coleta ─────────────────────────────────────────────────────
    
    const flushBatch = async () => {
        if (eventBufferRef.current.length === 0) return;
        const batch = [...eventBufferRef.current];
        eventBufferRef.current = [];
        lastBatchTimeRef.current = Date.now();
        try {
            await fetch('/api/events/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    session_id: sessionIdRef.current, 
                    participant_code: respondentId, 
                    events: batch 
                })
            });
        } catch (e) { console.error('Batch error:', e); }
    };

    const handleWritingKey = (e) => {
        if (status !== 'ready' || step !== 'writing' || showEma || showEnd) return;

        const timestamp_rel_ms = Math.round(e.timeStamp - sessionStartHighResRef.current);
        const event = {
            event_type: e.type,
            key_code: e.code,
            timestamp_rel_ms,
            timestamp_abs_ms: sessionStartEpochMsRef.current + timestamp_rel_ms,
            event_repeat: e.repeat
        };
        eventBufferRef.current.push(event);
        if (eventBufferRef.current.length >= BATCH_SIZE) flushBatch();

        if (e.type === 'keydown') {
            if (e.code !== 'Backspace' && e.code !== 'Delete' && e.key.length === 1) {
                charsTypedInCurrentSegmentRef.current++;
            }
        }

        if (e.type === 'keyup') {
            const currentText = e.target.value;
            setCharCount(currentText.length);
            
            if (charsTypedInCurrentSegmentRef.current >= EMA_CHAR_INTERVAL) {
                setShowEma(true);
                charsTypedInCurrentSegmentRef.current = 0;
            }
        }
    };

    const startSession = async (promptId) => {
        try {
            const res = await fetch('/api/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participant_code: respondentId, prompt_id: promptId })
            });
            const data = await res.json();
            sessionIdRef.current = data.session_id;
            sessionStartEpochMsRef.current = data.session_start_epoch_ms;
            sessionStartHighResRef.current = performance.now();
            
            // Inyectamos o texto do prompt no elemento
            const promptEl = document.getElementById('prompt-display');
            if (promptEl) promptEl.innerText = data.prompt_text;
        } catch (e) { console.error(e); }
    };

    const handleEmaSubmit = async () => {
        const valence = parseInt(document.getElementById('v-slider').value);
        const arousal = parseInt(document.getElementById('a-slider').value);
        const timestamp_rel_ms = Math.round(performance.now() - sessionStartHighResRef.current);
        
        try {
            await fetch('/api/ema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    participant_code: respondentId,
                    character_count: charCount,
                    valence,
                    arousal,
                    timestamp_rel_ms,
                    prompt_index: currentPromptIndexRef.current
                })
            });
            setShowEma(false);
            emasInCurrentSegmentRef.current++;

            if (emasInCurrentSegmentRef.current >= 3) {
                emasInCurrentSegmentRef.current = 0;
                currentPromptIndexRef.current++;
                if (currentPromptIndexRef.current >= 3) {
                    setShowEnd(true);
                } else {
                    alert("Segmento concluído. Continue sua narrativa.");
                }
            }
        } catch (e) { console.error(e); }
    };

    const handleFinalSubmit = async (genuine) => {
        await flushBatch();
        try {
            await fetch('/api/session/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    participant_code: respondentId,
                    engagement_rating: pendingRatingRef.current,
                    engagement_genuine: genuine,
                    text_final: writingAreaRef.current?.value || ''
                })
            });
            setStatus('completed');
        } catch (e) { console.error(e); }
    };

    // ── Handlers de Onboarding ───────────────────────────────────────────────

    const handleWpmFocus = () => {
        if (wpmStartTimeRef.current) return;
        wpmStartTimeRef.current = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - wpmStartTimeRef.current) / 1000;
            const remaining = Math.max(0, 60 - Math.floor(elapsed));
            setWpmTimer(remaining);

            const input = document.getElementById('wpm-textarea');
            const chars = input?.value.length || 0;
            const currentWPM = Math.round((chars / 5) / (elapsed / 60)) || 0;
            setWpmValue(currentWPM);

            if (remaining <= 0) {
                clearInterval(interval);
                completeOnboarding(currentWPM);
            }
        }, 500);
    };

    const completeOnboarding = async (wpm) => {
        try {
            await fetch(`/api/participant/${respondentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    wpm_baseline: wpm, 
                    device_profile: { userAgent: navigator.userAgent, platform: navigator.platform } 
                })
            });
            setStep('writing');
            startSession(1);
        } catch (e) { console.error(e); }
    };

    // ── Renderização Condicional ─────────────────────────────────────────────

    if (status === 'loading') return (
        <Layout>
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000]"></div>
            </div>
        </Layout>
    );

    if (status === 'unauthorized') return (
        <Layout>
            <div className="min-h-screen bg-black flex items-center justify-center text-center p-8">
                <div>
                    <h1 className="text-4xl font-space mb-4">Acesso Negado</h1>
                    <p className="text-white/40">O código de participante é inválido ou a sessão expirou.</p>
                </div>
            </div>
        </Layout>
    );

    if (status === 'completed') return (
        <Layout>
            <div className="min-h-screen bg-black flex items-center justify-center text-center p-8">
                <div className="max-w-md">
                    <div className="text-6xl mb-8 text-green-500">✓</div>
                    <h1 className="text-3xl font-space mb-6">Sessão Concluída</h1>
                    <p className="text-white/50 leading-relaxed">Obrigado por sua contribuição. Seus dados de digitação foram anonimizados e salvos com sucesso.</p>
                    <button onClick={() => router.push('/')} className="mt-12 text-xs tracking-widest uppercase text-white/30 hover:text-white transition">Voltar para Home</button>
                </div>
            </div>
        </Layout>
    );

    if (status === 'locked') return (
        <Layout>
            <div className="min-h-screen bg-black flex items-center justify-center text-center p-8">
                <div className="max-w-md">
                    <div className="text-6xl mb-8">⏳</div>
                    <h1 className="text-3xl font-space mb-6">Aguardando Liberação</h1>
                    <p className="text-white/50 leading-relaxed">Sua participação anterior está em análise. A próxima sessão será liberada em breve.</p>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <Head>
                <title>Pesquisa Somática IKI | XCORPION</title>
            </Head>

            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-inter">
                
                {/* ETAPA 1: CONSENTIMENTO */}
                {step === 'consent' && (
                    <div className="max-w-xl w-full text-center">
                        <div className="flex items-center justify-center gap-3 text-2xl font-space mb-8">
                            <i className="ph ph-shield-check"></i>
                            <h2>Termo de Consentimento</h2>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl text-left text-sm leading-relaxed mb-10 border border-white/10">
                            <p className="mb-4"><strong>1. Coleta Somática:</strong> Registramos apenas o ritmo das suas teclas (IKI), não o conteúdo privado fora deste ambiente.</p>
                            <p className="mb-4"><strong>2. Anonimização:</strong> Seus dados são vinculados a um hash, nunca ao seu nome real.</p>
                            <p><strong>3. Finalidade:</strong> Treinamento de modelos de IA para detecção de estados emocionais através da psicomotricidade.</p>
                        </div>
                        <button 
                            onClick={() => setStep('wpm')}
                            className="w-full py-5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                        >
                            ACEITO E DESEJO CONTINUAR
                        </button>
                    </div>
                )}

                {/* ETAPA 2: TESTE WPM */}
                {step === 'wpm' && (
                    <div className="max-w-2xl w-full text-center">
                        <h2 className="text-2xl font-space mb-4 flex items-center justify-center gap-3">
                            <i className="ph ph-keyboard"></i> Calibração de Velocidade
                        </h2>
                        <p className="text-white/40 mb-8">Digite o texto abaixo por 60 segundos para calibrar o seu IKI base.</p>
                        <div className="bg-[#111] p-6 rounded-2xl mb-8 italic text-white/70 border border-white/5">
                            "A técnica de Keystroke Dynamics estuda o ritmo individual de digitação. Cada pessoa possui um padrão único de pressionamento e liberação de teclas."
                        </div>
                        <textarea 
                            id="wpm-textarea"
                            onFocus={handleWpmFocus}
                            className="w-full h-40 bg-black border border-white/10 rounded-2xl p-6 text-white focus:border-[#8B0000] outline-none transition-colors resize-none"
                            placeholder="Comece a digitar aqui para iniciar..."
                        ></textarea>
                        <div className="flex justify-between mt-6 font-mono text-[10px] tracking-[0.2em] uppercase">
                            <span className="text-[#8B0000]">Tempo Restante: {wpmTimer}s</span>
                            <span className="text-white/30">{wpmValue} WPM</span>
                        </div>
                    </div>
                )}

                {/* ETAPA 3: ÁREA DE ESCRITA PRINCIPAL */}
                {step === 'writing' && (
                    <div className="w-full max-w-4xl animate-in fade-in duration-700">
                        <div className="mb-12 border-b border-white/5 pb-8">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#8B0000] mb-4">Tema da Sessão</h3>
                            <p id="prompt-display" className="text-2xl font-space leading-snug text-white/90"></p>
                        </div>

                        <textarea 
                            ref={writingAreaRef}
                            onKeyDown={handleWritingKey}
                            onKeyUp={handleWritingKey}
                            disabled={showEma || showEnd}
                            className="w-full h-[55vh] bg-transparent border-none text-xl leading-relaxed text-white/70 outline-none resize-none placeholder:text-white/10"
                            placeholder="Escreva sobre suas percepções e sentimentos..."
                        ></textarea>
                        
                        <div className="text-right mt-6 font-mono text-[9px] uppercase tracking-widest text-white/20">
                            {charCount} caracteres coletados
                        </div>

                        {/* MODAL EMA */}
                        {showEma && (
                            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                                <div className="w-full max-w-md bg-[#080808] border border-white/10 p-12 rounded-[2.5rem] shadow-2xl">
                                    <h3 className="text-center font-space text-2xl mb-12">Pausa Somática</h3>
                                    
                                    <div className="mb-12">
                                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 mb-4">
                                            <span>Desprazer</span>
                                            <span>Prazer</span>
                                        </div>
                                        <input type="range" id="v-slider" min="0" max="100" defaultValue="50" className="w-full h-1 bg-white/10 appearance-none rounded-full accent-white" />
                                    </div>

                                    <div className="mb-14">
                                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 mb-4">
                                            <span>Calma</span>
                                            <span>Agitação</span>
                                        </div>
                                        <input type="range" id="a-slider" min="0" max="100" defaultValue="50" className="w-full h-1 bg-white/10 appearance-none rounded-full accent-white" />
                                    </div>

                                    <button 
                                        onClick={handleEmaSubmit}
                                        className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px]"
                                    >
                                        Retomar Escrita
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* MODAL FINALIZAÇÃO */}
                        {showEnd && (
                            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
                                <div className="w-full max-w-md">
                                    {endStep === 'rating' && (
                                        <div className="animate-in zoom-in duration-300">
                                            <h3 className="text-3xl font-space mb-4">Sessão Concluída</h3>
                                            <p className="text-white/40 mb-10">Como foi sua experiência de escrita?</p>
                                            <div className="flex justify-center gap-4">
                                                {[1, 2, 3, 4, 5].map(r => (
                                                    <button 
                                                        key={r}
                                                        onClick={() => { pendingRatingRef.current = r; setEndStep('genuine'); }}
                                                        className="w-14 h-14 rounded-full border border-white/10 hover:border-[#8B0000] hover:bg-[#8B0000] transition-all flex items-center justify-center font-bold text-lg"
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {endStep === 'genuine' && (
                                        <div className="animate-in slide-in-from-bottom duration-500">
                                            <h3 className="text-3xl font-space mb-4">Genuinidade</h3>
                                            <p className="text-white/40 mb-10 leading-relaxed">Você estava engajado e sendo honesto com suas palavras?</p>
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => handleFinalSubmit(true)}
                                                    className="flex-1 py-5 bg-white text-black font-bold rounded-2xl hover:bg-green-500 transition-colors uppercase tracking-widest text-[10px]"
                                                >
                                                    Sim, Fui Real
                                                </button>
                                                <button 
                                                    onClick={() => handleFinalSubmit(false)}
                                                    className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-red-500 transition-colors uppercase tracking-widest text-[10px]"
                                                >
                                                    Não Totalmente
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            <style jsx global>{`
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    background: white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 15px rgba(255,255,255,0.3);
                }
                .animate-in { animation: animateIn 0.5s ease-out; }
                @keyframes animateIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .hidden { display: none; }
            `}</style>
        </Layout>
    );
}
