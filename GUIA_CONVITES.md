# 🎯 Guia Prático: Como Gerenciar Participantes e Sessões

Este guia rápido explica como convidar novos participantes e gerenciar o andamento deles na pesquisa.

---

## 1. Como Criar um Novo Convite
Sempre que precisar adicionar uma nova pessoa à pesquisa, você deve gerar um código de acesso único para ela pelo terminal.

1. Abra o terminal na pasta raiz do projeto (`titã page de capture IKIs`).
2. Digite o seguinte comando e aperte **Enter**:
   ```bash
   node scripts/invite.js
   ```
3. O script vai te fazer duas perguntas simples:
   - **Nome do participante:** (Ex: João Silva)
   - **Nome do indicador (quem indicou):** (Ex: Maria Souza)
4. Em seguida, o sistema vai gerar o código e exibir as informações na tela:
   ```text
   Gerando convite...
   ✓ Código de acesso: 7K3M9
   ✓ Participante criado no banco com status: ATIVO
   Link de convite: http://localhost:3000/convite/7K3M9
   ```
5. **Copie o Link de convite** e envie para a pessoa. *(Lembre-se: em produção, o link usará o domínio real do seu site ao invés de localhost, já que ele usa a variável APP_URL)*.

---

## 2. Como Funciona a Experiência do Participante
- **Acesso:** Ao abrir o link, o participante verá as instruções da Sessão atual e o seu Código de Acesso.
- **Engajamento:** Ao final da sessão, a pergunta "Você estava genuinamente engajado?" decide o futuro do participante:
  - Respondeu **SIM**: Sessão dada como concluída. A próxima sessão fica aguardando liberação do administrador.
  - Respondeu **NÃO**: Participante é marcado como Inativo e bloqueado permanentemente da pesquisa.

---

## 3. Como Aprovar as Próximas Sessões (Sessão 2 e 3)
Você precisará aprovar manualmente para que o participante possa fazer a Sessão 2 ou a Sessão 3.

1. Acesse o painel de administração através da URL do seu projeto:
   - Local: `http://localhost:3000/admin`
   - Produção: `https://[seu-dominio]/admin`
2. Faça login usando a senha definida no arquivo `.env` (Variável `ADMIN_PASSWORD`).
3. Você verá uma tabela com todos os participantes.
4. Na coluna **Ações**, você verá um botão verde **Lib. S2** ou **Lib. S3** caso aquele participante já tenha terminado a sessão anterior com engajamento válido.
5. Clique no botão para liberar o acesso. O participante poderá usar o **mesmo link** ou entrar com o mesmo código que já possui para acessar a nova sessão.

---

## 4. Como Bloquear um Participante Manualmente
Caso haja algum problema, você pode desativar o acesso de um participante a qualquer momento.
1. Vá até o painel `/admin`.
2. Clique no botão vermelho **Desativar** na coluna Ações correspondente àquele participante. 
3. Se ele tentar usar o link/código de novo, verá apenas a mensagem "Esta participação foi encerrada."
