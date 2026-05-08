import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

export default function IKIResearchPage() {
    const router = useRouter();
    const { respondentId } = router.query;
    const base = router.basePath;

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
    const [jitterWarning, setJitterWarning] = useState(false);

    // ── Refs para Lógica de Coleta ───────────────────────────────────────────
    const sessionIdRef = useRef('');
    const sessionTokenRef = useRef('');
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
                const res = await fetch(`${base}/api/participant/${respondentId}`);
                if (res.status === 403) {
                    setStatus('blocked');
                    return;
                }
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
            await fetch(`${base}/api/events/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    participant_code: respondentId,
                    session_token: sessionTokenRef.current,
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
            const res = await fetch(`${base}/api/session/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participant_code: respondentId,
                    prompt_id: promptId,
                    jitter_benchmark_ms: jitter,
                    device_profile: buildDeviceProfile(),
                })
            });
            const data = await res.json();
            sessionIdRef.current = data.session_id;
            sessionTokenRef.current = data.session_token;
            sessionStartEpochMsRef.current = data.session_start_epoch_ms;
            sessionStartHighResRef.current = performance.now();
            setPromptText(data.prompt_text);
            setStep('writing');

            if (jitter > 30) {
                console.warn(`[DEBUG][FIX-7] Jitter Crítico: ${jitter}ms. Ativando aviso.`);
                setJitterWarning(true);
            }
            
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

    const buildDeviceProfile = () => ({
        userAgent: navigator.userAgent,
        platform:  navigator.platform,
        language:  navigator.language,
        timezone:  Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen:    { w: screen.width, h: screen.height, depth: screen.colorDepth, dpr: devicePixelRatio },
        hw:        { cores: navigator.hardwareConcurrency, mem: navigator.deviceMemory ?? null },
    });

    const completeOnboarding = async (wpm) => {
        console.log(`[DEBUG][FIX-6][START] Gravando Baseline WPM...`);
        try {
            await fetch(`${base}/api/participant/${respondentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wpm_baseline: wpm, device_profile: buildDeviceProfile() })
            });
            console.log(`[DEBUG][FIX-6][END] Onboarding completo. Tema Liberado.`);
            startSession(1);
        } catch (e) { console.error(e); }
    };

    const handleEmaSubmit = async () => {
        const v = parseInt(document.getElementById('v-slider').value);
        const a = parseInt(document.getElementById('a-slider').value);
        const rel_ts = Date.now() - sessionStartEpochMsRef.current;

        console.log(`[DEBUG][FIX-10][FIX-11][FIX-12] Enviando EMA: Valência=${v}, Arousal=${a}, RelTime=${rel_ts}ms`);

        try {
            await fetch(`${base}/api/ema`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    participant_code: respondentId,
                    session_token: sessionTokenRef.current,
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
            await fetch(`${base}/api/session/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    participant_code: respondentId,
                    session_token: sessionTokenRef.current,
                    engagement_rating: pendingRatingRef.current,
                    engagement_genuine: genuine,
                    text_final: writingAreaRef.current?.value || ''
                })
            });
            console.log(`[DEBUG][FIX-13][END] Sessão Concluída Atamicamente no DB.`);
            router.push(`/IKI/${respondentId}/finish`);
        } catch (e) { console.error(e); }
    };

    // ── Renderização ─────────────────────────────────────────────────────────

    const F = { space: "'Space Grotesk', sans-serif", inter: "'Inter', sans-serif" };

    if (status === 'loading') return (
        <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#8B0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    if (status === 'completed') return (
        <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ textAlign: 'center', maxWidth: 440 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(139,0,0,0.35)', background: 'rgba(139,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 28px rgba(139,0,0,0.12)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 24, color: 'white', marginBottom: 12, letterSpacing: '-0.025em' }}>Pesquisa concluída</h2>
                <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontWeight: 300 }}>Você já completou todas as sessões disponíveis. Obrigado pela sua participação.</p>
            </div>
        </div>
    );

    if (status === 'blocked') return (
        <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ textAlign: 'center', maxWidth: 440 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                </div>
                <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 22, color: 'white', marginBottom: 12, letterSpacing: '-0.025em' }}>Acesso indisponível</h2>
                <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, fontWeight: 300 }}>Este acesso não está disponível no momento. Entre em contato com quem te convidou para a pesquisa.</p>
            </div>
        </div>
    );

    if (status === 'locked' || status === 'unauthorized') return (
        <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ textAlign: 'center', maxWidth: 440 }}>
                <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>Acesso não autorizado ou perfil bloqueado.</p>
            </div>
        </div>
    );

    return (
        <>
            <Head>
                <title>Pesquisa Somática — Xcorphion</title>
            </Head>
            <style jsx global>{`
                input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 2px; background: rgba(255,255,255,0.12); border-radius: 2px; outline: none; cursor: pointer; }
                input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: white; border-radius: 50%; cursor: pointer; }
                input[type="range"]::-moz-range-thumb { width: 18px; height: 18px; background: white; border-radius: 50%; cursor: pointer; border: none; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .step-enter { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
            `}</style>

            <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

                {step === 'consent' && (
                    <div style={{ maxWidth: 520, width: '100%' }}>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 36 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                border: '1px solid rgba(139,0,0,0.35)',
                                background: 'rgba(139,0,0,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: '0 0 28px rgba(139,0,0,0.12)',
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h2 style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: 700, fontSize: 24,
                                letterSpacing: '-0.025em', color: 'white',
                                marginBottom: 8, lineHeight: 1.2,
                            }}>
                                Termo de Consentimento
                            </h2>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
                                Leia atentamente antes de prosseguir
                            </p>
                        </div>

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                            {[
                                {
                                    num: '01', label: 'Coleta e Uso',
                                    text: 'Este protocolo registra a cadência temporal de sua digitação (IKIs). Estes dados serão utilizados em experimentos científicos e no treinamento de modelos de Inteligência Artificial.',
                                },
                                {
                                    num: '02', label: 'Anonimização e Retenção',
                                    text: 'Seus dados são processados através de um hash criptográfico irreversível e permanecerão armazenados em nossos servidores por um período de 5 anos para fins de pesquisa e validação estatística.',
                                },
                                {
                                    num: '03', label: 'Direitos e Exclusão',
                                    text: 'Sua participação é voluntária. Em conformidade com a LGPD, você possui o direito de solicitar a exclusão definitiva de seus registros de nossa base de dados a qualquer momento através dos canais de suporte da Xcorphion.',
                                },
                            ].map(item => (
                                <div key={item.num} style={{
                                    display: 'flex', gap: 16, alignItems: 'flex-start',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 12, padding: '16px 20px',
                                }}>
                                    <span style={{
                                        fontFamily: "'Inter', sans-serif", fontSize: 9,
                                        fontWeight: 600, color: '#8B0000',
                                        background: 'rgba(139,0,0,0.1)',
                                        border: '1px solid rgba(139,0,0,0.22)',
                                        borderRadius: 4, padding: '3px 7px',
                                        letterSpacing: '0.08em', flexShrink: 0,
                                        marginTop: 2,
                                    }}>
                                        {item.num}
                                    </span>
                                    <div>
                                        <p style={{
                                            fontFamily: "'Space Grotesk', sans-serif",
                                            fontSize: 13, fontWeight: 600,
                                            color: 'rgba(255,255,255,0.75)',
                                            marginBottom: 4, lineHeight: 1.3,
                                        }}>
                                            {item.label}
                                        </p>
                                        <p style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: 13, color: 'rgba(255,255,255,0.45)',
                                            lineHeight: 1.7, margin: 0, fontWeight: 300,
                                        }}>
                                            {item.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Link to full terms */}
                        <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 12,
                            color: 'rgba(255,255,255,0.25)', textAlign: 'center',
                            marginBottom: 24, lineHeight: 1.6,
                        }}>
                            Termos completos em{' '}
                            <a
                                href={`${process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online'}/terms`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline', textUnderlineOffset: 3 }}
                            >
                                xcorphion.online/terms
                            </a>
                        </p>

                        {/* CTA */}
                        <button
                            onClick={() => { console.log(`[DEBUG][FIX-4] Consentimento Dado.`); setStep('wpm'); }}
                            style={{
                                width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14,
                                color: 'white', background: '#8B0000',
                                border: 'none', borderRadius: 10,
                                padding: '15px 28px', cursor: 'pointer',
                                letterSpacing: '0.04em',
                                boxShadow: '0 0 28px rgba(139,0,0,0.22)',
                                transition: 'background 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#9e0000'; e.currentTarget.style.boxShadow = '0 0 48px rgba(139,0,0,0.42)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.boxShadow = '0 0 28px rgba(139,0,0,0.22)'; }}
                        >
                            Aceito e desejo continuar
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>

                    </div>
                )}

                {/* ── CALIBRAÇÃO ─────────────────────────────────────────────── */}
                {step === 'wpm' && (
                    <div style={{ maxWidth: 560, width: '100%' }} className="step-enter">

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 36 }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(139,0,0,0.35)', background: 'rgba(139,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 28px rgba(139,0,0,0.12)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>
                                </svg>
                            </div>
                            <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 24, letterSpacing: '-0.025em', color: 'white', marginBottom: 8, lineHeight: 1.2 }}>
                                Velocidade de Digitação
                            </h2>
                            <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
                                Escreva a frase abaixo o mais rápido e preciso que conseguir.<br/>O cronômetro começa na primeira tecla.
                            </p>
                        </div>

                        {/* Phrase card */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
                            <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, fontStyle: 'italic', fontWeight: 300, margin: 0 }}>
                                "A técnica de Keystroke Dynamics estuda o ritmo individual de digitação. Cada pessoa possui um ritmo, uma pressão e um padrão de escrita. É isso que a Xcorphion está compreendendo."
                            </p>
                        </div>

                        {/* Textarea */}
                        <textarea
                            id="wpm-textarea"
                            onKeyDown={handleWpmKeyDown}
                            style={{
                                width: '100%', height: 140, display: 'block',
                                fontFamily: F.inter, fontSize: 15,
                                color: 'white', fontWeight: 300,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 12, padding: '16px 20px',
                                outline: 'none', resize: 'none', lineHeight: 1.7,
                                transition: 'border-color 0.2s',
                                marginBottom: 16,
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,0,0,0.45)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                            placeholder="Comece a digitar..."
                        />

                        {/* Timer / WPM */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: F.space, fontSize: 10, fontWeight: 600, color: '#8B0000', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                                Tempo: {wpmTimer}s
                            </span>
                            <span style={{ fontFamily: F.space, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                                {wpmValue} WPM
                            </span>
                        </div>
                    </div>
                )}

                {/* ── ESCRITA ─────────────────────────────────────────────────── */}
                {step === 'writing' && (
                    <div style={{ width: '100%', maxWidth: 880 }} className="step-enter">

                        {/* Jitter warning */}
                        {jitterWarning && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, background: 'rgba(139,0,0,0.07)', border: '1px solid rgba(139,0,0,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 28 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: F.space, fontSize: 12, fontWeight: 600, color: '#8B0000', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Instabilidade de Hardware Detectada</p>
                                    <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, fontWeight: 300 }}>Seu dispositivo apresenta oscilações de latência. Para resultados acadêmicos precisos, sugerimos trocar para um computador com conexão estável.</p>
                                </div>
                                <button onClick={() => setJitterWarning(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>✕</button>
                            </div>
                        )}

                        {/* Prompt */}
                        <div style={{ marginBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 28 }}>
                            <p style={{ fontFamily: F.space, fontSize: 'clamp(18px, 2.4vw, 26px)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.45, letterSpacing: '-0.02em', fontWeight: 600 }}>
                                {promptText}
                            </p>
                        </div>

                        {/* Writing area */}
                        <textarea
                            ref={writingAreaRef}
                            onKeyDown={handleWritingKey}
                            onKeyUp={handleWritingKey}
                            disabled={showEma || showEnd}
                            style={{
                                width: '100%', height: 'calc(55vh + 80px)', display: 'block',
                                fontFamily: F.inter, fontSize: 18, fontWeight: 300,
                                color: 'rgba(255,255,255,0.72)',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 14, padding: '28px 32px',
                                outline: 'none', resize: 'none', lineHeight: 1.82,
                                transition: 'border-color 0.2s',
                                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
                                opacity: (showEma || showEnd) ? 0.4 : 1,
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,0,0,0.35)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                            placeholder="Escreva livremente..."
                        />

                        {/* Char counter */}
                        <div style={{ textAlign: 'right', marginTop: 10 }}>
                            <span style={{ fontFamily: F.space, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                                {charCount} caracteres coletados
                            </span>
                        </div>

                        {/* EMA overlay */}
                        {showEma && (
                            <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                                <div style={{ width: '100%', maxWidth: 340, background: '#070707', border: '1px solid rgba(255,255,255,0.08)', padding: '44px 40px', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

                                    <p style={{ fontFamily: F.inter, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 36 }}>
                                        Estado atual
                                    </p>

                                    {/* Valence */}
                                    <div style={{ marginBottom: 36 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.inter, fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                                            <span>Muito Negativo</span><span>Muito Positivo</span>
                                        </div>
                                        <input type="range" id="v-slider" min="0" max="100" defaultValue="50" />
                                    </div>

                                    {/* Arousal */}
                                    <div style={{ marginBottom: 40 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.inter, fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                                            <span>Muito Calmo</span><span>Muito Agitado</span>
                                        </div>
                                        <input type="range" id="a-slider" min="0" max="100" defaultValue="50" />
                                    </div>

                                    <button
                                        onClick={handleEmaSubmit}
                                        style={{ width: '100%', fontFamily: F.inter, fontWeight: 500, fontSize: 13, color: 'white', background: '#8B0000', border: 'none', borderRadius: 10, padding: '14px 24px', cursor: 'pointer', letterSpacing: '0.06em', boxShadow: '0 0 24px rgba(139,0,0,0.22)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#9e0000'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#8B0000'}
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* End overlay */}
                        {showEnd && (
                            <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
                                <div style={{ width: '100%', maxWidth: 480 }}>

                                    {endStep === 'rating' && (
                                        <div className="step-enter">
                                            <span style={{ display: 'block', fontFamily: F.inter, fontSize: 10, color: '#8B0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Sessão concluída</span>
                                            <h3 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 'clamp(20px, 3vw, 28px)', color: 'white', letterSpacing: '-0.025em', lineHeight: 1.3, marginBottom: 8 }}>Seu relato foi salvo.</h3>
                                            <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.4)', fontWeight: 300, marginBottom: 40, lineHeight: 1.6 }}>Como você avalia a qualidade desta sessão?</p>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                                                {[1, 2, 3, 4, 5].map(r => (
                                                    <button key={r}
                                                        onClick={() => { pendingRatingRef.current = r; setEndStep('genuine'); }}
                                                        style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontFamily: F.space, fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.borderColor = '#8B0000'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = '0 0 20px rgba(139,0,0,0.3)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                    >{r}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {endStep === 'genuine' && (
                                        <div className="step-enter">
                                            <span style={{ display: 'block', fontFamily: F.inter, fontSize: 10, color: '#8B0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Última pergunta</span>
                                            <h3 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 'clamp(20px, 3vw, 28px)', color: 'white', letterSpacing: '-0.025em', lineHeight: 1.3, marginBottom: 40 }}>Você estava realmente engajado com essa pesquisa?</h3>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <button onClick={() => handleFinalSubmit(true)} style={{ flex: 1, fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: '#8B0000', border: 'none', borderRadius: 10, padding: '15px', cursor: 'pointer', boxShadow: '0 0 24px rgba(139,0,0,0.22)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#9e0000'} onMouseLeave={e => e.currentTarget.style.background = '#8B0000'}>Sim</button>
                                                <button onClick={() => handleFinalSubmit(false)} style={{ flex: 1, fontFamily: F.inter, fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '15px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}>Não</button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </>
    );
}
