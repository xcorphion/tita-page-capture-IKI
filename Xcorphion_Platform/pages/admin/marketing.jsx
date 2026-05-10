import Head from 'next/head';
import { useState } from 'react';

const F = { space: "'Space Grotesk', sans-serif", inter: "'Inter', sans-serif" };

const SEGMENTS = [
  { value: 'waitlist',          label: 'Lista de espera' },
  { value: 'all_participants',  label: 'Todos os participantes (ativos)' },
  { value: 's1_complete',       label: 'Sessão 1 concluída' },
  { value: 's2_complete',       label: 'Sessão 2 concluída' },
  { value: 'all_complete',      label: 'Pesquisa completa (3 sessões)' },
];

const NavPill = ({ href, label, active }) => (
  <a href={href} style={{ fontFamily: F.inter, fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', transition: 'all 0.15s', background: active ? 'rgba(255,255,255,0.1)' : 'transparent', color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.32)', border: `1px solid ${active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
    {label}
  </a>
);

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: F.inter, fontSize: 14, color: 'white',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '12px 16px', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function AdminMarketing() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth]     = useState(false);
  const [authError, setAuthError] = useState('');

  const [segment, setSegment]   = useState('waitlist');
  const [subject, setSubject]   = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [sendState, setSendState] = useState('idle'); // idle | confirming | sending | done
  const [result, setResult]     = useState(null);
  const [campaignError, setCampaignError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!password) return;
    // Validate by making a cheap authenticated request
    const res = await fetch('/api/admin/participants', {
      headers: { 'x-admin-password': password },
    });
    if (res.ok) { setIsAuth(true); setAuthError(''); }
    else setAuthError('Senha incorreta.');
  };

  const handleSend = async () => {
    if (!subject.trim() || !htmlBody.trim()) {
      setCampaignError('Assunto e corpo são obrigatórios.');
      return;
    }
    setSendState('sending');
    setCampaignError('');
    try {
      const res = await fetch('/api/admin/email-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ segment, subject: subject.trim(), html_body: htmlBody }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCampaignError(data.error || 'Erro no envio.');
        setSendState('idle');
      } else {
        setResult(data);
        setSendState('done');
      }
    } catch {
      setCampaignError('Erro de conexão.');
      setSendState('idle');
    }
  };

  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Head><title>Marketing — Xcorphion Admin</title></Head>
        <form onSubmit={handleAuth} style={{ maxWidth: 360, width: '100%' }}>
          <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 22, color: 'white', letterSpacing: '-0.025em', marginBottom: 28 }}>Admin Marketing</h2>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" autoFocus style={{ ...inputStyle, marginBottom: 12 }} onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
          {authError && <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(200,80,80,0.9)', marginBottom: 12 }}>{authError}</p>}
          <button type="submit" style={{ width: '100%', fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: '#8B0000', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', boxShadow: '0 0 20px rgba(139,0,0,0.22)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#9e0000'} onMouseLeave={e => e.currentTarget.style.background = '#8B0000'}>
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter }}>
      <Head><title>Marketing — Xcorphion Admin</title></Head>

      <header style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 40px', height: 56 }}>
        <NavPill href="/admin" label="Participantes" active={false} />
        <NavPill href="/admin/dashboard" label="Dashboard" active={false} />
        <NavPill href="/admin/cards" label="Artigos" active={false} />
        <NavPill href="/admin/marketing" label="Marketing" active={true} />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, height: 'calc(100vh - 56px)' }}>

        {/* Left: Form */}
        <div style={{ padding: '40px', borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 20, letterSpacing: '-0.025em', marginBottom: 32 }}>Campanha de E-mail</h2>

          {sendState === 'done' && result ? (
            <div style={{ background: 'rgba(120,200,120,0.06)', border: '1px solid rgba(120,200,120,0.2)', borderRadius: 12, padding: '24px 28px', marginBottom: 28 }}>
              <p style={{ fontFamily: F.space, fontWeight: 600, fontSize: 18, color: 'rgba(120,200,120,0.9)', marginBottom: 8 }}>Campanha enviada.</p>
              <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                Enviado para <strong style={{ color: 'white' }}>{result.sent}</strong> endereços.
                {result.failed > 0 && <> <span style={{ color: 'rgba(200,80,80,0.8)' }}>{result.failed} falha(s).</span></>}
                {' '}Total: {result.total}.
              </p>
              <button onClick={() => { setSendState('idle'); setResult(null); setSubject(''); setHtmlBody(''); }} style={{ marginTop: 20, fontFamily: F.inter, fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                Nova campanha
              </button>
            </div>
          ) : (
            <>
              {/* Segment */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Segmento</label>
                <select value={segment} onChange={e => setSegment(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  {SEGMENTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Assunto</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Assunto do e-mail" style={inputStyle} onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* HTML Body */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Corpo HTML</label>
                <textarea
                  value={htmlBody}
                  onChange={e => setHtmlBody(e.target.value)}
                  placeholder="<p>Olá!</p>"
                  rows={14}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', fontSize: 13 }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {campaignError && <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(200,80,80,0.9)', marginBottom: 16 }}>{campaignError}</p>}

              {sendState === 'confirming' ? (
                <div style={{ background: 'rgba(139,0,0,0.08)', border: '1px solid rgba(139,0,0,0.25)', borderRadius: 10, padding: '20px 24px', marginBottom: 12 }}>
                  <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 16, lineHeight: 1.6 }}>
                    Enviar campanha para o segmento <strong style={{ color: 'white' }}>{SEGMENTS.find(s => s.value === segment)?.label}</strong>?<br />
                    Esta ação não pode ser desfeita.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleSend} style={{ flex: 1, fontFamily: F.inter, fontWeight: 600, fontSize: 13, color: 'white', background: '#8B0000', border: 'none', borderRadius: 8, padding: '11px', cursor: 'pointer', boxShadow: '0 0 20px rgba(139,0,0,0.25)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#9e0000'} onMouseLeave={e => e.currentTarget.style.background = '#8B0000'}>
                      Confirmar envio
                    </button>
                    <button onClick={() => setSendState('idle')} style={{ fontFamily: F.inter, fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => { setCampaignError(''); setSendState('confirming'); }}
                    disabled={!subject.trim() || !htmlBody.trim() || sendState === 'sending'}
                    style={{ flex: 1, fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: !subject.trim() || !htmlBody.trim() ? 'rgba(139,0,0,0.35)' : '#8B0000', border: 'none', borderRadius: 8, padding: '12px', cursor: !subject.trim() || !htmlBody.trim() ? 'default' : 'pointer', boxShadow: !subject.trim() || !htmlBody.trim() ? 'none' : '0 0 20px rgba(139,0,0,0.22)', transition: 'background 0.2s' }}
                    onMouseEnter={e => { if (subject.trim() && htmlBody.trim()) e.currentTarget.style.background = '#9e0000'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = !subject.trim() || !htmlBody.trim() ? 'rgba(139,0,0,0.35)' : '#8B0000'; }}
                  >
                    {sendState === 'sending' ? 'Enviando...' : 'Enviar campanha'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>
          <div style={{ padding: '40px 40px 16px', flexShrink: 0 }}>
            <p style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pré-visualização</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: '#fff', margin: '0 24px 24px' }}>
            {htmlBody.trim() ? (
              <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#111', padding: 40 }}>
                <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>O corpo HTML aparecerá aqui.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
