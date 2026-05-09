import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

const modules = {
  toolbar: [
    [{ 'header': [2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const Label = ({ children }) => (
  <span style={{ display: 'block', fontFamily: F.inter, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{children}</span>
);

const inputBase = {
  width: '100%', boxSizing: 'border-box',
  fontFamily: F.inter, fontSize: 14, color: 'white',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '12px 16px', outline: 'none',
  transition: 'border-color 0.2s',
};

const onFocus = e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; };
const onBlur  = e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; };

export default function AdminCardsEditor() {
  const [formData, setFormData] = useState({ card_title: '', card_legend: '', card_image: '', author: '', sources: '', article_content: '' });
  const [status, setStatus]   = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = content => {
    setFormData(prev => ({ ...prev, article_content: content }));
  };

  const handleSave = async () => {
    setStatus('Salvando...');
    setIsError(false);
    try {
      const payload = { ...formData, sources: formData.sources.split(',').map(s => s.trim()).filter(s => s) };
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus('Artigo publicado com sucesso.');
        setFormData({ card_title: '', card_legend: '', card_image: '', author: '', sources: '', article_content: '' });
        setTimeout(() => setStatus(''), 3000);
      } else {
        const error = await res.json();
        setIsError(true);
        setStatus(error.error || 'Falha ao salvar');
      }
    } catch {
      setIsError(true);
      setStatus('Erro na requisição.');
    }
  };

  return (
    <>
      <Head>
        <title>Redação — Xcorphion Research</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 56, flexShrink: 0 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Voltar
          </Link>
          <span style={{ fontFamily: F.space, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Redação</span>
          <button onClick={handleSave} style={{ fontFamily: F.inter, fontWeight: 500, fontSize: 13, color: 'white', background: '#8B0000', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', boxShadow: '0 0 20px rgba(139,0,0,0.25)', transition: 'background 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#9e0000'; e.currentTarget.style.boxShadow = '0 0 32px rgba(139,0,0,0.45)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#8B0000'; e.currentTarget.style.boxShadow = '0 0 20px rgba(139,0,0,0.25)'; }}>
            Publicar Artigo
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 56px)' }}>
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ width: '50%', height: '100%', overflowY: 'auto', padding: '40px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontFamily: F.space, fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 6 }}>Break News</h1>
              <span style={{ fontFamily: F.inter, fontWeight: 600, fontSize: 11, color: '#8B0000', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Redação // Editor</span>
            </div>

            {status && (
              <div style={{ marginBottom: 24, padding: '14px 18px', border: `1px solid ${isError ? 'rgba(139,0,0,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, background: isError ? 'rgba(139,0,0,0.06)' : 'rgba(255,255,255,0.02)' }}>
                <p style={{ fontFamily: F.inter, fontSize: 13, color: isError ? 'rgba(210,70,70,0.9)' : 'rgba(255,255,255,0.6)', margin: 0 }}>{status}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
                <span style={{ display: 'block', fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>Dados do Card (Vitrine)</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div><Label>Título (máx. 60 caracteres)</Label><input type="text" name="card_title" value={formData.card_title} onChange={handleChange} style={inputBase} placeholder="Ex: A nova era da empatia algorítmica..." onFocus={onFocus} onBlur={onBlur} /></div>
                  <div><Label>Legenda / Resumo</Label><textarea name="card_legend" value={formData.card_legend} onChange={handleChange} rows={2} style={{ ...inputBase, resize: 'none' }} placeholder="Uma breve descrição que aparecerá no carrossel." onFocus={onFocus} onBlur={onBlur} /></div>
                  <div><Label>URL da Imagem (quadrada 1:1)</Label><input type="text" name="card_image" value={formData.card_image} onChange={handleChange} style={inputBase} placeholder="https://exemplo.com/imagem.jpg" onFocus={onFocus} onBlur={onBlur} /></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><Label>Autor</Label><input type="text" name="author" value={formData.author} onChange={handleChange} style={inputBase} placeholder="Ex: Editorial Xcorphion" onFocus={onFocus} onBlur={onBlur} /></div>
                <div><Label>Fontes (separadas por vírgula)</Label><input type="text" name="sources" value={formData.sources} onChange={handleChange} style={inputBase} placeholder="Ex: Nature, MIT Tech Review" onFocus={onFocus} onBlur={onBlur} /></div>
              </div>

              <div>
                <Label>Corpo do Artigo (Editorial)</Label>
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ReactQuill theme="snow" value={formData.article_content} onChange={handleQuillChange} modules={modules} style={{ height: 400, paddingBottom: 42 }} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }} style={{ width: '50%', height: '100%', overflowY: 'auto', background: '#080808', position: 'relative' }}>
            <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 40px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Preview</span>
              <span style={{ fontFamily: F.inter, fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>Renderização em tempo real</span>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 40px 120px' }}>
              <div style={{ marginBottom: 56, textAlign: 'center' }}>
                <span style={{ fontFamily: F.inter, fontWeight: 600, fontSize: 11, color: '#8B0000', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>BREAK NEWS</span>
                <h1 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 'clamp(26px, 4vw, 42px)', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'white', marginBottom: 20 }}>{formData.card_title || 'Título do artigo aparecerá aqui'}</h1>
                <p style={{ fontFamily: F.inter, fontWeight: 300, fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 28px' }}>{formData.card_legend || 'A legenda de apoio será exibida aqui.'}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: F.inter, fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  <span>{formData.author || 'Autor'}</span><span>·</span><span>{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              {formData.card_image && (
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: 56, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <img src={formData.card_image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="article-preview-content" style={{ fontFamily: F.inter, fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)' }} dangerouslySetInnerHTML={{ __html: formData.article_content || '<p style="color:rgba(255,255,255,0.2);font-style:italic;text-align:center;margin-top:60px">O conteúdo do artigo será renderizado aqui...</p>' }} />
              {formData.sources && (
                <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Fontes & Referências</span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {formData.sources.split(',').map((s, i) => s.trim() && <li key={i} style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>[{i + 1}] {s.trim()}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .article-preview-content p { margin-bottom: 1.5em; }
        .article-preview-content h2 { font-family: 'Space Grotesk', sans-serif; font-size: 1.75rem; font-weight: 700; color: white; margin-top: 2em; margin-bottom: 1em; letter-spacing: -0.02em; }
        .article-preview-content h3 { font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; font-weight: 600; color: white; margin-top: 1.5em; margin-bottom: 0.75em; letter-spacing: -0.02em; }
        .article-preview-content a { color: #8B0000; text-decoration: underline; text-underline-offset: 4px; }
        .article-preview-content blockquote { border-left: 3px solid rgba(139,0,0,0.45); padding-left: 1.5em; font-style: italic; color: rgba(255,255,255,0.55); margin: 2em 0; }
        .article-preview-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.5em; }
        .article-preview-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.5em; }
        .article-preview-content img { border-radius: 10px; margin: 2em auto; display: block; max-width: 100%; border: 1px solid rgba(255,255,255,0.07); }
        .ql-toolbar.ql-snow { background: #161616 !important; border: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
        .ql-container.ql-snow { border: none !important; }
        .ql-toolbar.ql-snow .ql-stroke { stroke: rgba(255,255,255,0.5); }
        .ql-toolbar.ql-snow .ql-fill { fill: rgba(255,255,255,0.5); }
        .ql-toolbar.ql-snow button:hover .ql-stroke { stroke: white; }
        .ql-toolbar.ql-snow button:hover .ql-fill { fill: white; }
        .ql-toolbar.ql-snow .ql-picker-label { color: rgba(255,255,255,0.5); }
        .ql-editor { background: white; color: #111; min-height: 400px; font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.7; }
      `}</style>
    </>
  );
}
