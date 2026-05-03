# Registro de Erros (Lessons Learned)

Este arquivo documenta erros cometidos durante o desenvolvimento para evitar repetições.

## 1. Importação de CSS Global Fora do _app.js
- **Erro:** `Global CSS cannot be imported from files other than your Custom <App>` no arquivo `pages/omma.jsx`.
- **Causa:** O Next.js restringe a importação de CSS global exclusivamente ao arquivo `pages/_app.js` para evitar conflitos de especificidade.
- **Solução:** Mover todas as importações de `.css` global para o `pages/_app.js`.

## 2. Sintaxe de Importação do Tailwind v4
- **Erro:** O compilador não reconhece diretivas `@tailwind base` ou classes como `bg-black`.
- **Causa:** No Tailwind v4, a sintaxe mudou. As diretivas antigas foram substituídas por `@import "tailwindcss";`.
- **Solução:** Usar `@import "tailwindcss";` no topo dos arquivos CSS principais.

## 3. Dependências de PostCSS Faltantes
- **Erro:** `Cannot find module 'autoprefixer'` durante o build na Vercel.
- **Causa:** O arquivo `postcss.config.js` referenciava plugins que não estavam listados no `package.json`.
- **Solução:** Garantir que todos os plugins de PostCSS (como `autoprefixer` e `@tailwindcss/postcss`) estejam instalados como dependências.

## 4. Uso de Classe Utilitária Inexistente (Typo/Mismatch)
- **Erro:** `Cannot apply unknown utility class bg-black` (em contexto onde o Tailwind não estava carregado) e `text-text-primary`.
- **Causa:** Tentativa de usar `@apply text-text-primary` quando a configuração no `tailwind.config.js` definia apenas `text-primary`. O prefixo `text-` já é adicionado pelo Tailwind, resultando em duplicação se não houver atenção.
- **Solução:** Verificar sempre o `tailwind.config.js` antes de usar `@apply` e usar o nome exato da chave definida no extend.
