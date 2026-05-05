import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);
const callDebug = (action) => console.log(`[DEBUG][CALL] Ação disparada: ${action}`);

const HeroVideo = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        initDebug('HeroVideo');
        if (videoRef.current) {
            videoRef.current.play().then(() => {
                callDebug('Vídeo iniciado com sucesso');
            }).catch((err) => {
                callDebug(`Vídeo falhou ao iniciar: ${err.message}`);
            });
        }
    }, []);

    return (
        <section className="relative w-full max-h-[720px] overflow-hidden bg-transparent flex items-center justify-center">
            <video 
                ref={videoRef}
                autoPlay 
                loop 
                muted 
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover z-0"
                src="/She_slowly_begins_to_turn_202605042158.mp4"
            />
            
            {/* Overlay removido temporariamente para debug do vídeo */}

            {/* Conteúdo purista */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-16 text-right md:text-center pl-24 md:pl-16">
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className="font-space font-extrabold text-5xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.05] tracking-tight"
                >
                    A inteligência<br/>que <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-1 to-accent-hot">sente</span>.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="font-mono text-sm text-text-dim uppercase tracking-[0.3em] mt-8"
                >
                    Predictive Forward-Forward Somatic AI
                </motion.p>
            </div>
        </section>
    );
};

export default HeroVideo;
