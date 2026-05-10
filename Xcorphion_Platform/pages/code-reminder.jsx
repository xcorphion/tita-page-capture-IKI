import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

export default function CodeReminderPage() {
  const [email, setEmail]   = useState('');
  const [step, setStep]     = useState('idle'); // idle | sending | done
  const [error, setError]   = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || step === 'sending') return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('E-mail inválido.');
      return;
    }
    setError('');
    setStep('sending');
    try {
      await fetch('/api/code-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStep('done');
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setStep('idle');
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar código — Xcorphion</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        <div style={{ maxWidth: 420, width: '100%' }}>

          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 48, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Início
          </Link>

          <p style={{ fontFamily: F.inter, fontSize: 11, color: '#8B0000', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Xcorphion Research</p>

          {step === 'done' ? (
            <>
              <h1 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 'clamp(22px, 4vw, 30px)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>E-mail enviado.</h1>
              <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 32 }}>
                Se houver uma conta vinculada a <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>{email}</strong>, você receberá o código de participante em breve.
              </p>
              <button onClick={() => { setEmail(''); setStep('idle'); }} style={{ fontFamily: F.inter, fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                Tentar outro e-mail
              </button>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 'clamp(22px, 4vw, 30px)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16 }}>Esqueceu seu código?</h1>
              <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 36 }}>
                Digite o e-mail usado no cadastro. Se houver uma conta vinculada, enviaremos seu código de participante.
              </p>

              <div style={{ marginBottom: 16 }}>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  disabled={step === 'sending'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: F.inter, fontSize: 15, color: 'white',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${error ? 'rgba(200,80,80,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10, padding: '14px 16px',
                    outline: 'none', transition: 'border-color 0.2s',
                    opacity: step === 'sending' ? 0.6 : 1,
                  }}
                  onFocus={e => { if (!error) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                  onBlur={e => { if (!error) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                {error && <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(200,80,80,0.9)', margin: '8px 0 0' }}>{error}</p>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={step === 'sending' || !email.trim()}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: F.inter, fontWeight: 500, fontSize: 15, color: 'white',
                  background: step === 'sending' || !email.trim() ? 'rgba(139,0,0,0.4)' : '#8B0000',
                  border: 'none', borderRadius: 10, padding: '14px',
                  cursor: step === 'sending' || !email.trim() ? 'default' : 'pointer',
                  boxShadow: step === 'sending' ? 'none' : '0 0 24px rgba(139,0,0,0.22)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (step !== 'sending' && email.trim()) e.currentTarget.style.background = '#9e0000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = step === 'sending' || !email.trim() ? 'rgba(139,0,0,0.4)' : '#8B0000'; }}
              >
                {step === 'sending' ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />Enviando...</>
                ) : 'Enviar código'}
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
