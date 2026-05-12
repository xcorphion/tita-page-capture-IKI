import Link from 'next/link';
import { useTranslation } from '../../hooks/useTranslation';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

const ColLabel = ({ children }) => (
  <span style={{
    display: 'block', fontFamily: F.space, fontWeight: 600, fontSize: 11,
    color: '#8B0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20,
  }}>
    {children}
  </span>
);

const NavLink = ({ href, children, isNext, tag }) => {
  const baseStyle = {
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: F.inter, fontSize: 14,
    color: 'rgba(240,234,232,0.35)',
    textDecoration: 'none', transition: 'color 0.2s',
  };
  const handlers = {
    onMouseEnter: e => { e.currentTarget.style.color = '#B22222'; },
    onMouseLeave: e => { e.currentTarget.style.color = 'rgba(240,234,232,0.35)'; },
  };
  const inner = (
    <>
      {children}
      {tag && (
        <span style={{ fontFamily: F.inter, fontSize: 9, color: 'rgba(240,234,232,0.2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {tag}
        </span>
      )}
    </>
  );
  return isNext
    ? <Link href={href} style={baseStyle} {...handlers}>{inner}</Link>
    : <a href={href} style={baseStyle} {...handlers}>{inner}</a>;
};

const Col = ({ label, children }) => (
  <div>
    <ColLabel>{label}</ColLabel>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {children}
    </div>
  </div>
);

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{
      backgroundColor: '#000',
      borderTop: '1px solid #3D0000',
      paddingTop: 'clamp(40px,6vw,72px)', paddingBottom: 'clamp(24px,4vw,40px)',
    }}>
      {/* alinhado com max-w-6xl mx-auto px-8 do BreakNews */}
      <div style={{ maxWidth: 1152, margin: '0 auto', paddingLeft: 'clamp(16px,3vw,32px)', paddingRight: 'clamp(16px,3vw,32px)' }}>

        {/* grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10 lg:gap-x-10 mb-12 lg:mb-16">

          {/* ── Brand ─────────────────────────── */}
          <div className="col-span-2 md:col-span-1">
            <span style={{ display: 'block', fontFamily: F.space, fontWeight: 700, fontSize: 13, color: '#F0EAE8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
              Xcorphion
            </span>
            <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(240,234,232,0.45)', fontStyle: 'italic', lineHeight: 1.65, maxWidth: 200 }}>
              {t('footer.tagline')}
            </p>
            <p style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(240,234,232,0.18)', letterSpacing: '0.06em', marginTop: 24 }}>
              {t('footer.location')}
            </p>
          </div>

          {/* ── OMMΩ ──────────────────────────── */}
          <Col label={t('footer.colOmma')}>
            <NavLink href="/omma" isNext>{t('footer.ommaPersonal')}</NavLink>
            <NavLink href="/omma-business" isNext tag={t('footer.soon')}>{t('footer.ommaBusiness')}</NavLink>
            <NavLink href="/omma-chat" isNext tag={t('footer.soon')}>{t('footer.ommaChat')}</NavLink>
            <NavLink href="/omma-solutions" isNext tag={t('footer.soon')}>{t('footer.ommaSolutions')}</NavLink>
            <NavLink href="/omma-api" isNext tag={t('footer.soon')}>{t('footer.ommaApi')}</NavLink>
          </Col>

          {/* ── Plataforma ────────────────────── */}
          <Col label={t('footer.colPlatform')}>
            <NavLink href="/#section-breaknews">{t('footer.breakNews')}</NavLink>
            <NavLink href="/models" isNext tag={t('footer.soon')}>{t('footer.models')}</NavLink>
            <NavLink href="/white-label" isNext tag={t('footer.soon')}>{t('footer.whiteLabel')}</NavLink>
          </Col>

          {/* ── Pesquisa ──────────────────────── */}
          <Col label={t('footer.colResearch')}>
            <NavLink href="/study" isNext>{t('footer.ourResearch')}</NavLink>
            <NavLink href="/influences" isNext>{t('footer.damasio')}</NavLink>
            <NavLink href="/study" isNext>{t('footer.participate')}</NavLink>
          </Col>

          {/* ── Empresa ───────────────────────── */}
          <Col label={t('footer.colCompany')}>
            <NavLink href="/#section-manifesto">{t('footer.manifesto')}</NavLink>
            <NavLink href="/sobre" isNext tag={t('footer.soon')}>{t('footer.about')}</NavLink>
            <NavLink href="mailto:support@xcorphion.online">{t('footer.contact')}</NavLink>
          </Col>

        </div>

        {/* bottom bar */}
        <div style={{
          paddingTop: 24, borderTop: '1px solid #3D0000',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(240,234,232,0.18)', letterSpacing: '0.04em' }}>
            {t('footer.copyright')}
          </span>
        </div>

      </div>
    </footer>
  );
}
