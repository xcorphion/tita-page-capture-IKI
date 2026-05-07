
import Head from 'next/head';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Dashboard() {
    const router = useRouter();
    const { session_id, pwd } = router.query;
    
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Deep linking: se a senha vier pela URL (pwd), tenta logar direto
    useEffect(() => {
        if (pwd && !isAuthenticated) {
            setPassword(pwd);
            fetchData(pwd);
        }
    }, [pwd]);

    const fetchData = async (authPwd) => {
        setLoading(true);
        try {
            const url = session_id ? `/api/analysis/report?session_id=${session_id}` : '/api/analysis/report';
            const res = await fetch(url, {
                headers: { 'x-admin-password': authPwd || password }
            });
            if (res.ok) {
                const result = await res.json();
                setData(result);
                setIsAuthenticated(true);
            } else {
                setError('Acesso negado ou erro no processamento');
            }
        } catch (e) {
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        fetchData(password);
    };

    if (!isAuthenticated) {
        return (
            <div className="center-container">
                <div style={{ maxWidth: 400, background: 'rgba(255,255,255,0.05)', padding: 30, borderRadius: 12, textAlign: 'center' }}>
                    <h2>Admin Dashboard Login</h2>
                    <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
                        <input 
                            type="password" 
                            placeholder="Senha" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', marginBottom: 15 }}
                        />
                        <button type="submit" className="icon-btn">Ver Dashboard</button>
                    </form>
                    {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
                </div>
            </div>
        );
    }

    if (loading || !data) return <div className="center-container">Carregando análise estatística...</div>;

    const { plots, stats } = data;

    return (
        <div style={{ padding: '20px 40px', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
            <Head>
                <title>Análise Somática - Dashboard</title>
            </Head>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 300 }}>PIPELINE DE ANÁLISE <span style={{ color: '#7c6fff' }}>IKIs × EMAs</span></h1>
                <div style={{ display: 'flex', gap: 15 }}>
                    <button onClick={() => window.location.href = '/study/api/analysis/export-csv'} className="icon-btn" style={{ fontSize: '0.8rem', padding: '8px 15px' }}>
                        EXPORTAR DATASET (CSV)
                    </button>
                    <button onClick={() => fetchData()} className="icon-btn" style={{ fontSize: '0.8rem', padding: '8px 15px', background: '#333' }}>
                        ATUALIZAR
                    </button>
                </div>
            </div>

            {/* Métricas Principais (Gates) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
                <MetricCard title="Total de Sessões" value={stats.total_sessions} />
                <MetricCard title="Pearson r (Médio)" value={stats.current_pearson.toFixed(3)} color={Math.abs(stats.current_pearson) >= 0.4 ? '#4caf50' : '#ff9800'} gate="Gate 2: 0.4" />
                <MetricCard title="Cohen's d (Terciles)" value={stats.current_cohens_d.toFixed(3)} color={stats.current_cohens_d >= 0.5 ? '#4caf50' : '#ff9800'} gate="Gate 1: 0.5" />
                <MetricCard title="Status do Dataset" value={stats.current_cohens_d >= 0.5 ? 'VALIDADO' : 'COLETANDO'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Plot 1: Russell Trajectory */}
                <div className="plot-card">
                    <h3>Trajetória no Circumplexo de Russell</h3>
                    <Plot
                        data={[{
                            x: plots.russell.map(p => p.v),
                            y: plots.russell.map(p => p.a),
                            mode: 'lines+markers+text',
                            text: plots.russell.map((p, i) => `EMA ${i+1}`),
                            line: { shape: 'spline', color: '#7c6fff' },
                            marker: { size: 10, color: plots.russell.map(p => p.char), colorscale: 'Viridis' }
                        }]}
                        layout={{
                            width: undefined, height: 400,
                            xaxis: { title: 'Valência', range: [0, 100], gridcolor: '#222' },
                            yaxis: { title: 'Arousal', range: [0, 100], gridcolor: '#222' },
                            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#888' }, margin: { t: 40, b: 40, l: 50, r: 20 }
                        }}
                        style={{ width: '100%' }}
                        config={{ responsive: true }}
                    />
                </div>

                {/* Plot 2: IKI Timeline with EMA Quadrants */}
                <div className="plot-card">
                    <h3>IKI Timeline (Escala Log) + Marcadores EMA</h3>
                    <Plot
                        data={[
                            {
                                x: plots.timeline.ikis.map(i => i.t),
                                y: plots.timeline.ikis.map(i => i.v),
                                mode: 'markers',
                                marker: { size: 2, color: '#444' },
                                name: 'IKI (log1p)'
                            },
                            ...plots.timeline.emas.map((ema, i) => ({
                                x: [ema.t, ema.t],
                                y: [0, 10],
                                mode: 'lines',
                                line: { color: getQuadrantColor(ema.v, ema.a), width: 2, dash: 'dot' },
                                name: `EMA ${i+1}`
                            }))
                        ]}
                        layout={{
                            width: undefined, height: 400,
                            xaxis: { title: 'Tempo Relativo (ms)', gridcolor: '#222' },
                            yaxis: { title: 'log1p(IKI)', gridcolor: '#222' },
                            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#888' }, showlegend: false,
                            margin: { t: 40, b: 40, l: 50, r: 20 }
                        }}
                        style={{ width: '100%' }}
                        config={{ responsive: true }}
                    />
                </div>

                {/* Plot 3: Distribution lognormal */}
                <div className="plot-card">
                    <h3>Distribuição Lognormal dos IKIs</h3>
                    <Plot
                        data={[{
                            x: plots.distribution,
                            type: 'histogram',
                            name: 'Distribuição Real',
                            marker: { color: 'rgba(124, 111, 255, 0.5)' },
                            histnorm: 'probability density'
                        }]}
                        layout={{
                            width: undefined, height: 400,
                            xaxis: { title: 'log1p(IKI)', gridcolor: '#222' },
                            yaxis: { title: 'Densidade', gridcolor: '#222' },
                            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#888' }, margin: { t: 40, b: 40, l: 50, r: 20 }
                        }}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Plot 4: Pearson r acumulado */}
                <div className="plot-card">
                    <h3>Pearson r Acumulado (Gate 0.4)</h3>
                    <Plot
                        data={[
                            {
                                x: plots.pearson.map(p => p.n),
                                y: plots.pearson.map(p => p.r),
                                mode: 'lines',
                                line: { color: '#7c6fff', width: 3 }
                            },
                            {
                                x: [0, stats.total_sessions],
                                y: [0.4, 0.4],
                                mode: 'lines',
                                line: { color: '#ff9800', dash: 'dash' },
                                name: 'Gate 2'
                            }
                        ]}
                        layout={{
                            width: undefined, height: 400,
                            xaxis: { title: 'N Participantes', gridcolor: '#222' },
                            yaxis: { title: 'Pearson r', range: [-1, 1], gridcolor: '#222' },
                            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#888' }, margin: { t: 40, b: 40, l: 50, r: 20 }
                        }}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Plot 5: Cohen's d acumulado */}
                <div className="plot-card" style={{ gridColumn: 'span 2' }}>
                    <h3>Cohen's d Acumulado (Gate 0.5) - Métrica Crítica</h3>
                    <Plot
                        data={[
                            {
                                x: plots.cohensD.map(p => p.n),
                                y: plots.cohensD.map(p => p.d),
                                mode: 'lines',
                                line: { color: '#00e5ff', width: 4 }
                            },
                            {
                                x: [0, stats.total_sessions],
                                y: [0.5, 0.5],
                                mode: 'lines',
                                line: { color: '#f44336', dash: 'dash', width: 2 },
                                name: 'Gate 1'
                            }
                        ]}
                        layout={{
                            width: undefined, height: 400,
                            xaxis: { title: 'N Participantes', gridcolor: '#222' },
                            yaxis: { title: "Cohen's d", range: [0, 2], gridcolor: '#222' },
                            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#888' }, margin: { t: 40, b: 40, l: 50, r: 20 }
                        }}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            <style jsx>{`
                .plot-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid #222;
                    border-radius: 12px;
                    padding: 20px;
                }
                h3 {
                    margin: 0 0 15px 0;
                    font-size: 0.9rem;
                    color: #aaa;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
}

function MetricCard({ title, value, color = '#fff', gate = '' }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 12, border: '1px solid #222' }}>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>{title}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color }}>{value}</div>
            {gate && <div style={{ fontSize: '0.65rem', color: '#555', marginTop: 4 }}>Alvo: {gate}</div>}
        </div>
    );
}

function getQuadrantColor(v, a) {
    if (v >= 50 && a >= 50) return '#ff5252'; // Excitement
    if (v < 50 && a >= 50) return '#7c6fff'; // Anger/Anxiety
    if (v < 50 && a < 50) return '#2196f3'; // Sadness
    return '#4caf50'; // Calmness
}
