import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const LANGS = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const current = LANGS.find(l => l.code === (router.locale || 'pt'));

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const select = (code) => {
    setOpen(false);
    router.push(router.asPath, router.asPath, { locale: code });
  };

  const isHome = router.pathname === '/';

  // Mobile: abaixo da topbar pill (top:16 + height:54 + gap:12 = 82)
  // Desktop homepage: abaixo da headline (que começa em ~30px e tem ~3 linhas)
  // Desktop outras páginas: posição original topo-direito
  const topValue = isMobile
    ? 82
    : isHome
      ? 'clamp(160px, 14vw, 200px)'
      : 16;

  const base = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.1em',
  };

  return (
    <div style={{ position: 'fixed', top: topValue, right: 16, zIndex: 9999 }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            ...base,
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(8,8,8,0.92)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '6px 10px',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          {current?.label}
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0,
            background: 'rgba(8,8,8,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            minWidth: 60,
          }}>
            {LANGS.map(lang => (
              <button
                key={lang.code}
                onClick={() => select(lang.code)}
                style={{
                  ...base,
                  display: 'block', width: '100%',
                  padding: '8px 12px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: lang.code === router.locale ? '#8B0000' : 'rgba(255,255,255,0.55)',
                  textAlign: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { if (lang.code !== router.locale) e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
                onMouseLeave={e => { if (lang.code !== router.locale) e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
