import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from '../src/hooks/useTranslation';
import WaitlistGateModal from '../src/components/WaitlistGate/WaitlistGateModal';

const BrainIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

const ActivityIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const CARD_ICONS = [BrainIcon, ActivityIcon, ShieldIcon];

export default function OmmaPage() {
  const { t } = useTranslation();
  const [gateOpen, setGateOpen] = useState(false);

  const CARDS = [
    {
      Icon: BrainIcon,
      title: t('omma.card0Title'),
      desc: t('omma.card0Desc'),
    },
    {
      Icon: ActivityIcon,
      title: t('omma.card1Title'),
      desc: t('omma.card1Desc'),
    },
    {
      Icon: ShieldIcon,
      title: t('omma.card2Title'),
      desc: t('omma.card2Desc'),
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Head>
        <title>OMMΩ — Somatic AI | Xcorphion</title>
        <meta name="description" content="O primeiro sistema de IA que aprende com seu estado somático." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --red: #8B0000;
            --red-soft: rgba(139, 0, 0, 0.12);
            --bg: #080808;
            --surface: rgba(255,255,255,0.025);
            --border: rgba(255,255,255,0.07);
            --text: rgba(255,255,255,0.92);
            --muted: rgba(255,255,255,0.50);
            --dim: rgba(255,255,255,0.22);
          }

          html { scroll-behavior: smooth; }

          body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
          }

          /* subtle grid */
          body::before {
            content: '';
            position: fixed; inset: 0; z-index: 0;
            background-image:
              linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
            background-size: 56px 56px;
            pointer-events: none;
          }

          /* ── scroll reveals ─────────────────────── */
          .reveal {
            opacity: 0;
            transform: translateY(22px);
            transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1),
                        transform 0.75s cubic-bezier(0.22,1,0.36,1);
          }
          .reveal.in-view { opacity: 1; transform: none; }
          .d1 { transition-delay: 0.08s; }
          .d2 { transition-delay: 0.18s; }
          .d3 { transition-delay: 0.30s; }

          /* ── hero entrance ──────────────────────── */
          @keyframes rise {
            from { opacity: 0; transform: translateY(36px); }
            to   { opacity: 1; transform: none; }
          }

          .hero-badge {
            display: inline-flex; align-items: center; gap: 8px;
            font-family: 'Inter', sans-serif; font-weight: 500; font-size: 11px;
            letter-spacing: 0.2em; color: var(--dim);
            animation: rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both;
          }

          .pulse-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: var(--red);
            animation: dot-pulse 2.2s ease-in-out infinite;
          }
          @keyframes dot-pulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(139,0,0,0.5); }
            50%      { box-shadow: 0 0 0 5px rgba(139,0,0,0); }
          }

          .hero-title {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 900;
            font-size: clamp(80px, 13vw, 172px);
            line-height: 0.88;
            letter-spacing: -0.045em;
            color: var(--text);
            animation: rise 1s cubic-bezier(0.22,1,0.36,1) 0.28s both;
          }

          .hero-tag {
            font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px;
            letter-spacing: 0.28em; color: var(--red); text-transform: uppercase;
            animation: rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.45s both;
          }

          .hero-desc {
            font-family: 'Inter', sans-serif; font-weight: 300;
            font-size: clamp(16px, 1.75vw, 20px);
            color: var(--muted); line-height: 1.65; max-width: 500px;
            animation: rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.60s both;
          }

          /* ── ekg line ───────────────────────────── */
          .ekg-wrap {
            opacity: 0;
            animation: rise 1s cubic-bezier(0.22,1,0.36,1) 0.75s both;
          }
          .ekg-path {
            stroke: var(--red); stroke-width: 1.5; fill: none;
            stroke-dasharray: 560; stroke-dashoffset: 560;
            transition: stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1) 0.8s;
          }
          .ekg-wrap.ready .ekg-path { stroke-dashoffset: 0; }

          /* ── feature cards ──────────────────────── */
          .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px; padding: 30px;
            position: relative; overflow: hidden;
            transition: border-color 0.35s ease, background 0.35s ease;
          }
          .card::before {
            content: ''; position: absolute;
            left: 0; top: 16px; bottom: 16px; width: 2px;
            background: var(--red); border-radius: 2px;
            transform: scaleY(0); transform-origin: center;
            transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
          }
          .card:hover { border-color: rgba(139,0,0,0.25); background: var(--red-soft); }
          .card:hover::before { transform: scaleY(1); }

          .card-icon { color: var(--red); margin-bottom: 18px; }
          .card-title {
            font-family: 'Space Grotesk', sans-serif; font-weight: 600;
            font-size: 16px; letter-spacing: -0.01em; color: var(--text);
            margin-bottom: 10px;
          }
          .card-desc {
            font-family: 'Inter', sans-serif; font-weight: 300;
            font-size: 13.5px; line-height: 1.72; color: var(--muted);
          }

          /* ── quote ──────────────────────────────── */
          .quote-mark {
            font-family: 'Space Grotesk', sans-serif; font-weight: 900;
            font-size: 110px; line-height: 0.65; color: var(--red); opacity: 0.35;
            user-select: none;
          }
          .quote-text {
            font-family: 'Inter', sans-serif; font-weight: 300; font-style: italic;
            font-size: clamp(17px, 2.1vw, 24px); line-height: 1.65;
            color: rgba(255,255,255,0.78); max-width: 700px;
          }
          .quote-attr {
            font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px;
            letter-spacing: 0.18em; color: var(--red); text-transform: uppercase;
            margin-top: 22px;
          }

          /* ── cta button ─────────────────────────── */
          .cta-btn {
            display: inline-flex; align-items: center; gap: 10px;
            background: var(--red); color: #fff;
            font-family: 'Inter', sans-serif; font-weight: 500; font-size: 15px;
            padding: 14px 32px; border-radius: 8px; border: none; cursor: pointer;
            box-shadow: 0 0 28px rgba(139,0,0,0.28);
            transition: background 0.25s, box-shadow 0.25s, transform 0.18s;
            text-decoration: none;
          }
          .cta-btn:hover {
            background: #9e0000;
            box-shadow: 0 0 48px rgba(139,0,0,0.5);
            transform: translateY(-2px);
          }
          .cta-btn:active { transform: none; }

          /* ── misc ───────────────────────────────── */
          .back-link {
            font-family: 'Inter', sans-serif; font-weight: 400; font-size: 11px;
            color: var(--dim); text-decoration: none; letter-spacing: 0.06em;
            display: inline-flex; align-items: center; gap: 7px;
            transition: color 0.2s;
          }
          .back-link:hover { color: var(--muted); }

          .version-tag {
            font-family: 'Inter', sans-serif; font-weight: 500; font-size: 10px;
            color: var(--dim); letter-spacing: 0.12em;
            border: 1px solid var(--border); padding: 3px 8px; border-radius: 4px;
          }

          .section-label {
            font-family: 'Inter', sans-serif; font-weight: 500; font-size: 10px;
            letter-spacing: 0.25em; color: var(--dim); text-transform: uppercase;
            margin-bottom: 14px;
          }
          .section-title {
            font-family: 'Space Grotesk', sans-serif; font-weight: 700;
            font-size: clamp(26px, 3.8vw, 42px); letter-spacing: -0.025em;
            color: var(--text); line-height: 1.1;
          }
          .accent { color: var(--red); }

          .divider { border: none; border-top: 1px solid var(--border); }
        `}</style>
      </Head>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        background: 'rgba(8,8,8,0.88)',
      }}>
        <Link href="/" className="back-link">
          <ArrowLeftIcon />
          {t('common.back')}
        </Link>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '-0.04em' }}>
          OMMΩ
        </span>
        <span />
      </nav>

      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '120px 48px 80px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* glow */}
          <div style={{
            position: 'absolute', top: '40%', left: '35%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,0,0,0.07) 0%, transparent 65%)',
            transform: 'translate(-50%,-50%)', pointerEvents: 'none',
          }} />

          <h1 className="hero-title" style={{ marginBottom: 22 }}>OMMΩ</h1>

          <p className="hero-desc">
            {t('omma.heroDesc')}
          </p>

          {/* EKG */}
          <div
            className="ekg-wrap"
            ref={el => {
              if (el) setTimeout(() => el.classList.add('ready'), 900);
            }}
            style={{ marginTop: 60, maxWidth: 560 }}
          >
            <svg viewBox="0 0 560 36" style={{ width: '100%', height: 36 }}>
              <polyline
                className="ekg-path"
                points="0,18 80,18 100,4 118,32 134,6 150,30 166,18 560,18"
              />
            </svg>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────── */}
        <section style={{ padding: '80px 48px', maxWidth: 1080, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: 48 }}>
            <p className="section-label">{t('omma.featuresLabel')}</p>
            <h2 className="section-title">
              {t('omma.featuresTitle')}<br />
              <span className="accent">{t('omma.featuresAccent')}</span> {t('omma.featuresEnd')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 18 }}>
            {CARDS.map(({ Icon, title, desc }, i) => (
              <div key={i} className={`card reveal d${i + 1}`}>
                <div className="card-icon"><Icon /></div>
                <h3 className="card-title">{title}</h3>
                <p className="card-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── QUOTE ───────────────────────────────── */}
        <section style={{
          padding: '90px 48px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div className="reveal" style={{ maxWidth: 760, margin: '0 auto' }}>
            <div className="quote-mark">&ldquo;</div>
            <blockquote style={{ marginTop: -16 }}>
              <p className="quote-text">
                {t('omma.quoteText')}
              </p>
              <p className="quote-attr">{t('omma.quoteAttr')}</p>
            </blockquote>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────── */}
        <section style={{ padding: '100px 48px', textAlign: 'center' }}>
          <div className="reveal">
            <h2 className="section-title" style={{ fontSize: 'clamp(30px, 4.5vw, 50px)', marginBottom: 16 }}>
              {t('omma.ctaTitle')}
            </h2>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 15,
              color: 'rgba(255,255,255,0.38)', margin: '16px auto 40px', maxWidth: 380,
            }}>
              {t('omma.ctaSubtitle')}
            </p>
            <button onClick={() => setGateOpen(true)} className="cta-btn">
              {t('omma.ctaBtn')}
              <ArrowRightIcon />
            </button>
            <WaitlistGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} />
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────── */}
        <footer style={{
          padding: '22px 48px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em' }}>
            © 2025 XCORPHION
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em' }}>
            OMMΩ — SOMATIC AI
          </span>
        </footer>

      </main>
    </>
  );
}
