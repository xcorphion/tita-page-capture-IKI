import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from '../../../../src/hooks/useTranslation';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

export default function ResearchFinishPage() {
  const router = useRouter();
  const { respondentId } = router.query;
  const { t, ti } = useTranslation();

  const CONSENT_TEXT = t('finish.consentText');

  const [step, setStep]               = useState('consent');
  const [consentInput, setConsentInput] = useState('');
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [email, setEmail]             = useState('');
  const [emailError, setEmailError]   = useState('');
  const [sendError, setSendError]     = useState('');
  const [inviteEmail, setInviteEmail]       = useState('');
  const [inviteStep, setInviteStep]         = useState('idle'); // idle | sending | sent | error
  const [inviteError, setInviteError]       = useState('');
  const [invitesLocalCount, setInvitesLocalCount] = useState(0);
  const [linkCopied, setLinkCopied]         = useState(false);

  const consentValid = consentInput === CONSENT_TEXT;

  const handlePaste = (e) => {
    e.preventDefault();
    setPasteBlocked(true);
    setTimeout(() => setPasteBlocked(false), 2800);
  };

  const handleConsentSubmit = () => {
    if (consentValid) setStep('email');
  };

  const handleSend = async () => {
    if (!respondentId || !email.trim() || step === 'sending') return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError(t('finish.emailInvalid'));
      return;
    }
    setEmailError('');
    setSendError('');
    setStep('sending');
    try {
      const res = await fetch('/api/session/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_code: respondentId,
          email: email.trim(),
          consent_text: consentInput,
        }),
      });
      if (res.ok) {
        setStep('sent');
      } else {
        const data = await res.json().catch(() => ({}));
        setSendError(data.error || t('finish.emailError'));
        setStep('email');
      }
    } catch {
      setSendError(t('finish.connectionError'));
      setStep('email');
    }
  };

  const inputBase = {
    width: '100%', boxSizing: 'border-box',
    fontFamily: F.inter, fontSize: 15,
    color: 'white',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '13px 16px',
    outline: 'none', transition: 'border-color 0.2s',
  };

  const handleInvite = async () => {
    if (!respondentId || !inviteEmail.trim() || inviteStep === 'sending') return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      setInviteError(t('finish.inviteInvalid'));
      return;
    }
    setInviteError('');
    setInviteStep('sending');
    try {
      const res = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_code: respondentId, friend_email: inviteEmail.trim() }),
      });
      if (res.ok) {
        setInviteStep('sent');
        setInvitesLocalCount(c => c + 1);
      } else {
        const data = await res.json().catch(() => ({}));
        setInviteError(data.error || t('finish.inviteError'));
        setInviteStep('error');
      }
    } catch {
      setInviteError(t('finish.inviteConnectionError'));
      setInviteStep('error');
    }
  };

  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online';
  const studyLink = respondentId ? `${platformUrl}/study?code=${respondentId}` : '#';
  const referralLink = respondentId ? `${platformUrl}/study?referrer=${respondentId}` : '#';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <>
      <Head>
        <title>{t('finish.pageTitle')}</title>
      </Head>
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 24px rgba(139,0,0,0.15); } 50% { box-shadow: 0 0 48px rgba(139,0,0,0.35); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .finish-enter { animation: fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
        .icon-pulse { animation: pulseGlow 3s ease-in-out infinite; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 460, width: '100%' }} className="finish-enter">

          <div className="icon-pulse" style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(139,0,0,0.4)', background: 'rgba(139,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 36px' }}>
            {step === 'sent' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            )}
          </div>

          <h1 style={{ fontFamily: F.space, fontWeight: 800, fontSize: 'clamp(24px, 4vw, 34px)', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'white', marginBottom: 16 }}>
            {step === 'sent' ? t('finish.titleSent') : t('finish.titleDefault')}
          </h1>

          <p style={{ fontFamily: F.inter, fontWeight: 300, fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 40, maxWidth: 380, margin: '0 auto 40px' }}>
            {step === 'sent'
              ? <>{ti('finish.descSent', { email }).split(email).map((part, i, arr) =>
                  i < arr.length - 1
                    ? <span key={i}>{part}<strong style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>{email}</strong></span>
                    : <span key={i}>{part}</span>
                )}</>
              : t('finish.descDefault')}
          </p>

          <div style={{ width: 40, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)', margin: '0 auto 36px' }} />

          {step === 'consent' && (
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{t('finish.consentLabel')}</p>
              <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20 }}>
                {t('finish.consentDesc')}
              </p>
              <div style={{ fontFamily: F.inter, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 16px', letterSpacing: '0.06em', textAlign: 'center', marginBottom: 16, userSelect: 'none' }}>
                {CONSENT_TEXT}
              </div>
              <input
                type="text" placeholder={t('finish.consentPlaceholder')} value={consentInput}
                onChange={e => setConsentInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={e => e.key === 'Enter' && handleConsentSubmit()}
                autoComplete="off" spellCheck={false}
                style={{ ...inputBase, marginBottom: 8, borderColor: consentInput.length > 0 && !consentValid ? 'rgba(200,80,80,0.4)' : consentValid ? 'rgba(120,200,120,0.35)' : 'rgba(255,255,255,0.1)' }}
              />
              {pasteBlocked && <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(200,100,60,0.9)', marginBottom: 8 }}>{t('finish.consentPasteBlocked')}</p>}
              <button onClick={handleConsentSubmit} disabled={!consentValid} style={{ width: '100%', fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: consentValid ? '#8B0000' : 'rgba(139,0,0,0.3)', border: 'none', borderRadius: 10, padding: '13px', marginTop: 8, cursor: consentValid ? 'pointer' : 'default', boxShadow: consentValid ? '0 0 20px rgba(139,0,0,0.22)' : 'none', transition: 'background 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { if (consentValid) e.currentTarget.style.background = '#9e0000'; }} onMouseLeave={e => { if (consentValid) e.currentTarget.style.background = '#8B0000'; }}>
                {t('finish.consentConfirm')}
              </button>
            </div>
          )}

          {(step === 'email' || step === 'sending') && (
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{t('finish.emailLabel')}</p>
              <input
                type="email" placeholder={t('finish.emailPlaceholder')} value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={step === 'sending'}
                style={{ ...inputBase, marginBottom: emailError ? 8 : 16, borderColor: emailError ? 'rgba(200,80,80,0.4)' : 'rgba(255,255,255,0.1)', opacity: step === 'sending' ? 0.6 : 1 }}
              />
              {emailError && <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(200,80,80,0.9)', marginBottom: 12 }}>{emailError}</p>}
              {sendError && <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(200,80,80,0.9)', marginBottom: 12 }}>{sendError}</p>}
              <button onClick={handleSend} disabled={step === 'sending' || !email.trim()} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: step === 'sending' || !email.trim() ? 'rgba(139,0,0,0.35)' : '#8B0000', border: 'none', borderRadius: 10, padding: '13px', cursor: step === 'sending' || !email.trim() ? 'default' : 'pointer', boxShadow: step === 'sending' ? 'none' : '0 0 20px rgba(139,0,0,0.22)', transition: 'background 0.2s' }} onMouseEnter={e => { if (step === 'email' && email.trim()) e.currentTarget.style.background = '#9e0000'; }} onMouseLeave={e => { if (step === 'email') e.currentTarget.style.background = email.trim() ? '#8B0000' : 'rgba(139,0,0,0.35)'; }}>
                {step === 'sending' ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />{t('finish.emailSending')}</>
                ) : (
                  <>{t('finish.emailSend')}<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                )}
              </button>
            </div>
          )}

          {step === 'sent' && (
            <>
              <a href={studyLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: '#8B0000', padding: '13px 32px', borderRadius: 8, textDecoration: 'none', boxShadow: '0 0 28px rgba(139,0,0,0.22)', transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#9e0000'; e.currentTarget.style.boxShadow = '0 0 48px rgba(139,0,0,0.42)'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.boxShadow = '0 0 28px rgba(139,0,0,0.22)'; e.currentTarget.style.transform = 'none'; }}>
                {t('finish.sentCta')}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>

              <div style={{ marginTop: 40, textAlign: 'left' }}>
                <div style={{ width: 40, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)', margin: '0 auto 36px' }} />
                <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{t('finish.inviteLabel')}</p>
                {inviteStep === 'sent' ? (
                  <>
                    <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                      {ti('finish.inviteSent', { email: inviteEmail }).split(inviteEmail).map((part, i, arr) =>
                        i < arr.length - 1
                          ? <span key={i}>{part}<strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>{inviteEmail}</strong></span>
                          : <span key={i}>{part}</span>
                      )}
                    </p>
                    {invitesLocalCount < 3 && (
                      <button
                        onClick={() => { setInviteStep('idle'); setInviteEmail(''); setInviteError(''); }}
                        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s', marginTop: 16 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                      >
                        {t('finish.inviteAnother')}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 16 }}>
                      {t('finish.inviteDesc')}
                    </p>
                    <input
                      type="email"
                      placeholder={t('finish.invitePlaceholder')}
                      value={inviteEmail}
                      onChange={e => { setInviteEmail(e.target.value); setInviteError(''); setInviteStep('idle'); }}
                      onKeyDown={e => e.key === 'Enter' && handleInvite()}
                      disabled={inviteStep === 'sending'}
                      style={{ ...inputBase, marginBottom: inviteError ? 8 : 12, opacity: inviteStep === 'sending' ? 0.6 : 1 }}
                    />
                    {inviteError && <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(200,80,80,0.9)', marginBottom: 10 }}>{inviteError}</p>}
                    <button onClick={handleInvite} disabled={inviteStep === 'sending' || !inviteEmail.trim()} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: F.inter, fontWeight: 500, fontSize: 14, color: 'white', background: inviteStep === 'sending' || !inviteEmail.trim() ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px', cursor: inviteStep === 'sending' || !inviteEmail.trim() ? 'default' : 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => { if (inviteStep !== 'sending' && inviteEmail.trim()) e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }} onMouseLeave={e => { if (inviteStep !== 'sending') e.currentTarget.style.background = inviteEmail.trim() ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.08)'; }}>
                      {inviteStep === 'sending' ? (
                        <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />{t('finish.inviteSending')}</>
                      ) : t('finish.inviteBtn')}
                    </button>
                  </>
                )}
              </div>

              {/* Link copiável de indicação */}
              <div style={{ marginTop: 32, textAlign: 'left' }}>
                <div style={{ width: 40, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)', margin: '0 auto 28px' }} />
                <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{t('finish.inviteLinkLabel')}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,0.35)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{referralLink}</span>
                  <button
                    onClick={handleCopyLink}
                    style={{ flexShrink: 0, background: linkCopied ? 'rgba(139,0,0,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${linkCopied ? 'rgba(139,0,0,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontFamily: F.inter, fontSize: 11, color: linkCopied ? '#8B0000' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  >
                    {linkCopied ? t('finish.inviteLinkCopied') : t('finish.inviteLinkCopy')}
                  </button>
                </div>
              </div>
            </>
          )}

          {(step === 'consent' || step === 'email' || step === 'sending') && (
            <div style={{ marginTop: 28 }}>
              <a href={studyLink} style={{ fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}>
                {t('finish.skipEmail')}
              </a>
            </div>
          )}

          {step === 'sent' && (
            <div style={{ marginTop: 24 }}>
              <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: F.inter, fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.3em', textTransform: 'uppercase', padding: '8px 0', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}>
                {t('finish.returnHome')}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
