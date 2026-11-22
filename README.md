# Gamora

> Suas finanças, em família.

App de finanças pessoais **mobile-first com visão desktop**: saldo, gastos do mês, cartões e metas, registrados à mão (Estágio 1). O Estágio 2 (leitura de fatura e assistente via OpenAI) já tem os pontos de integração preparados, mas está **desligado**.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · lucide-react
**Futuro:** Supabase (auth + banco) · Vercel (hosting + Functions) · OpenAI (estágio 2)

## Conta de demonstração

Na tela de login, use **Conta de demonstração** (`pablo@gamora.app` / `gamora123`). O perfil (foto, nome e e-mail) é editável em Conta → Editar perfil.

## Rodar localmente

```bash
cp .env.example .env     # só na primeira vez
npm install
npm run dev              # http://localhost:5173
```

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | checa tipos e gera `dist/` |
| `npm run preview` | serve o build |
| `npm run typecheck` | só a checagem de tipos |
| `npm run storybook` | Storybook local em http://localhost:6006 (tokens, componentes, folhas e telas) |
| `npm run build-storybook` | Storybook estático em `storybook-static/` |
| `npm run tokens` | regenera `tokens/*.json` e `docs/TOKENS.md` a partir de `tokens/source.mjs` e confere com o CSS |

## Estrutura

```
gamora/
├─ api/                      # Vercel Functions (SERVIDOR — segredos ficam aqui)
│  └─ _examples/             # rotas OpenAI de exemplo, desligadas (prefixo _)
├─ public/                   # arquivos estáticos (favicon)
├─ tokens/                   # design tokens: source.mjs (fonte) → primitives/semantic/figma-variables.json
├─ docs/                     # TOKENS.md (gerado) e CHECKLIST.md
├─ .storybook/               # configuração do Storybook (tema, viewports, providers)
├─ supabase/
│  └─ migrations/            # schema SQL + RLS, pronto para aplicar
├─ src/
│  ├─ app/                   # App, navegação (pilha de telas + folhas)
│  ├─ components/
│  │  ├─ ui/                 # botões, campos, sheet, toast, progresso
│  │  ├─ layout/             # TopBar, Dock, ScreenHeader
│  │  └─ finance/            # TransactionRow, WalletCard, Pocket (carteira)
│  ├─ features/              # uma pasta por tela
│  │  ├─ home/  cards/  goals/  invoice/  assistant/  auth/
│  │  └─ sheets/             # Adicionar, Detalhe, Cartão, Guardar, Meta, Teto, Conta
│  ├─ store/                 # estado global (reducer) + valores derivados
│  ├─ services/
│  │  ├─ storage.ts          # FinanceRepository — hoje localStorage
│  │  ├─ supabase/           # cliente + repositório (preparados)
│  │  └─ ai/                 # cliente do estágio 2 → chama /api, nunca a OpenAI
│  ├─ config/env.ts          # leitura tipada das variáveis de ambiente
│  ├─ types/finance.ts       # modelo de domínio (espelha o SQL)
│  ├─ data/mocks.ts          # dados de referência do briefing
│  ├─ lib/format.ts          # moeda, datas, máscaras
│  ├─ hooks/                 # useTheme, useMoney (ocultar valores)
│  ├─ stories/               # Storybook: tokens, componentes, folhas, telas
│  └─ styles/index.css       # variáveis CSS --gm-* (tema claro e escuro)
├─ .env.example              # modelo das variáveis (versionado)
├─ .env                      # valores reais (NÃO versionado)
└─ vercel.json               # SPA rewrite + headers de segurança
```

Imports usam o alias `@/` → `src/`.

## Variáveis de ambiente

- `VITE_*` **vai para o navegador**: só valores públicos (URL do Supabase, anon key, flags).
- Sem `VITE_` **fica no servidor**: `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- `.env` está no `.gitignore`. Na Vercel, cadastre as mesmas chaves em *Settings → Environment Variables*.
- `src/config/env.ts` avisa no console (em dev) se algum segredo receber o prefixo `VITE_` por engano.

## Roteiro de integração

**Supabase**
1. `npm install @supabase/supabase-js`
2. Rodar `supabase/migrations/0001_init.sql` no projeto (SQL Editor ou `supabase db push`)
3. Preencher `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` no `.env`
4. Ativar `src/services/supabase/client.ts` e implementar `repository.ts` (mesmo contrato de `services/storage.ts`)
5. `VITE_DATA_SOURCE=supabase` e trocar o login de `features/auth` por `supabase.auth`

**GitHub + Vercel**
1. `git add . && git commit` → push para o GitHub
2. Importar o repositório na Vercel (framework: Vite — já em `vercel.json`)
3. Cadastrar as variáveis de ambiente

**Estágio 2 · OpenAI**
1. Copiar `api/_examples/*.example.ts` para `api/assistant.ts` e `api/invoice.ts`
2. `OPENAI_API_KEY` na Vercel · `VITE_FEATURE_AI=true`
3. Construir as telas Fatura e Assistente usando `src/services/ai/client.ts`
