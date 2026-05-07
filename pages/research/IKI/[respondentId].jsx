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
    const [promptText, setPromptText] = useState('');
    
    // ── Refs para Lógica de Coleta ───────────────────────────────────────────
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

    // ── Efeitos ──────────────────────────────────────────────────────────────
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

    // ── Handlers Principais ──────────────────────────────────────────────────

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

    const runJitterBenchmark = async () => {
        const timestamps = [];
        for (let i = 0; i < 12; i++) {
            await new Promise(r => setTimeout(r, 200));
            timestamps.push(performance.now());
        }
        const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
        const deviations = intervals.map(v => Math.abs(v - 200));
        const jitter = Math.round(
            deviations.reduce((a, b) => a + b) / deviations.length
        );
        return jitter;
    };

    const startSession = async (promptId) => {
        try {
            const jitter = await runJitterBenchmark();
            if (jitter > 30) {
                alert(`Qualidade de Captura Baixa (Jitter: ${jitter}ms). Para melhores resultados, tente fechar outras abas ou trocar de dispositivo.`);
            }

            const res = await fetch('/api/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    participant_code: respondentId, 
                    prompt_id: promptId,
                    jitter_benchmark_ms: jitter 
                })
            });
            const data = await res.json();
            sessionIdRef.current = data.session_id;
            sessionStartEpochMsRef.current = data.session_start_epoch_ms;
            sessionStartHighResRef.current = performance.now();
            setPromptText(data.prompt_text);
        } catch (e) { console.error(e); }
    };

    const handleWritingKey = (e) => {
        // Bloqueio se o modal estiver aberto
        if (showEma || showEnd) return;

        // #12 — event.timeStamp exclusivamente (DOMHighResTimeStamp, monotônico)
        const timestamp_rel_ms = Math.round(e.nativeEvent.timeStamp - sessionStartHighResRef.current);
        const event = {
            event_type: e.type,
            key_code: e.nativeEvent.code, // #8 — event.code exclusivamente
            timestamp_rel_ms,           // #12 — calculado via high-res timeStamp
            timestamp_abs_ms: sessionStartEpochMsRef.current + timestamp_rel_ms, // #11 — correlação absoluta
            event_repeat: !!e.nativeEvent.repeat // #9 — flag de repetição exclusivamente
        };
        eventBufferRef.current.push(event);
        if (eventBufferRef.current.length >= BATCH_SIZE) flushBatch();

        if (e.type === 'keydown') {
            // #8 — Apenas caracteres que contribuem para o texto final (líquido)
            if (e.code === 'Backspace' || e.code === 'Delete') {
                charsTypedInCurrentSegmentRef.current = Math.max(0, charsTypedInCurrentSegmentRef.current - 1);
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                charsTypedInCurrentSegmentRef.current++;
            } else if (e.code === 'Enter') {
                charsTypedInCurrentSegmentRef.current++;
            }
        }

        if (e.type === 'keyup') {
            setCharCount(e.target.value.length);
            if (charsTypedInCurrentSegmentRef.current >= EMA_CHAR_INTERVAL) {
                setShowEma(true);
                charsTypedInCurrentSegmentRef.current = 0;
            }
        }
    };

    const handleWpmKeyDown = (e) => {
        if (wpmStartTimeRef.current) return;
        const isValidKey = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
        if (isValidKey) {
            wpmStartTimeRef.current = Date.now();
            const interval = setInterval(() => {
                const elapsed = (Date.now() - wpmStartTimeRef.current) / 1000;
                const remaining = Math.max(0, 60 - Math.floor(elapsed));
                setWpmTimer(remaining);
                const input = document.getElementById('wpm-textarea');
                const chars = input?.value.length || 0;
                setWpmValue(Math.round((chars / 5) / (elapsed / 60)) || 0);
                if (remaining <= 0) {
                    clearInterval(interval);
                    completeOnboarding(Math.round((chars / 5) / (60 / 60)));
                }
            }, 500);
        }
    };

    const completeOnboarding = async (wpm) => {
        try {
            await fetch(`/api/participant/${respondentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wpm_baseline: wpm, device_profile: { userAgent: navigator.userAgent } })
            });
            setStep('writing');
            startSession(1);
        } catch (e) { console.error(e); }
    };

    const handleEmaSubmit = async () => {
        const valence = parseInt(document.getElementById('v-slider').value);
        const arousal = parseInt(document.getElementById('a-slider').value);
        // #12 — EMA timestamp relativo (ms desde o início da sessão)
        const timestamp_rel_ms = Date.now() - sessionStartEpochMsRef.current;
        
        try {
            await fetch('/api/ema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    participant_code: respondentId,
                    character_count: charCount,
                    valence, arousal, timestamp_rel_ms,
                    prompt_index: currentPromptIndexRef.current
                })
            });
            setShowEma(false);
            emasInCurrentSegmentRef.current++;
            if (emasInCurrentSegmentRef.current >= 3) {
                emasInCurrentSegmentRef.current = 0;
                currentPromptIndexRef.current++;
                if (currentPromptIndexRef.current >= 3) setShowEnd(true);
                else alert("Segmento concluído. Continue.");
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

    // ── Renderização ─────────────────────────────────────────────────────────

    if (status === 'loading') return <Layout><div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000]"></div></div></Layout>;
    if (status === 'unauthorized') return <Layout><div className="min-h-screen bg-black flex items-center justify-center text-center p-8"><div><h1 className="text-4xl font-space mb-4">Acesso Negado</h1></div></div></Layout>;
    if (status === 'completed') return <Layout><div className="min-h-screen bg-black flex items-center justify-center text-center p-8"><div className="max-w-md"><div className="text-6xl mb-8 text-green-500">✓</div><h1 className="text-3xl font-space mb-6">Sessão Concluída</h1><button onClick={() => router.push('/')} className="mt-12 text-xs tracking-widest uppercase text-white/30 hover:text-white transition">Home</button></div></div></Layout>;
    if (status === 'locked') return <Layout><div className="min-h-screen bg-black flex items-center justify-center text-center p-8"><div className="max-w-md"><div className="text-6xl mb-8">⏳</div><h1 className="text-3xl font-space mb-6">Aguardando Liberação</h1></div></div></Layout>;

    return (
        <Layout>
            <Head><title>Pesquisa Somática | XCORPION</title></Head>

            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-inter">
                
                {step === 'consent' && (
                    <div className="max-w-xl w-full text-center">
                        <div className="flex items-center justify-center gap-3 text-2xl font-space mb-8"><i className="ph ph-shield-check"></i><h2>Termo de Consentimento</h2></div>
                        <div className="bg-white/5 p-8 rounded-2xl text-left text-sm mb-10 border border-white/10"><p className="mb-4"><strong>1. Coleta Somática:</strong> Registramos o ritmo das teclas (IKI).</p><p className="mb-4"><strong>2. Anonimização:</strong> Dados vinculados a um hash.</p></div>
                        <button onClick={() => setStep('wpm')} className="w-full py-5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">ACEITO E DESEJO CONTINUAR</button>
                    </div>
                )}

                {step === 'wpm' && (
                    <div className="max-w-2xl w-full text-center">
                        <h2 className="text-2xl font-space mb-4 flex items-center justify-center gap-3"><i className="ph ph-keyboard"></i> Calibração</h2>
                        <p className="text-white/40 mb-8 font-inter">Digite o texto abaixo por 60 segundos.</p>
                        <div className="bg-[#111] p-6 rounded-2xl mb-8 italic text-white/70 border border-white/5 font-inter">"A técnica de Keystroke Dynamics estuda o ritmo individual de digitação."</div>
                        <textarea id="wpm-textarea" onKeyDown={handleWpmKeyDown} className="w-full h-40 bg-black border border-white/10 rounded-lg p-6 text-white focus:border-[#8B0000] outline-none resize-none font-inter" placeholder="Comece a digitar..."></textarea>
                        <div className="flex justify-between mt-6 font-space text-[10px] tracking-[0.2em] uppercase"><span className="text-[#8B0000]">Tempo: {wpmTimer}s</span><span className="text-white/30">{wpmValue} WPM</span></div>
                    </div>
                )}

                {step === 'writing' && (
                    <div className="w-full max-w-[936px] animate-in fade-in duration-700">
                        <div className="mb-12 border-b border-white/5 pb-8">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#8B0000] font-space mb-4">Tema da Sessão</h3>
                            <p className="text-2xl font-space leading-snug text-white/90">{promptText}</p>
                        </div>

                        <textarea 
                            ref={writingAreaRef}
                            onKeyDown={handleWritingKey}
                            onKeyUp={handleWritingKey}
                            disabled={showEma || showEnd}
                            className="w-full h-[calc(55vh+80px)] bg-white/[0.02] border border-white/10 rounded-lg p-8 text-xl leading-relaxed text-white/70 outline-none resize-none font-inter focus:border-[#8B0000]/50 transition-all shadow-inner"
                            placeholder="Escreva seus sentimentos..."
                        ></textarea>
                        
                        <div className="text-right mt-6 font-space text-[9px] uppercase tracking-widest text-white/20">{charCount} caracteres coletados</div>

                        {showEma && (
                            <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                                <div className="w-full max-w-md bg-[#080808] border border-white/10 p-12 rounded-[2.5rem] shadow-2xl">
                                    <h3 className="text-center font-space text-2xl mb-12">Pausa Somática</h3>
                                    <div className="mb-12"><div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 mb-4"><span>Desprazer</span><span>Prazer</span></div><input type="range" id="v-slider" min="0" max="100" defaultValue="50" className="w-full h-1 bg-white/10 appearance-none rounded-full accent-white" /></div>
                                    <div className="mb-14"><div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 mb-4"><span>Calma</span><span>Agitação</span></div><input type="range" id="a-slider" min="0" max="100" defaultValue="50" className="w-full h-1 bg-white/10 appearance-none rounded-full accent-white" /></div>
                                    <button onClick={handleEmaSubmit} className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px]">Retomar</button>
                                </div>
                            </div>
                        )}

                        {showEnd && (
                            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
                                <div className="w-full max-w-md">
                                    {endStep === 'rating' && (
                                        <div className="animate-in zoom-in duration-300">
                                            <h3 className="text-3xl font-space mb-4">Sessão Concluída</h3>
                                            <p className="text-white/40 mb-10">Como foi a experiência?</p>
                                            <div className="flex justify-center gap-4">
                                                {[1, 2, 3, 4, 5].map(r => <button key={r} onClick={() => { pendingRatingRef.current = r; setEndStep('genuine'); }} className="w-14 h-14 rounded-full border border-white/10 hover:bg-[#8B0000] transition-all flex items-center justify-center font-bold text-lg">{r}</button>)}
                                            </div>
                                        </div>
                                    )}
                                    {endStep === 'genuine' && (
                                        <div className="animate-in slide-in-from-bottom duration-500">
                                            <h3 className="text-3xl font-space mb-4">Genuinidade</h3>
                                            <div className="flex gap-4 mt-10"><button onClick={() => handleFinalSubmit(true)} className="flex-1 py-5 bg-white text-black font-bold rounded-2xl uppercase tracking-widest text-[10px]">Sim</button><button onClick={() => handleFinalSubmit(false)} className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl uppercase tracking-widest text-[10px]">Não</button></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <style jsx global>{`
                input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: white; border-radius: 50%; cursor: pointer; }
                .animate-in { animation: animateIn 0.5s ease-out; }
                @keyframes animateIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </Layout>
    );
}
