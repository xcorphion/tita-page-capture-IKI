import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function AdminPanel() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState('');

    const fetchParticipants = async (pwd) => {
        try {
            const res = await fetch('/api/admin/participants', {
                headers: { 'x-admin-password': pwd }
            });
            if (res.ok) {
                const data = await res.json();
                setParticipants(data.participants);
                setIsAuthenticated(true);
                setError('');
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.error || 'Senha incorreta');
                setIsAuthenticated(false);
            }
        } catch (e) {
            setError('Erro ao conectar com o servidor');
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        fetchParticipants(password);
    };

    const handleAction = async (participant_code, action) => {
        if (!confirm('Tem certeza?')) return;
        try {
            const res = await fetch('/api/admin/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, participant_code, action })
            });
            if (res.ok) {
                fetchParticipants(password); // refresh
            } else {
                alert('Erro ao executar ação');
            }
        } catch (e) {
            alert('Erro de conexão');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="center-container">
                <div style={{ maxWidth: 400, background: 'rgba(255,255,255,0.05)', padding: 30, borderRadius: 12, textAlign: 'center' }}>
                    <h2>Admin Login</h2>
                    <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
                        <input 
                            type="password" 
                            placeholder="Senha" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', marginBottom: 15 }}
                        />
                        <button type="submit" className="icon-btn">Entrar</button>
                    </form>
                    {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#fff', background: '#000', minHeight: '100vh' }}>
            <Head>
                <title>Painel Admin - Titã</title>
            </Head>
            <h1 style={{ marginBottom: 30, borderBottom: '1px solid #333', paddingBottom: 10 }}>Controle de Participantes</h1>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#111', borderBottom: '1px solid #333' }}>
                            <th style={{ padding: 12 }}>Código</th>
                            <th style={{ padding: 12 }}>Nome</th>
                            <th style={{ padding: 12 }}>Indicador</th>
                            <th style={{ padding: 12 }}>Status</th>
                            <th style={{ padding: 12 }}>Sessão 1</th>
                            <th style={{ padding: 12 }}>Sessão 2</th>
                            <th style={{ padding: 12 }}>Sessão 3</th>
                            <th style={{ padding: 12 }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map(p => (
                            <tr key={p._id || p.participant_id} style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: 12, fontWeight: 'bold' }}>{p.participant_code || p.participant_id}</td>
                                <td style={{ padding: 12 }}>{p.participant_name || '-'}</td>
                                <td style={{ padding: 12 }}>{p.referrer_name || '-'}</td>
                                <td style={{ padding: 12 }}>
                                    <span style={{ color: p.status === 'ATIVO' ? '#4caf50' : '#f44336' }}>{p.status}</span>
                                </td>
                                <td style={{ padding: 12 }}>{p.session_1_status}<br/><small>Eng: {p.session_1_engagement ? 'Sim' : p.session_1_engagement === false ? 'Não' : '-'}</small></td>
                                <td style={{ padding: 12 }}>{p.session_2_status}<br/><small>Eng: {p.session_2_engagement ? 'Sim' : p.session_2_engagement === false ? 'Não' : '-'}</small></td>
                                <td style={{ padding: 12 }}>{p.session_3_status}<br/><small>Eng: {p.session_3_engagement ? 'Sim' : p.session_3_engagement === false ? 'Não' : '-'}</small></td>
                                <td style={{ padding: 12 }}>
                                    {p.status === 'ATIVO' && p.session_1_engagement === true && !p.admin_authorized_s2 && p.session_2_status === 'AGUARDANDO' && (
                                        <button onClick={() => handleAction(p.participant_id, 'authorize_s2')} style={{ marginRight: 8, padding: '5px 10px', background: '#4caf50', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>Lib. S2</button>
                                    )}
                                    {p.status === 'ATIVO' && p.session_2_engagement === true && !p.admin_authorized_s3 && p.session_3_status === 'AGUARDANDO' && (
                                        <button onClick={() => handleAction(p.participant_id, 'authorize_s3')} style={{ marginRight: 8, padding: '5px 10px', background: '#4caf50', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>Lib. S3</button>
                                    )}
                                    {p.status === 'ATIVO' && (
                                        <button onClick={() => handleAction(p.participant_id, 'deactivate')} style={{ padding: '5px 10px', background: '#f44336', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>Desativar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {participants.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ padding: 20, textAlign: 'center', color: '#888' }}>Nenhum participante encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
