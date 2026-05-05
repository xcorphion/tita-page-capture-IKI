import { useEffect, useState } from 'react';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);
const callDebug = (action) => console.log(`[DEBUG][CALL] Ação disparada: ${action}`);

const FloatingNav = () => {
    // Definimos a largura base do iframe. Quando retraído: ~120px (para caber a sombra). Quando expandido: ~320px.
    const [iframeWidth, setIframeWidth] = useState('120px');

    useEffect(() => {
        initDebug('FloatingNav (Iframe Orchestrator)');

        const handleMessage = (event) => {
            if (event.data?.type === 'SIDEBAR_RESIZE') {
                setIframeWidth(event.data.isExpanded ? '320px' : '120px');
            } else if (event.data?.type === 'SIDEBAR_NAVIGATE') {
                callDebug(`Navegando para: ${event.data.id}`);
                // Aqui você pode adicionar lógica de roteamento do Next.js se precisar no futuro
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
            allowTransparency="true"
        />
    );
};

export default FloatingNav;
