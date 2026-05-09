import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);
const callDebug = (action) => console.log(`[DEBUG][CALL] Ação disparada: ${action}`);

const FloatingNav = () => {
    const { locale } = useRouter();
    const [iframeWidth, setIframeWidth] = useState('88px');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        initDebug('FloatingNav (Iframe Orchestrator)');

        const sectionMap = {
            'home': 'section-hero',
            'mission': 'section-manifesto',
            'break-news': 'section-breaknews'
        };
        const reverseSectionMap = Object.fromEntries(
            Object.entries(sectionMap).map(([id, elId]) => [elId, id])
        );

        const handleMessage = (event) => {
            if (event.data?.type === 'SIDEBAR_RESIZE') {
                const expanded = event.data.isExpanded;
                const expandedW = isMobile ? Math.min(264, window.innerWidth - 8) : 264;
                setIframeWidth(expanded ? `${expandedW}px` : '88px');
            } else if (event.data?.type === 'SIDEBAR_NAVIGATE') {
                if (event.data.id === 'research') {
                    window.location.href = '/study';
                    return;
                }
                if (event.data.id === 'omma') {
                    window.location.href = '/omma';
                    return;
                }
                const targetId = sectionMap[event.data.id];
                if (targetId) {
                    const element = document.getElementById(targetId);
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Scroll spy via IntersectionObserver
        const iframeEl = document.querySelector('iframe');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = reverseSectionMap[entry.target.id];
                    if (id && iframeEl) {
                        iframeEl.contentWindow?.postMessage({ type: 'SCROLL_ACTIVE', id }, '*');
                    }
                }
            });
        }, { threshold: 0.4 });

        Object.values(sectionMap).forEach(elId => {
            const el = document.getElementById(elId);
            if (el) observer.observe(el);
        });

        return () => {
            window.removeEventListener('message', handleMessage);
            observer.disconnect();
        };
    }, [isMobile]);

    return (
        <iframe
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
