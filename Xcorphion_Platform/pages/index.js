import Head from 'next/head';
import Layout from '../src/components/xcorphion/Layout';
import HeroVideo from '../src/components/xcorphion/HeroVideo';
import HeadlineOrchestrator from '../src/components/xcorphion/HeadlineOrchestrator';
import ManifestoOrchestrator from '../src/components/xcorphion/ManifestoOrchestrator';
import BreakNewsOrchestrator from '../src/components/xcorphion/BreakNewsOrchestrator';

export default function Home() {
  return (
    <>
      <Head>
        <title>Xcorphion | Somatic AI</title>
        <meta name="description" content="Xcorpion existe para tornar a comunicação entre humanos e máquinas honesta." />
      </Head>

      <Layout>

        {/* ─── SEÇÃO 1: HERO ─────────────────────────────────────────── */}
        {/*
          height: 100vh garante que a seção sempre ocupa a tela inteira.
          position: relative é o âncora para todos os filhos absolute.
          overflow: hidden evita barras de rolagem causadas pelo iframe 100vw.
        */}
        <section
          id="section-hero"
          style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}
        >
          {/* CAMADA 0 — Vídeo de fundo (z-index 0) */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <HeroVideo />
          </div>

          {/* CAMADA 1 — Malha + Headline (z-index 1, sem pointer-events) */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
            <HeadlineOrchestrator />
          </div>
        </section>

        {/* ─── SEÇÃO 2: MANIFESTO ────────────────────────────────────── */}
        {/*
          Flui naturalmente após o Hero.
          min-height garante espaço mínimo mesmo se o iframe demorar a carregar.
        */}
        <section
          id="section-manifesto"
          style={{ position: 'relative', width: '100%' }}
        >
          <ManifestoOrchestrator />
        </section>

        <section
          id="section-breaknews"
          style={{ position: 'relative', width: '100%' }}
        >
          <BreakNewsOrchestrator />
        </section>

      </Layout>
    </>
  );
}
