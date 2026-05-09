import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);

const ManifestoOrchestrator = () => {
    const { locale } = useRouter();
    const [iframeHeight, setIframeHeight] = useState('100vh');

    useEffect(() => {
        initDebug('ManifestoOrchestrator (Iframe Orchestrator)');

        const handler = (event) => {
            if (event.data?.type === 'MANIFESTO_HEIGHT') {
                setIframeHeight(`${event.data.height}px`);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    return (
        <iframe
            src={`/manifesto-full.html?lang=${locale || 'pt'}`}
            style={{
                display: 'block',
                width: '100%',
                height: iframeHeight,
                minHeight: '100vh',
                background: 'transparent',
                backgroundColor: 'transparent',
            }}
            className="border-none pointer-events-auto"
            allowtransparency="true"
        />
    );
};

export default ManifestoOrchestrator;
