import { useEffect, useRef } from 'react';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);
const callDebug = (action) => console.log(`[DEBUG][CALL] Ação disparada: ${action}`);

const HeroVideo = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        initDebug('HeroVideo');
        if (videoRef.current) {
            videoRef.current.play()
                .then(() => callDebug('Vídeo iniciado com sucesso'))
                .catch((err) => callDebug(`Vídeo falhou: ${err.message}`));
        }
    }, []);

    return (
        <section>
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                style={{ 
                    display: 'block', 
                    width: '100%', 
                    height: 'auto',
                    transform: 'scale(1.3) translateY(calc(17% - 13px))',
                    transformOrigin: 'center'
                }}
                src="/She_slowly_begins_to_turn_202605042158.mp4"
            />
        </section>
    );
};

export default HeroVideo;
