import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTDOWN = 20;

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

export default function WaitlistGateModal({ isOpen, onClose }) {
  const router = useRouter();
  const [count, setCount] = useState(COUNTDOWN);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setCount(COUNTDOWN);
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          router.push('/study?start=1');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const progress = ((COUNTDOWN - count) / COUNTDOWN) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="gate-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            background: 'rgba(0,0,0,0.72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <motion.div
            key="gate-box"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0c0c0c',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '48px 40px 40px',
              maxWidth: 480,
              width: '100%',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.25)', padding: 6, borderRadius: 6,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
              aria-label="Fechar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              border: '1px solid rgba(139,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
              boxShadow: '0 0 28px rgba(139,0,0,0.18)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: F.space, fontWeight: 700,
              fontSize: 'clamp(22px, 3vw, 28px)',
              letterSpacing: '-0.03em', lineHeight: 1.15,
              color: 'white', marginBottom: 16,
            }}>
              A waitlist exige a Sessão 1
            </h2>

            {/* Body */}
            <p style={{
              fontFamily: F.inter, fontWeight: 300, fontSize: 15,
              color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
              marginBottom: 36, maxWidth: 360, margin: '0 auto 36px',
            }}>
              Para entrar na lista de espera do OMMΩ é necessário completar a
              Sessão 1 da pesquisa. Em{' '}
              <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 400 }}>
                {count}s
              </span>{' '}
              você será redirecionado para iniciar.
            </p>

            {/* Progress bar */}
            <div style={{
              width: '100%', height: 2,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 2, marginBottom: 28, overflow: 'hidden',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  background: '#8B0000',
                  borderRadius: 2,
                  width: `${progress}%`,
                }}
                transition={{ duration: 0.9, ease: 'linear' }}
              />
            </div>

            {/* Countdown number */}
            <div style={{
              fontFamily: F.space, fontSize: 'clamp(48px, 8vw, 64px)',
              fontWeight: 800, color: 'rgba(255,255,255,0.06)',
              letterSpacing: '-0.05em', lineHeight: 1,
              marginBottom: 28, userSelect: 'none',
            }}>
              {String(count).padStart(2, '0')}
            </div>

            {/* Fallback link */}
            <p style={{
              fontFamily: F.inter, fontSize: 13,
              color: 'rgba(255,255,255,0.25)', lineHeight: 1.6,
            }}>
              Caso não seja redirecionado,{' '}
              <a
                href="/study?start=1"
                style={{
                  color: 'rgba(139,0,0,0.85)',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#9e0000'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(139,0,0,0.85)'}
              >
                clique aqui para iniciar
              </a>
              .
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
