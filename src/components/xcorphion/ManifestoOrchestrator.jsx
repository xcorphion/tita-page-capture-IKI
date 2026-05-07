import { useEffect } from 'react';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);

const ManifestoOrchestrator = () => {
    useEffect(() => {
        initDebug('ManifestoOrchestrator (Iframe Orchestrator)');
    }, []);

    return (
        <iframe 
            src="/manifesto-full.html"
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
