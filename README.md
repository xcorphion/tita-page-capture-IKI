# Somatic Transformer — Aplicação de Coleta

Aplicação web de pesquisa acadêmica para captura de keystroke 
dynamics de participantes reais. Cada sessão registra eventos 
de teclado com timestamp de alta resolução enquanto o 
participante escreve livremente sobre decisões pessoais. 
O sinal temporal resultante alimenta o Somatic Transformer — 
um modelo que testa a hipótese de que padrões de digitação 
carregam marcadores somáticos de estados emocionais, conforme 
a teoria de António Damásio.

## O que a aplicação faz

- Exibe prompts de escrita sobre decisões reais
- Captura keydown e keyup com event.timeStamp (DOMHighResTimeStamp)
- Interrompe a sessão a cada 200 caracteres com EMA de dois sliders
  (valência 0–100 e arousal 0–100, modelo circumplexo de Russell)
- Armazena eventos brutos append-only no banco de dados
- Controla liberação de sessões via painel administrativo

## Stack

- **Framework**: Next.js 16 (React 19)
- **Linguagem**: JavaScript (Node.js)
- **Banco de Dados**: MongoDB (Motor de persistência append-only)
- **Estilização**: Vanilla CSS (CSS moderno com variáveis e glassmorphism)
- **Infraestrutura**: Projetado para deploy na Vercel

## Variáveis de ambiente

As seguintes variáveis devem estar presentes no arquivo `.env`:

- `MONGODB_URI`: String de conexão oficial do MongoDB (Atlas ou Local).
- `ADMIN_PASSWORD`: Senha em texto simples para acesso ao painel `/admin`.
- `APP_URL`: URL base da aplicação (ex: `http://localhost:3000`) para geração de links de convite.

## Instalação e execução local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env` baseado no `.env.example`.

3. Execute em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Para build de produção:
   ```bash
   npm run build
   npm start
   ```

## Estrutura do banco de dados

Quatro tabelas principais:

**participants** — cadastro anônimo por hash
- `participant_id` (string): Código de 5 caracteres.
- `status` (string): `ATIVO` ou `INATIVO`.
- `session_X_status` (string): `LIBERADA`, `AGUARDANDO`, `CONCLUIDA` ou `BLOQUEADA`.
- `admin_authorized_sX` (boolean): Flag de liberação manual.
- `fingerprint` (object): IP e User Agent coletados na S1.

**sessions** — uma por participante por rodada de coleta  
- `session_id` (uuid): Identificador único da sessão.
- `jitter_benchmark_ms` (number): Resultado do teste de precisão de tempo.
- `engagement_rating` (number): Nota de 1 a 5 dada pelo usuário.
- `text_final` (string): O texto completo produzido.

**events** — append-only, nunca deletar ou atualizar
- `event_type` (string): `keydown` ou `keyup`.
- `key_code` (string): Código da tecla via `event.code`.
- `timestamp_rel_ms` (number): Tempo relativo de alta resolução do browser.
- `event_repeat` (boolean): Identificador de auto-repeat do SO.

**emas** — Ecological Momentary Assessment a cada 200 chars
- `valence` (number): Coordenada 0-100 no eixo de prazer/desprazer.
- `arousal` (number): Coordenada 0-100 no eixo de ativação/calma.
- `character_count` (number): Ponto de interrupção (ex: 200, 400, 600).

## Sistema de convites

Participantes são recrutados via código de 5 caracteres 
gerado pelo script CLI. Cada código vincula um participante 
a três sessões liberadas sequencialmente conforme regras 
de engajamento e autorização administrativa.

Para gerar um convite:

```bash
node scripts/invite.js
```

## Painel administrativo

Rota `/admin` protegida por `ADMIN_PASSWORD`. Permite:
- Visualizar todos os participantes e status de sessões
- Autorizar sessão 2 ou 3 por participante
- Desativar participantes

## Regras de liberação de sessões

Sessão 2 é liberada quando:
  engagement da sessão 1 = true E admin autorizou

Sessão 3 é liberada quando:
  engagement da sessão 2 = true E admin autorizou

Resposta "não engajado" em qualquer sessão marca o 
participante como INATIVO e bloqueia sessões seguintes.

## Decisões técnicas críticas (não alterar)

- Fonte de tempo: `event.timeStamp`, nunca `Date.now()`
- Campo: `event.code`, nunca `event.key`
- Backspace e Delete são armazenados como eventos normais
- `timestamp_rel_ms` calculado no browser antes do envio
- Eventos enviados em batches de 50 ou a cada 5 segundos
- Tabela `events` é append-only — sem UPDATE ou DELETE

## Protocolo de coleta

200 participantes × 3 sessões × 3 segmentos EMA
= 1.800 amostras rotuladas com coordenadas reais
  de valência e arousal no circumplexo de Russell

Cada segmento: 600 caracteres | 3 EMAs | shape fixo

## Licença e autoria

[Placeholder para o autor preencher]
