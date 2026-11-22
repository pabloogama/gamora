# Checklist — telas e funcionalidades do Gamora

Revisão completa contra o briefing, com **CRUD completo** para tudo que a pessoa cria. O mapa de cada operação até o banco está em [`docs/CRUD.md`](CRUD.md).

**Legenda:**

- ✅ feito e testado no navegador
- 🟡 feito com dados simulados (estágio 2)
- ⏳ depende da integração (Supabase, OpenAI)
- ➕ além do briefing

**Testes:**

- **Fluxos gerais:** 22 verificações ponta a ponta.
- **CRUD:** 54 verificações ponta a ponta (celular 390px, build de produção).
- **Banco:** `supabase/tests/crud_rls.test.sql` num Postgres 16.

---

## 1. Telas

| # | Tela | O que verificar | Status |
|---|---|---|---|
| 1 | **Login** | E-mail + senha · validação · "E-mail ou senha incorretos" · botão da conta de demonstração · tema claro/escuro | ✅ |
| 2 | **Cadastro** ➕ | Nome, e-mail, senha, confirmação, saldo inicial (opcional) · e-mail duplicado bloqueia | ✅ |
| 3 | **Home** | "Olá, Pablo" com foto · carteira (toque troca o cartão da frente) · Seu saldo · ocultar valores · Detalhes do cartão · atalhos · Este mês (−12% vs. mês anterior, 3 categorias) · tiles (teto e fatura) · últimos 5 gastos + **Ver extrato** | ✅ |
| 4 | **Extrato** ➕ | Todos os lançamentos agrupados por dia · busca · filtro de mês (ou todos) · filtro de categoria · total do filtro · estado vazio e "Nada encontrado" · no desktop é item do menu | ✅ |
| 5 | **Cartões** | Pilha de cartões (toque traz para a frente) · bolso com fatura, limite usado e vencimento · disponível e final · próximas faturas (por vencimento) · faturas importadas (estágio 2) · compras no cartão | ✅ |
| 6 | **Metas** | Teto do mês ("Ainda pode gastar") · tetos por categoria · meta em destaque (anel, por mês até a data) · lista de metas · card do assistente (estágio 2) | ✅ |
| 7 | **Fatura** (estágio 2) | Enviar PDF ou foto · validação de tipo e tamanho · "Lendo sua fatura" com cancelar · revisão (34 compras, 6 assinaturas, R$ 1.284) · marcar e desmarcar itens · confirmar | 🟡 |
| 8 | **Assistente** (estágio 2) | Insight inicial · sugestões · digitando + streaming · respostas com os números do app · conversa salva · Nova conversa | 🟡 |

## 2. Folhas (sheets)

| # | Folha | Abre em | Status |
|---|---|---|---|
| 1 | Adicionar gasto | **+** do dock e do topo · Home · Extrato | ✅ |
| 2 | Editar gasto | Detalhe da compra → Editar | ✅ |
| 3 | Detalhe da compra (categoria, pagamento, data, **origem**, assinatura) | Toque num gasto em qualquer lista | ✅ |
| 4 | Novo cartão / Editar cartão (**dia do vencimento**, de 1 a 31) | Cartões · Home | ✅ |
| 5 | **Detalhe da meta** ➕ (progresso, já tinha × guardado pelo app, depósitos) | Toque numa meta · "Detalhes" | ✅ |
| 6 | Nova meta / Editar meta | Metas **+** · Detalhe da meta | ✅ |
| 7 | Guardar valor / **Editar depósito** ➕ (valor, data, observação) | Metas · Detalhe da meta | ✅ |
| 8 | Teto: novo · ajustar · **remover** ➕ · teto do mês | Metas · Home | ✅ |
| 9 | **Fatura importada** ➕ (lista e desfazer) | Cartões → Faturas importadas | ✅ |
| 10 | Conta (ajustar saldo, ocultar valores, tema, alterar senha, restaurar, sair, excluir conta) | Avatar no topo | ✅ |
| 11 | Editar perfil (foto, nome, e-mail) | Conta | ✅ |
| 12 | **Ajustar saldo** ➕ | Conta | ✅ |
| 13 | **Alterar senha** ➕ (confere a senha atual) | Conta | ✅ |
| 14 | **Excluir conta** ➕ (pede a senha, apaga os dados) | Conta | ✅ |

## 3. CRUD por entidade

| Entidade | Criar | Ver | Editar | Apagar | Banco |
|---|---|---|---|---|---|
| Lançamento (gasto) | ✅ | ✅ Home · Extrato · Detalhe · Cartões | ✅ | ✅ com confirmação | `transactions` |
| Cartão | ✅ | ✅ Cartões · Home | ✅ | ✅ gastos ficam como "Cartão removido" | `cards` |
| Meta | ✅ | ✅ Metas · Detalhe da meta | ✅ | ✅ depósitos voltam ao saldo | `goals` + view `goal_progress` |
| Depósito em meta | ✅ | ✅ histórico na meta | ✅ | ✅ valor volta ao saldo | `goal_deposits` |
| Teto por categoria | ✅ | ✅ | ✅ | ✅ | `budgets` |
| Teto do mês | ✅ | ✅ | ✅ | ✅ (0 = sem teto) | `profiles.month_cap` |
| Fatura importada | ✅ | ✅ | via cada lançamento | ✅ desfazer | `invoice_imports` + RPCs |
| Conversa do assistente | ✅ | ✅ | não se aplica | ✅ Nova conversa | `assistant_messages` |
| Perfil / conta | ✅ cadastro | ✅ | ✅ foto, nome, e-mail, senha, saldo | ✅ excluir conta | `auth.users` + `profiles` |

## 4. Regras de negócio

| Regra | Status |
|---|---|
| Gasto atualiza saldo, mês, categorias, teto e fatura do cartão | ✅ |
| Editar ou apagar gasto desfaz o efeito anterior na fatura | ✅ (front e banco) |
| Depósito sai do saldo; editar ou apagar devolve | ✅ |
| "Já guardado" da meta = guardado antes do app + depósitos | ✅ |
| Desfazer importação: apaga os lançamentos e a fatura volta ao valor anterior | ✅ (front e banco) |
| Vencimento calculado a partir do dia (não envelhece) | ✅ |
| Dados salvos antes da revisão são migrados sem mudar o saldo | ✅ |
| Ocultar valores vale para o app inteiro (inclusive textos do assistente) | ✅ |
| Cada conta vê só os próprios dados (front: por e-mail; banco: RLS) | ✅ |

## 5. Base para o backend

| Item | Status |
|---|---|
| **Banco criado no Supabase** (projeto Gamora) com dados de demonstração | ✅ ver [`docs/SUPABASE.md`](SUPABASE.md) |
| Schema completo: 8 tabelas, 3 views, triggers, 2 RPCs, GRANTs, buckets `avatars` e `invoices` | ✅ `supabase/migrations/0001_init.sql` |
| CRUD + RLS + Storage validados pela API real (61/61) | ✅ `supabase/tests/api-crud.test.mjs` |
| Schema Prisma (documentação, conferido contra o banco) | ✅ `prisma/schema.prisma` |
| RLS com 4 políticas por tabela (select/insert/update/delete) | ✅ testado |
| Isolamento: não usa o cartão ou a meta de outra conta | ✅ testado |
| Cascatas: excluir conta apaga tudo; apagar meta apaga depósitos; apagar cartão mantém os gastos | ✅ testado |
| Tipos das linhas (`src/types/database.ts`) e mapeadores domínio ⇄ banco | ✅ |
| Contratos de repositório por entidade (`src/services/api/contracts.ts`) | ✅ |
| Contrato de auth com alterar senha e excluir conta | ✅ local · ⏳ Supabase |
| `.env` / `.env.example` / `.gitignore` · rotas de exemplo da OpenAI | ✅ |
| App lendo e gravando no Supabase | ⏳ banco pronto; o front ainda usa localStorage |
| OpenAI real (fatura e assistente) | ⏳ hoje: simulado |

## 6. Visual e acessibilidade

| Item | Status |
|---|---|
| Mobile-first; desktop a partir de 1100px (menu no topo, sem sidebar) | ✅ |
| Sem rolagem lateral em 390px (corrigido nesta revisão: o total do mês com centavos alargava a Home) | ✅ |
| Tema claro padrão, escuro opcional; calendário nativo segue o tema (corrigido nesta revisão) | ✅ |
| Identidade Gamora: paleta, Manrope, logo G, slogan | ✅ |
| Ações destrutivas sempre pedem confirmação | ✅ |
| Toasts, carregamento e estados vazios | ✅ |
| Storybook com todas as telas e folhas novas | ✅ |

## Lacunas conhecidas

- **ESLint:** o briefing cita, mas o projeto ainda não tem configuração de lint.
- **Modo estágio 1** (`VITE_APP_STAGE=1`): implementado, mas não testado no navegador.
- **Receitas:** o briefing só trata de gastos. O saldo muda por *Ajustar saldo*; lançar salário como entrada ainda não existe.
- **Conta de demonstração:** se for excluída, volta a existir no próximo acesso (é recriada de propósito).
