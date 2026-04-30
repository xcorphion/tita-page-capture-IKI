# Documentação da Feature: Convite e Controle de Sessões

## 1. Visão Geral
Esta feature adiciona um fluxo completo para convidar novos participantes e gerenciar o acesso deles a sessões subsequentes da pesquisa, garantindo maior controle sobre o andamento e o engajamento dos voluntários.

## 2. Componentes da Feature

### 2.1 Script CLI (`scripts/invite.js`)
Script interativo para gerar códigos de acesso únicos e criar novos participantes no banco de dados.

**Como rodar:**
No terminal, dentro da pasta raiz do projeto, execute:
```bash
node scripts/invite.js
```
O script solicitará o **Nome do participante** e o **Nome do indicador**. Em seguida, ele irá gerar um código de 5 dígitos alfanuméricos e fornecer o link de acesso.

### 2.2 Página de Convite (`/convite/[codigo]`)
Uma página minimalista e compatível com a estética do projeto. A página lê o banco de dados e exibe o status atual do participante, indicando em qual sessão ele se encontra, se precisa aguardar ou se o acesso foi encerrado.

### 2.3 Painel Admin (`/admin`)
Um painel de controle simples protegido por senha que permite aos pesquisadores gerenciar os participantes.
- **Acesso:** Acesse a rota `/admin`.
- **Senha:** A mesma configurada na variável `ADMIN_PASSWORD` do `.env`.
- **Funcionalidades:** 
  - Listar todos os participantes.
  - Aprovar sessões seguintes (Sessão 2 e 3). A aprovação só é possível se o engajamento for válido e a sessão anterior estiver concluída.
  - Desativar a conta de um participante caso necessário.

## 3. Fluxo Completo de um Participante

1. **Geração do Convite:** O pesquisador roda o script CLI informando o nome e o indicador do participante. Um link `/convite/[codigo]` é gerado e enviado ao participante.
2. **Sessão 1:** O participante acessa o link, lê a instrução personalizada, clica no botão para iniciar e realiza a Sessão 1.
3. **Fim da Sessão 1:** Ao concluir, ele responde às perguntas finais.
    - Se responder SIM na validação de engajamento genuíno, a Sessão 1 é marcada como concluída e a Sessão 2 passa para o status `AGUARDANDO`.
    - Se responder NÃO, a participação é encerrada permanentemente (status: `INATIVO`).
4. **Autorização (Admin):** O pesquisador acessa `/admin` e libera manualmente a Sessão 2 para o participante aprovado.
5. **Sessões Seguintes:** O fluxo de aguardar aprovação e liberação no painel admin se repete entre as Sessões 2 e 3.
6. **Fim da Pesquisa:** Após concluir a Sessão 3 de forma engajada, a jornada do participante termina, garantindo dados validados.

## 4. Variáveis de Ambiente
Verifique se seu arquivo `.env` contém:
```env
APP_URL=http://localhost:3000
ADMIN_PASSWORD=senha_super_secreta_aqui
```
