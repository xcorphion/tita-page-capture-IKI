import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

const TOC_SECTIONS = [
  { id: 'sec-1',  num: '01', label: 'Identificação da Controladora' },
  { id: 'sec-2',  num: '02', label: 'Natureza e Objetivo' },
  { id: 'sec-3',  num: '03', label: 'Dados Coletados' },
  { id: 'sec-4',  num: '04', label: 'Pseudonimização' },
  { id: 'sec-5',  num: '05', label: 'Base Legal' },
  { id: 'sec-6',  num: '06', label: 'Retenção de Dados' },
  { id: 'sec-7',  num: '07', label: 'Compartilhamento' },
  { id: 'sec-8',  num: '08', label: 'Segurança' },
  { id: 'sec-9',  num: '09', label: 'Direitos do Titular' },
  { id: 'sec-10', num: '10', label: 'Requisitos para Participar' },
  { id: 'sec-11', num: '11', label: 'Critérios de Elegibilidade' },
  { id: 'sec-12', num: '12', label: 'Participação Voluntária' },
  { id: 'sec-13', num: '13', label: 'Cookies' },
  { id: 'sec-14', num: '14', label: 'Alterações' },
  { id: 'sec-15', num: '15', label: 'Foro e Lei Aplicável' },
];

const SectionBadge = ({ num }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    fontFamily: F.inter, fontSize: 10, fontWeight: 600,
    color: '#8B0000', letterSpacing: '0.1em',
    background: 'rgba(139,0,0,0.1)',
    border: '1px solid rgba(139,0,0,0.22)',
    borderRadius: 4, padding: '3px 8px',
    marginBottom: 14,
    textTransform: 'uppercase',
  }}>
    {num}
  </span>
);

const H2 = ({ id, num, children }) => (
  <div id={id} style={{ paddingTop: 72, marginBottom: 6 }}>
    <SectionBadge num={num} />
    <h2 style={{
      fontFamily: F.space, fontSize: 'clamp(18px, 2.2vw, 22px)',
      fontWeight: 700, color: 'white',
      letterSpacing: '-0.025em', lineHeight: 1.2,
      margin: 0,
    }}>
      {children}
    </h2>
  </div>
);

const H3 = ({ children }) => (
  <h3 style={{
    fontFamily: F.space, fontSize: 13, fontWeight: 600,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    marginTop: 32, marginBottom: 14,
  }}>
    {children}
  </h3>
);

const P = ({ children }) => (
  <p style={{
    fontFamily: F.inter, fontSize: 15,
    color: 'rgba(255,255,255,0.52)',
    lineHeight: 1.82, marginBottom: '1.2em',
    fontWeight: 300,
  }}>
    {children}
  </p>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="rgba(120,200,120,0.75)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="rgba(200,80,80,0.75)" strokeWidth="2.5" strokeLinecap="round"
    style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const DataCard = ({ icon, children }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 12,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10, padding: '12px 16px',
    marginBottom: 6,
  }}>
    <span style={{ marginTop: 1 }}>{icon}</span>
    <span style={{
      fontFamily: F.inter, fontSize: 14,
      color: 'rgba(255,255,255,0.52)',
      lineHeight: 1.7, fontWeight: 300,
    }}>
      {children}
    </span>
  </div>
);

const Divider = () => (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 0 0' }} />
);

export default function TermsPage() {
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef(null);

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]');
    if (!sections.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveId(topmost.target.id);
        }
      },
      { rootMargin: '-56px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(s => observerRef.current.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>Termos de Uso da Pesquisa — Xcorphion</title>
        <meta name="description" content="Termos de uso, privacidade e consentimento informado para participação na pesquisa IKI da Xcorphion." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          ::selection { background: rgba(139,0,0,0.25); }
          * { box-sizing: border-box; }
          @media (max-width: 768px) { .toc-sidebar { display: none !important; } }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter }}>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(24px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(16px, 4vw, 40px)', height: 56,
        }}>
          <Link
            href="/study"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <span style={{ fontFamily: F.space, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Termos
          </span>
          <div style={{ width: 72 }} />
        </header>

        {/* Outer layout: content + sidebar */}
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', gap: 'clamp(24px, 5vw, 64px)', alignItems: 'flex-start' }}>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 160 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >

              {/* Hero */}
              <div style={{ padding: '72px 0 56px' }}>
                <span style={{
                  fontFamily: F.inter, fontSize: 11,
                  color: '#8B0000', letterSpacing: '0.12em',
                  textTransform: 'uppercase', display: 'block', marginBottom: 20,
                }}>
                  Documento Legal · Xcorphion Research Unit
                </span>
                <h1 style={{
                  fontFamily: F.space, fontWeight: 800,
                  fontSize: 'clamp(26px, 3.5vw, 42px)',
                  letterSpacing: '-0.03em', lineHeight: 1.1,
                  color: 'white', marginBottom: 24, maxWidth: 600,
                }}>
                  Termos de Uso e Consentimento Informado para Participação em Pesquisa
                </h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: F.inter, fontSize: 12,
                    color: 'rgba(255,255,255,0.38)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20, padding: '5px 14px',
                    letterSpacing: '0.02em',
                  }}>
                    Versão 1.0
                  </span>
                  <span style={{
                    fontFamily: F.inter, fontSize: 12,
                    color: 'rgba(255,255,255,0.38)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20, padding: '5px 14px',
                  }}>
                    Vigência: 1º mai 2026
                  </span>
                  <span style={{
                    fontFamily: F.inter, fontSize: 12,
                    color: 'rgba(255,255,255,0.38)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20, padding: '5px 14px',
                  }}>
                    Atualizado: 7 mai 2026
                  </span>
                </div>
              </div>

              <Divider />

              {/* Section 1 */}
              <div id="sec-1" data-section>
                <H2 id="sec-1-title" num="01">Identificação da Controladora</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    A pesquisa descrita neste documento é conduzida pela <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Xcorphion Corporation</strong> ("Xcorphion", "nós", "nossa"), pessoa jurídica de direito privado, responsável pelo desenvolvimento do sistema de inteligência artificial OMMΩ. Para fins de comunicação relacionados a esta pesquisa, o contato pode ser feito através dos canais disponíveis em <Link href="https://xcorphion.online/contact" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.25)', textUnderlineOffset: 3, fontWeight: 400, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>xcorphion.online/contact</Link>.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 2 */}
              <div id="sec-2" data-section>
                <H2 id="sec-2-title" num="02">Natureza e Objetivo da Pesquisa</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Esta pesquisa investiga a relação entre padrões de digitação humana — especificamente o Inter-Keystroke Interval (IKI), definido como o intervalo de tempo em milissegundos entre eventos consecutivos de pressionamento de tecla — e estados afetivos e somáticos do participante, conforme mensurados por escalas de autorrelato (Experience Sampling Method — EMA).
                  </P>
                  <P>
                    O objetivo científico é testar a hipótese, derivada das teorias de marcadores somáticos de António Damásio, de que variações no ritmo de digitação correlacionam-se de forma estatisticamente significativa com estados emocionais autorrelatados, medidos por dimensões de valência (positivo/negativo) e arousal (calmo/agitado) no modelo circumplexo de Russell.
                  </P>
                  <P>
                    Os dados coletados serão utilizados exclusivamente para o treinamento, validação e melhoria do componente somático do modelo OMMΩ, desenvolvido pela Xcorphion, e para publicações acadêmicas ou técnicas relacionadas, nas quais os dados serão apresentados de forma agregada e anonimizada.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 3 */}
              <div id="sec-3" data-section>
                <H2 id="sec-3-title" num="03">Dados Coletados</H2>
                <div style={{ paddingTop: 20 }}>

                  <H3>3.1 Dados coletados durante a sessão de pesquisa</H3>
                  <P>Os seguintes dados são coletados e armazenados em servidores da Xcorphion durante cada sessão:</P>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28 }}>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Texto narrativo:</strong> O conteúdo integral do texto produzido pelo participante em resposta ao prompt fornecido, incluindo todas as edições realizadas durante a sessão.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Eventos de teclado:</strong> Código de tecla pressionada (event.code, independente de layout de teclado), timestamp relativo ao início da sessão em milissegundos (calculado no navegador), timestamp absoluto em epoch ms, tipo do evento (keydown/keyup) e indicador de tecla mantida pressionada.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Respostas EMA:</strong> Valores numéricos de valência (0–100) e arousal (0–100) fornecidos pelo participante a cada 200 caracteres digitados, com o respectivo timestamp e contagem de caracteres.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Avaliação de engajamento:</strong> Nota numérica de 1 a 5 sobre a qualidade percebida da sessão e resposta binária (sim/não) à pergunta sobre genuinidade do engajamento.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Velocidade de digitação (WPM):</strong> Baseline de palavras por minuto medida durante a fase de calibração inicial.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Parâmetros calculados de IKI:</strong> Média e desvio padrão da distribuição log-normal dos intervalos entre teclas (log1p), calculados ao final de cada sessão.
                    </DataCard>
                  </div>

                  <H3>3.2 Dados coletados ao final da Sessão 1</H3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28 }}>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Endereço IP:</strong> Capturado uma única vez, ao final da Sessão 1, com a finalidade exclusiva de controle de duplicatas e integridade da amostra.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>User-Agent do navegador:</strong> String de identificação do navegador e sistema operacional, capturada junto ao IP.
                    </DataCard>
                  </div>

                  <H3>3.3 Dados NÃO coletados</H3>
                  <P>A Xcorphion declara expressamente que não coleta, em nenhuma circunstância, durante ou após as sessões de pesquisa:</P>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 8 }}>
                    {[
                      'Conteúdo da área de transferência (clipboard);',
                      'Histórico de navegação ou outros dados de sessões web;',
                      'Dados de outros aplicativos ou processos em execução no dispositivo;',
                      'Dados de áudio, vídeo ou câmera;',
                      'Dados de geolocalização precisa ou aproximada além do IP;',
                      'Senhas, dados de cartão de crédito ou quaisquer credenciais de acesso;',
                      'Dados inseridos em outros campos de formulários fora do ambiente da sessão.',
                    ].map((item, i) => (
                      <DataCard key={i} icon={<XIcon />}>{item}</DataCard>
                    ))}
                  </div>
                </div>
              </div>

              <Divider />

              {/* Section 4 */}
              <div id="sec-4" data-section>
                <H2 id="sec-4-title" num="04">Pseudonimização e Identificadores</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    O participante é identificado por um código de 5 caracteres alfanuméricos ("código de participante") atribuído pela Xcorphion. Internamente, esse código é armazenado exclusivamente como hash SHA-256 irreversível, computado com salt específico da plataforma, impossibilitando a recuperação do código original a partir do hash.
                  </P>
                  <P>
                    O e-mail fornecido na lista de espera é armazenado separadamente do hash do participante e não é associado aos dados de sessão para fins de análise. Sua finalidade é exclusivamente operacional: notificação sobre a abertura de novas sessões e comunicações relacionadas à pesquisa.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 5 */}
              <div id="sec-5" data-section>
                <H2 id="sec-5-title" num="05">Base Legal para Tratamento de Dados</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    O tratamento dos dados coletados nesta pesquisa baseia-se nas seguintes hipóteses legais previstas na Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD):
                  </P>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 8 }}>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Consentimento (Art. 7º, I):</strong> O participante consente livremente com a coleta ao aceitar estes termos e concluir a sessão de pesquisa.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Legítimo interesse (Art. 7º, IX):</strong> O desenvolvimento de sistemas de IA que melhorem a qualidade das interações humano-computador, com minimização de dados e salvaguardas técnicas adequadas.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Pesquisa científica (Art. 7º, IV):</strong> O estudo visa produzir conhecimento científico publicável sobre relações entre biometria comportamental e estados afetivos.
                    </DataCard>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Section 6 */}
              <div id="sec-6" data-section>
                <H2 id="sec-6-title" num="06">Retenção de Dados</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Os dados de sessão (eventos de teclado, texto, EMA, IKI calculado) serão retidos por um período de até <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>5 (cinco) anos</strong> a contar da data de coleta, período necessário para análises longitudinais e validação de resultados. Após esse prazo, os dados serão anonimizados irreversivelmente ou eliminados.
                  </P>
                  <P>
                    Dados de IP e user-agent serão eliminados em até <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>12 (doze) meses</strong> após a conclusão da Sessão 1, uma vez cumprida sua finalidade de controle de duplicatas.
                  </P>
                  <P>
                    O e-mail cadastrado na lista de espera será retido até que o participante solicite sua remoção ou até o encerramento do programa de pesquisa, o que ocorrer primeiro.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 7 */}
              <div id="sec-7" data-section>
                <H2 id="sec-7-title" num="07">Compartilhamento de Dados</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Os dados coletados <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>não serão vendidos, cedidos, alugados ou comercializados</strong> a terceiros sob nenhuma circunstância.
                  </P>
                  <P>Dados poderão ser compartilhados exclusivamente nas seguintes situações:</P>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 8 }}>
                    <DataCard icon={<CheckIcon />}>Em publicações científicas ou técnicas, exclusivamente na forma agregada e anonimizada, sem possibilidade de identificação individual;</DataCard>
                    <DataCard icon={<CheckIcon />}>Com provedores de infraestrutura de nuvem (atualmente MongoDB Atlas / MongoDB, Inc.) que atuam como operadores de dados sob contrato de processamento adequado à LGPD;</DataCard>
                    <DataCard icon={<CheckIcon />}>Mediante determinação judicial ou requisição de autoridade competente, na extensão estritamente necessária.</DataCard>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Section 8 */}
              <div id="sec-8" data-section>
                <H2 id="sec-8-title" num="08">Segurança dos Dados</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Os dados são armazenados em infraestrutura MongoDB Atlas com transmissão encriptada (TLS/SSL), controle de acesso baseado em roles, autenticação de múltiplos fatores para administradores e backups automatizados. O acesso administrativo aos dados de pesquisa é restrito a membros autorizados da Xcorphion Research Unit.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 9 */}
              <div id="sec-9" data-section>
                <H2 id="sec-9-title" num="09">Direitos do Titular</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>Nos termos da LGPD, o participante tem direito a:</P>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
                    {[
                      'Confirmar a existência de tratamento de seus dados;',
                      'Acessar os dados a ele relacionados;',
                      'Corrigir dados incompletos, inexatos ou desatualizados;',
                      'Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;',
                      'Revogar o consentimento, com eliminação dos dados não indispensáveis para obrigações legais;',
                      'Opor-se ao tratamento realizado com base em legítimo interesse.',
                    ].map((item, i) => (
                      <DataCard key={i} icon={<CheckIcon />}>{item}</DataCard>
                    ))}
                  </div>
                  <P>
                    O exercício desses direitos pode ser solicitado através dos canais de contato disponíveis em <Link href="https://xcorphion.online/contact" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.25)', textUnderlineOffset: 3, fontWeight: 400, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>xcorphion.online/contact</Link>. Solicitações serão respondidas em até 15 dias úteis.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 10 */}
              <div id="sec-10" data-section>
                <H2 id="sec-10-title" num="10">Requisitos para Participar</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>Para participar da pesquisa, o dispositivo e o ambiente do participante devem atender aos seguintes requisitos técnicos:</P>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 8 }}>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Notebook:</strong> A sessão deve ser realizada em um computador portátil (notebook). Dispositivos móveis (smartphones, tablets) não são suportados, pois a coleta de IKI requer teclado físico integrado ou externo conectado.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Teclado físico:</strong> O uso de teclado físico é obrigatório. Teclados virtuais ou de tela não produzem os eventos de temporização necessários para o cálculo do Inter-Keystroke Interval.
                    </DataCard>
                    <DataCard icon={<CheckIcon />}>
                      <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Conexão estável com a internet:</strong> A sessão requer conexão Wi-Fi ou cabeada estável durante toda a sua duração. Interrupções de conexão podem resultar em perda de dados e invalidação da sessão.
                    </DataCard>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Section 11 */}
              <div id="sec-11" data-section>
                <H2 id="sec-11-title" num="11">Critérios de Elegibilidade e Gate de Engajamento</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    A participação está condicionada à conclusão da Sessão 1 com aprovação interna do servidor. A Xcorphion aplica critérios automatizados de qualidade de dados para determinar a elegibilidade de cada perfil — esses critérios não são divulgados para preservar a integridade da amostra. Perfis que não atendam aos critérios serão marcados como inelegíveis para sessões subsequentes e para inclusão na lista de espera do OMMΩ.
                  </P>
                  <P>
                    Essa medida é necessária para garantir a qualidade científica dos dados coletados. Dados que não atendam aos parâmetros de qualidade introduzem ruído sistemático inaceitável para os modelos somáticos em desenvolvimento.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 12 */}
              <div id="sec-12" data-section>
                <H2 id="sec-12-title" num="12">Participação Voluntária e Revogação</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    A participação nesta pesquisa é inteiramente voluntária. Não há remuneração, obrigação contratual ou qualquer penalidade associada à não participação ou à desistência. O participante pode interromper a sessão a qualquer momento, sem prejuízo algum.
                  </P>
                  <P>
                    A revogação do consentimento, com solicitação de eliminação dos dados, pode ser feita a qualquer tempo, com exceção dos dados já anonimizados e incorporados a conjuntos de dados de treinamento, que por definição técnica não permitem remoção individualizada.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 13 */}
              <div id="sec-13" data-section>
                <H2 id="sec-13-title" num="13">Cookies e Tecnologias de Rastreamento</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    A plataforma de pesquisa não utiliza cookies de rastreamento de terceiros, pixels de marketing ou SDKs de análise comportamental externos. O único dado de sessão armazenado no navegador é o código de participante, necessário para continuidade entre sessões distintas.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 14 */}
              <div id="sec-14" data-section>
                <H2 id="sec-14-title" num="14">Alterações nestes Termos</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    A Xcorphion reserva-se o direito de atualizar estes termos a qualquer momento. Alterações materiais serão comunicadas através dos canais disponíveis e publicadas nesta página com data de vigência atualizada. O uso continuado da plataforma após a vigência das novas condições implica concordância com os termos revisados.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Section 15 */}
              <div id="sec-15" data-section>
                <H2 id="sec-15-title" num="15">Foro e Lei Aplicável</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Estes termos são regidos pela legislação brasileira. Eventuais conflitos serão submetidos ao foro da comarca competente no Brasil, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
                  </P>
                </div>
              </div>

              {/* Consent Banner */}
              <div style={{ marginTop: 64 }}>
                <div style={{
                  border: '1px solid rgba(139,0,0,0.22)',
                  background: 'rgba(139,0,0,0.04)',
                  borderRadius: 14, padding: '28px 32px',
                  display: 'flex', gap: 20, alignItems: 'flex-start',
                }}>
                  <div style={{
                    flexShrink: 0,
                    width: 36, height: 36,
                    borderRadius: 8,
                    background: 'rgba(139,0,0,0.12)',
                    border: '1px solid rgba(139,0,0,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 2,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: F.space, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                      Consentimento implícito
                    </p>
                    <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.72, margin: 0, fontWeight: 300 }}>
                      Ao concluir a Sessão 1 da pesquisa ou ao cadastrar seu e-mail na lista de espera, o participante declara ter lido, compreendido e concordado integralmente com os presentes Termos de Uso e Consentimento Informado.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

          {/* TOC Sidebar */}
          <aside
            className="toc-sidebar"
            style={{
              width: 200, flexShrink: 0,
              position: 'sticky', top: 80,
              paddingTop: 72, paddingBottom: 40,
              alignSelf: 'flex-start',
            }}
          >
            <p style={{
              fontFamily: F.inter, fontSize: 10, fontWeight: 600,
              color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 16,
            }}>
              Índice
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TOC_SECTIONS.map(({ id, num, label }) => {
                const isActive = activeId === id;
                return (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: isActive ? 'rgba(139,0,0,0.08)' : 'transparent',
                      border: isActive ? '1px solid rgba(139,0,0,0.18)' : '1px solid transparent',
                      borderRadius: 7, padding: '7px 10px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.18s',
                      width: '100%',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{
                      fontFamily: F.inter, fontSize: 9, fontWeight: 600,
                      color: isActive ? '#8B0000' : 'rgba(255,255,255,0.2)',
                      letterSpacing: '0.06em', flexShrink: 0,
                      transition: 'color 0.18s',
                      minWidth: 18,
                    }}>
                      {num}
                    </span>
                    <span style={{
                      fontFamily: F.inter, fontSize: 12,
                      color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)',
                      lineHeight: 1.4, transition: 'color 0.18s',
                    }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 40px', display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>
            © 2026 Xcorphion Corporation
          </span>
        </div>
      </div>
    </>
  );
}
