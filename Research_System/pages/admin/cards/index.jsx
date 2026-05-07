import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Importa o Quill dinamicamente para evitar erro de SSR (document is not defined)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Configurações do toolbar do Quill para permitir formatação de jornalismo
const modules = {
  toolbar: [
    [{ 'header': [2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

export default function AdminCardsEditor() {
    const [formData, setFormData] = useState({
        card_title: '',
        card_legend: '',
        card_image: '',
        author: '',
        sources: '',
        article_content: ''
    });

    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuillChange = (content) => {
        setFormData(prev => ({ ...prev, article_content: content }));
    };

    const handleSave = async () => {
        setStatus('Salvando...');
        try {
            const payload = {
                ...formData,
                sources: formData.sources.split(',').map(s => s.trim()).filter(s => s)
            };

            const res = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatus('✅ Artigo salvo com sucesso!');
                setFormData({
                    card_title: '', card_legend: '', card_image: '', author: '', sources: '', article_content: ''
                });
                setTimeout(() => setStatus(''), 3000);
            } else {
                const error = await res.json();
                setStatus(`❌ Erro: ${error.error || 'Falha ao salvar'}`);
            }
        } catch (error) {
            setStatus('❌ Erro na requisição.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row overflow-hidden font-inter">
            <Head>
                <title>Admin - OMMΩ News Editor</title>
            </Head>

            {/* PAINEL ESQUERDO: EDITOR */}
            <div className="w-full md:w-1/2 h-screen overflow-y-auto p-8 border-r border-white/10 bg-[#0a0a0a]">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-space font-semibold text-[#8B0000]">Redação // Break News</h1>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#8B0000] text-white font-medium rounded hover:bg-red-800 transition"
                    >
                        Publicar Artigo
                    </button>
                </div>

                {status && <div className="mb-4 text-sm font-medium text-green-400">{status}</div>}

                <div className="space-y-6">
                    {/* Campos do Card */}
                    <div className="p-6 bg-white/5 rounded-lg border border-white/10 space-y-4">
                        <h2 className="text-sm uppercase tracking-widest text-white/50 mb-4 font-mono">Dados do Card (Vitrine)</h2>
                        
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Título (Max 60 chars)</label>
                            <input type="text" name="card_title" value={formData.card_title} onChange={handleChange} 
                                className="w-full bg-black border border-white/20 rounded p-3 text-white focus:border-[#8B0000] outline-none transition" 
                                placeholder="Ex: A nova era da empatia algorítmica..." />
                        </div>
                        
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Legenda / Resumo</label>
                            <textarea name="card_legend" value={formData.card_legend} onChange={handleChange} rows="2"
                                className="w-full bg-black border border-white/20 rounded p-3 text-white focus:border-[#8B0000] outline-none transition resize-none"
                                placeholder="Uma breve descrição que aparecerá no carrossel." />
                        </div>

                        <div>
                            <label className="block text-xs text-white/70 mb-1">URL da Imagem (Quadrada 1:1)</label>
                            <input type="text" name="card_image" value={formData.card_image} onChange={handleChange} 
                                className="w-full bg-black border border-white/20 rounded p-3 text-white focus:border-[#8B0000] outline-none transition" 
                                placeholder="https://exemplo.com/imagem-quadrada.jpg" />
                        </div>
                    </div>

                    {/* Metadados do Artigo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Autor</label>
                            <input type="text" name="author" value={formData.author} onChange={handleChange} 
                                className="w-full bg-black border border-white/20 rounded p-3 text-white focus:border-[#8B0000] outline-none transition" 
                                placeholder="Ex: Editorial Xcorphion" />
                        </div>
                        <div>
                            <label className="block text-xs text-white/70 mb-1">Fontes (Separadas por vírgula)</label>
                            <input type="text" name="sources" value={formData.sources} onChange={handleChange} 
                                className="w-full bg-black border border-white/20 rounded p-3 text-white focus:border-[#8B0000] outline-none transition" 
                                placeholder="Ex: Nature, MIT Tech Review" />
                        </div>
                    </div>

                    {/* Corpo do Artigo (Rich Text) */}
                    <div>
                        <label className="block text-xs text-white/70 mb-2">Corpo do Artigo (Editorial)</label>
                        <div className="bg-white text-black rounded overflow-hidden">
                            <ReactQuill 
                                theme="snow" 
                                value={formData.article_content} 
                                onChange={handleQuillChange}
                                modules={modules}
                                className="h-[400px] pb-[42px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* PAINEL DIREITO: LIVE PREVIEW */}
            <div className="w-full md:w-1/2 h-screen overflow-y-auto bg-[#0F172A] relative">
                {/* O background 'preto chumbo levemente azulado' (#0F172A) solicitado */}
                
                <div className="sticky top-0 w-full bg-[#0F172A]/90 backdrop-blur-md border-b border-white/5 py-3 px-6 z-10 flex justify-between items-center">
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Live Preview</span>
                    <span className="text-[10px] text-white/20">Renderização em Tempo Real</span>
                </div>

                {/* Container do Artigo (Padrão Anthropic: limpo, centralizado, padding médio) */}
                <div className="max-w-3xl mx-auto px-8 py-16">
                    
                    {/* Header do Artigo */}
                    <div className="mb-12 text-center">
                        <span className="text-[#8B0000] font-mono text-sm tracking-widest uppercase block mb-4">
                            BREAK NEWS
                        </span>
                        <h1 className="text-4xl md:text-5xl font-space font-semibold text-white leading-tight mb-6">
                            {formData.card_title || 'Título do Artigo Aparecerá Aqui'}
                        </h1>
                        <p className="text-lg text-white/60 font-inter max-w-2xl mx-auto leading-relaxed mb-8">
                            {formData.card_legend || 'A legenda de apoio será exibida nesta área, complementando o título de forma elegante.'}
                        </p>
                        
                        <div className="flex items-center justify-center gap-4 text-sm text-white/40 font-mono">
                            <span>{formData.author || 'Autor'}</span>
                            <span>•</span>
                            <span>{new Date().toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>

                    {/* Imagem Hero Preview */}
                    {formData.card_image && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden mb-12 border border-white/10">
                            <img src={formData.card_image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Corpo do Texto Renderizado */}
                    {/* A classe 'prose' tipicamente vem do tailwind typography, mas aqui faremos estilos nativos p/ garantir controle */}
                    <div 
                        className="font-inter text-[17px] leading-[1.8] text-white/80 article-preview-content"
                        dangerouslySetInnerHTML={{ __html: formData.article_content || '<p class="text-white/30 italic text-center mt-20">O conteúdo do artigo será renderizado aqui...</p>' }}
                    />

                    {/* Rodapé: Fontes */}
                    {formData.sources && (
                        <div className="mt-16 pt-8 border-t border-white/10">
                            <span className="text-xs font-mono uppercase tracking-widest text-white/40 block mb-4">Fontes & Referências</span>
                            <ul className="text-sm text-white/60 space-y-2">
                                {formData.sources.split(',').map((s, i) => s.trim() && (
                                    <li key={i}>[{i+1}] {s.trim()}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Estilos injetados para o conteúdo do Quill renderizado no preview */}
            <style jsx global>{`
                .article-preview-content p { margin-bottom: 1.5em; }
                .article-preview-content h2 { font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem; font-weight: 600; color: white; margin-top: 2em; margin-bottom: 1em; }
                .article-preview-content h3 { font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; font-weight: 500; color: white; margin-top: 1.5em; margin-bottom: 0.8em; }
                .article-preview-content a { color: #8B0000; text-decoration: underline; text-underline-offset: 4px; }
                .article-preview-content blockquote { border-left: 4px solid #8B0000; padding-left: 1.5em; font-style: italic; color: rgba(255,255,255,0.7); margin: 2em 0; }
                .article-preview-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.5em; }
                .article-preview-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.5em; }
                .article-preview-content img { border-radius: 0.5rem; margin: 2em auto; display: block; max-width: 100%; border: 1px solid rgba(255,255,255,0.1); }
                .article-preview-content iframe { width: 100%; aspect-ratio: 16/9; border-radius: 0.5rem; margin: 2em 0; border: 1px solid rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
}
