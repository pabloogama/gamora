# CRUD — mapa completo

Tudo o que a pessoa cria no Gamora tem as quatro operações: **C** criar, **R** ver, **U** editar e **D** apagar.

Cada linha da matriz liga quatro camadas:

- a tela ou folha (sheet) onde a pessoa faz a operação;
- a ação do store (`src/store/index.tsx`);
- o método do contrato (`src/services/api/contracts.ts`);
- a tabela e a política de RLS (`supabase/migrations/0001_init.sql`).

**Como cada camada está testada:**

- **Front:** `npm run build` + teste ponta a ponta de CRUD (54 verificações, Playwright, celular 390px).
- **Banco:** `supabase/tests/crud_rls.test.sql` num Postgres 16. Cobre:
  - as 4 operações em cada tabela;
  - o isolamento entre contas;
  - as cascatas;
  - as RPCs da fatura.

## Matriz

| Entidade | Op. | Onde a pessoa faz | Ação do store | Contrato | Banco |
|---|---|---|---|---|---|
| **Lançamento** (gasto) | C | Dock/topo **+** · Home "Adicionar" → folha *Adicionar gasto* | `saveTx` (id novo) | `transactions.create` | `insert transactions` |
| | R | Home (últimos 5) · **Extrato** (busca, mês, categoria) · Cartões (compras do cartão) · folha *Detalhe da compra* | state | `transactions.query` / `get` | `select transactions` |
| | U | *Detalhe da compra* → **Editar** | `saveTx` (id existente) | `transactions.update` | `update transactions` |
| | D | *Detalhe da compra* → **Apagar** (confirma) | `deleteTx` | `transactions.remove` | `delete transactions` |
| **Cartão** | C | Cartões **+** · Home "Novo cartão" · bolso da Home **+** | `saveCard` | `cards.create` | `insert cards` |
| | R | Cartões (pilha, fatura, disponível, próximas faturas) · Home (carteira) | state | `cards.list` | `select cards` |
| | U | Cartões → lápis no bolso ou linha em *Próximas faturas* → *Editar cartão* | `saveCard` | `cards.update` | `update cards` |
| | D | *Editar cartão* → **Apagar cartão** (confirma; os gastos ficam como "Cartão removido") | `deleteCard` | `cards.remove` | `delete cards` → `transactions.card_id = null` |
| **Meta** | C | Metas **+** · lista vazia "Nova meta" | `saveGoal` | `goals.create` | `insert goals` |
| | R | Metas (destaque + lista) · folha **Detalhe da meta** | state | `goals.list` / `get` | `select goal_progress` (view) |
| | U | *Detalhe da meta* → **Editar meta** | `saveGoal` | `goals.update` | `update goals` |
| | D | *Editar meta* → **Apagar meta** (confirma; os depósitos voltam ao saldo) | `deleteGoal` | `goals.remove` | `delete goals` → cascata em `goal_deposits` |
| **Depósito em meta** | C | Metas: "Guardar R$ 500", **+** na linha · *Detalhe da meta* → Guardar | `saveDeposit` | `deposits.create` | `insert goal_deposits` |
| | R | *Detalhe da meta* → lista de depósitos (valor, data, observação) | state | `deposits.listByGoal` | `select goal_deposits` |
| | U | Toque num depósito → *Editar depósito* (valor, data, observação) | `saveDeposit` | `deposits.update` | `update goal_deposits` |
| | D | *Editar depósito* → **Apagar depósito** (o valor volta ao saldo) | `deleteDeposit` | `deposits.remove` | `delete goal_deposits` |
| **Teto por categoria** | C | Metas → "Teto por categoria" → *Novo teto* | `setBudget` | `budgets.upsert` | `insert budgets` (único por categoria) |
| | R | Metas (grid com % usado) | state | `budgets.list` | `select budgets` |
| | U | Toque no bloco → *Ajustar teto* | `setBudget` | `budgets.upsert` | `update budgets` |
| | D | *Ajustar teto* → **Remover teto** | `deleteBudget` | `budgets.remove` | `delete budgets` |
| **Teto do mês** | C/U | Metas/Home → *Teto do mês* | `setCap` | `profile.update` | `update profiles.month_cap` |
| | R | Metas ("Ainda pode gastar") · Home (tile) | state | `profile.get` | `select profiles` |
| | D | *Teto do mês* → **Remover teto do mês** (vira 0 = sem teto) | `setCap(0)` | `profile.update` | `month_cap = 0` |
| **Fatura importada** (estágio 2) | C | Fatura → enviar → revisar → **Confirmar** | `importInvoice` | `imports.create` | RPC `import_invoice` |
| | R | Cartões → *Faturas importadas* → folha *Fatura importada* (lançamentos dela) | state | `imports.list` / `get` | `select invoice_imports` |
| | U | Não se edita a importação: cada lançamento dela é editável como qualquer gasto | `saveTx` | `transactions.update` | `update transactions` |
| | D | *Fatura importada* → **Desfazer importação** (apaga os lançamentos e devolve a fatura anterior) | `deleteImport` | `imports.remove` | RPC `undo_invoice_import` |
| **Conversa com o assistente** (estágio 2) | C | Assistente → perguntar | `chatAdd` | `chat.create` | `insert assistant_messages` |
| | R | Assistente (a conversa fica salva ao sair e voltar) | state | `chat.list` | `select assistant_messages` |
| | U | Não se aplica: mensagens não são editadas (não existe política de update) | — | — | — |
| | D | Assistente → **Nova conversa** | `chatClear` | `chat.clear` | `delete assistant_messages` |
| **Perfil e conta** | C | Cadastro (nome, e-mail, senha, saldo inicial) | `hydrate` | `auth.signUp` | `auth.users` + trigger cria `profiles` |
| | R | Folha *Conta* · topo (foto + "Olá, Pablo") | state | `profile.get` | `select profiles` |
| | U | *Editar perfil* (foto, nome, e-mail) · *Ajustar saldo* · *Alterar senha* · ocultar valores · tema | `updateUser` · `setBalance` · `toggleBalance` | `profile.update` · `auth.changePassword` | `update profiles` · `auth.updateUser` |
| | D | *Conta* → **Excluir conta** (pede a senha) | `logout` + `repository.remove` | `auth.deleteAccount` | `delete auth.users` → cascata em tudo |

## Regras que o banco garante

- **Isolamento:** cada tabela tem RLS com uma política por operação (`select`, `insert`, `update`, `delete`) e `user_id = auth.uid()`. O cliente nunca manda `user_id`: ele vem do `default auth.uid()`.
- **Sem misturar contas:**
  - um gasto não pode usar o cartão de outra pessoa (trigger `check_card_owner`);
  - um depósito não pode ir para a meta de outra pessoa (FK composta `(goal_id, user_id)`).
- **Derivados não são colunas:**
  - quanto a meta já tem: `goal_progress.saved = initial_saved + soma dos depósitos`;
  - saldo: `account_summary.balance = base_balance − gastos − depósitos`.
- **Fatura do cartão:** um gasto no cartão soma na fatura dele; editar ou apagar o gasto desconta (trigger `bump_card_invoice`). É a mesma regra do reducer.
- **Vencimento:** guardamos o **dia** (`due_day`, de 1 a 31). "Vence em N dias" é calculado (`src/lib/cards.ts`), porque mudaria sozinho todo dia.
- **ids:** o app gera UUID v4 no aparelho, então o mesmo id serve no banco (útil para salvar offline e sincronizar depois).
- **Dados antigos:** `migrate()` no store converte o formato salvo antes desta revisão sem mudar o saldo que a pessoa via. O teste ponta a ponta tem um caso para isso.

## Como plugar o Supabase

1. Aplicar a migração: `supabase db push`, ou colar `0001_init.sql` no SQL Editor.
2. Gerar os tipos com `supabase gen types typescript` e trocar `src/types/database.ts` mantendo os nomes.
3. Implementar `DataApi` (`src/services/api/contracts.ts`) com `@supabase/supabase-js`, usando os mapeadores de `src/services/api/mappers.ts`.
4. Trocar `localAuth` por um `supabaseAuth` com o mesmo contrato `AuthService`.
5. Trocar cada `dispatch` de escrita por *chamada ao repositório → dispatch do resultado*. As telas não mudam.
6. Excluir conta: criar `/api/account` (função no servidor com a `SUPABASE_SERVICE_ROLE_KEY`), que chama `auth.admin.deleteUser`.
