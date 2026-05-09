import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

export default function StudyWelcome() {
  const router = useRouter();
  const { code } = router.query;
  const [copied, setCopied] = useState(false);

  const sessionUrl = code ? `/study/IKI/${code}` : '#';

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <Head>
        <title>Bem-vindo à pesquisa — Xcorphion</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter, display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <header style={{
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(16px, 4vw, 40px)', height: 56, flexShrink: 0,
        }}>
          <Link
            href="/study"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Sobre a pesquisa
          </Link>
          <span style={{ fontFamily: F.space, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Xcorphion Research
          </span>
          <div style={{ width: 120 }} />
        </header>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px, 6vw, 60px) clamp(16px, 4vw, 40px)' }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                border: '1px solid rgba(139,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 36px',
                boxShadow: '0 0 32px rgba(139,0,0,0.15)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>

            <h1 style={{
              fontFamily: F.space, fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 42px)',
              letterSpacing: '-0.03em', lineHeight: 1.1,
              color: 'white', marginBottom: 20,
            }}>
              Tudo pronto.
            </h1>

            <p style={{
              fontFamily: F.inter, fontWeight: 300, fontSize: 17,
              color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
              marginBottom: 48, maxWidth: 440, margin: '0 auto 48px',
            }}>
              Seu perfil foi criado. A Sessão 1 já está liberada — você vai escrever livremente em resposta a uma pergunta sobre uma decisão que tomou. O ritmo das suas teclas é o dado que importa.
            </p>

            {/* Code block */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '28px 32px',
              marginBottom: 32,
            }}>
              <p style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                Seu código de acesso
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
                <span style={{
                  fontFamily: F.inter, fontSize: 'clamp(28px, 6vw, 40px)',
                  fontWeight: 600, letterSpacing: '0.22em',
                  color: 'white',
                }}>
                  {code || '—'}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? 'rgba(139,0,0,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${copied ? 'rgba(139,0,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8, padding: '8px 14px',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: F.inter, fontSize: 12,
                    color: copied ? '#8B0000' : 'rgba(255,255,255,0.5)',
                  }}
                  onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
                  onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
                >
                  {copied ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                      Copiado
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.6 }}>
                Guarde este código — ele é o seu acesso para todas as sessões.
              </p>
            </div>

            {/* CTA */}
            <a
              href={sessionUrl}
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
              Iniciar Sessão 1
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>

          </motion.div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 40px', display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>
            © 2026 Xcorphion Corporation
          </span>
        </div>
      </div>
    </>
  );
}
