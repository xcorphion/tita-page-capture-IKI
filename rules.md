# Diretrizes e Normas do Projeto Xcorphion

Este documento consolida todas as regras de design, comportamento e desenvolvimento estabelecidas para a interface institucional da Xcorphion.

## 1. Fluxo de Desenvolvimento
*   **Sandbox First:** Nenhum componente de interface novo deve ser criado diretamente no site principal. Tudo deve ser prototipado isoladamente na pasta `/sidebar-sandbox` (Porta 3002).
*   **Aprovação Mandatória:** A integração ao site oficial (Porta 3001) só ocorre após validação visual e funcional completa no sandbox.
*   **Paridade de Código:** O código integrado deve ser um reflexo fiel do sandbox, garantindo que animações, sombras e estilos não se percam na transição para o ambiente React/Next.js.

## 2. Estética e Design (Visual Excellence)
*   **Aparência Premium:** O design deve causar impacto imediato ("Wow factor"), utilizando estética *high-tech*, *minimalista* e *cyber*.
*   **Paleta de Cores:**
    *   **Primária:** Preto absoluto (#000000).
    *   **Destaque:** Vermelho Sangue / Hot Red (#8B0000, #B22222).
    *   **Texto:** Branco/Cinza claro com opacidades variadas (80-90%).
*   **Glassmorphism:** Uso ostensivo de `backdrop-blur`, bordas finas com transparência e sombras suaves.
*   **Tipografia:**
    *   **Headlines/Técnico:** `Space Grotesk` (letras levemente quadradas, ar tecnológico).
    *   **Leitura/Geral:** `Inter`.
*   **Animações:** Devem ser fluidas, calmas e "premium". Utilizar easing `cubic-bezier(0.22, 1, 0.36, 1)` (0.6s).

## 3. Diretrizes de UI Específicas
### Sidebar (Navegação)
*   **Comportamento:** Deve flutuar sobre o conteúdo (ex: vídeo Hero) com efeito de sombra profunda e desfoque.
*   **Iframe Orchestrator:** No site principal, a sidebar roda via Iframe para isolamento total de estilos, mas deve redimensionar dinamicamente via `postMessage` para não bloquear cliques no restante da página.
*   **Sombra:** Deve ser ultra-suave (Blur 60px+) e nunca ser cortada pelas bordas do contêiner.

### Headlines e Texto
*   **Posicionamento:** Alinhamento à direita com margem fixa de `30px` da borda da tela.
*   **Estrutura:** Formato de "cascata" (quebras de linha manuais para criar degraus visuais).
*   **Texturas:** A "Malha Quadriculada" (grid-bg) deve ser anexada ao bloco de texto, movendo-se junto com ele.

## 4. Normas Técnicas e Ambiente
*   **Portas de Execução:** 
    *   Site Principal: **3001** (Porta 3000 evitada por conflito com GenieACS).
    *   Sandbox: **3002**.
*   **Preservação:** Proibido alterar arquivos de coleta de dados, lógica de backend ou componentes já validados sem solicitação expressa.
*   **Imagens e Ícones:** Não utilizar placeholders. Usar ícones da biblioteca `Lucide` e assets reais da pasta `/public`.

## 5. Padrão de Seções
*   **Altura Padrão:** Seções institucionais devem seguir a medida de **1080px** no eixo Y, garantindo um layout consistente em rolagem.
