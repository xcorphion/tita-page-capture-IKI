import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@xcorphion/platform/src/components/xcorphion/Layout';

export default function ResearchIndex() {
  const articles = [
    {
      id: 'gate-1',
      title: 'Gate 1: Dinâmica de Teclado',
      description: 'Análise preliminar dos padrões de digitação e identificação emocional.',
      date: '2026-04-10'
    },
    {
      id: 'gate-2',
      title: 'Gate 2: Validação de Circunplexo de Russell',
      description: 'Mapeamento de valência e excitação através de inferência de keystrokes.',
      date: '2026-05-01'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#990000] selection:text-white flex relative overflow-x-hidden">
        <Head>
          <title>Pesquisa | XCORPION</title>
          <meta name="description" content="A base científica da XCORPION Research." />
        </Head>

        {/* Hero content area */}
        <main className="flex-1 px-8 py-20 lg:pl-40 lg:pr-[420px] flex items-center min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
          <header className="max-w-4xl w-full">
            <h1 
              className="font-semibold text-[30px] leading-relaxed tracking-tight text-white/90 drop-shadow-2xl mb-8"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              O estado emocional influencia a forma como digitamos antes mesmo de influenciar o conteúdo do texto. A <br/>
              <span className="text-[#990000] font-bold [-webkit-text-stroke:0.5px_#990000]">XCORPION Research</span> <br/>
              desenvolve a base científica para detectar esse sinal e integrá-lo nativamente à IA generativa.
            </h1>
          </header>
        </main>

        {/* TOC Right Sidebar - Fixed and Always Visible */}
        <aside 
          className="fixed right-0 top-0 bottom-0 w-[380px] border-l border-white/10 bg-[#0a0a0a] backdrop-blur-3xl p-10 overflow-y-auto z-[50] flex flex-col" 
          style={{ fontFamily: "'Inter', sans-serif", boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}
        >
          <h2 className="text-xl font-semibold mb-10 text-white border-b border-white/10 pb-4">
            Índice de Publicações
          </h2>
          
          <div className="flex flex-col gap-6">
            {articles.map((article) => (
              <Link href={`/research/${article.id}`} key={article.id} className="group block p-6 border border-white/5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#990000]/40 transition-all duration-500">
                <article>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold group-hover:text-[#990000] transition-colors leading-tight">
                      {article.title}
                    </h3>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono block mb-3 uppercase tracking-widest">
                    {article.date}
                  </span>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {article.description}
                  </p>
                  <div className="mt-5 flex items-center text-xs text-[#990000] font-bold opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                    ACESSAR PAPER <span className="ml-2">→</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          
          {/* Decorative Footer for TOC */}
          <div className="mt-auto pt-10 text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em]">
            XCORPION RESEARCH UNIT // 2026
          </div>
        </aside>
      </div>
    </Layout>
  );
}
