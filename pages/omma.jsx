
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Use dynamic import with ssr: false for components that use Three.js / window
const App = dynamic(() => import('../src/App'), { ssr: false });

export default function OmmaPage() {
  return (
    <>
      <Head>
        <title>TITAN — OMMA | Xcorpion Corporation</title>
        <meta name="description" content="OMMA is the first cognitive affective model. Perceive what you feel while you think." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&family=Inter:wght@400;500;700&family=JetBrains+Mono&display=swap" rel="stylesheet" />
      </Head>
      <App />
    </>
  );
}
