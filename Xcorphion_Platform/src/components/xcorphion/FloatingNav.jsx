import { useEffect, useState } from 'react';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);
const callDebug = (action) => console.log(`[DEBUG][CALL] Ação disparada: ${action}`);

const FloatingNav = () => {
    // Definimos a largura base do iframe. Quando retraído: ~160px (para caber a sombra). Quando expandido: ~360px.
    const [iframeWidth, setIframeWidth] = useState('160px');

    useEffect(() => {
        initDebug('FloatingNav (Iframe Orchestrator)');

        const handleMessage = (event) => {
            if (event.data?.type === 'SIDEBAR_RESIZE') {
                setIframeWidth(event.data.isExpanded ? '360px' : '160px');
            } else if (event.data?.type === 'SIDEBAR_NAVIGATE') {
                if (event.data.id === 'research') {
                    window.location.href = '/research';
                    return;
                }

                const sectionMap = {
                    'home': 'section-hero',
                    'mission': 'section-manifesto',
                    'break-news': 'section-breaknews'
                };
                
                const targetId = sectionMap[event.data.id];
                if (targetId) {
                    const element = document.getElementById(targetId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <iframe 
            src="/sidebar.html"
            style={{ 
                width: iframeWidth, 
                transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)', 
                background: 'transparent',
                backgroundColor: 'transparent',
                colorScheme: 'light' // Previne o fundo preto automático do browser
            }}
            className="fixed top-0 left-0 h-screen border-none z-[100] pointer-events-auto bg-transparent"
            allowtransparency="true"
        />
    );
};

export default FloatingNav;
