import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';

export default function ArticlePage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!rawId) return;

        // A URL é do formato /article/id:{id}, então extraímos a string após "id:"
        const actualId = typeof rawId === 'string' && rawId.startsWith('id:') 
            ? rawId.substring(3) 
            : rawId;

        const fetchArticle = async () => {
            try {
                const res = await fetch(`/api/articles/${actualId}`);
                const data = await res.json();
                
                if (res.ok && data.success) {
                    setArticle(data.data);
                } else {
                    setError('Artigo não encontrado ou indisponível.');
                }
            } catch (err) {
                setError('Erro ao conectar com o servidor.');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [rawId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center font-inter text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B0000]"></div>
                    <span className="text-sm tracking-widest text-white/50 uppercase">Carregando Acervo</span>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center font-inter text-white p-8">
                <div className="text-center max-w-md">
                    <span className="text-[#8B0000] font-mono text-sm tracking-widest mb-4 block">ERRO 404</span>
                    <h1 className="text-3xl font-space mb-6">Sinal Perdido</h1>
                    <p className="text-white/60 mb-8">{error}</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="text-sm uppercase tracking-widest border border-white/20 px-6 py-2 rounded hover:bg-white hover:text-black transition duration-300"
                    >
                        Retornar à Base
                    </button>
                </div>
            </div>
        );
    }

    return (
        // Background imutável: preto chumbo levemente azulado (#0F172A)
        <div className="min-h-screen bg-[#0F172A] text-white font-inter selection:bg-[#8B0000] selection:text-white">
            <Head>
                <title>{article.card_title} | Xcorphion News</title>
                <meta name="description" content={article.card_legend} />
            </Head>

            {/* Topbar minimalista */}
            <div className="w-full border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
                    <button 
                        onClick={() => router.push('/')}
                        className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-mono text-xs uppercase tracking-widest">Retornar</span>
                    </button>
                    <span className="font-space font-medium text-white/80 tracking-widest uppercase text-xs">OMMΩ Break News</span>
                </div>
            </div>

            {/* Estrutura Editorial Padrão Anthropic: Clean, Focada, Centralizada, Padding Médio */}
            <main className="max-w-[760px] mx-auto px-6 md:px-8 py-16 md:py-24">
                
                <motion.article 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Header do Artigo */}
                    <header className="mb-14">
                        <h1 className="font-space text-4xl md:text-[52px] leading-[1.1] font-semibold text-white tracking-tight mb-6">
                            {article.card_title}
                        </h1>
                        <p className="font-inter text-xl md:text-2xl text-white/60 leading-relaxed font-light mb-10">
                            {article.card_legend}
                        </p>
                        
                        {/* Metadados */}
                        <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-white/40 uppercase tracking-wider py-4 border-y border-white/10">
                            <span>{article.author || 'Editorial Xcorphion'}</span>
                            <span className="w-1 h-1 rounded-full bg-[#8B0000]"></span>
                            <span>
                                {new Date(article.published_at).toLocaleDateString('pt-BR', { 
                                    year: 'numeric', month: 'long', day: 'numeric' 
                                })}
                            </span>
                        </div>
                    </header>

                    {/* Imagem de Destaque (se existir) */}
                    {article.card_image && (
                        <figure className="mb-16 w-full relative">
                            {/* A imagem hero não precisa ser perfeitamente quadrada aqui, respeitamos o aspect ratio original da URL com max-height ou aspect-video, estilo editorial */}
                            <div className="w-full aspect-[21/9] bg-black rounded-xl overflow-hidden border border-white/10">
                                <img 
                                    src={article.card_image} 
                                    alt={article.card_title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </figure>
                    )}

                    {/* Corpo do Texto (Rich Text rendered) */}
                    <div 
                        className="editorial-content font-inter text-[18px] leading-[1.8] text-white/80"
                        dangerouslySetInnerHTML={{ __html: article.article_content }}
                    />

                    {/* Rodapé: Fontes e Referências */}
                    {article.sources && Array.isArray(article.sources) && article.sources.length > 0 && (
                        <footer className="mt-24 pt-10 border-t border-white/10">
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B0000] mb-6">
                                Fontes & Referências Analíticas
                            </h4>
                            <ul className="space-y-3">
                                {article.sources.map((source, idx) => (
                                    <li key={idx} className="text-sm font-inter text-white/50 flex gap-3">
                                        <span className="text-white/20 font-mono">[{idx + 1}]</span>
                                        <span className="leading-relaxed">{source}</span>
                                    </li>
                                ))}
                            </ul>
                        </footer>
                    )}
                </motion.article>

            </main>

            {/* Estilos Globais para o Conteúdo do Editor (Injeção Segura) */}
            <style dangerouslySetInnerHTML={{__html: `
                .editorial-content p { margin-bottom: 1.8em; }
                .editorial-content h2 { font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 600; color: white; margin-top: 2.5em; margin-bottom: 1em; letter-spacing: -0.02em; line-height: 1.2; }
                .editorial-content h3 { font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 500; color: white; margin-top: 2em; margin-bottom: 0.8em; }
                .editorial-content a { color: #8B0000; text-decoration: underline; text-underline-offset: 4px; transition: color 0.2s; }
                .editorial-content a:hover { color: #ff3333; }
                .editorial-content blockquote { border-left: 4px solid #8B0000; padding-left: 1.5em; font-style: italic; color: rgba(255,255,255,0.7); margin: 2.5em 0; background: linear-gradient(90deg, rgba(139,0,0,0.05) 0%, transparent 100%); padding-top: 1em; padding-bottom: 1em; }
                .editorial-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.8em; }
                .editorial-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.8em; }
                .editorial-content li { margin-bottom: 0.5em; }
                .editorial-content img { border-radius: 0.75rem; margin: 3em auto; display: block; max-width: 100%; border: 1px solid rgba(255,255,255,0.1); }
                .editorial-content iframe { width: 100%; aspect-ratio: 16/9; border-radius: 0.75rem; margin: 3em 0; border: 1px solid rgba(255,255,255,0.1); }
            `}} />
        </div>
    );
}
