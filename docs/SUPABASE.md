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

No Supabase, a migração foi aplicada em 4 passos (`list_migrations`): `gamora_schema`, `gamora_rls_storage`, `gamora_fk_indexes` e `gamora_grants`. O arquivo `0001_init.sql` contém tudo isso junto.

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
- Segurança: um aviso, *Leaked password protection*. Ligue em Authentication → Sign In / Providers → Password. Pode depender do plano.

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

**Próximo passo (ainda não feito): ligar o app ao banco**

- [ ] `npm install @supabase/supabase-js` e ativar `src/services/supabase/client.ts`
- [ ] Implementar `DataApi` (`src/services/api/contracts.ts`) com os mapeadores prontos
- [ ] Trocar `localAuth` por Supabase Auth; enviar a foto para `avatars/<uid>/` no Editar perfil
- [ ] Criar `/api/account` (service role) para excluir conta
- [ ] Na Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_DATA_SOURCE=supabase`
