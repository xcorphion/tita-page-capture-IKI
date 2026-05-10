import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const SECTION_MAP = {
    'home': 'section-hero',
    'mission': 'section-manifesto',
    'break-news': 'section-breaknews',
};

const REVERSE_SECTION_MAP = Object.fromEntries(
    Object.entries(SECTION_MAP).map(([id, elId]) => [elId, id])
);

const NAV_LABELS = {
    pt: { home: 'Início', mission: 'Manifesto', 'break-news': 'Break News', research: 'Pesquisa', omma: 'OMMΩ' },
    en: { home: 'Home', mission: 'Manifesto', 'break-news': 'Break News', research: 'Research', omma: 'OMMΩ' },
    es: { home: 'Inicio', mission: 'Manifiesto', 'break-news': 'Break News', research: 'Investigación', omma: 'OMMΩ' },
};

const IconHome = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);
const IconLayers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
);
const IconNewspaper = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
    </svg>
);
const IconSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
);
const IconCpu = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
        <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2" />
    </svg>
);

const NAV_ICONS = {
    home: IconHome,
    mission: IconLayers,
    'break-news': IconNewspaper,
    research: IconSearch,
    omma: IconCpu,
};

const NAV_IDS = ['home', 'mission', 'break-news', 'research', 'omma'];

function MobileTopbar({ locale, activeItem, onNavigate }) {
    const labels = NAV_LABELS[locale] || NAV_LABELS.pt;

    return (
        <nav
            style={{
                position: 'fixed',
                top: 16,
                left: 16,
                right: 16,
                zIndex: 100,
                height: 54,
                background: 'rgba(12, 4, 4, 0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 27,
                display: 'flex',
                alignItems: 'center',
                padding: '0 6px 0 14px',
                gap: 2,
            }}
        >
            {/* Logo */}
            <img
                src="/ommo.png"
                alt="Xcorphion"
                style={{ height: 28, width: 28, borderRadius: 7, objectFit: 'contain', flexShrink: 0 }}
            />

            <div style={{ flex: 1 }} />

            {/* Nav icons */}
            {NAV_IDS.map(id => {
                const Icon = NAV_ICONS[id];
                const isActive = activeItem === id;
                return (
                    <button
                        key={id}
                        onClick={() => onNavigate(id)}
                        title={labels[id]}
                        style={{
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isActive ? 'rgba(139,0,0,0.22)' : 'transparent',
                            border: 'none',
                            borderRadius: 11,
                            cursor: 'pointer',
                            color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                            transition: 'background 0.2s, color 0.2s',
                            position: 'relative',
                            flexShrink: 0,
                        }}
                    >
                        <Icon />
                        {isActive && (
                            <span style={{
                                position: 'absolute',
                                bottom: 5,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 3,
                                height: 3,
                                borderRadius: '50%',
                                background: '#8B0000',
                            }} />
                        )}
                    </button>
                );
            })}

        </nav>
    );
}

const FloatingNav = () => {
    const router = useRouter();
    const { locale } = router;
    const [iframeWidth, setIframeWidth] = useState('88px');
    const [isMobile, setIsMobile] = useState(false);
    const [activeItem, setActiveItem] = useState('home');

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'SIDEBAR_RESIZE') {
                if (!isMobile) {
                    setIframeWidth(event.data.isExpanded ? '264px' : '88px');
                }
            } else if (event.data?.type === 'SIDEBAR_NAVIGATE') {
                handleNavigate(event.data.id);
            } else if (event.data?.type === 'SIDEBAR_LANG_CHANGE') {
                router.push(router.asPath, router.asPath, { locale: event.data.locale });
            }
        };

        window.addEventListener('message', handleMessage);

        const iframeEl = document.querySelector('iframe[data-sidebar]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = REVERSE_SECTION_MAP[entry.target.id];
                    if (id) {
                        setActiveItem(id);
                        if (!isMobile && iframeEl) {
                            iframeEl.contentWindow?.postMessage({ type: 'SCROLL_ACTIVE', id }, '*');
                        }
                    }
                }
            });
        }, { threshold: 0.4 });

        Object.values(SECTION_MAP).forEach(elId => {
            const el = document.getElementById(elId);
            if (el) observer.observe(el);
        });

        return () => {
            window.removeEventListener('message', handleMessage);
            observer.disconnect();
        };
    }, [isMobile]);

    const handleNavigate = (id) => {
        if (id === 'research') { window.location.href = '/study'; return; }
        if (id === 'omma') { window.location.href = '/omma'; return; }
        const targetId = SECTION_MAP[id];
        if (targetId) {
            setActiveItem(id);
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (isMobile) {
        return (
            <MobileTopbar
                locale={locale || 'pt'}
                activeItem={activeItem}
                onNavigate={handleNavigate}
            />
        );
    }

    return (
        <iframe
            data-sidebar
            src={`/sidebar.html?lang=${locale || 'pt'}`}
            style={{
                width: iframeWidth,
                transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                background: 'transparent',
                backgroundColor: 'transparent',
                colorScheme: 'light',
            }}
            className="fixed top-0 left-0 h-screen border-none z-[100] pointer-events-auto bg-transparent"
            allowtransparency="true"
        />
    );
};

export default FloatingNav;
