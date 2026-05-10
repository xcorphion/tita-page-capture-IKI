import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

function detectPhysicalKeyboard() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return false;
  if (/iPhone|iPod/i.test(ua)) return false;
  if (/iPad/i.test(ua)) return false;
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return false;
  return true;
}

export default function ConectPage() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [code, setCode] = useState('');
  const [screen, setScreen] = useState('input'); // input | loading | checking | valid | invalid_device | error
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [participantCode, setParticipantCode] = useState('');
  const [respondentNum, setRespondentNum] = useState(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (screen !== 'checking') return;
    if (countdown === 0) {
      const hasKeyboard = detectPhysicalKeyboard();
      setScreen(hasKeyboard ? 'valid' : 'invalid_device');
      return;
    }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [screen, countdown]);

  const handleSubmit = async () => {
    const raw = code.trim().toUpperCase();
    if (raw.length !== 6 || screen === 'loading') return;

    setScreen('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/conect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connect_code: raw }),
      });
      const data = await res.json();

      if (!data.valid) {
        setScreen('input');
        if (data.reason === 'invalid_code')
          setErrorMsg('Código não encontrado. Verifique e tente novamente.');
        else if (data.reason === 'blocked')
          setErrorMsg('Acesso não disponível. Entre em contato com a equipe da pesquisa.');
        else if (data.reason === 'completed')
          setErrorMsg('Você já completou todas as sessões disponíveis. Obrigado pela participação.');
        else if (data.reason === 'rate_limited')
          setErrorMsg('Muitas tentativas. Aguarde alguns minutos.');
        else
          setErrorMsg('Erro ao verificar. Tente novamente.');
        return;
      }

      setParticipantCode(data.participant_code);
      setRespondentNum(data.respondent_number);
      setCountdown(5);
      setScreen('checking');
    } catch {
      setScreen('input');
      setErrorMsg('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  };

  const handleRetry = () => {
    setScreen('input');
    setCode('');
    setErrorMsg('');
    setCountdown(5);
  };

  return (
    <>
      <Head>
        <title>Retomar Participação — Xcorphion</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        input[type="text"] { -webkit-appearance: none; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#080808', color: 'white',
        fontFamily: F.inter, display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <header style={{
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 clamp(16px, 4vw, 40px)', height: 56, flexShrink: 0,
        }}>
          <span style={{ fontFamily: F.space, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Xcorphion Research
          </span>
        </header>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 40px)' }}>

          {(screen === 'input' || screen === 'loading') && (
            <div className="fade-up" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(139,0,0,0.35)', background: 'rgba(139,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 28px rgba(139,0,0,0.1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>

              <h1 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 'clamp(22px, 3.5vw, 30px)', letterSpacing: '-0.03em', color: 'white', marginBottom: 12, lineHeight: 1.2 }}>
                Retome sua participação
              </h1>
              <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontWeight: 300, marginBottom: 36 }}>
                Para prosseguir com a pesquisa neste equipamento, insira o código que você recebeu.
              </p>

              <div style={{ marginBottom: errorMsg ? 12 : 24 }}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ex: AB3X7K"
                  value={code}
                  maxLength={6}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setErrorMsg(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  disabled={screen === 'loading'}
                  style={{
                    width: '100%', fontFamily: F.inter, fontSize: 22,
                    fontWeight: 600, letterSpacing: '0.2em', textAlign: 'center',
                    color: 'white', background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${errorMsg ? 'rgba(200,60,60,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 12, padding: '18px 24px', outline: 'none',
                    transition: 'border-color 0.2s',
                    opacity: screen === 'loading' ? 0.6 : 1,
                    textTransform: 'uppercase',
                  }}
                  onFocus={e => { if (!errorMsg) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                  onBlur={e => { if (!errorMsg) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>

              {errorMsg && (
                <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(200,60,60,0.85)', marginBottom: 20, lineHeight: 1.5 }}>
                  {errorMsg}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={code.trim().length !== 6 || screen === 'loading'}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: F.inter, fontWeight: 500, fontSize: 15,
                  color: 'white',
                  background: (code.trim().length !== 6 || screen === 'loading') ? 'rgba(139,0,0,0.4)' : '#8B0000',
                  border: 'none', borderRadius: 10, padding: '15px 28px',
                  cursor: (code.trim().length !== 6 || screen === 'loading') ? 'default' : 'pointer',
                  boxShadow: screen === 'loading' ? 'none' : '0 0 24px rgba(139,0,0,0.22)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { if (code.trim().length === 6 && screen !== 'loading') { e.currentTarget.style.background = '#9e0000'; e.currentTarget.style.boxShadow = '0 0 40px rgba(139,0,0,0.4)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = (code.trim().length !== 6 || screen === 'loading') ? 'rgba(139,0,0,0.4)' : '#8B0000'; e.currentTarget.style.boxShadow = screen === 'loading' ? 'none' : '0 0 24px rgba(139,0,0,0.22)'; }}
              >
                {screen === 'loading' ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar código
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </>
                )}
              </button>
            </div>
          )}

          {screen === 'checking' && (
            <div className="fade-up" style={{ textAlign: 'center', maxWidth: 380 }}>
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 28px' }}>
                <div style={{ width: 72, height: 72, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: F.space, fontWeight: 700, fontSize: 28, color: 'rgba(255,255,255,0.7)' }}>{countdown}</span>
                </div>
                <svg style={{ position: 'absolute', inset: 0, animation: 'spin 1s linear infinite' }} width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <circle cx="36" cy="36" r="34" stroke="#8B0000" strokeWidth="1.5" strokeDasharray="213" strokeDashoffset="160" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', fontWeight: 300 }}>
                Verificando elegibilidade de equipamento...
              </p>
            </div>
          )}

          {screen === 'valid' && (
            <div className="fade-up" style={{ textAlign: 'center', maxWidth: 440 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', border: '1px solid rgba(139,0,0,0.4)', background: 'rgba(139,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 32px rgba(139,0,0,0.15)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em', color: 'white', marginBottom: 10, lineHeight: 1.2 }}>
                Equipamento válido
              </h2>
              <p style={{ fontFamily: F.inter, fontSize: 16, color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.6, marginBottom: 36 }}>
                Boa pesquisa{respondentNum != null ? `, respondente n° ${respondentNum}` : ''}.
              </p>
              <a
                href={`/study/IKI/${participantCode}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  fontFamily: F.inter, fontWeight: 500, fontSize: 15,
                  color: 'white', background: '#8B0000',
                  padding: '14px 36px', borderRadius: 8,
                  textDecoration: 'none',
                  boxShadow: '0 0 28px rgba(139,0,0,0.25)',
                  transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#9e0000'; e.currentTarget.style.boxShadow = '0 0 48px rgba(139,0,0,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.boxShadow = '0 0 28px rgba(139,0,0,0.25)'; e.currentTarget.style.transform = 'none'; }}
              >
                Iniciar pesquisa
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            </div>
          )}

          {screen === 'invalid_device' && (
            <div className="fade-up" style={{ textAlign: 'center', maxWidth: 440 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 24, letterSpacing: '-0.025em', color: 'white', marginBottom: 12, lineHeight: 1.2 }}>
                Equipamento não válido
              </h2>
              <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.4)', fontWeight: 300, lineHeight: 1.7, marginBottom: 32 }}>
                Este dispositivo não possui teclado físico. Acesse a pesquisa de um computador, notebook ou tablet com teclado conectado.
              </p>
              <button
                onClick={handleRetry}
                style={{
                  fontFamily: F.inter, fontWeight: 400, fontSize: 14,
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '12px 28px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                Tentar em outro dispositivo
              </button>
            </div>
          )}

        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(14px,2vw,20px) clamp(16px,4vw,40px)', display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>
            © 2026 Xcorphion Corporation
          </span>
        </div>
      </div>
    </>
  );
}
