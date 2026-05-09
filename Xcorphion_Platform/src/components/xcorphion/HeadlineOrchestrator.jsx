import { useEffect } from 'react';
import { useRouter } from 'next/router';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);

const HeadlineOrchestrator = () => {
    const { locale } = useRouter();

    useEffect(() => {
        initDebug('HeadlineOrchestrator (Iframe Orchestrator)');
    }, []);

    return (
        <iframe
            src={`/headline-full.html?lang=${locale || 'pt'}`}
            style={{
                display: 'block',
                width: '100%',
                height: '100%',
                background: 'transparent',
                backgroundColor: 'transparent',
                border: 'none',
            }}
            className="border-none"
            allowtransparency="true"
        />
    );
};

export default HeadlineOrchestrator;
