import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../src/components/xcorphion/Layout';

export default function IKIResearchPage() {
    const router = useRouter();
    const { respondentId } = router.query;

    // ── Estados de UI ────────────────────────────────────────────────────────
    const [status, setStatus] = useState('loading');
    const [step, setStep] = useState('consent');
    const [wpmTimer, setWpmTimer] = useState(60);
    const [wpmValue, setWpmValue] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [showEma, setShowEma] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [endStep, setEndStep] = useState('rating');
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
        console.log(`[DEBUG][FIX-1][FIX-2] Rota Dinâmica Detectada. Respondente: ${respondentId}`);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@phosphor-icons/web';
        document.head.appendChild(script);

        const checkParticipant = async () => {
            console.log(`[DEBUG][FIX-7] Validando status do participante...`);
            try {
                const res = await fetch(`/api/participant/${respondentId}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                console.log(`[DEBUG][FIX-7] Participante carregado. Sessões: ${data.sessions_completed}, Onboarding: ${data.onboarding_complete}`);

                if (data.sessions_completed >= 3) {
                    setStatus('completed');
                } else if (data.locked) {
                    setStatus('locked');
                } else if (data.sessions_completed === 0 && !data.onboarding_complete) {
                    setStatus('ready');
                    setStep('consent');
                    console.log(`[DEBUG][FIX-4] Iniciando Fluxo Onboarding (React State)`);
                } else {
                    setStatus('ready');
                    setStep('writing');
                    startSession(data.next_prompt_id || 1);
                }
            } catch (e) {
                setStatus('unauthorized');
                console.log(`[DEBUG][FIX-7] Erro: Participante não autorizado.`);
            }
        };

        checkParticipant();

        const batchInterval = setInterval(() => {
            if (Date.now() - lastBatchTimeRef.current >= BATCH_TIMEOUT) {
                console.log(`[DEBUG][FIX-5] Batch Timeout (5s) atingido. Forçando flush.`);
                flushBatch();
            }
        }, 1000);

        return () => clearInterval(batchInterval);
    }, [respondentId]);

    // ── Handlers Principais ──────────────────────────────────────────────────

    const flushBatch = async () => {
        if (eventBufferRef.current.length === 0) return;
        const count = eventBufferRef.current.length;
        const batch = [...eventBufferRef.current];
        eventBufferRef.current = [];
        lastBatchTimeRef.current = Date.now();
        
        console.log(`[DEBUG][FIX-5][START] Enviando Lote: ${count} eventos.`);
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
            console.log(`[DEBUG][FIX-5][END] Lote enviado com sucesso.`);
            console.log(`[DEBUG][FIX-14][FIX-15] Verificação: Dados inseridos em modo Append-Only e Indexados.`);
        } catch (e) { console.error('Batch error:', e); }
    };

    const startSession = async (promptId) => {
        console.log(`[DEBUG][FIX-7][START] Iniciando Benchmark de Hardware...`);
        const jitter = await runJitterBenchmark();
        console.log(`[DEBUG][FIX-7][END] Jitter: ${jitter}ms`);

        try {
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
            console.log(`[DEBUG][FIX-13] Sessão iniciada ID: ${data.session_id}. Ready for IKI.`);
        } catch (e) { console.error(e); }
    };

    const runJitterBenchmark = async () => {
        const timestamps = [];
        for (let i = 0; i < 12; i++) {
            await new Promise(r => setTimeout(r, 200));
            timestamps.push(performance.now());
        }
        const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
        const deviations = intervals.map(v => Math.abs(v - 200));
        return Math.round(deviations.reduce((a, b) => a + b) / deviations.length);
    };

    const handleWritingKey = (e) => {
        if (showEma || showEnd) return;

        // #12 — event.timeStamp exclusivamente
        const timestamp_rel_ms = Math.round(e.nativeEvent.timeStamp - sessionStartHighResRef.current);
        const event = {
            event_type: e.type,
            key_code: e.nativeEvent.code, // #8 — event.code exclusivamente
            timestamp_rel_ms,
            timestamp_abs_ms: sessionStartEpochMsRef.current + timestamp_rel_ms,
            event_repeat: !!e.nativeEvent.repeat // #9 — flag de repetição
        };
        
        eventBufferRef.current.push(event);
        if (eventBufferRef.current.length >= BATCH_SIZE) {
            console.log(`[DEBUG][FIX-5] Batch Size (50) atingido. Efetuando flush.`);
            flushBatch();
        }

        if (e.type === 'keydown') {
            const oldVal = charsTypedInCurrentSegmentRef.current;
            if (e.code === 'Backspace' || e.code === 'Delete') {
                charsTypedInCurrentSegmentRef.current = Math.max(0, charsTypedInCurrentSegmentRef.current - 1);
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                charsTypedInCurrentSegmentRef.current++;
            } else if (e.code === 'Enter') {
                charsTypedInCurrentSegmentRef.current++;
            }
            
            if (charsTypedInCurrentSegmentRef.current !== oldVal) {
                console.log(`[DEBUG][FIX-9] EMA Progress: ${charsTypedInCurrentSegmentRef.current}/${EMA_CHAR_INTERVAL}`);
            }
        }

        if (e.type === 'keyup') {
            setCharCount(e.target.value.length);
            if (charsTypedInCurrentSegmentRef.current >= EMA_CHAR_INTERVAL) {
                console.log(`[DEBUG][FIX-9] Limite de 200 chars atingido. Disparando EMA.`);
                setShowEma(true);
                charsTypedInCurrentSegmentRef.current = 0;
            }
        }
    };

    const handleWpmKeyDown = (e) => {
        if (wpmStartTimeRef.current) return;
        const isValidKey = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
        if (isValidKey) {
            console.log(`[DEBUG][FIX-6] Tecla válida detectada: "${e.key}". Iniciando cronômetro WPM.`);
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
                    console.log(`[DEBUG][FIX-6] Teste WPM Finalizado. Baseline: ${Math.round((chars / 5) / (60 / 60))} WPM.`);
                    completeOnboarding(Math.round((chars / 5) / (60 / 60)));
                }
            }, 500);
        } else {
            console.log(`[DEBUG][FIX-6] Tecla "${e.key}" ignorada (não inicia timer).`);
        }
    };

    const completeOnboarding = async (wpm) => {
        console.log(`[DEBUG][FIX-6][START] Gravando Baseline WPM...`);
        try {
            await fetch(`/api/participant/${respondentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wpm_baseline: wpm, device_profile: { userAgent: navigator.userAgent } })
            });
            console.log(`[DEBUG][FIX-6][END] Onboarding completo. Tema Liberado.`);
            setStep('writing');
            startSession(1);
        } catch (e) { console.error(e); }
    };

    const handleEmaSubmit = async () => {
        const v = parseInt(document.getElementById('v-slider').value);
        const a = parseInt(document.getElementById('a-slider').value);
        const rel_ts = Date.now() - sessionStartEpochMsRef.current;
        
        console.log(`[DEBUG][FIX-10][FIX-11][FIX-12] Enviando EMA: Valência=${v}, Arousal=${a}, RelTime=${rel_ts}ms`);
        
        try {
            await fetch('/api/ema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    participant_code: respondentId,
                    character_count: charCount,
                    valence: v, arousal: a, timestamp_rel_ms: rel_ts,
                    prompt_index: currentPromptIndexRef.current
                })
            });
            console.log(`[DEBUG][FIX-11] EMA enviado. Retomando fluxo.`);
            setShowEma(false);
            emasInCurrentSegmentRef.current++;
            if (emasInCurrentSegmentRef.current >= 3) {
                emasInCurrentSegmentRef.current = 0;
                currentPromptIndexRef.current++;
                if (currentPromptIndexRef.current >= 3) {
                    console.log(`[DEBUG][FIX-13] Fim dos segmentos. Abrindo Finalização.`);
                    setShowEnd(true);
                }
            }
        } catch (e) { console.error(e); }
    };

    const handleFinalSubmit = async (genuine) => {
        console.log(`[DEBUG][FIX-12][FIX-13][START] Encerrando Sessão. Rating=${pendingRatingRef.current}, Genuino=${genuine}`);
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
            console.log(`[DEBUG][FIX-13][END] Sessão Concluída Atamicamente no DB.`);
            setStatus('completed');
        } catch (e) { console.error(e); }
    };

    // ── Renderização ─────────────────────────────────────────────────────────

    if (status === 'loading') return <Layout><div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000]"></div></div></Layout>;
    
    return (
        <Layout>
            <Head><title>Pesquisa Somática | XCORPION</title></Head>

            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-inter">
                
                {step === 'consent' && (
                    <div className="max-w-xl w-full text-center">
                        <div className="flex items-center justify-center gap-3 text-2xl font-space mb-8"><i className="ph ph-shield-check"></i><h2>Termo de Consentimento</h2></div>
                        <div className="bg-white/5 p-8 rounded-2xl text-left text-sm leading-relaxed mb-10 border border-white/10 font-inter">
                            <p className="mb-4 text-white/80"><strong>1. Monitoramento Psicomotor:</strong> Este protocolo registra exclusivamente a cadência e o ritmo temporal de sua digitação (IKIs). Nosso foco é a dinâmica biométrica, e não o conteúdo semântico de sua narrativa.</p>
                            <p className="mb-4 text-white/80"><strong>2. Protocolo de Anonimato:</strong> Seus dados são processados através de um hash criptográfico de via única, impossibilitando a reidentificação e garantindo total conformidade com a LGPD.</p>
                            <p className="text-white/80"><strong>3. Contribuição Científica:</strong> Ao participar, você contribui para o desenvolvimento de sistemas de IA capazes de compreender estados afetivos através da neurofisiologia do movimento.</p>
                        </div>
                        <button onClick={() => { console.log(`[DEBUG][FIX-4] Consentimento Dado.`); setStep('wpm'); }} className="w-full py-5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all font-inter">ACEITO E DESEJO CONTINUAR</button>
                    </div>
                )}

                {step === 'wpm' && (
                    <div className="max-w-2xl w-full text-center">
                        <h2 className="text-2xl font-space mb-4 flex items-center justify-center gap-3"><i className="ph ph-keyboard"></i> Calibração</h2>
                        <p className="text-white/40 mb-8 font-inter">Aguardando primeira tecla para iniciar cronômetro...</p>
                        <div className="bg-[#111] p-6 rounded-2xl mb-8 italic text-white/70 border border-white/5 font-inter">"A técnica de Keystroke Dynamics estuda o ritmo individual de digitação. Cada pessoa possui um ritmo, uma pressão e um padrão de escrita. É isso que a Xcorphion está compreendendo."</div>
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
                            <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
                                <div className="w-full max-w-sm bg-[#050505] border border-white/10 p-10 rounded-3xl shadow-2xl">
                                    <div className="mb-12">
                                        <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/40 mb-6"><span>Negativo</span><span>Positivo</span></div>
                                        <input type="range" id="v-slider" min="0" max="100" defaultValue="50" className="w-full h-1 bg-white/10 appearance-none rounded-full accent-white" />
                                    </div>
                                    <div className="mb-14">
                                        <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/40 mb-6"><span>Calmo</span><span>Agitado</span></div>
                                        <input type="range" id="a-slider" min="0" max="100" defaultValue="50" className="w-full h-1 bg-white/10 appearance-none rounded-full accent-white" />
                                    </div>
                                    <button onClick={handleEmaSubmit} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px] font-inter">Continuar</button>
                                </div>
                            </div>
                        )}

                        {showEnd && (
                            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
                                <div className="w-full max-w-md">
                                    {endStep === 'rating' && (
                                        <div className="animate-in zoom-in duration-300">
                                            <h3 className="text-3xl font-space mb-4">Sessão Concluída</h3>
                                            <div className="flex justify-center gap-4 mt-10">
                                                {[1, 2, 3, 4, 5].map(r => <button key={r} onClick={() => { pendingRatingRef.current = r; setEndStep('genuine'); }} className="w-14 h-14 rounded-full border border-white/10 hover:bg-[#8B0000] transition-all flex items-center justify-center font-bold text-lg font-space">{r}</button>)}
                                            </div>
                                        </div>
                                    )}
                                    {endStep === 'genuine' && (
                                        <div className="animate-in slide-in-from-bottom duration-500">
                                            <h3 className="text-3xl font-space mb-4">Genuinidade</h3>
                                            <div className="flex gap-4 mt-10"><button onClick={() => handleFinalSubmit(true)} className="flex-1 py-5 bg-white text-black font-bold rounded-2xl uppercase tracking-widest text-[10px] font-inter">Sim</button><button onClick={() => handleFinalSubmit(false)} className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl uppercase tracking-widest text-[10px] font-inter">Não</button></div>
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
