import Head from 'next/head';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: F.inter, fontSize: 14, color: 'white',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '12px 16px', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function Dashboard() {
  const router = useRouter();
  const { session_id, pwd } = router.query;

  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pwd && !isAuthenticated) {
      setPassword(pwd);
      fetchData(pwd);
    }
  }, [pwd]);

  const fetchData = async (authPwd) => {
    setLoading(true);
    try {
      const url = session_id
        ? `/api/analysis/report?session_id=${session_id}`
        : '/api/analysis/report';
      const res = await fetch(url, {
        headers: { 'x-admin-password': authPwd || password },
      });
      if (res.ok) {
        const result = await res.json();
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
          setIsAuthenticated(true);
          setError('');
        }
      } else {
        setError('Acesso negado ou erro no processamento');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => { e.preventDefault(); fetchData(password); };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Head><title>Dashboard Login — Xcorphion</title></Head>
        <div style={{ width: '100%', maxWidth: 380, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 36px' }}>
          <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 22, color: 'white', letterSpacing: '-0.025em', marginBottom: 28 }}>Dashboard de Análise</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <button type="submit" style={{ fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: '#8B0000', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', boxShadow: '0 0 20px rgba(139,0,0,0.22)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#9e0000'} onMouseLeave={e => e.currentTarget.style.background = '#8B0000'}>Ver Dashboard</button>
          </form>
          {error && <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(210,70,70,0.9)', marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>Carregando análise estatística...</span>
      </div>
    );
  }

  const { plots, stats } = data;

  return (
    <div style={{ padding: '0 0 60px', background: '#080808', minHeight: '100vh', color: '#fff' }}>
      <Head><title>Pipeline de Análise — Xcorphion</title></Head>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 56 }}>
        <span style={{ fontFamily: F.space, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>
          Pipeline de Análise <span style={{ color: '#8B0000' }}>IKIs × EMAs</span>
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => window.location.href = '/api/analysis/export-csv'} style={{ fontFamily: F.inter, fontWeight: 500, fontSize: 11, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>Exportar CSV</button>
          <button onClick={() => fetchData()} style={{ fontFamily: F.inter, fontWeight: 500, fontSize: 11, color: 'white', background: '#8B0000', border: 'none', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 0 16px rgba(139,0,0,0.2)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#9e0000'} onMouseLeave={e => e.currentTarget.style.background = '#8B0000'}>Atualizar</button>
        </div>
      </header>

      <div style={{ padding: '32px 40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <MetricCard title="Total de Sessões" value={stats.total_sessions} />
          <MetricCard title="Pearson r (Médio)" value={stats.current_pearson.toFixed(3)} color={Math.abs(stats.current_pearson) >= 0.4 ? 'rgba(120,200,120,0.9)' : 'rgba(220,140,60,0.9)'} gate="Gate 2: r ≥ 0.4" met={Math.abs(stats.current_pearson) >= 0.4} />
          <MetricCard title="Cohen's d (Terciles)" value={stats.current_cohens_d.toFixed(3)} color={stats.current_cohens_d >= 0.5 ? 'rgba(120,200,120,0.9)' : 'rgba(220,140,60,0.9)'} gate="Gate 1: d ≥ 0.5" met={stats.current_cohens_d >= 0.5} />
          <MetricCard title="Status do Dataset" value={stats.current_cohens_d >= 0.5 ? 'VALIDADO' : 'COLETANDO'} color={stats.current_cohens_d >= 0.5 ? 'rgba(120,200,120,0.9)' : 'rgba(220,140,60,0.9)'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <PlotCard title="Trajetória no Circumplexo de Russell">
            <Plot data={[{ x: plots.russell.map(p => p.v), y: plots.russell.map(p => p.a), mode: 'lines+markers+text', text: plots.russell.map((p, i) => `EMA ${i + 1}`), line: { shape: 'spline', color: '#8B0000' }, marker: { size: 10, color: plots.russell.map(p => p.char), colorscale: 'Reds' } }]} layout={plotLayout({ xTitle: 'Valência', yTitle: 'Arousal', xRange: [0, 100], yRange: [0, 100] })} style={{ width: '100%' }} config={{ responsive: true }} />
          </PlotCard>
          <PlotCard title="IKI Timeline (Escala Log) + Marcadores EMA">
            <Plot data={[{ x: plots.timeline.ikis.map(i => i.t), y: plots.timeline.ikis.map(i => i.v), mode: 'markers', marker: { size: 2, color: 'rgba(255,255,255,0.15)' }, name: 'IKI (log1p)' }, ...plots.timeline.emas.map((ema, i) => ({ x: [ema.t, ema.t], y: [0, 10], mode: 'lines', line: { color: getQuadrantColor(ema.v, ema.a), width: 2, dash: 'dot' }, name: `EMA ${i + 1}` }))]} layout={plotLayout({ xTitle: 'Tempo Relativo (ms)', yTitle: 'log1p(IKI)', showLegend: false })} style={{ width: '100%' }} config={{ responsive: true }} />
          </PlotCard>
          <PlotCard title="Distribuição Lognormal dos IKIs">
            <Plot data={[{ x: plots.distribution, type: 'histogram', name: 'Distribuição Real', marker: { color: 'rgba(139,0,0,0.45)' }, histnorm: 'probability density' }]} layout={plotLayout({ xTitle: 'log1p(IKI)', yTitle: 'Densidade' })} style={{ width: '100%' }} />
          </PlotCard>
          <PlotCard title="Pearson r Acumulado — Gate 0.4">
            <Plot data={[{ x: plots.pearson.map(p => p.n), y: plots.pearson.map(p => p.r), mode: 'lines', line: { color: '#8B0000', width: 3 } }, { x: [0, stats.total_sessions], y: [0.4, 0.4], mode: 'lines', line: { color: 'rgba(220,140,60,0.7)', dash: 'dash' }, name: 'Gate 2' }]} layout={plotLayout({ xTitle: 'N Participantes', yTitle: 'Pearson r', yRange: [-1, 1] })} style={{ width: '100%' }} config={{ responsive: true }} />
          </PlotCard>
          <PlotCard title="Cohen's d Acumulado — Gate 0.5 (Métrica Crítica)" span={2}>
            <Plot data={[{ x: plots.cohensD.map(p => p.n), y: plots.cohensD.map(p => p.d), mode: 'lines', line: { color: 'rgba(120,200,120,0.8)', width: 4 } }, { x: [0, stats.total_sessions], y: [0.5, 0.5], mode: 'lines', line: { color: 'rgba(200,80,80,0.7)', dash: 'dash', width: 2 }, name: 'Gate 1' }]} layout={plotLayout({ xTitle: 'N Participantes', yTitle: "Cohen's d", yRange: [0, 2] })} style={{ width: '100%' }} config={{ responsive: true }} />
          </PlotCard>
        </div>
      </div>
    </div>
  );
}

function plotLayout({ xTitle, yTitle, xRange, yRange, showLegend }) {
  return {
    width: undefined, height: 400,
    xaxis: { title: xTitle, range: xRange, gridcolor: 'rgba(255,255,255,0.06)', zerolinecolor: 'rgba(255,255,255,0.08)' },
    yaxis: { title: yTitle, range: yRange, gridcolor: 'rgba(255,255,255,0.06)', zerolinecolor: 'rgba(255,255,255,0.08)' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: 'rgba(255,255,255,0.4)', family: "'Inter', sans-serif", size: 11 },
    margin: { t: 20, b: 44, l: 54, r: 20 },
    showlegend: showLegend ?? false,
  };
}

function PlotCard({ title, children, span }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 20px 4px', gridColumn: span ? `span ${span}` : undefined }}>
      <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{title}</span>
      {children}
    </div>
  );
}

function MetricCard({ title, value, color = 'white', gate = '', met }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${met === true ? 'rgba(120,200,120,0.18)' : met === false ? 'rgba(200,80,80,0.12)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '20px' }}>
      <div style={{ fontFamily: F.inter, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{title}</div>
      <div style={{ fontFamily: F.space, fontSize: 28, fontWeight: 700, color, letterSpacing: '-0.025em', lineHeight: 1 }}>{value}</div>
      {gate && <div style={{ fontFamily: F.inter, fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>{gate}</div>}
    </div>
  );
}

function getQuadrantColor(v, a) {
  if (v >= 50 && a >= 50) return 'rgba(220,80,80,0.8)';
  if (v < 50 && a >= 50) return 'rgba(139,0,0,0.9)';
  if (v < 50 && a < 50) return 'rgba(80,120,220,0.8)';
  return 'rgba(120,200,120,0.8)';
}
