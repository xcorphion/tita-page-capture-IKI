import Head from 'next/head';
import { useRouter } from 'next/router';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

export default function ResearchFinishPage() {
  const router = useRouter();
  const { respondentId } = router.query;

  return (
    <>
      <Head>
        <title>Sessão concluída — Xcorphion</title>
      </Head>
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(139,0,0,0.15); }
          50%       { box-shadow: 0 0 48px rgba(139,0,0,0.35); }
        }
        .finish-enter { animation: fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
        .icon-pulse   { animation: pulseGlow 3s ease-in-out infinite; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#080808', color: 'white',
        fontFamily: F.inter,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 480, width: '100%' }} className="finish-enter">

          {/* Icon */}
          <div
            className="icon-pulse"
            style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '1px solid rgba(139,0,0,0.4)',
              background: 'rgba(139,0,0,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 36px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: F.space, fontWeight: 800,
            fontSize: 'clamp(26px, 4vw, 38px)',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            color: 'white', marginBottom: 20,
          }}>
            Sua essência foi capturada.
          </h1>

          {/* Body */}
          <p style={{
            fontFamily: F.inter, fontWeight: 300, fontSize: 16,
            color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
            marginBottom: 48, maxWidth: 400, margin: '0 auto 48px',
          }}>
            Obrigado pela entrega e autenticidade.
            Sua participação contribui diretamente para o treinamento do OMMΩ.
            Quando a{' '}
            <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>segunda sessão</span>
            {' '}abrir, você receberá o link no seu e-mail.
          </p>

          {/* Divider */}
          <div style={{
            width: 48, height: 1,
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)',
            margin: '0 auto 40px',
          }} />

          {/* CTA */}
          <a
            href={`${process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online'}/study?code=${respondentId}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: F.inter, fontWeight: 500, fontSize: 14,
              color: 'white', background: '#8B0000',
              padding: '13px 32px', borderRadius: 8,
              textDecoration: 'none',
              boxShadow: '0 0 28px rgba(139,0,0,0.22)',
              transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
              marginBottom: 20, display: 'inline-flex',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#9e0000'; e.currentTarget.style.boxShadow = '0 0 48px rgba(139,0,0,0.42)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.boxShadow = '0 0 28px rgba(139,0,0,0.22)'; e.currentTarget.style.transform = 'none'; }}
          >
            Entrar na lista de espera do OMMΩ
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <div>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: F.inter, fontSize: 10, fontWeight: 500,
                color: 'rgba(255,255,255,0.2)', letterSpacing: '0.3em',
                textTransform: 'uppercase', padding: '8px 0',
                transition: 'color 0.3s, letter-spacing 0.4s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.letterSpacing = '0.45em'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.letterSpacing = '0.3em'; }}
            >
              Retornar ao Início
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
