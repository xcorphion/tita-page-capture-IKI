import Head from 'next/head';
import { useState, useEffect } from 'react';
import InfluencesEditor from '../../src/components/xcorphion/InfluencesEditor';

const F = { space: "'Space Grotesk', sans-serif", inter: "'Inter', sans-serif" };

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: F.inter, fontSize: 14, color: 'white',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '12px 16px', outline: 'none',
  transition: 'border-color 0.2s',
};

const NAV_LINKS = [
  { href: '/admin',            label: 'Participantes' },
  { href: '/admin/dashboard',  label: 'Dashboard' },
  { href: '/admin/cards',      label: 'Artigos' },
  { href: '/admin/marketing',  label: 'Marketing' },
  { href: '/admin/influences', label: 'Influências' },
];

export default function AdminInfluences() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [error, setError] = useState('');
  const [initialConfig, setInitialConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/influences-config', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        const data = await res.json();
        setInitialConfig(data.config);
        setIsAuth(true);
        setError('');
      } else {
        setError('Senha incorreta');
      }
    } catch {
      setError('Erro de conexão');
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Head><title>Admin · Influências — Xcorphion</title></Head>
        <div style={{ width: '100%', maxWidth: 380, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 36px' }}>
          <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 22, color: 'white', letterSpacing: '-0.025em', marginBottom: 6 }}>Admin Login</h2>
          <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.25)', marginBottom: 24, fontWeight: 300 }}>Editor · Influências Chave</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password" placeholder="Senha" value={password}
              onChange={e => setPassword(e.target.value)} style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button
              type="submit" disabled={loading}
              style={{ fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: '#8B0000', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', transition: 'background 0.2s', opacity: loading ? 0.6 : 1 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#9e0000'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#8B0000'; }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          {error && <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(210,70,70,0.9)', marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter }}>
      <Head><title>Admin · Influências — Xcorphion</title></Head>

      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(24px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 56,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === '/admin/influences';
            return (
              <a key={href} href={href} style={{
                fontFamily: F.inter, fontSize: 10, fontWeight: 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
                transition: 'all 0.15s',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.32)',
                border: `1px solid ${active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                {label}
              </a>
            );
          })}
        </div>
        <span style={{ fontFamily: F.inter, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          /influences editor
        </span>
      </header>

      <InfluencesEditor password={password} initialConfig={initialConfig} />
    </div>
  );
}
