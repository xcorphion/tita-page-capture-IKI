import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../src/hooks/useTranslation';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

const Section = ({ id, title, children }) => (
  <section id={id} style={{ paddingTop: 80, paddingBottom: 24 }}>
    <h2 style={{ fontFamily: F.space, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 32 }}>
      {title}
    </h2>
    {children}
  </section>
);

const P = ({ children, style }) => (
  <p style={{ fontFamily: F.inter, fontSize: 17, color: 'rgba(255,255,255,0.62)', lineHeight: 1.8, marginBottom: '1.6em', ...style }}>
    {children}
  </p>
);

export default function StudyPage() {
  const router = useRouter();
  const { t, ti } = useTranslation();
  const nameInputRef = useRef(null);

  // --- Waitlist flow (for existing session-1 participants) ---
  const [participantCode, setParticipantCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [eligible, setEligible] = useState(null);
  const [ineligibleReason, setIneligibleReason] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // --- Registration modal ---
  const [showModal, setShowModal] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [registerStatus, setRegisterStatus] = useState('idle'); // idle | loading | error
  const [registerError, setRegisterError] = useState('');
  const [referrerName, setReferrerName] = useState('');

  const openOrResume = async () => {
    try {
      const stored = localStorage.getItem('xcorphion_code');
      if (stored) {
        const code = stored.trim().toUpperCase();
        const res = await fetch(`/api/participant/${encodeURIComponent(code)}`);
        if (res.ok) { router.push(`/study/IKI/${code}`); return; }
        localStorage.removeItem('xcorphion_code');
      }
    } catch {}
    setParticipantName('');
    setRegisterError('');
    setRegisterStatus('idle');
    setShowModal(true);
  };

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.start === '1') {
      router.replace('/study', undefined, { shallow: true });
      openOrResume();
      return;
    }
    const code = typeof router.query.code === 'string' ? router.query.code.trim().toUpperCase() : '';
    if (!code) { setEligible(false); setIneligibleReason('no_code'); return; }
    setParticipantCode(code);
    setVerifying(true);
    fetch(`/api/verify-participant?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(data => {
        setEligible(data.eligible);
        if (!data.eligible) setIneligibleReason(data.reason || 'unknown');
      })
      .catch(() => { setEligible(false); setIneligibleReason('server_error'); })
      .finally(() => setVerifying(false));
  }, [router.isReady, router.query.code, router.query.start]);

  useEffect(() => {
    if (!router.isReady) return;
    const ref = typeof router.query.referrer === 'string' ? router.query.referrer.trim().toUpperCase() : '';
    if (!ref) return;
    fetch(`/api/referrer-name?code=${encodeURIComponent(ref)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.name) setReferrerName(data.name); })
      .catch(() => {});
  }, [router.isReady, router.query.referrer]);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  useEffect(() => {
    if (showModal && nameInputRef.current) nameInputRef.current.focus();
  }, [showModal]);

  const handleRegister = async () => {
    const name = participantName.trim();
    if (!name || registerStatus === 'loading') return;

    if (name.length < 2) { setRegisterError(t('study.modalNameShort')); return; }
    if (name.length > 80) { setRegisterError(t('study.modalNameLong')); return; }
    if (!/^[\p{L}\p{M} '-]+$/u.test(name)) { setRegisterError(t('study.modalNameInvalid')); return; }

    setRegisterStatus('loading');
    setRegisterError('');
    try {
      const referrerCode = typeof router.query.referrer === 'string' ? router.query.referrer.trim() : undefined;
      const body = { participant_name: name, locale: router.locale || 'pt' };
      if (referrerCode) body.referrer_code = referrerCode;

      const res = await fetch('/api/register-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRegisterStatus('error');
        setRegisterError(data.error || t('study.modalGenericError'));
        return;
      }
      localStorage.setItem('xcorphion_code', data.code);
      router.push(`/study/welcome?code=${data.code}`);
    } catch {
      setRegisterStatus('error');
      setRegisterError(t('study.modalConnectionError'));
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || status === 'loading') return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, participant_code: participantCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || t('study.waitlistError'));
        return;
      }
      setStatus(data.already ? 'duplicate' : 'success');
    } catch {
      setStatus('error');
      setErrorMsg(t('study.modalConnectionError'));
    }
  };

  return (
    <>
      <Head>
        <title>{t('study.pageTitle')}</title>
        <meta name="description" content={t('study.metaDesc')} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800;900&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter }}>

        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(24px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(16px, 4vw, 40px)', height: 56,
        }}>
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </Link>
          <span style={{ fontFamily: F.space, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {t('study.headerLabel')}
          </span>
          <div style={{ width: 72 }} />
        </header>

        {referrerName && (
          <div style={{ background: 'rgba(139,0,0,0.08)', borderBottom: '1px solid rgba(139,0,0,0.15)', padding: '10px clamp(16px, 4vw, 40px)', textAlign: 'center' }}>
            <span style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              {ti('study.referrerBanner', { name: referrerName })}
            </span>
          </div>
        )}

        {/* Hero */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(48px, 8vw, 88px) clamp(16px, 4vw, 40px) clamp(48px, 8vw, 80px)' }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 760, margin: '0 auto' }}
          >
            <h1 style={{
              fontFamily: F.space, fontWeight: 800,
              fontSize: 'clamp(36px, 5vw, 68px)',
              letterSpacing: '-0.04em', lineHeight: 1.0,
              color: 'white', marginBottom: 28,
            }}>
              {t('study.heroTitle')}
            </h1>
            <p style={{ fontFamily: F.inter, fontWeight: 300, fontSize: 20, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 600, marginBottom: 48 }}>
              {t('study.heroDesc')}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={openOrResume}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontFamily: F.inter, fontWeight: 500, fontSize: 14,
                  color: 'white', background: '#8B0000',
                  padding: '12px 28px', borderRadius: 8,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 24px rgba(139,0,0,0.25)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#9e0000'; e.currentTarget.style.boxShadow = '0 0 40px rgba(139,0,0,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.boxShadow = '0 0 24px rgba(139,0,0,0.25)'; }}
              >
                {t('study.ctaWaitlist')}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <a
                href="#o-que-e-iki"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontFamily: F.inter, fontWeight: 400, fontSize: 14,
                  color: 'rgba(255,255,255,0.45)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '12px 28px', borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                {t('study.ctaLearnFirst')}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) clamp(80px, 12vw, 160px)' }}>

          <Section id="o-que-e-iki" title={t('study.sec1Title')}>
            <P>{t('study.sec1p1')}</P>
            <P>{t('study.sec1p2')}</P>
            <P>{t('study.sec1p3')}</P>
          </Section>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          <Section id="como-funciona" title={t('study.sec2Title')}>
            <P>{t('study.sec2p1')}</P>
            <P>{t('study.sec2p2')}</P>
          </Section>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          <Section id="privacidade" title={t('study.sec3Title')}>
            <P>{t('study.sec3Collect')}</P>
            <P>{t('study.sec3NotCollect')}</P>
          </Section>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          <Section id="como-participar" title={t('study.sec4Title')}>
            <P>{t('study.sec4p1')}</P>

            {verifying ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 0', color: 'rgba(255,255,255,0.35)' }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#8B0000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                <span style={{ fontFamily: F.inter, fontSize: 14 }}>{t('study.verifying')}</span>
              </div>
            ) : eligible === false ? (
              <div style={{ padding: '28px 32px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, background: 'rgba(255,255,255,0.02)', marginBottom: 32 }}>
                <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
                  {ineligibleReason === 'no_code' && t('study.ineligibleNoCode')}
                  {ineligibleReason === 'not_found' && t('study.ineligibleNotFound')}
                  {ineligibleReason === 'session_not_completed' && t('study.ineligibleSessionNotCompleted')}
                  {ineligibleReason === 'not_engaged' && t('study.ineligibleNotEngaged')}
                  {ineligibleReason === 'inactive' && t('study.ineligibleInactive')}
                  {(ineligibleReason === 'server_error' || ineligibleReason === 'unknown') && t('study.ineligibleServerError')}
                </p>
              </div>
            ) : eligible === true && status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  padding: '32px 36px',
                  border: '1px solid rgba(139,0,0,0.3)',
                  borderRadius: 12,
                  background: 'rgba(139,0,0,0.06)',
                  marginBottom: 32,
                }}
              >
                <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>
                  {t('study.waitlistSuccess')} <strong style={{ color: 'white' }}>{email}</strong>.
                </p>
              </motion.div>
            ) : eligible === true && status === 'duplicate' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  padding: '32px 36px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  marginBottom: 32,
                }}
              >
                <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  {t('study.waitlistDuplicate')}
                </p>
              </motion.div>
            ) : eligible === true ? (
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
                  padding: '32px 36px',
                  border: `1px solid ${status === 'error' ? 'rgba(139,0,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  marginBottom: status === 'error' ? 12 : 0,
                }}>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    disabled={status === 'loading'}
                    style={{
                      flex: 1, minWidth: 0,
                      fontFamily: F.inter, fontSize: 14,
                      color: 'white', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '12px 16px',
                      outline: 'none',
                      opacity: status === 'loading' ? 0.6 : 1,
                    }}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={status === 'loading'}
                    style={{
                      fontFamily: F.inter, fontWeight: 500, fontSize: 14,
                      color: 'white', background: '#8B0000',
                      border: 'none', borderRadius: 8,
                      padding: '12px 28px', cursor: status === 'loading' ? 'default' : 'pointer',
                      boxShadow: '0 0 20px rgba(139,0,0,0.2)',
                      transition: 'background 0.2s, opacity 0.2s',
                      whiteSpace: 'nowrap',
                      opacity: status === 'loading' ? 0.7 : 1,
                    }}
                    onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.background = '#9e0000'; }}
                    onMouseLeave={e => e.currentTarget.style.background = '#8B0000'}
                  >
                    {status === 'loading' ? t('study.waitlistLoading') : t('study.waitlistJoin')}
                  </button>
                </div>
                {status === 'error' && (
                  <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(200,50,50,0.9)', margin: 0 }}>
                    {errorMsg}
                  </p>
                )}
              </div>
            ) : null}

            <P style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              {t('study.termsAgreement')}{' '}
              <Link href="/terms" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                {t('study.termsLink')}
              </Link>
              . {t('study.termsNoData')}
            </P>
          </Section>

        </div>

        {/* Footer strip */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(14px,2vw,20px) clamp(16px,4vw,40px)', display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>
            © 2026 Xcorphion Corporation
          </span>
        </div>

      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <motion.div
              key="modal-box"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'relative',
                width: '100%', maxWidth: 440,
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 'clamp(28px, 5vw, 44px) clamp(20px, 4vw, 40px) clamp(24px, 4vw, 40px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                maxHeight: '90dvh',
                overflowY: 'auto',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute', top: 18, right: 18,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', fontSize: 20, lineHeight: 1,
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6, transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                aria-label="Fechar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>

              {/* Header */}
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 24, letterSpacing: '-0.03em', color: 'white', marginBottom: 10, lineHeight: 1.2 }}>
                  {t('study.modalTitle')}
                </h2>
                <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>
                  {t('study.modalDesc')}
                </p>
              </div>

              {/* Input */}
              <div style={{ marginBottom: 20 }}>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder={t('study.modalPlaceholder')}
                  value={participantName}
                  onChange={e => { setParticipantName(e.target.value); setRegisterError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  disabled={registerStatus === 'loading'}
                  maxLength={80}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: F.inter, fontSize: 15,
                    color: 'white',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${registerError ? 'rgba(200,50,50,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10, padding: '14px 16px',
                    outline: 'none', transition: 'border-color 0.2s',
                    opacity: registerStatus === 'loading' ? 0.6 : 1,
                  }}
                  onFocus={e => { if (!registerError) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                  onBlur={e => { if (!registerError) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                {registerError && (
                  <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(200,50,50,0.9)', margin: '8px 0 0', lineHeight: 1.5 }}>
                    {registerError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleRegister}
                disabled={registerStatus === 'loading' || !participantName.trim()}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: F.inter, fontWeight: 500, fontSize: 15,
                  color: 'white',
                  background: registerStatus === 'loading' || !participantName.trim() ? 'rgba(139,0,0,0.45)' : '#8B0000',
                  border: 'none', borderRadius: 10,
                  padding: '14px 28px',
                  cursor: registerStatus === 'loading' || !participantName.trim() ? 'default' : 'pointer',
                  boxShadow: registerStatus === 'loading' ? 'none' : '0 0 24px rgba(139,0,0,0.25)',
                  transition: 'background 0.2s, box-shadow 0.2s, opacity 0.2s',
                }}
                onMouseEnter={e => { if (registerStatus !== 'loading' && participantName.trim()) { e.currentTarget.style.background = '#9e0000'; e.currentTarget.style.boxShadow = '0 0 40px rgba(139,0,0,0.4)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = registerStatus === 'loading' || !participantName.trim() ? 'rgba(139,0,0,0.45)' : '#8B0000'; e.currentTarget.style.boxShadow = registerStatus === 'loading' ? 'none' : '0 0 24px rgba(139,0,0,0.25)'; }}
              >
                {registerStatus === 'loading' ? (
                  <>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                    {t('study.modalCreating')}
                  </>
                ) : (
                  <>
                    {t('study.modalParticipate')}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </>
                )}
              </button>

              <p style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 20, marginBottom: 0, lineHeight: 1.6 }}>
                {t('study.modalTerms')}{' '}
                <Link href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  {t('study.modalTermsLink')}
                </Link>
                {'. '}
                <Link href="/study#privacidade" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  {t('study.modalMethodology')}
                </Link>
                .
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
