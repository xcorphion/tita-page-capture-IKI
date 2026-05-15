import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

const BreakNewsOrchestrator = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch('/api/articles');
                const data = await res.json();
                if (data.success) {
                    setArticles(data.data);
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    // Função de navegação
    const navigateToArticle = (id) => {
        // Usa location.href para garantir a rota no padrão Next.js sem precisar do router aqui se estiver fora do contexto
        window.location.href = `/article/id:${id}`;
    };

    return (
        <div className="w-full relative overflow-hidden bg-transparent flex flex-col justify-center py-8 md:py-20 font-inter">
            {/* Grid background similar ao que havia */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
                backgroundSize: '30px 30px',
                backgroundImage: 'linear-gradient(to right, rgba(139, 0, 0, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 0, 0, 0.2) 1px, transparent 1px)'
            }} />
            
            <div className="w-full absolute top-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(139, 0, 0, 0.4), transparent)' }} />
            
            <div className="relative z-10">
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-6 md:mb-16"
                >
                    <h2 className="font-space text-4xl md:text-5xl lg:text-[56px] font-medium text-white tracking-tight mb-4 md:mb-6">{t('breaknews.title')}</h2>
                    <p className="font-inter text-base md:text-lg text-white/50 max-w-2xl">
                        {t('breaknews.subtitle')}
                    </p>
                </motion.div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000]"></div>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="max-w-6xl mx-auto px-4 md:px-8 text-white/40 italic font-inter py-10">{t('breaknews.noArticles')}</div>
                ) : (
                    <div className="relative">
                        {/* Carrossel full-width, cards saem da tela */}
                        <div
                            ref={carouselRef}
                            className="flex gap-4 md:gap-6 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory hide-scrollbar px-4 md:px-8"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {articles.map((article, index) => (
                                <motion.div
                                    key={article.custom_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    onClick={() => navigateToArticle(article.custom_id)}
                                    className="flex-none w-4/5 sm:w-[278px] md:w-[318px] snap-start group cursor-pointer"
                                >
                                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-[#8B0000]/50 transition duration-300 flex flex-col h-full relative" style={{ boxShadow: 'none' }}>
                                        
                                        {/* Imagem Quadrada */}
                                        <div className="w-full aspect-square overflow-hidden bg-black/50">
                                            {article.card_image ? (
                                                <img 
                                                    src={article.card_image} 
                                                    alt={article.card_title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20 font-inter text-xs">
                                                    Sem Imagem
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 md:p-8 flex flex-col flex-grow">
                                            {/* Título Bold Médio */}
                                            <h3 className="font-space text-2xl font-semibold text-white mb-4 line-clamp-2 leading-tight">
                                                {article.card_title}
                                            </h3>

                                            {/* Legenda */}
                                            <p className="font-inter text-white/60 text-[15px] leading-relaxed mb-8 line-clamp-3 flex-grow">
                                                {article.card_legend}
                                            </p>

                                            {/* Arrow estética apontando pra direita */}
                                            <div className="mt-auto flex items-center gap-3 text-[#8B0000] font-inter text-sm uppercase tracking-widest group-hover:text-white transition-colors duration-300">
                                                {t('breaknews.readMore')}
                                                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
};

export default BreakNewsOrchestrator;
