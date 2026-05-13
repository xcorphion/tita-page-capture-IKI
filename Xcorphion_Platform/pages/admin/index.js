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

const STATUS_OPTIONS = ['TODOS', 'ATIVO', 'INATIVO', 'BLOQUEADO'];

export default function AdminPanel() {
  const [password, setPassword]         = useState('');
  const [isAuthenticated, setIsAuth]    = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError]               = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [copiedCode, setCopiedCode]     = useState(null);

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

  // URL uses participant_id (hash) — raw code never exposed in shared links.
  // copiedCode keyed on participant_code for visual feedback on the correct table row.
  const copyInviteLink = (code, participantId) => {
    const url = `${window.location.origin}/study/convite/${participantId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1800);
    });
  };

  const handleAction = async (participant_code, action, participant) => {
    const name = participant.participant_name || participant.participant_code;
    if (action === 'block') {
      const hasData = (participant.sessions_completed > 0)
        || participant.session_1_status === 'CONCLUIDA'
        || participant.session_2_status === 'CONCLUIDA'
        || participant.session_3_status === 'CONCLUIDA'
        || participant.onboarding_complete;
      if (hasData) {
        const ok = confirm(
          `⚠️ ATENÇÃO — ${name} tem dados registrados.\n\n` +
          `Isso vai deletar permanentemente:\n` +
          `• Todos os eventos de digitação\n` +
          `• Todas as respostas EMA\n` +
          `• Todas as sessões\n` +
          `• E bloquear o IP do participante\n\n` +
          `Clique OK para confirmar.`
        );
        if (!ok) return;
      } else {
        if (!confirm(`Bloquear ${name}? Isso bloqueará o IP e apagará os dados.`)) return;
      }
    } else if (action === 'inactivate') {
      if (!confirm(`Inativar ${name}?\n\nO acesso à pesquisa será bloqueado, mas os dados serão preservados e o IP não será bloqueado.`)) return;
    } else {
      if (!confirm('Tem certeza?')) return;
    }
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

  const filtered = statusFilter === 'TODOS' ? participants : participants.filter(p => p.status === statusFilter);

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter }}>
      <Head><title>Admin — Xcorphion</title></Head>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 56 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { href: '/admin',            label: 'Participantes', active: true },
            { href: '/admin/dashboard',  label: 'Dashboard',     active: false },
            { href: '/admin/cards',      label: 'Artigos',       active: false },
            { href: '/admin/marketing',  label: 'Marketing',     active: false },
          ].map(({ href, label, active }) => (
            <a key={href} href={href} style={{ fontFamily: F.inter, fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', transition: 'all 0.15s', background: active ? 'rgba(255,255,255,0.1)' : 'transparent', color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.32)', border: `1px solid ${active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
              {label}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ fontFamily: F.inter, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s', border: statusFilter === s ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.06)', background: statusFilter === s ? 'rgba(255,255,255,0.08)' : 'transparent', color: statusFilter === s ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}>
                {s}
              </button>
            ))}
          </div>
          <span style={{ fontFamily: F.inter, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{filtered.length}/{participants.length}</span>
        </div>
      </header>
      <div style={{ padding: '32px 40px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>{['Código', 'Nome', 'Indicador', 'Status', 'Sessão 1', 'Sessão 2', 'Sessão 3', 'Ações'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id || p.participant_id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ transition: 'background 0.15s' }}>
                <td style={{ ...tdStyle }}>
                  <span
                    onClick={() => copyInviteLink(p.participant_code, p.participant_id)}
                    title="Clique para copiar link do convite"
                    style={{ fontFamily: F.space, fontWeight: 600, fontSize: 13, color: copiedCode === p.participant_code ? 'rgba(120,200,120,0.9)' : 'white', cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s' }}
                  >
                    {copiedCode === p.participant_code ? '✓ copiado' : (p.participant_code || p.participant_id)}
                  </span>
                </td>
                <td style={tdStyle}>{p.participant_name || '—'}</td>
                <td style={tdStyle}>{p.referrer_name || '—'}</td>
                <td style={tdStyle}>
                  <span style={{ display: 'inline-block', fontFamily: F.inter, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4,
                    color: p.status === 'ATIVO' ? 'rgba(120,200,120,0.9)' : p.status === 'INATIVO' ? 'rgba(220,140,60,0.9)' : p.status === 'BLOQUEADO' ? 'rgba(255,255,255,0.3)' : 'rgba(200,80,80,0.9)',
                    background: p.status === 'ATIVO' ? 'rgba(120,200,120,0.08)' : p.status === 'INATIVO' ? 'rgba(220,140,60,0.08)' : p.status === 'BLOQUEADO' ? 'rgba(255,255,255,0.04)' : 'rgba(200,80,80,0.08)',
                    border: `1px solid ${p.status === 'ATIVO' ? 'rgba(120,200,120,0.2)' : p.status === 'INATIVO' ? 'rgba(220,140,60,0.2)' : p.status === 'BLOQUEADO' ? 'rgba(255,255,255,0.1)' : 'rgba(200,80,80,0.2)'}` }}>{p.status}</span>
                </td>
                {[
                  { status: p.session_1_status, eng: p.session_1_engagement, devMismatch: false, ipMismatch: false },
                  { status: p.session_2_status, eng: p.session_2_engagement, devMismatch: p.session_2_device_mismatch, ipMismatch: p.session_2_ip_mismatch },
                  { status: p.session_3_status, eng: p.session_3_engagement, devMismatch: p.session_3_device_mismatch, ipMismatch: p.session_3_ip_mismatch },
                ].map((s, i) => {
                  const progress = s.status === 'CONCLUIDA' ? 100 : s.status === 'EM_ANDAMENTO' ? 50 : s.status === 'BLOQUEADA' || s.status === 'INATIVO' ? 0 : s.status === 'AGUARDANDO' ? 0 : s.status === 'LIBERADA' ? 15 : 0;
                  const barColor = s.status === 'CONCLUIDA' ? (s.eng === false ? 'rgba(220,140,60,0.7)' : 'rgba(120,200,120,0.7)') : s.status === 'BLOQUEADA' ? 'rgba(255,255,255,0.12)' : 'rgba(139,0,0,0.6)';
                  return (
                    <td key={i} style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: s.status === 'CONCLUIDA' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>{s.status || '—'}</span>
                        {(s.devMismatch || s.ipMismatch) && <span title={[s.devMismatch && 'Device diferente', s.ipMismatch && 'IP diferente'].filter(Boolean).join(' · ')} style={{ fontSize: 11, color: 'rgba(220,140,60,0.9)', cursor: 'default' }}>⚠</span>}
                      </div>
                      <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: barColor, borderRadius: 2, transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontFamily: F.inter, fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4, display: 'block' }}>Eng: {s.eng === true ? 'Sim' : s.eng === false ? 'Não' : '—'}</span>
                    </td>
                  );
                })}
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {p.status === 'ATIVO' && p.session_1_engagement === true && !p.admin_authorized_s2 && p.session_2_status === 'AGUARDANDO' && (
                      <button onClick={() => handleAction(p.participant_id, 'authorize_s2', p)} style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(120,200,120,0.9)', background: 'rgba(120,200,120,0.08)', border: '1px solid rgba(120,200,120,0.2)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s' }}>Lib. S2</button>
                    )}
                    {p.status === 'ATIVO' && p.session_2_engagement === true && !p.admin_authorized_s3 && p.session_3_status === 'AGUARDANDO' && (
                      <button onClick={() => handleAction(p.participant_id, 'authorize_s3', p)} style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(120,200,120,0.9)', background: 'rgba(120,200,120,0.08)', border: '1px solid rgba(120,200,120,0.2)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s' }}>Lib. S3</button>
                    )}
                    {p.status === 'ATIVO' && (
                      <button onClick={() => handleAction(p.participant_id, 'inactivate', p)} style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(220,140,60,0.9)', background: 'rgba(220,140,60,0.06)', border: '1px solid rgba(220,140,60,0.18)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s' }}>Inativar</button>
                    )}
                    {p.status === 'ATIVO' && (
                      <button onClick={() => handleAction(p.participant_id, 'block', p)} style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(200,80,80,0.9)', background: 'rgba(200,80,80,0.06)', border: '1px solid rgba(200,80,80,0.18)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s' }}>Bloquear</button>
                    )}
                    {(p.status === 'BLOQUEADO' || p.status === 'INATIVO') && (
                      <button onClick={() => handleAction(p.participant_id, 'reactivate', p)} style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(100,160,255,0.9)', background: 'rgba(100,160,255,0.06)', border: '1px solid rgba(100,160,255,0.18)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.15s' }}>Reativar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '48px 16px' }}>Nenhum participante encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
