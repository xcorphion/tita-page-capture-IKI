import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { connectToDatabase } from '@xcorphion/shared';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const ease = [0.22, 1, 0.36, 1];

const fonts = (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800;900&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </>
);

function Shell({ children, platformUrl }) {
  return (
    <>
      <Head>
        <title>Sessão de Pesquisa — Xcorphion</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {fonts}
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #000; color: white; font-family: ${F.inter}; -webkit-font-smoothing: antialiased; }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', background: '#000', color: 'white', display: 'flex', flexDirection: 'column' }}>

        {/* Radial glow — subtle depth behind content */}
        <div style={{
          position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 600, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 900px 500px at 50% -5%, rgba(139,0,0,0.07) 0%, transparent 70%)',
        }} />

        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(24px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', height: 56, flexShrink: 0,
        }}>
          <a
            href={platformUrl ? `${platformUrl}/study` : '/study'}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: F.inter, fontSize: 12, letterSpacing: '0.02em',
              color: 'rgba(255,255,255,0.28)', textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Sobre a pesquisa
          </a>

          <span style={{
            fontFamily: F.space, fontSize: 12, fontWeight: 700,
            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            Xcorphion
          </span>

          <div style={{ width: 120 }} />
        </header>

        {/* Main */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '60px 24px', position: 'relative', zIndex: 1,
        }}>
          {children}
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid #3D0000',
          padding: '20px 40px',
          display: 'flex', justifyContent: 'center',
          flexShrink: 0, position: 'relative', zIndex: 1,
        }}>
          <span style={{
            fontFamily: F.inter, fontSize: 11,
            color: 'rgba(240,234,232,0.18)', letterSpacing: '0.04em',
          }}>
            © 2025 Xcorphion Corporation
          </span>
        </footer>
      </div>
    </>
  );
}

function StatusIcon({ type }) {
  const configs = {
    check: {
      stroke: '#8B0000',
      path: <path d="M20 6L9 17l-5-5" />,
      bg: 'rgba(139,0,0,0.08)',
      border: 'rgba(139,0,0,0.3)',
      shadow: '0 0 28px rgba(139,0,0,0.18)',
    },
    clock: {
      stroke: 'rgba(255,255,255,0.3)',
      path: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
      bg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.08)',
      shadow: 'none',
    },
    lock: {
      stroke: 'rgba(255,255,255,0.18)',
      path: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>,
      bg: 'rgba(255,255,255,0.02)',
      border: 'rgba(255,255,255,0.06)',
      shadow: 'none',
    },
  };
  const c = configs[type] || configs.check;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease }}
      style={{
        width: 52, height: 52, borderRadius: '50%',
        border: `1px solid ${c.border}`,
        background: c.bg,
        boxShadow: c.shadow,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 28px',
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {c.path}
      </svg>
    </motion.div>
  );
}

function SessionLabel({ number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.04, ease }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}
    >
      <div style={{
        width: 4, height: 4, borderRadius: '50%', background: '#8B0000',
        boxShadow: '0 0 7px rgba(139,0,0,0.9)',
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: F.space, fontSize: 10, fontWeight: 600,
        color: '#8B0000', letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>
        Sessão {number} · de 3
      </span>
    </motion.div>
  );
}

function StateLabel({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.04, ease }}
      style={{ marginBottom: 20, textAlign: 'center' }}
    >
      <span style={{
        fontFamily: F.space, fontSize: 10, fontWeight: 600,
        color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>
        {children}
      </span>
    </motion.div>
  );
}

function DescriptionCard({ lines }) {
  if (!lines || lines.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      marginBottom: 28,
      overflow: 'hidden',
    }}>
      {/* First paragraph — personalized greeting, visually distinguished */}
      <div style={{
        padding: '22px 28px',
        borderLeft: '2px solid #3D0000',
        borderBottom: lines.length > 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}>
        <p style={{
          fontFamily: F.inter, fontWeight: 400, fontSize: 15,
          color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, margin: 0,
        }}>
          {lines[0]}
        </p>
      </div>

      {/* Remaining paragraphs */}
      {lines.length > 1 && (
        <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {lines.slice(1).map((line, i) => (
            <p key={i} style={{
              fontFamily: F.inter, fontWeight: 300, fontSize: 14,
              color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, margin: 0,
            }}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      background: 'rgba(0,0,0,0.45)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      marginBottom: 28,
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        padding: '11px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: F.space, fontSize: 10, fontWeight: 600,
          color: '#8B0000', letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          Código de acesso
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? 'rgba(139,0,0,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copied ? 'rgba(139,0,0,0.28)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 6, padding: '5px 11px',
            cursor: 'pointer', transition: 'all 0.18s',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: F.inter, fontSize: 11,
            color: copied ? '#8B0000' : 'rgba(255,255,255,0.32)',
            letterSpacing: '0.03em',
          }}
          onMouseEnter={e => {
            if (!copied) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
            }
          }}
          onMouseLeave={e => {
            if (!copied) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.32)';
            }
          }}
        >
          {copied ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Copiado
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copiar
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div style={{ padding: '26px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          fontFamily: F.mono,
          fontSize: 'clamp(26px, 5vw, 36px)',
          fontWeight: 500,
          letterSpacing: '0.28em',
          color: 'white',
        }}>
          {code || '—'}
        </span>
      </div>

      {/* Note */}
      <div style={{
        padding: '10px 24px 14px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'center',
      }}>
        <span style={{
          fontFamily: F.inter, fontSize: 11,
          color: 'rgba(255,255,255,0.18)', letterSpacing: '0.02em',
        }}>
          Guarde este código — ele é o seu acesso para todas as sessões.
        </span>
      </div>
    </div>
  );
}

function CTAButton({ href, label }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        fontFamily: F.inter, fontWeight: 600, fontSize: 14,
        color: 'white', background: '#8B0000',
        padding: '14px 38px', borderRadius: 10,
        textDecoration: 'none', letterSpacing: '0.02em',
        boxShadow: '0 0 36px rgba(139,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
        transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#9e0000';
        e.currentTarget.style.boxShadow = '0 0 56px rgba(139,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#8B0000';
        e.currentTarget.style.boxShadow = '0 0 36px rgba(139,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
  );
}

export default function Convite({ participant, error, platformUrl }) {
  const wrap = (content) => <Shell platformUrl={platformUrl}>{content}</Shell>;

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return wrap(
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}
      >
        <StatusIcon type="lock" />
        <StateLabel>Acesso negado</StateLabel>
        <h1 style={{
          fontFamily: F.space, fontWeight: 700,
          fontSize: 'clamp(22px, 3vw, 28px)',
          letterSpacing: '-0.03em', color: 'white', marginBottom: 14,
        }}>
          Código não encontrado
        </h1>
        <p style={{
          fontFamily: F.inter, fontWeight: 300, fontSize: 15,
          color: 'rgba(255,255,255,0.38)', lineHeight: 1.75,
        }}>
          Verifique o link recebido ou entre em contato com quem te convidou para a pesquisa.
        </p>
      </motion.div>
    );
  }

  // ── Inativo / Concluído ──────────────────────────────────────────────────
  if (participant.status === 'INATIVO' || participant.session_3_status === 'CONCLUIDA') {
    return wrap(
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}
      >
        <StatusIcon type="check" />
        <StateLabel>Participação concluída</StateLabel>
        <h1 style={{
          fontFamily: F.space, fontWeight: 700,
          fontSize: 'clamp(22px, 3vw, 28px)',
          letterSpacing: '-0.03em', color: 'white', marginBottom: 14,
        }}>
          Obrigado pela sua contribuição.
        </h1>
        <p style={{
          fontFamily: F.inter, fontWeight: 300, fontSize: 15,
          color: 'rgba(255,255,255,0.38)', lineHeight: 1.75,
        }}>
          {participant.participant_name}, sua participação foi concluída com sucesso. Os dados coletados contribuirão para a pesquisa.
        </p>
      </motion.div>
    );
  }

  const { participant_name, referrer_name, participant_code } = participant;
  const session_link = `/IKI/${participant_code}`;

  // ── Aguardando ───────────────────────────────────────────────────────────
  const isWaiting =
    (participant.session_1_status === 'CONCLUIDA' && participant.session_2_status === 'AGUARDANDO') ||
    (participant.session_2_status === 'CONCLUIDA' && participant.session_3_status === 'AGUARDANDO');

  const waitingSession = participant.session_2_status === 'AGUARDANDO' ? 2 : 3;

  if (isWaiting) {
    return wrap(
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}
      >
        <StatusIcon type="clock" />
        <StateLabel>Aguardando liberação</StateLabel>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease }}
          style={{
            fontFamily: F.space, fontWeight: 800,
            fontSize: 'clamp(26px, 4vw, 36px)',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            color: 'white', marginBottom: 14,
          }}
        >
          Sessão {waitingSession} em breve.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.22, ease }}
          style={{
            fontFamily: F.inter, fontWeight: 300, fontSize: 15,
            color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: 36,
          }}
        >
          {participant_name}, você não precisa fazer nada agora. Quando a próxima sessão for liberada, este link continuará funcionando.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
        >
          <CodeBlock code={participant_code} />
        </motion.div>
      </motion.div>
    );
  }

  // ── Sessão liberada ───────────────────────────────────────────────────────
  let sessionNumber = 1;
  let title = '';
  let bodyLines = [];

  if (participant.session_1_status === 'LIBERADA') {
    sessionNumber = 1;
    title = 'Você foi convidado para participar de uma pesquisa.';
    bodyLines = [
      `${participant_name}, ${referrer_name} te indicou para uma pesquisa acadêmica sobre como as pessoas escrevem quando tomam decisões importantes.`,
      'Não é um teste. Não existe resposta certa ou errada.',
      'Você vai escrever livremente sobre uma decisão real que viveu — e enquanto escreve, o ritmo das suas teclas será registrado de forma anônima. Nada mais.',
      'Esta é a Sessão 1 de 3. Cada sessão leva entre 8 e 15 minutos e pode ser feita em dias diferentes.',
    ];
  } else if (participant.session_2_status === 'LIBERADA') {
    sessionNumber = 2;
    title = 'Sessão 2 — Você está de volta.';
    bodyLines = [
      `${participant_name}, obrigado por completar a primeira sessão.`,
      `${referrer_name} acreditou que você teria algo valioso a contribuir — e você confirmou isso.`,
      'Esta é a Sessão 2 de 3. O formato é idêntico ao da primeira: escreva livremente, sem pressão, em um ambiente silencioso.',
    ];
  } else if (participant.session_3_status === 'LIBERADA') {
    sessionNumber = 3;
    title = 'Sessão 3 — A etapa final.';
    bodyLines = [
      `${participant_name}, você chegou à última sessão.`,
      `Esta pesquisa só existe porque pessoas como você, indicadas por ${referrer_name}, aceitaram dedicar tempo a algo que ainda está sendo construído.`,
      'Depois desta sessão, sua participação estará completa. Os dados coletados — sempre anônimos — vão alimentar um modelo que tenta entender como o corpo responde enquanto a mente decide.',
    ];
  }

  return wrap(
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease }}
      style={{ maxWidth: 600, width: '100%' }}
    >
      {/* Section label */}
      <SessionLabel number={sessionNumber} />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.1, ease }}
        style={{
          fontFamily: F.space, fontWeight: 800,
          fontSize: 'clamp(26px, 4vw, 42px)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          color: 'white', marginBottom: 28,
        }}
      >
        {title}
      </motion.h1>

      {/* Description card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18, ease }}
      >
        <DescriptionCard lines={bodyLines} />
      </motion.div>

      {/* Code + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28, ease }}
      >
        <CodeBlock code={participant_code} />
        <CTAButton href={session_link} label={`Iniciar Sessão ${sessionNumber}`} />
      </motion.div>
    </motion.div>
  );
}

export async function getServerSideProps(context) {
  const { codigo } = context.params;
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || process.env.APP_URL || '';

  try {
    const db = await connectToDatabase();
    const participant =
      (await db.collection('participants').findOne({ participant_id: codigo })) ??
      (await db.collection('participants').findOne({ participant_code: codigo }));

    if (!participant) {
      return { props: { error: true, platformUrl } };
    }

    return {
      props: {
        platformUrl,
        participant: {
          participant_id: participant.participant_id || '',
          participant_code: participant.participant_code || '',
          participant_name: participant.participant_name || 'Participante',
          referrer_name: participant.referrer_name || 'Alguém',
          status: participant.status || 'ATIVO',
          session_1_status: participant.session_1_status || 'LIBERADA',
          session_2_status: participant.session_2_status || 'AGUARDANDO',
          session_3_status: participant.session_3_status || 'AGUARDANDO',
        },
      },
    };
  } catch (e) {
    console.error('[convite]', e);
    return { props: { error: true, platformUrl } };
  }
}
