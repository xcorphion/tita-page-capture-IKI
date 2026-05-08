import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from '../../hooks/useTranslation';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

export default function ComingSoon({ productKey, backHref = '/' }) {
  const { t } = useTranslation();
  const name = t(`products.${productKey}.name`);
  const desc = t(`products.${productKey}.desc`);

  return (
    <>
      <Head>
        <title>{name} — Em Breve | Xcorphion</title>
        <meta name="description" content={desc} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800;900&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <main style={{
        minHeight: '100vh',
        backgroundColor: '#080808',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* nav */}
        <nav style={{
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <Link href={backHref} style={{
            fontFamily: F.inter, fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 7,
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            {t('common.back')}
          </Link>
          <span style={{ fontFamily: F.space, fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.15)', letterSpacing: '-0.02em' }}>
            Xcorphion
          </span>
        </nav>

        {/* content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          textAlign: 'center',
        }}>
          {/* title */}
          <h1 style={{
            fontFamily: F.space, fontWeight: 900,
            fontSize: 'clamp(40px, 7vw, 88px)',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            color: 'rgba(255,255,255,0.92)',
            marginBottom: 28,
            maxWidth: 700,
          }}>
            {name}
          </h1>

          {/* desc */}
          <p style={{
            fontFamily: F.inter, fontWeight: 300,
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.45)',
            maxWidth: 480,
            marginBottom: 52,
          }}>
            {desc}
          </p>

          {/* cta */}
          <Link href="/omma" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: F.inter, fontWeight: 500, fontSize: 15,
            color: '#fff',
            background: '#8B0000',
            padding: '14px 32px',
            borderRadius: 8,
            textDecoration: 'none',
            boxShadow: '0 0 28px rgba(139,0,0,0.28)',
            transition: 'background 0.25s, box-shadow 0.25s, transform 0.18s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#9e0000';
              e.currentTarget.style.boxShadow = '0 0 48px rgba(139,0,0,0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#8B0000';
              e.currentTarget.style.boxShadow = '0 0 28px rgba(139,0,0,0.28)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {t('common.joinWaitlist')}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>

          {/* divider line */}
          <div style={{
            width: 1, height: 80,
            background: 'linear-gradient(to bottom, transparent, rgba(139,0,0,0.3), transparent)',
            margin: '60px auto 0',
          }} />
        </div>

        {/* footer strip */}
        <div style={{
          padding: '18px 40px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>
            © 2025 Xcorphion Corporation
          </span>
        </div>
      </main>
    </>
  );
}
