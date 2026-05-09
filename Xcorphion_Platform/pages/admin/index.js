import Head from 'next/head';
import { useState } from 'react';

const F = { space: "'Space Grotesk', sans-serif", inter: "'Inter', sans-serif" };

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: F.inter, fontSize: 14, color: 'white',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '12px 16px', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function AdminPanel() {
  const [password, setPassword]         = useState('');
  const [isAuthenticated, setIsAuth]    = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError]               = useState('');

  const fetchParticipants = async (pwd) => {
    try {
      const res = await fetch('/api/admin/participants', {
        headers: { 'x-admin-password': pwd },
      });
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants);
        setIsAuth(true);
        setError('');
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Senha incorreta');
        setIsAuth(false);
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleLogin = (e) => { e.preventDefault(); fetchParticipants(password); };

  const handleAction = async (participant_code, action) => {
    if (!confirm('Tem certeza?')) return;
    try {
      const res = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ participant_code, action }),
      });
      if (res.ok) fetchParticipants(password);
      else alert('Erro ao executar ação');
    } catch { alert('Erro de conexão'); }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Head><title>Admin Login — Xcorphion</title></Head>
        <div style={{ width: '100%', maxWidth: 380, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 36px' }}>
          <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 22, color: 'white', letterSpacing: '-0.025em', marginBottom: 28 }}>Admin Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <button type="submit" style={{ fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: '#8B0000', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', boxShadow: '0 0 20px rgba(139,0,0,0.22)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#9e0000'} onMouseLeave={e => e.currentTarget.style.background = '#8B0000'}>
              Entrar
            </button>
          </form>
          {error && <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(210,70,70,0.9)', marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    );
  }

  const thStyle = { fontFamily: F.inter, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' };
  const tdStyle = { fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter }}>
      <Head><title>Admin — Xcorphion</title></Head>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 56 }}>
        <span style={{ fontFamily: F.space, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>Controle de Participantes</span>
        <span style={{ fontFamily: F.inter, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{participants.length} participante{participants.length !== 1 ? 's' : ''}</span>
      </header>
      <div style={{ padding: '32px 40px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>{['Código', 'Nome', 'Indicador', 'Status', 'Sessão 1', 'Sessão 2', 'Sessão 3', 'Ações'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {participants.map(p => (
              <tr key={p._id || p.participant_id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ transition: 'background 0.15s' }}>
                <td style={{ ...tdStyle, fontFamily: F.space, fontWeight: 600, color: 'white', fontSize: 13 }}>{p.participant_code || p.participant_id}</td>
                <td style={tdStyle}>{p.participant_name || '—'}</td>
                <td style={tdStyle}>{p.referrer_name || '—'}</td>
                <td style={tdStyle}>
                  <span style={{ display: 'inline-block', fontFamily: F.inter, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, color: p.status === 'ATIVO' ? 'rgba(120,200,120,0.9)' : p.status === 'BLOQUEADO' ? 'rgba(255,255,255,0.3)' : 'rgba(200,80,80,0.9)', background: p.status === 'ATIVO' ? 'rgba(120,200,120,0.08)' : p.status === 'BLOQUEADO' ? 'rgba(255,255,255,0.04)' : 'rgba(200,80,80,0.08)', border: `1px solid ${p.status === 'ATIVO' ? 'rgba(120,200,120,0.2)' : p.status === 'BLOQUEADO' ? 'rgba(255,255,255,0.1)' : 'rgba(200,80,80,0.2)'}` }}>{p.status}</span>
                </td>
                {[
                  { status: p.session_1_status, eng: p.session_1_engagement, devMismatch: false, ipMismatch: false },
                  { status: p.session_2_status, eng: p.session_2_engagement, devMismatch: p.session_2_device_mismatch, ipMismatch: p.session_2_ip_mismatch },
                  { status: p.session_3_status, eng: p.session_3_engagement, devMismatch: p.session_3_device_mismatch, ipMismatch: p.session_3_ip_mismatch },
                ].map((s, i) => (
                  <td key={i} style={tdStyle}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                      {s.status || '—'}
                      {(s.devMismatch || s.ipMismatch) && <span title={[s.devMismatch && 'Device diferente', s.ipMismatch && 'IP diferente'].filter(Boolean).join(' · ')} style={{ fontSize: 11, color: 'rgba(220,140,60,0.9)', cursor: 'default' }}>⚠</span>}
                    </span>
                    <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, display: 'block' }}>Eng: {s.eng === true ? 'Sim' : s.eng === false ? 'Não' : '—'}</span>
                  </td>
                ))}
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {p.status === 'ATIVO' && p.session_1_engagement === true && !p.admin_authorized_s2 && p.session_2_status === 'AGUARDANDO' && (
                      <button onClick={() => handleAction(p.participant_id, 'authorize_s2')} style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(120,200,120,0.9)', background: 'rgba(120,200,120,0.08)', border: '1px solid rgba(120,200,120,0.2)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s' }}>Lib. S2</button>
                    )}
                    {p.status === 'ATIVO' && p.session_2_engagement === true && !p.admin_authorized_s3 && p.session_3_status === 'AGUARDANDO' && (
                      <button onClick={() => handleAction(p.participant_id, 'authorize_s3')} style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(120,200,120,0.9)', background: 'rgba(120,200,120,0.08)', border: '1px solid rgba(120,200,120,0.2)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s' }}>Lib. S3</button>
                    )}
                    {p.status === 'ATIVO' && (
                      <button onClick={() => handleAction(p.participant_id, 'deactivate')} style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(200,80,80,0.9)', background: 'rgba(200,80,80,0.06)', border: '1px solid rgba(200,80,80,0.18)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s' }}>Desativar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {participants.length === 0 && (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '48px 16px' }}>Nenhum participante encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
