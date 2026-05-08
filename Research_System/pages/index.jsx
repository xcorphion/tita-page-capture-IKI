import React, { useEffect } from 'react';
import Head from 'next/head';

export default function ResearchIndex() {
  useEffect(() => {
    console.log('O proxy está funcionando');
  }, []);

  return (
    <>
      <Head>
        <title>Pesquisa | XCORPION</title>
      </Head>
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <p style={{ fontSize: '1.5rem' }}>O proxy está funcionando</p>
      </div>
    </>
  );
}
