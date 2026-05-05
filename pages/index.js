import Head from 'next/head';
import Layout from '../src/components/xcorphion/Layout';
import HeroVideo from '../src/components/xcorphion/HeroVideo';
// import Manifesto from '../src/components/xcorphion/Manifesto'; // Próximo passo

export default function Home() {
  return (
    <>
      <Head>
        <title>Xcorphion | Somatic AI</title>
        <meta name="description" content="Xcorpion existe para tornar a comunicação entre humanos e máquinas honesta." />
      </Head>
      
      <Layout>
        <HeroVideo />
        {/* Outras seções entrarão aqui depois */}
      </Layout>
    </>
  );
}
