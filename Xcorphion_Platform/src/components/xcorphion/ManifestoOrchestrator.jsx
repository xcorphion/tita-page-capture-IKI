import { useEffect } from 'react';
import { useRouter } from 'next/router';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);

const ManifestoOrchestrator = () => {
    const { locale } = useRouter();

    useEffect(() => {
        initDebug('ManifestoOrchestrator (Iframe Orchestrator)');
    }, []);

    return (
        <iframe
            src={`/manifesto-full.html?lang=${locale || 'pt'}`}
            style={{ 
                display: 'block',
                width: '100%',
                height: '100vh',
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
