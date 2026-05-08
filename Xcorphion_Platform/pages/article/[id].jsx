import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

function estimateReadingTime(html) {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function processContent(html) {
  const sections = [];
  const withIds = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const id = `sec-${sections.length}`;
    sections.push({ id, text });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { sections, withIds };
}

export default function ArticlePage() {
  const router = useRouter();
  const { id: rawId } = router.query;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [processedContent, setProcessedContent] = useState('');
  const articleRef = useRef(null);

  useEffect(() => {
    if (!rawId) return;
    const actualId = typeof rawId === 'string' && rawId.startsWith('id:')
      ? rawId.substring(3)
      : rawId;

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${actualId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setArticle(data.data);
          const { sections: s, withIds } = processContent(data.data.article_content || '');
          setSections(s);
          setProcessedContent(withIds);
        } else {
          setError('Artigo não encontrado ou indisponível.');
        }
      } catch {
        setError('Erro ao conectar com o servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [rawId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (sections.length === 0) return;
    const observers = sections.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(obs => obs?.disconnect());
  }, [sections, processedContent]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.06)', borderTopColor: '#8B0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Carregando
          </span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <span style={{ fontFamily: F.inter, fontWeight: 600, fontSize: 10, color: '#8B0000', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>
            ERRO 404
          </span>
          <h1 style={{ fontFamily: F.space, fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Sinal Perdido
          </h1>
          <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 36, lineHeight: 1.6 }}>
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            style={{ fontFamily: F.inter, fontSize: 13, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', background: 'transparent', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const readMins = estimateReadingTime(article.article_content || '');
  const publishDate = new Date(article.published_at).toLocaleDateString('pt-BR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter }}>
      <Head>
        <title>{article.card_title} | Xcorphion</title>
        <meta name="description" content={article.card_legend} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      {/* Reading progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.04)', zIndex: 200 }}>
        <motion.div
          style={{ height: '100%', background: '#8B0000', transformOrigin: 'left' }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.08 }}
        />
      </div>

      {/* Topbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(24px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 56,
      }}>
        <button
          onClick={() => router.push('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <span style={{ fontFamily: F.space, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Break News
        </span>
        <div style={{ width: 72 }} />
      </header>

      {/* Hero */}
      <div style={{
        position: 'relative', height: '65vh', minHeight: 480,
        overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        {article.card_image ? (
          <>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${article.card_image})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'brightness(0.3) saturate(0.7)',
            }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.4) 55%, rgba(8,8,8,0.1) 100%)' }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg, rgba(60,0,0,0.3) 0%, #080808 70%)' }} />
        )}

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '0 40px 64px', width: '100%' }}
        >
          <h1 style={{
            fontFamily: F.space, fontWeight: 800,
            fontSize: 'clamp(30px, 4.5vw, 62px)',
            letterSpacing: '-0.03em', lineHeight: 1.05,
            color: 'white', marginBottom: 20, maxWidth: 820,
          }}>
            {article.card_title}
          </h1>
          <p style={{
            fontFamily: F.inter, fontWeight: 300,
            fontSize: 'clamp(15px, 1.6vw, 21px)',
            color: 'rgba(255,255,255,0.55)', lineHeight: 1.55,
            maxWidth: 580, marginBottom: 28,
          }}>
            {article.card_legend}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {[
              article.author || 'Editorial Xcorphion',
              publishDate,
              `${readMins} min de leitura`,
            ].map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#8B0000', flexShrink: 0 }} />}
                <span style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
                  {item}
                </span>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Body: sidebar + content */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '72px 40px 120px',
        display: 'grid', gridTemplateColumns: '240px 1fr', gap: '0 80px',
        alignItems: 'start',
      }}>

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'sticky', top: 80 }}
        >
          <div style={{ marginBottom: 36 }}>
            <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              Progresso
            </span>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: '#8B0000', transformOrigin: 'left' }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.08 }}
              />
            </div>
            <span style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 8, display: 'block' }}>
              {Math.round(progress)}%
            </span>
          </div>

          {sections.length > 0 && (
            <div>
              <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
                Neste artigo
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sections.map(({ id, text }) => (
                  <button
                    key={id}
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    style={{
                      textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: F.inter, fontSize: 13, lineHeight: 1.45,
                      color: activeSection === id ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.28)',
                      padding: '6px 0 6px 14px',
                      borderLeft: `2px solid ${activeSection === id ? '#8B0000' : 'rgba(255,255,255,0.07)'}`,
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={e => { if (activeSection !== id) { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; } }}
                    onMouseLeave={e => { if (activeSection !== id) { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; } }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.aside>

        {/* Article body */}
        <motion.article
          ref={articleRef}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 680, minWidth: 0 }}
        >
          <div
            className="editorial-content"
            style={{ fontFamily: F.inter, fontSize: 18, lineHeight: 1.85, color: 'rgba(255,255,255,0.75)' }}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {/* Research invite */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: 72,
              padding: '36px 40px',
              borderLeft: '3px solid #8B0000',
              background: 'rgba(139,0,0,0.04)',
              borderRadius: '0 12px 12px 0',
            }}
          >
            <span style={{ fontFamily: F.inter, fontSize: 11, color: '#8B0000', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
              Pesquisa Xcorphion
            </span>
            <h3 style={{ fontFamily: F.space, fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 14 }}>
              Você usa o teclado de um jeito único. Queremos aprender com isso.
            </h3>
            <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 24, maxWidth: 520 }}>
              O OMMΩ é treinado com dados de Inter-Keystroke Interval (IKI) — o ritmo entre as suas teclas. Estamos recrutando participantes para a fase inicial da pesquisa: sem coleta de conteúdo, sem identificação, apenas o padrão somático do seu teclado.{' '}
              <Link href="/study" style={{ color: '#8B0000', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                Saiba como funciona a pesquisa →
              </Link>
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                href="/study"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontFamily: F.inter, fontWeight: 500, fontSize: 14,
                  color: 'white', background: '#8B0000',
                  padding: '11px 24px', borderRadius: 8,
                  textDecoration: 'none',
                  boxShadow: '0 0 24px rgba(139,0,0,0.2)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#9e0000'; e.currentTarget.style.boxShadow = '0 0 36px rgba(139,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.boxShadow = '0 0 24px rgba(139,0,0,0.2)'; }}
              >
                Quero participar
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link
                href="/study#como-funciona"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontFamily: F.inter, fontWeight: 400, fontSize: 14,
                  color: 'rgba(255,255,255,0.45)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '11px 24px', borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                Como a pesquisa funciona
              </Link>
            </div>
          </motion.div>

          {article.sources && Array.isArray(article.sources) && article.sources.length > 0 && (
            <footer style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontFamily: F.inter, fontSize: 11, color: '#8B0000', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>
                Fontes & Referências
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {article.sources.map((source, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: 12, fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>
                    <span style={{ fontFamily: F.inter, fontWeight: 500, color: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>[{idx + 1}]</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </footer>
          )}
        </motion.article>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .editorial-content p { margin-bottom: 1.8em; }
        .editorial-content h2 { font-family: 'Space Grotesk', sans-serif; font-size: 2rem; font-weight: 700; color: white; margin-top: 2.8em; margin-bottom: 0.8em; letter-spacing: -0.03em; line-height: 1.15; }
        .editorial-content h3 { font-family: 'Space Grotesk', sans-serif; font-size: 1.3rem; font-weight: 600; color: rgba(255,255,255,0.88); margin-top: 2em; margin-bottom: 0.6em; letter-spacing: -0.02em; }
        .editorial-content a { color: #8B0000; text-decoration: underline; text-underline-offset: 4px; transition: color 0.2s; }
        .editorial-content a:hover { color: #c0392b; }
        .editorial-content blockquote { border-left: 3px solid #8B0000; padding: 1em 1.5em; font-style: italic; color: rgba(255,255,255,0.6); margin: 2.5em 0; background: rgba(139,0,0,0.04); border-radius: 0 4px 4px 0; }
        .editorial-content ul, .editorial-content ol { padding-left: 1.5em; margin-bottom: 1.8em; }
        .editorial-content li { margin-bottom: 0.5em; }
        .editorial-content img { border-radius: 12px; margin: 3em auto; display: block; max-width: 100%; border: 1px solid rgba(255,255,255,0.07); }
        .editorial-content code { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 0.83em; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px; color: rgba(255,255,255,0.85); }
        .editorial-content pre { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 1.5em; overflow-x: auto; margin: 2em 0; }
        .editorial-content pre code { background: none; padding: 0; }
        .editorial-content strong { color: rgba(255,255,255,0.92); font-weight: 600; }
        ::selection { background: rgba(139,0,0,0.35); color: white; }
      `}} />
    </div>
  );
}
