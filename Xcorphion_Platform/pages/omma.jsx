import Head from 'next/head';
import Layout from '../src/components/xcorphion/Layout';
import HeroVideo from '../src/components/xcorphion/HeroVideo';
import ManifestoOrchestrator from '../src/components/xcorphion/ManifestoOrchestrator';

export default function OmmaPage() {
  return (
    <>
      <Head>
        <title>Xcorphion | Somatic AI</title>
        <meta name="description" content="Xcorpion existe para tornar a comunicação entre humanos e máquinas honesta." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&family=Inter:wght@400;500;700&family=JetBrains+Mono&display=swap" rel="stylesheet" />
      </Head>
      
      <Layout>
        <HeroVideo />
        <ManifestoOrchestrator />
      </Layout>
    </>
  );
}
