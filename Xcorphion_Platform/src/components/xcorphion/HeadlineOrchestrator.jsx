import { useEffect } from 'react';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);

const HeadlineOrchestrator = () => {
    useEffect(() => {
        initDebug('HeadlineOrchestrator (Iframe Orchestrator)');
    }, []);

    return (
        <iframe 
            src="/headline-full.html"
            style={{ 
                display: 'block',
                width: '100%', 
                height: '100%', 
                background: 'transparent',
                backgroundColor: 'transparent',
            }}
            className="border-none"
            allowtransparency="true"
        />
    );
};

export default HeadlineOrchestrator;
