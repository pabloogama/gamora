# Banco de dados — Supabase

Projeto **Gamora** · ref `uwthinqxfdmfunzbcyti` · região us-east-2 · Postgres 17.
URL: `https://uwthinqxfdmfunzbcyti.supabase.co`

| Arquivo | O que é |
|---|---|
| `supabase/migrations/0001_init.sql` | **Fonte da verdade**: tipos, tabelas, constraints, triggers, views, RPCs, RLS, GRANTs e Storage |
| `supabase/seed/demo.sql` | Dados de demonstração (temporários); também mostra como apagar |
| `prisma/schema.prisma` | Espelho do banco para o Prisma (documentação e client tipado no servidor) |
| `supabase/tests/api-crud.test.mjs` | Validação pela API real: CRUD, RLS, Storage e RPCs (61 verificações) |
| `supabase/tests/crud_rls.test.sql` | Os mesmos testes num Postgres puro, sem Supabase |
| `docs/CRUD.md` | Cada operação: tela → ação do store → contrato → tabela → política |
| `src/services/supabase/` | O app conectado: `client.ts`, `auth.ts` (Supabase Auth) e `data.ts` (ler e gravar) |
| `supabase/migrations/0002_app_rpcs.sql` | RPCs do app: `import_invoice` com arquivo, `delete_my_account`, `reset_demo` |
| `supabase/migrations/0003_admin_role.sql` | Papel de administrador (`is_admin()` e políticas dono-ou-admin) |
| `tests/e2e/supabase-admin.cjs` | Admin: acesso a todas as contas pela API, tela só com os próprios dados (11 verificações) |
| `tests/e2e/supabase.cjs` · `supabase-conta.cjs` | O app no navegador, conferindo cada gravação no banco (28 + 14 verificações) |

No Supabase, as migrações aparecem em 5 passos (`list_migrations`): `gamora_schema`, `gamora_rls_storage`, `gamora_fk_indexes` e `gamora_grants` (que juntos são o `0001_init.sql`), mais `gamora_app_rpcs` (o `0002_app_rpcs.sql`).

## Como o app usa o banco

Com `VITE_DATA_SOURCE=supabase`, o app lê e grava tudo no Supabase:

| Momento | O que acontece |
|---|---|
| Abrir o app | O supabase-js recupera a sessão salva e `loadRemote` lê os dados da conta. O RLS garante que só voltam os dados dela |
| Entrar | `signInWithPassword` e depois os dados do banco |
| Criar conta | `signUp` com nome e saldo inicial; o trigger cria o profile |
| Qualquer ação (criar, editar, apagar) | A tela muda na hora e `syncRemote` grava no banco, uma ação de cada vez |
| O banco recusa ou cai a conexão | Aviso em destaque, e os dados são relidos do servidor |
| Editar perfil | Nome e foto vão para `profiles` + `avatars/<uid>/`. Trocar o e-mail manda um link de confirmação |
| Ler fatura | O arquivo vai para `invoices/<uid>/` e a RPC `import_invoice` grava a importação e os lançamentos |
| Excluir conta | Confere a senha, apaga os arquivos do Storage e chama a RPC `delete_my_account` (cascata) |
| Restaurar dados de exemplo | Na demo, a RPC `reset_demo` recria o seed. Numa conta comum, apaga os dados e mantém o perfil |

Com `VITE_DATA_SOURCE=local`, o app volta ao protótipo offline: contas e dados no navegador. Esse modo é o usado pelo Storybook e pelos testes de interface.

**Na Vercel**, cadastre em *Settings → Environment Variables*:

| Variável | Valor |
|---|---|
| `VITE_DATA_SOURCE` | `supabase` |
| `VITE_SUPABASE_URL` | `https://uwthinqxfdmfunzbcyti.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | a chave **publicável** (`sb_publishable_…`), em Supabase → Project Settings → API Keys |

Depois do deploy, ajuste o Supabase em Authentication → URL Configuration:

- **Site URL:** coloque a URL da Vercel.
- **Redirect URLs:** coloque a URL da Vercel. Assim, os links de confirmação de e-mail voltam para o app.

**Cadastro e e-mail:** o Supabase vem com *Confirm email* ligado.

- Quem se cadastra recebe um link e só entra depois de confirmar. O app mostra esse aviso na tela de login.
- O envio padrão do Supabase tem limite baixo de e-mails por hora.
- Para testes, desligue em Authentication → Sign In / Providers → Email → *Confirm email*.
- Para produção, configure um SMTP próprio.

## Acesso e administrador

- **Quem entra:** só quem se cadastra ou já tem login e senha. No modo conectado, a tela de login não mostra mais o atalho da conta demo. A conta demo continua no banco.
- **Administrador:** `app_metadata.app_role = 'admin'`, um campo que só o SQL ou o servidor altera.
  - **No banco:** as políticas valem para o dono **ou** para o admin (`public.is_admin()`). Então o admin vê, edita e apaga dados de todas as contas, e vê e apaga arquivos do Storage.
  - **Na tela:** o app sempre filtra por `user_id`. O admin vê só os dados dele e um selo "Administrador" na folha Conta.
  - **Conta admin atual:** a conta pessoal do dono do projeto (criada já confirmada, com cópia dos dados de exemplo). O e-mail e a senha provisória **não** estão no repositório. Troque a senha em Conta → Alterar senha.
  - **Promover ou rebaixar:** comandos em `supabase/migrations/0003_admin_role.sql`. A mudança vale no próximo login.
- **"Restaurar dados de exemplo"** só aparece na demo. Nas outras contas, o botão se chama **"Começar do zero"** e pede confirmação antes de apagar os lançamentos.

## Modelo

```
auth.users ─┬─ profiles (1:1)           saldo = base_balance − gastos − depósitos  → view account_summary
            ├─ cards ──────────┬─ transactions (card_id → null se o cartão for apagado)
            │                  └─ invoice_imports ── transactions (cascata: desfazer apaga os lançamentos)
            ├─ budgets (único por categoria)
            ├─ goals ── goal_deposits (FK composta goal_id+user_id; cascata)  → view goal_progress
            └─ assistant_messages
   excluir a conta (auth.users) ⇒ apaga tudo em cascata
```

| Tabela | Linhas da demo | Criar | Ver | Editar | Apagar |
|---|---|---|---|---|---|
| `profiles` | 1 | trigger no cadastro | ✅ | ✅ só nome, foto, saldo, teto, ocultar, tema | cascata de `auth.users` |
| `cards` | 3 | ✅ | ✅ | ✅ | ✅ |
| `transactions` | 17 (10 deste mês, 7 do anterior) | ✅ | ✅ | ✅ | ✅ |
| `invoice_imports` | 0 | RPC `import_invoice` | ✅ | — (edita-se cada lançamento) | RPC `undo_invoice_import` |
| `budgets` | 4 | ✅ (upsert) | ✅ | ✅ | ✅ |
| `goals` | 4 | ✅ | ✅ (`goal_progress`) | ✅ | ✅ |
| `goal_deposits` | 3 | ✅ | ✅ | ✅ | ✅ |
| `assistant_messages` | 0 | ✅ | ✅ | — (mensagens não se editam) | ✅ |

## Segurança

**Acesso às tabelas**

- **RLS ligado nas 8 tabelas.** Cada operação tem uma política própria, sempre com `user_id = (select auth.uid())`. São 29 políticas.
- **GRANTs explícitos** (projetos novos do Supabase não liberam as tabelas sozinhos):
  - `authenticated` recebe só as operações que o app usa;
  - `anon` (sem login) não acessa nada.

**Regras que impedem misturar contas**

- Um gasto não pode usar o cartão de outra pessoa (trigger `check_card_owner`).
- Um depósito não pode ir para a meta de outra pessoa (FK composta).

**Funções**

- Todas têm `search_path` fixo.
- As RPCs rodam com as permissões de quem chama (`security invoker`, então o RLS vale) e só usuários logados as executam.

**Avisos do Supabase (advisors)**

- Desempenho: nenhum aviso.
- Segurança: dois avisos.
  - `delete_my_account` roda como `security definer`. É intencional: apagar em `auth.users` exige isso, e a função só apaga a conta de quem chama.
  - *Leaked password protection*. Ligue em Authentication → Sign In / Providers → Password. Pode depender do plano.

## Storage

| Bucket | Acesso | Limite | Caminho | Políticas |
|---|---|---|---|---|
| `avatars` | público (a foto abre por URL) | 2 MB · webp/jpeg/png | `avatars/<uid>/avatar.webp` | listar, enviar, trocar e apagar só na própria pasta |
| `invoices` | **privado** (URL assinada) | 10 MB · pdf/jpeg/png/webp/heic | `invoices/<uid>/<arquivo>` | ler, enviar, trocar e apagar só na própria pasta |

A foto da demo já está em `avatars/6a6f6d6f-0000-4000-8000-000000000001/avatar.webp`, e `profiles.avatar_url` aponta para ela.

## Dados de demonstração

**Conta:** `pablo@gamora.app` / `gamora123` (já confirmada). Os números são os do briefing:

- saldo R$ 14.500;
- gastos do mês R$ 2.340 (−12% vs. R$ 2.659 no mês passado);
- faturas R$ 1.284 / R$ 640 / R$ 98;
- teto do mês R$ 3.200;
- Japão R$ 13.600 de R$ 20.000.

As datas são relativas ao dia em que o seed roda. Para recriar a demo (por exemplo, num mês novo), rode `supabase/seed/demo.sql` no SQL Editor.

**Para apagar quando entrarem dados reais:**

```sql
delete from auth.users where id = '6a6f6d6f-0000-4000-8000-000000000001'; -- apaga tudo da demo em cascata
```

Depois, apague a pasta `avatars/6a6f6d6f-0000-4000-8000-000000000001` em Storage.

## Prisma

`prisma/schema.prisma` espelha o banco. Conferido com `prisma validate` e com `prisma db pull`: as colunas das 8 tabelas e das 3 views batem.

- **Não use `prisma migrate` neste banco.** RLS, triggers, RPCs e Storage só existem no SQL. Para conferir, use `prisma db pull`.
- O Prisma conecta como `postgres` e **ignora o RLS**. Use só no servidor (`/api`) e sempre filtre por `userId`.
- O app no navegador usa `supabase-js` com a chave publicável, e o RLS protege os dados.

## Rodar a validação de novo

A validação usa a conta demo e uma segunda conta para testar o isolamento. Crie a segunda conta no SQL Editor (o bloco abaixo) e apague-a no fim. O teste deixa a demo exatamente como estava.

```sql
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', '6a6f6d6f-0000-4000-8000-0000000000b2', 'authenticated', 'authenticated', 'teste-rls@gamora.app', extensions.crypt('teste-rls-123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Teste RLS"}', now(), now(), '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), '6a6f6d6f-0000-4000-8000-0000000000b2', '6a6f6d6f-0000-4000-8000-0000000000b2', '{"sub":"6a6f6d6f-0000-4000-8000-0000000000b2","email":"teste-rls@gamora.app","email_verified":true}', 'email', now(), now(), now());
```

```bash
SUPABASE_URL=https://uwthinqxfdmfunzbcyti.supabase.co SUPABASE_KEY=<chave publicável> node supabase/tests/api-crud.test.mjs
```

```sql
delete from auth.users where email = 'teste-rls@gamora.app';
```

---

## Checklist do banco

**Estrutura**

- [x] 6 tipos enum: categoria, cor do cartão, forma de pagamento, origem, papel no chat, tema
- [x] 8 tabelas com colunas, `not null`, `check` e valores padrão
- [x] Chaves estrangeiras com a regra certa de exclusão (`cascade` ou `set null`) e índices em todas elas
- [x] `updated_at` automático em 6 tabelas
- [x] Profile criado sozinho no cadastro (lê nome e saldo inicial de `options.data`)
- [x] Fatura do cartão soma, ajusta e desconta junto com os gastos (trigger)
- [x] 3 views com permissões de quem consulta: `goal_progress`, `account_summary`, `monthly_totals`
- [x] 2 RPCs transacionais: `import_invoice` e `undo_invoice_import`

**Segurança**

- [x] RLS nas 8 tabelas, com 29 políticas por operação
- [x] GRANTs mínimos para `authenticated` e nenhum para `anon`
- [x] Isolamento entre contas testado pela API: ver, editar, apagar, gravar em nome de outra conta, usar o cartão de outra conta
- [x] Sem login, nada é lido nem gravado
- [x] Avisos de segurança do Supabase sem pendências de banco
- [ ] Ligar *Leaked password protection* no painel do Auth (você)

**Storage**

- [x] Bucket `avatars` público, com escrita só na própria pasta
- [x] Bucket `invoices` privado, sem URL pública, com leitura só da dona
- [x] Foto da demo enviada e ligada ao profile

**CRUD validado pela API real (61 de 61)**

- [x] Cartões C/R/U/D + validação do dia de vencimento
- [x] Lançamentos C/R/U/D + filtros + validações (valor > 0, Pix sem cartão) + efeito na fatura
- [x] Faturas importadas: importar, ver, desfazer
- [x] Metas C/R/U/D + depósitos C/R/U/D + saldo e progresso nas views + cascata
- [x] Tetos C/R/U/D (upsert por categoria)
- [x] Perfil: editar teto, ocultar valores e tema; criar profile pela API é bloqueado
- [x] Mensagens do assistente: criar, ver, apagar; editar é bloqueado
- [x] Demo intacta depois do teste (saldo R$ 14.500, faturas 1.284/640/98)

**Documentação**

- [x] Schema Prisma validado e conferido contra o banco
- [x] `.env` local com URL e chave publicável; `.env.example` com `DATABASE_URL` e `DIRECT_URL`
- [x] Seed da demo versionado e reaplicável, com instrução para apagar

**App conectado (testado no navegador)**

- [x] Login, sessão salva (continua logado ao recarregar) e sair
- [x] Dados da demo carregados do banco: saldo, −12% vs. mês anterior, cartões, metas, tetos, foto
- [x] Gastos, cartões, metas, depósitos e tetos: cada criar, editar e apagar conferido no banco
- [x] Fatura: importação, 34 lançamentos e arquivo no Storage; desfazer apaga os três
- [x] Assistente: conversa gravada e apagada
- [x] Perfil: ocultar valores, ajustar saldo, nome e foto (Storage)
- [x] Alterar senha (a antiga para de funcionar) e excluir conta (login, dados e foto somem)
- [x] Restaurar dados de exemplo (RPC `reset_demo`); "Começar do zero" com confirmação nas outras contas
- [x] Login sem atalho da demo: só entra quem tem conta
- [x] Admin: acessa todas as contas pela API, conta comum continua isolada, tela do admin só com os dados dele
- [x] Saldo inicial do cadastro chega ao profile (conferido pelo trigger, com uma conta criada no SQL)
- [ ] Cadastro pela tela com e-mail real: não testado, para não enviar e-mail a endereços falsos
- [ ] Variáveis na Vercel e URLs do Auth (você, no deploy)
