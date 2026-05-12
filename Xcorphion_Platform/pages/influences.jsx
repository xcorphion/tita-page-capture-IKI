import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
};

const AUTHORS = [
  { id: 'damasio', num: '01', label: 'António Damásio' },
  { id: 'russell', num: '02', label: 'James A. Russell' },
  { id: 'picard',  num: '03', label: 'Rosalind Picard' },
  { id: 'vaswani', num: '04', label: 'Vaswani et al.' },
  { id: 'hinton',  num: '05', label: 'Geoffrey Hinton' },
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

const IL = ({ href, children }) => (
  <Link
    href={href}
    style={{
      color: 'rgba(255,255,255,0.85)',
      textDecoration: 'underline',
      textDecorationColor: 'rgba(255,255,255,0.28)',
      textUnderlineOffset: 3,
      fontWeight: 400,
      transition: 'color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.color = 'white'}
    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
  >
    {children}
  </Link>
);

const H3 = ({ children }) => (
  <h3 style={{
    fontFamily: F.space, fontSize: 13, fontWeight: 600,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    marginTop: 36, marginBottom: 14,
  }}>
    {children}
  </h3>
);

const Strong = ({ children }) => (
  <strong style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>
    {children}
  </strong>
);

const AuthorHeader = ({ name, years, affiliation, img, epithet }) => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', margin: '24px 0 32px' }}>
    <div style={{
      flexShrink: 0, width: 96, height: 96,
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.03)',
    }}>
      <img
        src={img}
        alt={name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
    <div style={{ flex: 1 }}>
      <h2 style={{
        fontFamily: F.space, fontSize: 'clamp(18px, 2.4vw, 24px)',
        fontWeight: 700, color: 'white',
        letterSpacing: '-0.025em', lineHeight: 1.15,
        margin: '0 0 8px',
      }}>
        {name}
      </h2>
      <p style={{
        fontFamily: F.inter, fontSize: 13,
        color: 'rgba(255,255,255,0.28)',
        margin: '0 0 4px', fontWeight: 300,
      }}>
        {years}
      </p>
      <p style={{
        fontFamily: F.inter, fontSize: 12,
        color: 'rgba(255,255,255,0.2)',
        margin: 0, fontWeight: 300, fontStyle: 'italic',
      }}>
        {affiliation}
      </p>
      {epithet && (
        <p style={{
          fontFamily: F.inter, fontSize: 13,
          color: 'rgba(255,255,255,0.38)',
          margin: '14px 0 0', fontWeight: 300,
          borderLeft: '2px solid rgba(139,0,0,0.45)',
          paddingLeft: 14, lineHeight: 1.65,
        }}>
          {epithet}
        </p>
      )}
    </div>
  </div>
);

const WorkCard = ({ title, year, venue, desc, href, hrefLabel }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10, padding: '18px 20px',
    marginBottom: 8,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: F.space, fontSize: 14, fontWeight: 600,
          color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.45,
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: F.inter, fontSize: 12,
          color: 'rgba(255,255,255,0.22)', margin: '4px 0 0', fontWeight: 300,
        }}>
          {venue}
        </p>
      </div>
      <span style={{
        flexShrink: 0,
        fontFamily: F.inter, fontSize: 11, fontWeight: 600,
        color: 'rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 4, padding: '3px 8px',
        letterSpacing: '0.04em', whiteSpace: 'nowrap',
      }}>
        {year}
      </span>
    </div>
    <p style={{
      fontFamily: F.inter, fontSize: 13,
      color: 'rgba(255,255,255,0.38)', lineHeight: 1.72,
      margin: '0 0 12px', fontWeight: 300,
    }}>
      {desc}
    </p>
    {href && (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: F.inter, fontSize: 12, fontWeight: 500,
          color: 'rgba(255,255,255,0.28)',
          textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, padding: '5px 12px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.28)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        {hrefLabel || 'Adquirir'}
      </a>
    )}
  </div>
);

export default function InfluencesPage() {
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
        <title>Influências Chave — Xcorphion</title>
        <meta name="description" content="As figuras científicas e intelectuais que fundamentam a pesquisa e o desenvolvimento do OMMΩ." />
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
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: F.inter, fontSize: 13,
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Pesquisa
          </Link>
          <span style={{
            fontFamily: F.space, fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Influências Chave
          </span>
          <div style={{ width: 72 }} />
        </header>

        {/* Layout */}
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          padding: '0 clamp(16px, 4vw, 40px)',
          display: 'flex', gap: 'clamp(24px, 5vw, 64px)', alignItems: 'flex-start',
        }}>

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
                  Xcorphion Research Unit · Fundações Científicas
                </span>
                <h1 style={{
                  fontFamily: F.space, fontWeight: 800,
                  fontSize: 'clamp(26px, 3.5vw, 42px)',
                  letterSpacing: '-0.03em', lineHeight: 1.1,
                  color: 'white', marginBottom: 24, maxWidth: 560,
                }}>
                  Influências Chave
                </h1>
                <P style={{ maxWidth: 600, fontSize: 16 }}>
                  Cinco trajetórias distintas — Lisboa, Los Angeles, Atlanta, Nova Delhi, Londres — convergindo numa hipótese sobre o que acontece entre os dedos e o cérebro quando um ser humano escreve sobre o que sente. Estas são as figuras que fundamentam a{' '}
                  <IL href="/study">pesquisa IKI</IL> e a arquitetura do{' '}
                  <IL href="/omma">OMMΩ</IL>.
                </P>
              </div>

              <Divider />

              {/* ─── 01 DAMÁSIO ─── */}
              <div id="damasio" data-section style={{ paddingTop: 72 }}>
                <SectionBadge num="01" />
                <AuthorHeader
                  name="António Damásio"
                  years="n. 25 fev. 1944 · Lisboa, Portugal"
                  affiliation="USC Brain and Creativity Institute · Cátedra David Dornsife de Neurociências"
                  img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmKjUeZK1oSaeYl4aWsIboh8igdmN77G06Ag&s"
                  epithet="«A razão não opera independente da emoção — os pacientes de Damásio provaram isso antes de qualquer teoria.»"
                />

                <P>
                  António Rosa Damásio estudou medicina na Universidade de Lisboa, formou-se sob orientação de Norman Geschwind e doutorou-se em Lisboa em 1974. Emigrou para os Estados Unidos ainda na década de 1970, tornando-se diretor do Departamento de Neurologia da Universidade de Iowa por mais de duas décadas. Em 2005, transferiu-se para a USC, onde dirige o Brain and Creativity Institute em colaboração permanente com Hanna Damásio. É membro da Academia Nacional de Ciências dos EUA e seus livros foram traduzidos para mais de 30 idiomas.
                </P>
                <P>
                  No Hospital da Universidade de Iowa, Damásio estudou centenas de pacientes com lesões no córtex pré-frontal ventromedial — inclusive o caso célebre de Phineas Gage, trabalhador americano do século XIX que sobreviveu a uma barra de ferro atravessando o crânio e perdeu a capacidade de tomar decisões racionais enquanto mantinha inteligência e linguagem intactas. Esses casos clínicos levaram à formulação da <Strong>Hipótese do Marcador Somático</Strong>: estados do corpo sinalizam antecipadamente o valor emocional de uma decisão, funcionando como filtros que tornam a deliberação racional possível.
                </P>
                <P>
                  A hipótese do marcador somático é a âncora teórica central da <IL href="/study">pesquisa IKI da Xcorphion</IL>: se o corpo sinaliza estados emocionais antes e durante a decisão, ele também os sinaliza enquanto escreve — e os dedos, em particular, transmitem esse sinal em milissegundos.
                </P>

                <H3>Obras Principais</H3>

                <WorkCard
                  title="Descartes' Error: Emotion, Reason and the Human Brain"
                  year="1994"
                  venue="Putnam / Penguin"
                  desc="Ataca o dualismo cartesiano usando casos clínicos de lesão pré-frontal. Formula pela primeira vez, de forma sistemática, a Hipótese do Marcador Somático. Mais de 28.000 citações no Google Scholar."
                  href="https://www.penguinrandomhouse.com/books/340745/descartes-error-by-antonio-damasio/"
                  hrefLabel="Adquirir"
                />
                <WorkCard
                  title="The Feeling of What Happens: Body and Emotion in the Making of Consciousness"
                  year="1999"
                  venue="Harcourt"
                  desc="Distingue três camadas — emoção (processo automático), sentimento (representação mental da emoção) e consciência (o self que percebe o sentimento). Propõe que sentir é sempre sentir algo que acontece ao corpo. Mais de 12.000 citações."
                  href="https://www.penguinrandomhouse.com/books/340737/the-feeling-of-what-happens-by-antonio-damasio/"
                  hrefLabel="Adquirir"
                />
                <WorkCard
                  title="Looking for Spinoza: Joy, Sorrow and the Feeling Brain"
                  year="2003"
                  venue="Harcourt"
                  desc="Encontra em Spinoza (1632–1677) um precursor da neurobiologia dos afetos. Define com rigor a distinção entre emoção (programa automático e público do organismo) e sentimento (experiência subjetiva e privada). Mais de 8.000 citações."
                  href="https://www.penguinrandomhouse.com/books/340735/looking-for-spinoza-by-antonio-damasio/"
                  hrefLabel="Adquirir"
                />
                <WorkCard
                  title="Self Comes to Mind: Constructing the Conscious Brain"
                  year="2010"
                  venue="Pantheon"
                  desc="Propõe três camadas do self: proto-self, self central e self autobiográfico. Argumenta que a consciência emerge do tronco encefálico, não do neocórtex — colocando o corpo no centro da experiência subjetiva. Mais de 5.000 citações."
                  href="https://www.penguinrandomhouse.com/books/93565/self-comes-to-mind-by-antonio-damasio/"
                  hrefLabel="Adquirir"
                />
                <WorkCard
                  title="The Strange Order of Things: Life, Feeling and the Making of Cultures"
                  year="2018"
                  venue="Pantheon"
                  desc="Propõe que sentimentos são instrumentos homeostáticos presentes desde formas de vida unicelulares e que a cultura humana emerge como resposta coletiva à necessidade de regular o bem-estar. Mais de 3.000 citações."
                  href="https://www.penguinrandomhouse.com/books/573255/the-strange-order-of-things-by-antonio-damasio/"
                  hrefLabel="Adquirir"
                />
                <WorkCard
                  title="Feeling & Knowing: Making Minds Conscious"
                  year="2021"
                  venue="Pantheon"
                  desc="Obra de maturidade. Consolida teses sobre consciência, sentimento e homeostase. Argumenta que a interoceptividade — sentir o próprio estado interno — é a origem evolutiva de toda experiência subjetiva."
                  href="https://www.penguinrandomhouse.com/books/646060/feeling-knowing-by-antonio-damasio/"
                  hrefLabel="Adquirir"
                />
                <WorkCard
                  title="The Somatic Marker Hypothesis and the Possible Functions of the Prefrontal Cortex"
                  year="1996"
                  venue="Philosophical Transactions of the Royal Society B"
                  desc="Artigo fundacional da hipótese do marcador somático. Apresenta o Iowa Gambling Task como paradigma experimental. Mais de 4.500 citações."
                  href="https://royalsocietypublishing.org/doi/10.1098/rstb.1996.0118"
                  hrefLabel="Artigo"
                />
              </div>

              <Divider />

              {/* ─── 02 RUSSELL ─── */}
              <div id="russell" data-section style={{ paddingTop: 72 }}>
                <SectionBadge num="02" />
                <AuthorHeader
                  name="James A. Russell"
                  years="Los Angeles, Califórnia, EUA"
                  affiliation="Boston College · Emotion Development Lab · Professor titular de Psicologia"
                  img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVh4odkNSzpbmEDG5bFxt4345QyauYFXi3joLKO8CK2w&s"
                  epithet="«Qualquer estado emocional pode ser localizado num espaço bidimensional de valência e arousal. Essa geometria é o que o OMMΩ usa para escutar o que os dedos dizem.»"
                />

                <P>
                  James A. Russell cresceu numa família operária em Los Angeles e transformou ceticismo em rigor científico. Publicou mais de cem artigos, todos sobre emoção. Trabalhou por décadas na Universidade de British Columbia antes de se fixar no Boston College, onde fundou o Emotion Development Lab. Foi editor-chefe da revista <em>Emotion Review</em> entre 2007 e 2014.
                </P>
                <P>
                  Russell é o arquiteto do <Strong>modelo circumplexo do afeto</Strong> (1980) — a geometria padrão dos sistemas de anotação emocional em aprendizado de máquina, psicologia clínica e neuroimagem funcional. No <IL href="/study">protocolo IKI da Xcorphion</IL>, participantes reportam seu estado emocional como posição no espaço bidimensional circumplexo — valência (0–100) e arousal (0–100) — a cada 200 caracteres digitados. Essa interface de autorrelato é derivada diretamente do modelo de Russell.
                </P>
                <P>
                  É também um crítico sistemático da hipótese de universalidade das expressões faciais de Paul Ekman, tendo demonstrado que as taxas de reconhecimento das chamadas "emoções básicas" são artificialmente infladas por metodologias de escolha forçada.
                </P>

                <H3>Obras Principais</H3>

                <WorkCard
                  title="A Circumplex Model of Affect"
                  year="1980"
                  venue="Journal of Personality and Social Psychology"
                  desc="O artigo mais citado de Russell e um dos mais citados em psicologia emocional. Propõe que estados afetivos são posições num espaço circular onde os eixos são valência (prazer–desprazer) e ativação (alta–baixa excitação). Mais de 25.000 citações."
                  href="https://psycnet.apa.org/record/1980-23793-001"
                  hrefLabel="Artigo · APA"
                />
                <WorkCard
                  title="Core Affect and the Psychological Construction of Emotion"
                  year="2003"
                  venue="Psychological Review"
                  desc="Distingue core affect — estado neurofisiológico contínuo, sempre presente — do conceito pleno de emoção. Emoções não são detectadas pelo organismo: são construídas por ele. Mais de 6.000 citações."
                  href="https://psycnet.apa.org/record/2003-05387-002"
                  hrefLabel="Artigo · APA"
                />
                <WorkCard
                  title="Is There Universal Recognition of Emotion from Facial Expression? A Review"
                  year="1994"
                  venue="Psychological Bulletin"
                  desc="Revisão crítica dos estudos de Ekman sobre universalidade. Demonstra que metodologias de escolha forçada inflavam artificialmente as taxas de reconhecimento. Marco metodológico da área. Mais de 3.500 citações."
                  href="https://psycnet.apa.org/record/1994-42988-001"
                  hrefLabel="Artigo · APA"
                />
                <WorkCard
                  title="The Psychological Construction of Emotion"
                  year="2014"
                  venue="Guilford Press · co-editado com Lisa Feldman Barrett"
                  desc="Volume coletivo que sintetiza décadas de construtivismo psicológico das emoções. Defende que emoções não são módulos inatos do cérebro, mas construções que dependem de linguagem, cultura e contexto. Referência para pesquisadores com modelos computacionais de afeto."
                  href="https://www.guilford.com/books/The-Psychological-Construction-of-Emotion/Barrett-Russell/9781462516971"
                  hrefLabel="Adquirir"
                />
              </div>

              <Divider />

              {/* ─── 03 PICARD ─── */}
              <div id="picard" data-section style={{ paddingTop: 72 }}>
                <SectionBadge num="03" />
                <AuthorHeader
                  name="Rosalind W. Picard"
                  years="n. 1962, EUA"
                  affiliation="MIT Media Lab · Cátedra Grover M. Hermann · Fundadora: Affectiva & Empatica"
                  img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbnbSsqijicNi2fin-7RGxqui454u5wX1m9WTj6cixM6zF7mvSFcAyXkV_-RQx-IlBg6ekD1KnZH9i34UKzR0KODhMbc9CrmqR0L1mqyZZDg&s=10"
                  epithet="«Se a emoção é essencial para a cognição humana, por que os computadores são completamente cegos a ela?»"
                />

                <P>
                  Rosalind Picard formou-se em engenharia elétrica pelo Georgia Tech com distinção e doutorou-se no MIT em Ciências Elétricas e da Computação. Trabalhou no AT&T Bell Labs antes de ingressar no MIT Media Lab, onde seu foco inicial era <em>computer vision</em> — percebendo que humanos usam emoção para indexar e recuperar imagens, perguntou-se: e se computadores fizessem o mesmo?
                </P>
                <P>
                  Fundou o Affective Computing Research Group no MIT Media Lab em meados dos anos 1990. O livro <em>Affective Computing</em> (1997) nomeou e estabeleceu um campo inteiro, gerando a conferência ACII e a revista <em>IEEE Transactions on Affective Computing</em>. Cofundou a <Strong>Affectiva</Strong> — cujas tecnologias de IA emocional são usadas por mais de 25% das empresas Fortune 500 — e a <Strong>Empatica</Strong>, produtora de sensores vestíveis para monitoramento de crises epilépticas. Foi eleita para a Academia Nacional de Engenharia dos EUA em 2019.
                </P>
                <P>
                  A contribuição de Picard mais diretamente relevante para o <IL href="/study">OMMΩ IKI</IL> é a demonstração empírica de que padrões de uso do teclado e do mouse correlacionam-se com medidas fisiológicas de estresse — uma das primeiras evidências de que keystroke dynamics carregam sinal afetivo mensurável. Essa linha de evidência é citação direta na genealogia teórica do projeto.
                </P>

                <H3>Obras Principais</H3>

                <WorkCard
                  title="Affective Computing"
                  year="1997"
                  venue="MIT Press"
                  desc="O livro fundador do campo. Argumenta que computadores precisam reconhecer, compreender e — de forma limitada — expressar emoções para interagir naturalmente com humanos. Deu origem à conferência ACII, à revista IEEE Transactions on Affective Computing e a uma sociedade profissional."
                  href="https://mitpress.mit.edu/9780262661157/affective-computing/"
                  hrefLabel="Adquirir · MIT Press"
                />
                <WorkCard
                  title="Recognizing Stress from Keystroke and Mouse Patterns"
                  year="2007"
                  venue="Picard & Healey · IEEE"
                  desc="Demonstra que o padrão de uso do teclado e do mouse correlaciona-se com medidas fisiológicas de estresse. Uma das primeiras demonstrações empíricas de que keystroke dynamics carregam sinal afetivo — citação direta da genealogia do OMMΩ IKI."
                  href="https://affect.media.mit.edu/pdfs/07.picard-healey.pdf"
                  hrefLabel="Artigo (PDF)"
                />
                <WorkCard
                  title="Toward an Affective User Interface: Motivation and Theory"
                  year="2000"
                  venue="Personal and Ubiquitous Computing"
                  desc="Articula os princípios de design para interfaces que reconhecem e respondem ao estado emocional do usuário: sem invasão de privacidade, resposta contextualmente adequada, transparência sobre inferências."
                  href="https://link.springer.com/article/10.1007/BF01261679"
                  hrefLabel="Artigo"
                />
                <WorkCard
                  title="Affective Wearables"
                  year="1997"
                  venue="Personal and Ubiquitous Computing"
                  desc="Proposta de vestíveis que monitoram continuamente sinais fisiológicos correlacionados com estados emocionais. Antecipou em décadas os smartwatches modernos com sensores biométricos."
                  href="https://affect.media.mit.edu/pdfs/97.picard-et-al-affective-wearables.pdf"
                  hrefLabel="Artigo (PDF)"
                />
              </div>

              <Divider />

              {/* ─── 04 VASWANI ET AL. ─── */}
              <div id="vaswani" data-section style={{ paddingTop: 72 }}>
                <SectionBadge num="04" />
                <AuthorHeader
                  name="Vaswani · Shazeer · Parmar · Uszkoreit · Jones · Gomez · Kaiser · Polosukhin"
                  years="Google Brain / Google Research · Universidade de Toronto — 2017"
                  affiliation="Autores do Transformer — a arquitetura sobre a qual toda a IA generativa moderna foi construída"
                  img="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i2Q1XWfCwbj0/v1/-1x-1.webp"
                  epithet="«Atenção é tudo que você precisa — e esse paper sustenta o GPT, o BERT, o LLaMA e o OMMΩ.»"
                />

                <P>
                  Oito pesquisadores — todos então no Google Brain ou Google Research, exceto Aidan Gomez, estagiário da Universidade de Toronto — publicaram em 2017 o artigo que criou a infraestrutura computacional de toda a IA generativa moderna. <Strong>Ashish Vaswani</Strong> e <Strong>Illia Polosukhin</Strong> implementaram os primeiros modelos. <Strong>Noam Shazeer</Strong> propôs o scaled dot-product attention e o multi-head attention. <Strong>Jakob Uszkoreit</Strong> formulou a questão central: e se substituíssemos RNNs inteiramente por self-attention?
                </P>
                <P>
                  O Transformer dispensou completamente a recorrência (RNNs, LSTMs) e as convoluções, demonstrando que atenção sozinha é suficiente para capturar dependências de longo alcance em sequências. A arquitetura opera por três componentes centrais: (1) <em>scaled dot-product attention</em>; (2) <em>multi-head attention</em>, que executa múltiplas operações em paralelo em diferentes subespaços; e (3) <em>positional encoding</em> via funções senoidais. GPT usa apenas o decoder. BERT usa apenas o encoder.
                </P>
                <P>
                  O <IL href="/omma">OMMΩ</IL> opera sobre variações dessa arquitetura para processar texto narrativo e sequências de eventos de teclado como representações conjuntas de estado afetivo — combinando o sinal linguístico com o sinal somático bruto dos intervalos entre teclas.
                </P>

                <H3>Obras Principais</H3>

                <WorkCard
                  title="Attention Is All You Need"
                  year="2017"
                  venue="NeurIPS · Google Brain"
                  desc="O paper fundador do Transformer. Mais de 93.000 citações — um dos mais citados em toda a história da ciência da computação. Toda a IA generativa moderna foi construída sobre esta arquitetura."
                  href="https://arxiv.org/abs/1706.03762"
                  hrefLabel="arXiv (gratuito)"
                />
                <WorkCard
                  title="Image Transformer"
                  year="2018"
                  venue="ICML · Parmar et al."
                  desc="Extensão do Transformer para geração de imagens, demonstrando que a arquitetura generaliza além de texto — antecipando o Vision Transformer (ViT)."
                  href="https://arxiv.org/abs/1802.05751"
                  hrefLabel="arXiv"
                />
                <WorkCard
                  title="Universal Transformers"
                  year="2018"
                  venue="ICLR · Dehghani et al., com Kaiser e Shazeer"
                  desc="Propõe Transformers com número adaptativo de passos de processamento, aproximando a arquitetura de máquinas de Turing universais."
                  href="https://arxiv.org/abs/1807.03819"
                  hrefLabel="arXiv"
                />
              </div>

              <Divider />

              {/* ─── 05 HINTON ─── */}
              <div id="hinton" data-section style={{ paddingTop: 72 }}>
                <SectionBadge num="05" />
                <AuthorHeader
                  name="Geoffrey E. Hinton"
                  years="n. 6 dez. 1947 · Wimbledon, Londres"
                  affiliation="Universidade de Toronto · ex-Google Brain · Nobel de Física 2024 · Prêmio Turing 2018"
                  img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVfg34WBGo-g870qasPXvp9NBtsUARYha4iF_hT_J3vw&s"
                  epithet="«Bisneto de George Boole. Cinco décadas convicto quando o mundo não estava. Agora o mundo está e ele se preocupa.»"
                />

                <P>
                  Geoffrey Everest Hinton é bisneto do matemático George Boole, criador da álgebra booleana que está na base de toda a computação digital. Estudou psicologia experimental em Cambridge (BA, 1970) e doutorou-se em inteligência artificial pela Universidade de Edinburgh (PhD, 1978). Nos anos 1970 e 1980, quando a comunidade de IA considerava redes neurais um beco sem saída, Hinton permaneceu convicto de que a chave estava em sistemas que aprendem representações distribuídas, inspirados no funcionamento do cérebro.
                </P>
                <P>
                  Em Toronto, com seus estudantes Ilya Sutskever e Alex Krizhevsky, desenvolveu a <Strong>AlexNet</Strong> (2012), que venceu o ImageNet Challenge com uma margem devastadora — 15,3% de erro Top-5 contra 26,2% do segundo colocado — e é considerada o marco de nascimento do deep learning moderno. Em 2012, o Google adquiriu sua empresa por ~44 milhões de dólares. Em 2023, Hinton deixou o Google declarando publicamente preocupação com os riscos da IA. Recebeu o Prêmio Nobel de Física em 2024, junto com John Hopfield.
                </P>
                <P>
                  A contribuição de Hinton mais diretamente relevante para a <IL href="/study">pesquisa IKI</IL> é o <Strong>Forward-Forward Algorithm</Strong> (2022): substitui os dois passes do backpropagation por dois passes <em>forward</em> — um com dados reais e um com dados negativos — aprendendo localmente, camada por camada, sem coordenação global. Esse algoritmo é a inspiração direta do Predictive Forward-Forward (PFF) de Ororbia & Mali (2023), o algoritmo-alvo de treinamento do OMMΩ.
                </P>

                <H3>Obras Principais</H3>

                <WorkCard
                  title="Learning Representations by Back-propagating Errors"
                  year="1986"
                  venue="Nature · com Rumelhart e Williams"
                  desc="Popularizou o backpropagation como algoritmo de treinamento para redes neurais multicamadas. A base de praticamente todo o deep learning treinado desde então. Mais de 27.000 citações."
                  href="https://www.nature.com/articles/323533a0"
                  hrefLabel="Nature"
                />
                <WorkCard
                  title="ImageNet Classification with Deep Convolutional Neural Networks (AlexNet)"
                  year="2012"
                  venue="NeurIPS · com Krizhevsky e Sutskever"
                  desc="O paper da AlexNet. Iniciou o boom do deep learning e transformou o setor tecnológico. Mais de 110.000 citações — um dos mais citados em toda a história da computação."
                  href="https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html"
                  hrefLabel="NeurIPS"
                />
                <WorkCard
                  title="Dropout: A Simple Way to Prevent Neural Networks from Overfitting"
                  year="2014"
                  venue="JMLR · com Srivastava et al."
                  desc="Introdução do dropout como técnica de regularização. Simples e extremamente eficaz: neurônios são desativados aleatoriamente durante o treinamento. Mais de 50.000 citações."
                  href="https://jmlr.org/papers/v15/srivastava14a.html"
                  hrefLabel="JMLR (gratuito)"
                />
                <WorkCard
                  title="The Forward-Forward Algorithm: Some Preliminary Investigations"
                  year="2022"
                  venue="arXiv"
                  desc="Substitui backpropagation por dois passes forward: um com dados reais (positivos) e um com dados negativos. Aprende localmente, camada por camada, sem coordenação global — biologicamente mais plausível e a inspiração direta do algoritmo PFF usado no OMMΩ."
                  href="https://arxiv.org/abs/2212.13345"
                  hrefLabel="arXiv (gratuito)"
                />
                <WorkCard
                  title="Nobel Prize in Physics 2024 — Geoffrey Hinton"
                  year="2024"
                  venue="The Royal Swedish Academy of Sciences"
                  desc="Prêmio Nobel de Física 2024, compartilhado com John Hopfield, pelo desenvolvimento de métodos que habilitaram o aprendizado de máquina com redes neurais artificiais."
                  href="https://www.nobelprize.org/prizes/physics/2024/hinton/facts/"
                  hrefLabel="Página oficial"
                />
              </div>

              {/* Closing */}
              <div style={{ marginTop: 80 }}>
                <div style={{
                  border: '1px solid rgba(139,0,0,0.18)',
                  background: 'rgba(139,0,0,0.03)',
                  borderRadius: 14, padding: '28px 32px',
                }}>
                  <p style={{
                    fontFamily: F.space, fontSize: 14, fontWeight: 600,
                    color: 'rgba(255,255,255,0.55)', marginBottom: 12, letterSpacing: '-0.01em',
                  }}>
                    Uma convergência improvável
                  </p>
                  <p style={{
                    fontFamily: F.inter, fontSize: 13,
                    color: 'rgba(255,255,255,0.32)', lineHeight: 1.82,
                    margin: 0, fontWeight: 300,
                  }}>
                    Lisboa, Los Angeles, Atlanta, Nova Delhi, Londres. Um neurologista clínico, um psicólogo experimental, uma engenheira do MIT, oito engenheiros do Google, um bisneto de Boole. O que os une é uma hipótese que o{' '}
                    <IL href="/study">IKI</IL> está testando: que o corpo não para de transmitir quando a mente está ocupada em pensar — e que os dedos, em particular, transmitem mais do que palavras.
                  </p>
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
              Autores
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {AUTHORS.map(({ id, num, label }) => {
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
                      transition: 'color 0.18s', minWidth: 18,
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
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: 'clamp(14px,2vw,20px) clamp(16px,4vw,40px)',
          display: 'flex', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>
            © 2026 Xcorphion Corporation
          </span>
        </div>
      </div>
    </>
  );
}
