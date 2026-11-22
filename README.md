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

### Testes

Com o app rodando (`npm run dev` ou `npm run preview`) e o Playwright instalado:

```bash
node tests/e2e/fluxos.cjs   # login, cadastro, fatura, cartões, metas, assistente
node tests/e2e/crud.cjs     # criar · ver · editar · apagar em cada entidade
```

Esses dois rodam no modo local (`VITE_DATA_SOURCE=local`). Para o app conectado ao Supabase, use `tests/e2e/supabase.cjs` e `tests/e2e/supabase-conta.cjs` (instruções no topo de cada arquivo).

Testes do banco (Postgres puro, sem Supabase): veja `supabase/tests/README.md`.

## Documentação

- [`docs/CHECKLIST.md`](docs/CHECKLIST.md): todas as telas, folhas e funcionalidades, com o status de cada uma.
- [`docs/SUPABASE.md`](docs/SUPABASE.md): o banco no Supabase (tabelas, RLS, Storage, Prisma, dados de demonstração) e o checklist do banco.
- [`docs/CRUD.md`](docs/CRUD.md): cada entidade × criar, ver, editar e apagar, ligadas à tela, à ação do store, ao contrato e à tabela.
- [`docs/TOKENS.md`](docs/TOKENS.md): design tokens primitivos e semânticos.

## Estrutura

```
gamora/
├─ api/                      # Vercel Functions (SERVIDOR — segredos ficam aqui)
│  ├─ assistant.ts · invoice.ts  # IA (OpenAI) com login obrigatório
│  └─ _lib/                  # código comum das rotas
├─ public/                   # arquivos estáticos (favicon)
├─ tokens/                   # design tokens: source.mjs (fonte) → primitives/semantic/figma-variables.json
├─ docs/                     # CHECKLIST.md, CRUD.md, TOKENS.md (gerado)
├─ .storybook/               # configuração do Storybook (tema, viewports, providers)
├─ prisma/schema.prisma      # espelho do banco para o Prisma (só servidor)
├─ supabase/
│  ├─ seed/demo.sql          # dados de demonstração (temporários)
│  ├─ migrations/            # schema SQL + RLS + views + RPCs, pronto para aplicar
│  └─ tests/                 # testes do CRUD e do RLS (Postgres puro)
├─ tests/e2e/                # testes ponta a ponta (Playwright)
├─ src/
│  ├─ app/                   # App, navegação (pilha de telas + folhas)
│  ├─ components/
│  │  ├─ ui/                 # botões, campos, sheet, toast, progresso
│  │  ├─ layout/             # TopBar, Dock, ScreenHeader
│  │  └─ finance/            # TransactionRow, WalletCard, Pocket (carteira)
│  ├─ features/              # uma pasta por tela
│  │  ├─ home/  transactions/ (extrato)  cards/  goals/  invoice/  assistant/  auth/
│  │  └─ sheets/             # gasto, cartão, meta, depósito, teto, fatura importada, conta, perfil, saldo, senha, excluir conta
│  ├─ store/                 # estado global (reducer com o CRUD de cada entidade) + derivados + migração
│  ├─ services/
│  │  ├─ storage.ts          # FinanceRepository — hoje localStorage
│  │  ├─ api/                # contratos de CRUD por entidade + mapeadores domínio ⇄ banco
│  │  ├─ supabase/           # client, auth (Supabase Auth) e data (ler/gravar no banco)
│  │  └─ ai/                 # cliente do estágio 2 → chama /api, nunca a OpenAI
│  ├─ config/env.ts          # leitura tipada das variáveis de ambiente
│  ├─ types/finance.ts       # modelo de domínio
│  ├─ types/database.ts      # linhas das tabelas (snake_case)
│  ├─ data/mocks.ts          # dados de referência do briefing
│  ├─ lib/                   # format (moeda, datas, uid), cards (vencimento), goals, image
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

**Supabase**: feito. O banco está criado e populado, e o app está conectado (veja [`docs/SUPABASE.md`](docs/SUPABASE.md)). Os passos abaixo ficam como referência.
1. `npm install @supabase/supabase-js`
2. ~~Rodar `supabase/migrations/0001_init.sql`~~ feito no projeto Gamora
3. Preencher `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` no `.env`
4. Ativar `src/services/supabase/client.ts` e implementar `DataApi` (`src/services/api/contracts.ts`) usando `mappers.ts`
5. `VITE_DATA_SOURCE=supabase` e trocar `localAuth` por um `supabaseAuth` (mesmo contrato `AuthService`)
6. Passo a passo completo: [`docs/CRUD.md`](docs/CRUD.md#como-plugar-o-supabase)

**GitHub + Vercel**
1. `git add . && git commit` → push para o GitHub
2. Importar o repositório na Vercel (framework: Vite — já em `vercel.json`)
3. Cadastrar as variáveis de ambiente

**Estágio 2 · OpenAI** (rotas prontas: [`api/README.md`](api/README.md))
1. Cadastrar `OPENAI_API_KEY` na Vercel, sem o prefixo `VITE_`.
2. Trocar `VITE_FEATURE_AI` para `true` e fazer Redeploy.
