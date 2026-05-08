import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const H2 = ({ children }) => (
  <h2 style={{ fontFamily: F.space, fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginTop: 52, marginBottom: 16 }}>
    {children}
  </h2>
);

const H3 = ({ children }) => (
  <h3 style={{ fontFamily: F.space, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginTop: 28, marginBottom: 10 }}>
    {children}
  </h3>
);

const P = ({ children }) => (
  <p style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '1.2em' }}>
    {children}
  </p>
);

const Li = ({ children }) => (
  <li style={{ fontFamily: F.inter, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 6 }}>
    {children}
  </li>
);

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Termos de Uso da Pesquisa — Xcorphion</title>
        <meta name="description" content="Termos de uso, privacidade e consentimento informado para participação na pesquisa IKI da Xcorphion." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#080808', color: 'white', fontFamily: F.inter }}>

        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(24px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', height: 56,
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

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 40px 160px' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{ fontFamily: F.inter, fontSize: 11, color: '#8B0000', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>
              Xcorphion Research Unit
            </span>
            <h1 style={{ fontFamily: F.space, fontWeight: 800, fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'white', marginBottom: 16 }}>
              Termos de Uso e Consentimento Informado para Participação em Pesquisa
            </h1>
            <p style={{ fontFamily: F.inter, fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 48 }}>
              Versão 1.0 — Vigência a partir de 1º de maio de 2026. Última atualização: 7 de maio de 2026.
            </p>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 0 }} />

            <H2>1. Identificação da Controladora</H2>
            <P>
              A pesquisa descrita neste documento é conduzida pela <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Xcorphion Corporation</strong> ("Xcorphion", "nós", "nossa"), pessoa jurídica de direito privado, responsável pelo desenvolvimento do sistema de inteligência artificial OMMΩ. Para fins de comunicação relacionados a esta pesquisa, o contato pode ser feito através dos canais disponíveis em xcorphion.online.
            </P>

            <H2>2. Natureza e Objetivo da Pesquisa</H2>
            <P>
              Esta pesquisa investiga a relação entre padrões de digitação humana — especificamente o Inter-Keystroke Interval (IKI), definido como o intervalo de tempo em milissegundos entre eventos consecutivos de pressionamento de tecla — e estados afetivos e somáticos do participante, conforme mensurados por escalas de autorrelato (Experience Sampling Method — EMA).
            </P>
            <P>
              O objetivo científico é testar a hipótese, derivada das teorias de marcadores somáticos de António Damásio, de que variações no ritmo de digitação correlacionam-se de forma estatisticamente significativa com estados emocionais autorrelatados, medidos por dimensões de valência (positivo/negativo) e arousal (calmo/agitado) no modelo circumplexo de Russell.
            </P>
            <P>
              Os dados coletados serão utilizados exclusivamente para o treinamento, validação e melhoria do componente somático do modelo OMMΩ, desenvolvido pela Xcorphion, e para publicações acadêmicas ou técnicas relacionadas, nas quais os dados serão apresentados de forma agregada e anonimizada.
            </P>

            <H2>3. Dados Coletados</H2>
            <H3>3.1 Dados coletados durante a sessão de pesquisa</H3>
            <P>Os seguintes dados são coletados e armazenados em servidores da Xcorphion durante cada sessão:</P>
            <ul style={{ paddingLeft: 24, marginBottom: '1.4em' }}>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Texto narrativo:</strong> O conteúdo integral do texto produzido pelo participante em resposta ao prompt fornecido, incluindo todas as edições realizadas durante a sessão.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Eventos de teclado:</strong> Código de tecla pressionada (event.code, independente de layout de teclado), timestamp relativo ao início da sessão em milissegundos (calculado no navegador), timestamp absoluto em epoch ms, tipo do evento (keydown/keyup) e indicador de tecla mantida pressionada.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Respostas EMA:</strong> Valores numéricos de valência (0–100) e arousal (0–100) fornecidos pelo participante a cada 200 caracteres digitados, com o respectivo timestamp e contagem de caracteres.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Avaliação de engajamento:</strong> Nota numérica de 1 a 5 sobre a qualidade percebida da sessão e resposta binária (sim/não) à pergunta sobre genuinidade do engajamento.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Velocidade de digitação (WPM):</strong> Baseline de palavras por minuto medida durante a fase de calibração inicial.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Parâmetros calculados de IKI:</strong> Média e desvio padrão da distribuição log-normal dos intervalos entre teclas (log1p), calculados ao final de cada sessão.</Li>
            </ul>

            <H3>3.2 Dados coletados ao final da Sessão 1</H3>
            <ul style={{ paddingLeft: 24, marginBottom: '1.4em' }}>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Endereço IP:</strong> Capturado uma única vez, ao final da Sessão 1, com a finalidade exclusiva de controle de duplicatas e integridade da amostra.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>User-Agent do navegador:</strong> String de identificação do navegador e sistema operacional, capturada junto ao IP.</Li>
            </ul>

            <H3>3.3 Dados NÃO coletados</H3>
            <P>A Xcorphion declara expressamente que não coleta, em nenhuma circunstância, durante ou após as sessões de pesquisa:</P>
            <ul style={{ paddingLeft: 24, marginBottom: '1.4em' }}>
              <Li>Conteúdo da área de transferência (clipboard);</Li>
              <Li>Histórico de navegação ou outros dados de sessões web;</Li>
              <Li>Dados de outros aplicativos ou processos em execução no dispositivo;</Li>
              <Li>Dados de áudio, vídeo ou câmera;</Li>
              <Li>Dados de geolocalização precisa ou aproximada além do IP;</Li>
              <Li>Senhas, dados de cartão de crédito ou quaisquer credenciais de acesso;</Li>
              <Li>Dados inseridos em outros campos de formulários fora do ambiente da sessão.</Li>
            </ul>

            <H2>4. Pseudonimização e Identificadores</H2>
            <P>
              O participante é identificado por um código de 5 caracteres alfanuméricos ("código de participante") atribuído pela Xcorphion. Internamente, esse código é armazenado exclusivamente como hash SHA-256 irreversível, computado com salt específico da plataforma, impossibilitando a recuperação do código original a partir do hash.
            </P>
            <P>
              O e-mail fornecido na lista de espera é armazenado separadamente do hash do participante e não é associado aos dados de sessão para fins de análise. Sua finalidade é exclusivamente operacional: notificação sobre a abertura de novas sessões e comunicações relacionadas à pesquisa.
            </P>

            <H2>5. Base Legal para Tratamento de Dados</H2>
            <P>
              O tratamento dos dados coletados nesta pesquisa baseia-se nas seguintes hipóteses legais previstas na Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD):
            </P>
            <ul style={{ paddingLeft: 24, marginBottom: '1.4em' }}>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Consentimento (Art. 7º, I):</strong> O participante consente livremente com a coleta ao aceitar estes termos e concluir a sessão de pesquisa.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Legítimo interesse (Art. 7º, IX):</strong> O desenvolvimento de sistemas de IA que melhorem a qualidade das interações humano-computador, com minimização de dados e salvaguardas técnicas adequadas.</Li>
              <Li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Pesquisa científica (Art. 7º, IV):</strong> O estudo visa produzir conhecimento científico publicável sobre relações entre biometria comportamental e estados afetivos.</Li>
            </ul>

            <H2>6. Retenção de Dados</H2>
            <P>
              Os dados de sessão (eventos de teclado, texto, EMA, IKI calculado) serão retidos por um período de até <strong style={{ color: 'rgba(255,255,255,0.7)' }}>5 (cinco) anos</strong> a contar da data de coleta, período necessário para análises longitudinais e validação de resultados. Após esse prazo, os dados serão anonimizados irreversivelmente ou eliminados.
            </P>
            <P>
              Dados de IP e user-agent serão eliminados em até <strong style={{ color: 'rgba(255,255,255,0.7)' }}>12 (doze) meses</strong> após a conclusão da Sessão 1, uma vez cumprida sua finalidade de controle de duplicatas.
            </P>
            <P>
              O e-mail cadastrado na lista de espera será retido até que o participante solicite sua remoção ou até o encerramento do programa de pesquisa, o que ocorrer primeiro.
            </P>

            <H2>7. Compartilhamento de Dados</H2>
            <P>
              Os dados coletados <strong style={{ color: 'rgba(255,255,255,0.7)' }}>não serão vendidos, cedidos, alugados ou comercializados</strong> a terceiros sob nenhuma circunstância.
            </P>
            <P>
              Dados poderão ser compartilhados exclusivamente nas seguintes situações:
            </P>
            <ul style={{ paddingLeft: 24, marginBottom: '1.4em' }}>
              <Li>Em publicações científicas ou técnicas, exclusivamente na forma agregada e anonimizada, sem possibilidade de identificação individual;</Li>
              <Li>Com provedores de infraestrutura de nuvem (atualmente MongoDB Atlas / MongoDB, Inc.) que atuam como operadores de dados sob contrato de processamento adequado à LGPD;</Li>
              <Li>Mediante determinação judicial ou requisição de autoridade competente, na extensão estritamente necessária.</Li>
            </ul>

            <H2>8. Segurança dos Dados</H2>
            <P>
              Os dados são armazenados em infraestrutura MongoDB Atlas com transmissão encriptada (TLS/SSL), controle de acesso baseado em roles, autenticação de múltiplos fatores para administradores e backups automatizados. O acesso administrativo aos dados de pesquisa é restrito a membros autorizados da Xcorphion Research Unit.
            </P>

            <H2>9. Direitos do Titular</H2>
            <P>Nos termos da LGPD, o participante tem direito a:</P>
            <ul style={{ paddingLeft: 24, marginBottom: '1.4em' }}>
              <Li>Confirmar a existência de tratamento de seus dados;</Li>
              <Li>Acessar os dados a ele relacionados;</Li>
              <Li>Corrigir dados incompletos, inexatos ou desatualizados;</Li>
              <Li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</Li>
              <Li>Revogar o consentimento, com eliminação dos dados não indispensáveis para obrigações legais;</Li>
              <Li>Opor-se ao tratamento realizado com base em legítimo interesse.</Li>
            </ul>
            <P>
              O exercício desses direitos pode ser solicitado através dos canais de contato disponíveis em xcorphion.online. Solicitações serão respondidas em até 15 dias úteis.
            </P>

            <H2>10. Critérios de Elegibilidade e Gate de Engajamento</H2>
            <P>
              A participação está condicionada à conclusão da Sessão 1 com confirmação de engajamento genuíno, conforme avaliado pela resposta à pergunta sobre autenticidade do engajamento ao final da sessão. Participantes que respondam negativamente a essa pergunta terão seu perfil marcado como inelegível para sessões subsequentes e para inclusão na lista de espera do OMMΩ.
            </P>
            <P>
              Essa medida é necessária para garantir a qualidade científica dos dados coletados, uma vez que dados produzidos sem engajamento genuíno introduzem ruído sistemático inaceitável para os modelos somáticos em desenvolvimento.
            </P>

            <H2>11. Participação Voluntária e Revogação</H2>
            <P>
              A participação nesta pesquisa é inteiramente voluntária. Não há remuneração, obrigação contratual ou qualquer penalidade associada à não participação ou à desistência. O participante pode interromper a sessão a qualquer momento, sem prejuízo algum.
            </P>
            <P>
              A revogação do consentimento, com solicitação de eliminação dos dados, pode ser feita a qualquer tempo, com exceção dos dados já anonimizados e incorporados a conjuntos de dados de treinamento, que por definição técnica não permitem remoção individualizada.
            </P>

            <H2>12. Cookies e Tecnologias de Rastreamento</H2>
            <P>
              A plataforma de pesquisa não utiliza cookies de rastreamento de terceiros, pixels de marketing ou SDKs de análise comportamental externos. O único dado de sessão armazenado no navegador é o código de participante, necessário para continuidade entre sessões distintas.
            </P>

            <H2>13. Alterações nestes Termos</H2>
            <P>
              A Xcorphion reserva-se o direito de atualizar estes termos a qualquer momento. Alterações materiais serão comunicadas através dos canais disponíveis e publicadas nesta página com data de vigência atualizada. O uso continuado da plataforma após a vigência das novas condições implica concordância com os termos revisados.
            </P>

            <H2>14. Foro e Lei Aplicável</H2>
            <P>
              Estes termos são regidos pela legislação brasileira. Eventuais conflitos serão submetidos ao foro da comarca competente no Brasil, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </P>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '52px 0 32px' }} />

            <p style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7 }}>
              Ao concluir a Sessão 1 da pesquisa ou ao cadastrar seu e-mail na lista de espera, o participante declara ter lido, compreendido e concordado integralmente com os presentes Termos de Uso e Consentimento Informado.
            </p>
          </motion.div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 40px', display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>
            © 2025 Xcorphion Corporation
          </span>
        </div>
      </div>
    </>
  );
}
