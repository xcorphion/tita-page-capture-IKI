import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
  mono: "'Courier New', monospace",
};

const TOC = [
  { id: 'resumo',    num: '00', label: 'Resumo' },
  { id: 'intro',     num: '01', label: 'Introdução' },
  { id: 'protocolo', num: '02', label: 'Protocolo' },
  { id: 'analise',   num: '03', label: 'Análise' },
  { id: 'literatura',num: '04', label: 'Literatura' },
  { id: 'gates',     num: '05', label: 'Validação' },
  { id: 'limites',   num: '06', label: 'Limitações' },
  { id: 'nota',      num: '07', label: 'Transparência' },
  { id: 'refs',      num: 'REF', label: 'Referências' },
];

const SectionBadge = ({ num }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    fontFamily: F.inter, fontSize: 10, fontWeight: 600,
    color: '#8B0000', letterSpacing: '0.1em',
    background: 'rgba(139,0,0,0.1)',
    border: '1px solid rgba(139,0,0,0.22)',
    borderRadius: 4, padding: '3px 8px',
    marginBottom: 14, textTransform: 'uppercase',
  }}>
    {num}
  </span>
);

const Divider = () => (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 0 0' }} />
);

const H2 = ({ id, num, children }) => (
  <div id={id} style={{ paddingTop: 72, marginBottom: 6 }}>
    <SectionBadge num={num} />
    <h2 style={{
      fontFamily: F.space, fontSize: 'clamp(18px, 2.2vw, 22px)',
      fontWeight: 700, color: 'white',
      letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0,
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
    marginTop: 32, marginBottom: 12,
  }}>
    {children}
  </h3>
);

const P = ({ children, style }) => (
  <p style={{
    fontFamily: F.inter, fontSize: 15,
    color: 'rgba(255,255,255,0.52)',
    lineHeight: 1.82, marginBottom: '1.2em',
    fontWeight: 300, ...style,
  }}>
    {children}
  </p>
);

const Strong = ({ children }) => (
  <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>
    {children}
  </strong>
);

const IL = ({ href, children }) => (
  <Link
    href={href}
    style={{
      color: 'rgba(255,255,255,0.85)',
      textDecoration: 'underline',
      textDecorationColor: 'rgba(255,255,255,0.28)',
      textUnderlineOffset: 3,
      fontWeight: 400, transition: 'color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.color = 'white'}
    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
  >
    {children}
  </Link>
);

const Formula = ({ children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8, padding: '14px 20px', margin: '14px 0',
    fontFamily: F.mono, fontSize: 13,
    color: 'rgba(255,255,255,0.65)', lineHeight: 1.7,
    overflowX: 'auto',
  }}>
    {children}
  </div>
);

const GateCard = ({ num, n, condition, result }) => (
  <div style={{
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.015)',
    borderRadius: 10, padding: '18px 22px', marginBottom: 8,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <span style={{
        fontFamily: F.inter, fontSize: 9, fontWeight: 700,
        color: '#8B0000', letterSpacing: '0.1em',
        background: 'rgba(139,0,0,0.1)', border: '1px solid rgba(139,0,0,0.22)',
        borderRadius: 4, padding: '3px 8px', textTransform: 'uppercase',
      }}>
        Gate {num}
      </span>
      <span style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 300 }}>
        n = {n} participantes
      </span>
    </div>
    <p style={{ fontFamily: F.mono, fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 10px', lineHeight: 1.7 }}>
      {condition}
    </p>
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
      <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.65, fontWeight: 300 }}>
        → {result}
      </p>
    </div>
  </div>
);

const Ref = ({ children }) => (
  <p style={{
    fontFamily: F.inter, fontSize: 13,
    color: 'rgba(255,255,255,0.32)', lineHeight: 1.75,
    marginBottom: '0.55em', fontWeight: 300,
    paddingLeft: 22, textIndent: -22,
  }}>
    {children}
  </p>
);

export default function ResearchPage() {
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
        <title>Keystroke Dynamics como Sinal Somático — Xcorphion Research</title>
        <meta name="description" content="Evidências preliminares de que o padrão temporal de digitação carrega informação sobre o estado emocional do operador. Xcorphion Corporation · OMMΩ Research · 2026." />
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
            Participar
          </Link>
          <span style={{ fontFamily: F.space, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Pesquisa
          </span>
          <div style={{ width: 72 }} />
        </header>

        {/* Layout */}
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', gap: 'clamp(24px, 5vw, 64px)', alignItems: 'flex-start' }}>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 160 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >

              {/* Hero */}
              <div style={{ padding: '72px 0 48px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {['Xcorphion Corporation', 'Família TITÃ', 'OMMΩ Research', 'Maio 2026'].map(tag => (
                    <span key={tag} style={{
                      fontFamily: F.inter, fontSize: 11,
                      color: 'rgba(255,255,255,0.28)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 20, padding: '4px 12px',
                      letterSpacing: '0.02em',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 style={{
                  fontFamily: F.space, fontWeight: 800,
                  fontSize: 'clamp(22px, 3vw, 36px)',
                  letterSpacing: '-0.03em', lineHeight: 1.15,
                  color: 'white', marginBottom: 16, maxWidth: 680,
                }}>
                  Keystroke Dynamics como Sinal Somático
                </h1>
                <p style={{
                  fontFamily: F.inter, fontSize: 15, fontWeight: 300,
                  color: 'rgba(255,255,255,0.35)', maxWidth: 520, lineHeight: 1.7,
                }}>
                  Evidências Preliminares e Fundamentos para um Sistema de Detecção de Estado Afetivo em Tempo Real
                </p>
              </div>

              <Divider />

              {/* Resumo */}
              <div id="resumo" data-section style={{ paddingTop: 56 }}>
                <SectionBadge num="00" />
                <h2 style={{ fontFamily: F.space, fontSize: 'clamp(18px, 2.2vw, 22px)', fontWeight: 700, color: 'white', letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 0 20px' }}>
                  Resumo
                </h2>
                <div style={{
                  border: '1px solid rgba(139,0,0,0.2)',
                  background: 'rgba(139,0,0,0.03)',
                  borderRadius: 12, padding: '24px 28px',
                }}>
                  <P style={{ marginBottom: 0 }}>
                    Apresentamos evidências preliminares de que o padrão temporal de digitação — especificamente os intervalos entre teclas consecutivas (Inter-Key Intervals, IKIs) — carrega informação estatisticamente detectável sobre o estado emocional do operador, independentemente do conteúdo semântico do texto produzido. Os dados foram coletados em protocolo de escrita livre com avaliação de estado afetivo por Ecological Momentary Assessment (EMA) em escala bidimensional de valência e ativação, baseada no <IL href="/influences">modelo circumplexo de Russell (1980)</IL>. Os achados incluem: distribuição lognormal dos IKIs consistente com a literatura de tempos de reação motora; idiossincrasia interindividual na direção do sinal; maior poder discriminativo do desvio padrão dos IKIs sobre a média para estados de valência negativa; e correlação de Pearson <Strong>r = +0.402</Strong> entre sinal de digitação e dimensão de ativação emocional na primeira sessão com participante externo. Esses resultados são consistentes com a <IL href="/influences">hipótese do marcador somático de Damásio (1994)</IL> aplicada ao canal motor periférico da digitação, e motivam a construção de um sistema de aprendizado de representações afetivas a partir de sinais de teclado em língua portuguesa.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Introdução */}
              <div id="intro" data-section>
                <H2 num="01">Introdução e Motivação</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Sistemas de linguagem de grande escala operam exclusivamente sobre representações semânticas do texto produzido pelo usuário. Essa arquitetura implica uma limitação estrutural: o sistema só tem acesso ao que o usuário decidiu escrever, não ao estado fisiológico e emocional no qual a escrita foi produzida. Essa distinção é não trivial.
                  </P>
                  <P>
                    A <IL href="/influences">hipótese do marcador somático (Damásio, 1994)</IL> estabelece que estados emocionais se manifestam como respostas corporais que precedem e modulam o processamento cognitivo consciente. Se essa hipótese é correta, então o canal motor da digitação — produto direto do processamento cognitivo e motor do sistema nervoso central e periférico — deve carregar traços mensuráveis desses estados.
                  </P>
                  <P>
                    A questão empírica que o projeto <IL href="/omma">OMMΩ</IL> se propõe a responder é precisa: dado um segmento de texto produzido por um participante, é possível inferir o estado emocional do participante no momento da produção a partir das propriedades temporais da digitação, com acurácia estatisticamente superior ao acaso e magnitude de efeito clinicamente relevante?
                  </P>
                  <P>
                    Essa pergunta tem três camadas de dificuldade que a distinguem de trabalhos anteriores em keystroke dynamics.
                  </P>
                  <P>
                    <Strong>Primeira: a língua.</Strong> A esmagadora maioria da literatura de keystroke dynamics foi conduzida em inglês, com estruturas morfológicas, fonológicas e ortográficas distintas do português. Padrões de digitação são parcialmente determinados pela frequência de bigramas e trigramas específicos da língua, pela posição de acentos e caracteres especiais, e pela velocidade média de processamento lexical — todos fatores que variam entre línguas. Não é possível assumir que modelos treinados em inglês generalizam para português sem validação empírica.
                  </P>
                  <P>
                    <Strong>Segunda: o contexto ecológico.</Strong> Estudos laboratoriais de keystroke dynamics tipicamente usam textos de cópia — o participante digita um texto fornecido pelo experimentador. Isso controla a variância semântica mas elimina precisamente o canal pelo qual estados emocionais se expressam na escrita: a geração espontânea de conteúdo. O protocolo do <IL href="/study">OMMΩ IKI</IL> usa escrita livre sobre decisões pessoais recentes — um contexto que ativa estados emocionais reais e produz variância natural no conteúdo.
                  </P>
                  <P>
                    <Strong>Terceira: a granularidade da anotação afetiva.</Strong> Estudos que usam categorias emocionais discretas (feliz, triste, ansioso) introduzem imprecisão conceptual: as categorias são culturalmente construídas, têm fronteiras difusas e frequentemente não capturam a textura contínua do estado afetivo. O uso do <IL href="/influences">modelo circumplexo de Russell (1980)</IL> com anotação contínua em duas dimensões — valência e ativação — produz coordenadas afetivas matematicamente tratáveis e teoricamente fundamentadas.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Protocolo */}
              <div id="protocolo" data-section>
                <H2 num="02">Protocolo de Coleta</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Cada <IL href="/study">sessão de coleta</IL> consiste em um período de escrita livre de aproximadamente 20 minutos, durante o qual o participante escreve sobre decisões pessoais recentes sem restrição de conteúdo ou extensão. O sistema registra, para cada evento de teclado, um timestamp de alta resolução. O IKI entre duas teclas consecutivas é definido como:
                  </P>
                  <Formula>
                    IKI_k = t_k − t_(k−1){'\n'}
                    {'\n'}
                    onde t_k é o timestamp do evento de pressão da tecla k em milissegundos.
                  </Formula>
                  <P>
                    Em três momentos distribuídos ao longo da sessão, o fluxo de escrita é interrompido e o participante completa uma avaliação EMA: posiciona seu estado emocional atual num espaço bidimensional de valência (eixo horizontal, negativo a positivo) e ativação (eixo vertical, baixa a alta), produzindo coordenadas contínuas <Strong>(v, a)</Strong> no espaço circumplexo.
                  </P>
                  <P>
                    O intervalo médio entre o início da sessão e o primeiro EMA, entre o primeiro e o segundo EMA, e entre o segundo e o terceiro EMA foi de aproximadamente 190 caracteres por segmento — desvio marginal em relação ao critério de disparo configurado em 200 caracteres, considerado aceitável para análise.
                  </P>
                  <P>
                    Cada sessão produz portanto um par estruturado: uma série temporal de IKIs, e três vetores de estado afetivo <Strong>(v₁, a₁), (v₂, a₂), (v₃, a₃)</Strong> distribuídos temporalmente ao longo da série.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Análise */}
              <div id="analise" data-section>
                <H2 num="03">Análise Estatística e Achados</H2>
                <div style={{ paddingTop: 20 }}>

                  <H3>3.1 Distribuição dos IKIs</H3>
                  <P>
                    A análise exploratória dos IKIs brutos de todos os participantes confirmou distribuição lognormal, consistente com a literatura consolidada de tempos de reação motora (Logan, 1988; Ratcliff, 1993) e com estudos anteriores de keystroke dynamics (Leggett e Williams, 1988; Monrose e Rubin, 2000). A distribuição lognormal implica que a variável de análise adequada não é o IKI bruto, mas seu logaritmo natural:
                  </P>
                  <Formula>
                    IKI_log = ln(IKI_k)    para IKI_k &gt; 0
                  </Formula>
                  <P>
                    Trabalhar com <Strong>IKI_log</Strong> aproxima a distribuição da normalidade, viabilizando testes paramétricos e estabilizando a variância entre participantes com velocidades de digitação muito distintas. Diferenças em IKI_log correspondem a razões multiplicativas nos IKIs brutos, capturando variações relativas de ritmo independentemente da velocidade base do participante.
                  </P>

                  <H3>3.2 Idiossincrasia Interindividual</H3>
                  <P>
                    A comparação entre participantes revelou que a direção da correlação entre variações de IKI e estado emocional <Strong>não é uniforme</Strong>. Para um subconjunto de participantes, estados de alta ativação emocional correspondem a aceleração do ritmo de digitação (IKIs menores). Para outro subconjunto, a mesma condição corresponde a desaceleração ou aumento de irregularidade.
                  </P>
                  <P>
                    Esse achado é teoricamente esperado. A hipótese do marcador somático não prediz uma direção universal de resposta somática — prediz que o organismo produz respostas consistentes <em>para si mesmo</em>, não idênticas entre indivíduos. A idiossincrasia do sinal é compatível com a teoria e com a literatura de biofeedback (Schandry, 1981).
                  </P>
                  <P>
                    A implicação para modelagem é direta: um modelo que tenta aprender um mapeamento universal entre IKI e estado emocional será limitado pela heterogeneidade interindividual. Isso motiva abordagens que aprendem representações individuais antes de generalizar — um dos princípios arquiteturais que guiam o desenvolvimento do <IL href="/omma">OMMΩ</IL>.
                  </P>

                  <H3>3.3 Desvio Padrão versus Média como Feature Discriminativa</H3>
                  <P>
                    Comparando o poder discriminativo de duas métricas agregadas dos IKIs por segmento de escrita para classificação de estados de valência negativa versus não-negativa:
                  </P>
                  <Formula>
                    μ_IKI_log = (1/N) × Σ ln(IKI_k){'\n'}
                    {'\n'}
                    σ_IKI_log = sqrt( (1/N) × Σ (ln(IKI_k) − μ_IKI_log)² )
                  </Formula>
                  <P>
                    O desvio padrão mostrou <Strong>maior poder discriminativo para valência negativa</Strong> do que a média. Participantes em estados de valência negativa produzem padrões de digitação com maior irregularidade temporal — o ritmo se torna menos uniforme, com maior variância entre teclas consecutivas — sem necessariamente alteração consistente na velocidade média.
                  </P>
                  <P>
                    Esse resultado é coerente com literatura de psicofisiologia do estresse que documenta aumento de variabilidade em respostas motoras sob carga emocional negativa (Fairclough e Venables, 2006). A implicação para feature engineering é que métricas de dispersão devem ter peso representacional igual ou superior a métricas de tendência central em qualquer modelo que tente inferir valência a partir de IKIs.
                  </P>

                  <H3>3.4 Correlação de Pearson: Sinal de Ativação</H3>
                  <P>
                    Na primeira sessão conduzida com participante externo ao grupo de pesquisa — sem qualquer ajuste de modelo, usando apenas o sinal bruto transformado — a correlação de Pearson entre a série temporal de IKIs e a dimensão de ativação do EMA foi:
                  </P>
                  <Formula>
                    r = +0.402    (n = 3 pontos EMA, segmentos de ~190 caracteres cada)
                  </Formula>
                  <P>
                    Esse valor está no limiar inferior do que a literatura considera correlação moderada (Cohen, 1988: r &gt; 0.3 = pequeno, r &gt; 0.5 = médio). É um resultado preliminar, com n pequeno, e não pode ser tomado como evidência confirmatória da hipótese. Mas três aspectos merecem atenção.
                  </P>
                  <P>
                    Primeiro, a <Strong>direção é positiva e consistente com a hipótese</Strong>: maior ativação emocional correlaciona-se com alterações específicas no padrão de digitação na direção prevista. Segundo, o valor foi obtido <Strong>sem otimização de qualquer tipo</Strong> — o sinal bruto, transformado apenas por logaritmo natural, já produz correlação detectável. Terceiro: se o sinal bruto sem modelo produz r = +0.402, a pergunta sobre o que um modelo aprendido sobre centenas de participantes pode produzir está empiricamente motivada.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Literatura */}
              <div id="literatura" data-section>
                <H2 num="04">Cruzamento com a Literatura e Implicações Teóricas</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Os quatro achados descritos acima, tomados em conjunto, produzem um quadro teórico coerente. O sistema nervoso autônomo modula continuamente a atividade motora periférica em resposta a estados emocionais (Damasio, 1994; Porges, 2007). Essa modulação se manifesta em sinais periféricos mensuráveis: frequência cardíaca, condutância da pele, tônus muscular, e — nossa hipótese — variações no ritmo de digitação. A digitação é um ato motor altamente automatizado em usuários experientes, o que significa que variações no ritmo não são produto de deliberação consciente, mas de flutuações no substrato neurofisiológico que executa o ato motor. Isso é precisamente a definição operacional de marcador somático aplicada ao canal da digitação.
                  </P>
                  <P>
                    A literatura de keystroke dynamics para autenticação (Monrose e Rubin, 2000; Peacock et al., 2004) estabelece que o padrão temporal de digitação é suficientemente estável e idiossincrático para identificar indivíduos com alta acurácia. Se o padrão de digitação é uma assinatura individual estável o suficiente para autenticação biométrica, então variações nesse padrão ao longo do tempo devem refletir mudanças no estado interno do indivíduo — seja cognitivo, seja emocional.
                  </P>
                  <P>
                    <IL href="/influences">Picard e Healey (2002)</IL> demonstraram que stress mensurado por GSR e frequência cardíaca correlaciona-se com padrões de uso de teclado e mouse em contexto de trabalho real. Nossos achados estendem esse resultado para um contexto de escrita emocional explícita e para a língua portuguesa, com anotação afetiva multidimensional em lugar de categorias discretas de stress.
                  </P>
                  <P>
                    O achado de idiossincrasia é consistente com o modelo de Feldman Barrett (2006) de construção psicológica da emoção: respostas somáticas a estados emocionais são parcialmente aprendidas e culturalmente moduladas, não fixas biologicamente. Isso prediz precisamente o que observamos: a existência de sinal somático na digitação, mas com expressão heterogênea entre indivíduos.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Gates */}
              <div id="gates" data-section>
                <H2 num="05">Gates de Validação e Critérios de Progressão</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    A progressão do projeto está condicionada a critérios estatísticos pré-registrados, definidos antes da coleta de dados em escala. Esses critérios determinam se a hipótese central tem suporte empírico suficiente para justificar investimento crescente em modelagem e infraestrutura.
                  </P>
                  <GateCard
                    num="1"
                    n="50"
                    condition={"Cohen's d > 0.5 entre grupos de estado emocional"}
                    result="Escalar para 150 participantes e iniciar modelagem"
                  />
                  <GateCard
                    num="2"
                    n="150"
                    condition={"Pearson r > 0.4 em validação leave-one-out"}
                    result="Escalar para modelo de produção e beta fechado do OMMΩ"
                  />
                  <P style={{ marginTop: 20 }}>
                    O uso de <Strong>leave-one-out cross-validation</Strong> no Gate 2 é deliberado: garante que a correlação medida reflete generalização para participantes não vistos pelo modelo, não apenas ajuste aos dados de treinamento. A escolha de Cohen's d &gt; 0.5 como critério para o Gate 1 é conservadora em relação ao que a literatura de psicofisiologia tipicamente reporta para efeitos de estado emocional em sinais periféricos (onde d entre 0.3 e 0.8 é comum). Isso reflete a necessidade de efeito suficientemente grande para ser útil em aplicação real, não apenas estatisticamente significativo.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Limitações */}
              <div id="limites" data-section>
                <H2 num="06">O Que Permanece Aberto</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Três questões permanecem sem resposta empírica e determinam os limites de validade da hipótese no estado atual da pesquisa.
                  </P>
                  <P>
                    <Strong>Generalização linguística.</Strong> O protocolo atual coleta dados em português. Não sabemos se modelos treinados nesse corpus generalizam para outros idiomas, ou se a estrutura temporal da digitação em português tem propriedades específicas que facilitam ou dificultam a detecção de sinal afetivo.
                  </P>
                  <P>
                    <Strong>Estabilidade intraindividual ao longo do tempo.</Strong> Participantes foram coletados em até três sessões separadas por semanas. Não sabemos se o padrão de correlação entre IKI e estado emocional de um participante é estável ao longo de meses ou anos, ou se deriva com mudanças no contexto de vida, no hardware usado, ou na fluência de digitação.
                  </P>
                  <P>
                    <Strong>Confusão semântica.</Strong> O protocolo usa escrita livre sobre conteúdo emocionalmente carregado. Não podemos ainda separar completamente quanto da variação nos IKIs é produzida pelo estado emocional e quanto é produzida pela dificuldade semântica do conteúdo sendo elaborado — palavras raras, frases complexas, hesitação lexical. Separar esses dois sinais é um problema de identificação estatística que requer design experimental adicional.
                  </P>
                </div>
              </div>

              <Divider />

              {/* Transparência */}
              <div id="nota" data-section>
                <H2 num="07">Nota sobre Transparência e Propriedade Intelectual</H2>
                <div style={{ paddingTop: 20 }}>
                  <P>
                    Este documento descreve os fenômenos observados, as métricas que os quantificam, o protocolo de coleta e os fundamentos teóricos que motivam a pesquisa. Não descreve a arquitetura do sistema de aprendizado em desenvolvimento, os algoritmos de treinamento, a estrutura de representação dos dados, o pipeline de processamento de sinal, nem os critérios de design do modelo. Esses elementos constituem propriedade intelectual da Xcorphion Corporation e não são objeto de divulgação pública nesta fase do projeto.
                  </P>
                  <div style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 10, padding: '16px 20px', marginTop: 8,
                  }}>
                    <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.72, fontWeight: 300, fontStyle: 'italic' }}>
                      O que publicamos é o fenômeno e a pergunta. A engenharia que nos permite investigar ambos permanece interna.
                    </p>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Referências */}
              <div id="refs" data-section>
                <H2 num="REF">Referências</H2>
                <div style={{ paddingTop: 20 }}>
                  <Ref>Bechara, A., Damásio, A. R. (2005). The somatic marker hypothesis: A neural theory of economic decision. <em>Games and Economic Behavior, 52</em>(2), 336–372.</Ref>
                  <Ref>Cohen, J. (1988). <em>Statistical Power Analysis for the Behavioral Sciences</em> (2nd ed.). Lawrence Erlbaum Associates.</Ref>
                  <Ref>Damásio, A. R. (1994). <em>Descartes' Error: Emotion, Reason and the Human Brain</em>. Putnam.</Ref>
                  <Ref>Fairclough, S. H., Venables, L. (2006). Prediction of subjective states from psychophysiology: A multivariate approach. <em>Biological Psychology, 71</em>(1), 100–110.</Ref>
                  <Ref>Feldman Barrett, L. (2006). Are emotions natural kinds? <em>Perspectives on Psychological Science, 1</em>(1), 28–58.</Ref>
                  <Ref>Gross, J. J. (1998). The emerging field of emotion regulation. <em>Review of General Psychology, 2</em>(3), 271–299.</Ref>
                  <Ref>Leggett, J., Williams, G. (1988). Verifying identity via keystroke characteristics. <em>International Journal of Man-Machine Studies, 28</em>(1), 67–76.</Ref>
                  <Ref>Logan, G. D. (1988). Toward an instance theory of automatization. <em>Psychological Review, 95</em>(4), 492–527.</Ref>
                  <Ref>Monrose, F., Rubin, A. D. (2000). Keystroke dynamics as a biometric for authentication. <em>Future Generation Computer Systems, 16</em>(4), 351–359.</Ref>
                  <Ref>Peacock, A., Ke, X., Wilkerson, M. (2004). Typing patterns: A key to user identification. <em>IEEE Security and Privacy, 2</em>(5), 40–47.</Ref>
                  <Ref>Picard, R. W., Healey, J. (2002). Affective wearables. <em>Personal and Ubiquitous Computing, 1</em>(4), 231–240.</Ref>
                  <Ref>Porges, S. W. (2007). The polyvagal perspective. <em>Biological Psychology, 74</em>(2), 116–143.</Ref>
                  <Ref>Ratcliff, R. (1993). Methods for dealing with reaction time outliers. <em>Psychological Bulletin, 114</em>(3), 510–532.</Ref>
                  <Ref>Russell, J. A. (1980). A circumplex model of affect. <em>Journal of Personality and Social Psychology, 39</em>(6), 1161–1178.</Ref>
                  <Ref>Schandry, R. (1981). Heart beat perception and emotional experience. <em>Psychophysiology, 18</em>(4), 483–488.</Ref>
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
              {TOC.map(({ id, num, label }) => {
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
                      transition: 'all 0.18s', width: '100%',
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
                      transition: 'color 0.18s', minWidth: 22,
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
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(14px,2vw,20px) clamp(16px,4vw,40px)', display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>
            © 2026 Xcorphion Corporation · OMMΩ Research
          </span>
        </div>
      </div>
    </>
  );
}
