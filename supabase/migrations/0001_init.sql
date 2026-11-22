-- ════════════════════════════════════════════════════════════════════
--  Gamora · schema inicial — PRONTO, AINDA NÃO APLICADO
--
--  Espelha src/types/finance.ts (domínio) e src/types/database.ts (linhas).
--  Mapa tela → ação → tabela → política: docs/CRUD.md
--
--  Regras gerais
--  • Valores em reais: numeric(12,2). Gastos são sempre positivos.
--  • Toda tabela tem user_id (ou id = auth.uid() em profiles) e RLS com
--    4 políticas explícitas: select · insert · update · delete.
--  • ids são uuid; o app já gera UUID v4 no aparelho (lib/format.ts → uid),
--    então um insert pode mandar o id criado offline.
--  • Campos derivados (quanto a meta já tem, saldo) NÃO são colunas:
--    ficam nas views goal_progress e account_summary.
--  • Excluir a conta (auth.users) apaga tudo em cascata.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── tipos ──────────────────────────────────────────────────────────
create type public.category as enum
  ('moradia','alimentacao','transporte','lazer','assinaturas','saude','outros');
create type public.card_color as enum ('gradient','lilac','offwhite');
create type public.pay_method as enum ('card','pix','dinheiro');
create type public.tx_source  as enum ('manual','invoice');
create type public.chat_role  as enum ('user','assistant');
create type public.theme      as enum ('light','dark');

-- ─── updated_at automático ──────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ════════════════════════════════════════════════════════════════════
--  profiles — 1 linha por conta (criada no signup pelo trigger abaixo)
--  C: trigger on_auth_user_created · R/U: tela Conta, Editar perfil,
--  Ajustar saldo, Teto do mês · D: em cascata ao excluir a conta
-- ════════════════════════════════════════════════════════════════════
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  name          text not null check (char_length(name) between 1 and 40),
  avatar_url    text,                                  -- Storage: avatars/<uid>/...
  base_balance  numeric(12,2) not null default 0,      -- saldo = base − gastos − depósitos
  month_cap     numeric(12,2) not null default 0 check (month_cap >= 0), -- 0 = sem teto
  hide_balance  boolean not null default false,
  theme         public.theme not null default 'light',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- cria o profile no cadastro (signUp manda { name, starting_balance } em options.data)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, base_balance)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'starting_balance')::numeric, 0)
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════
--  cards — CRUD completo na tela Cartões (folha Novo/Editar cartão)
-- ════════════════════════════════════════════════════════════════════
create table public.cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  nickname      text not null check (char_length(nickname) between 1 and 20),
  last4         char(4) not null check (last4 ~ '^\d{4}$'),
  invoice       numeric(12,2) not null default 0 check (invoice >= 0), -- fatura atual (à mão + gastos no cartão)
  credit_limit  numeric(12,2) not null check (credit_limit > 0),
  due_day       smallint not null default 10 check (due_day between 1 and 31), -- "vence em N dias" é calculado
  color         public.card_color not null default 'lilac',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (id, user_id)
);
create index cards_user on public.cards (user_id);

-- ════════════════════════════════════════════════════════════════════
--  invoice_imports — Estágio 2. C: confirmar leitura de fatura
--  R: Cartões → Faturas importadas · D: Desfazer importação
--  (apaga os lançamentos dela em cascata; o app devolve a fatura anterior)
--  U: não se edita uma importação — edita-se cada lançamento dela.
-- ════════════════════════════════════════════════════════════════════
create table public.invoice_imports (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users on delete cascade,
  card_id           uuid,
  file_name         text not null,
  total             numeric(12,2) not null check (total >= 0),
  item_count        integer not null check (item_count >= 0),
  previous_invoice  numeric(12,2) not null default 0,
  imported_at       timestamptz not null default now(),
  unique (id, user_id),
  -- cartão removido: a importação continua no histórico, sem cartão
  foreign key (card_id) references public.cards (id) on delete set null
);
create index invoice_imports_user on public.invoice_imports (user_id, imported_at desc);

-- ════════════════════════════════════════════════════════════════════
--  transactions — CRUD completo: Adicionar gasto · Extrato/Detalhe ·
--  Editar gasto · Apagar gasto
-- ════════════════════════════════════════════════════════════════════
create table public.transactions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users on delete cascade,
  name               text not null check (char_length(name) between 1 and 40),
  category           public.category not null,
  method             public.pay_method not null,
  card_id            uuid,                        -- só quando method = 'card'
  date               date not null default current_date,
  amount             numeric(12,2) not null check (amount > 0),
  source             public.tx_source not null default 'manual',
  invoice_import_id  uuid references public.invoice_imports on delete cascade,
  is_subscription    boolean not null default false,
  note               text check (char_length(note) <= 120),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- cartão apagado: o gasto fica no histórico como "Cartão removido"
  foreign key (card_id) references public.cards (id) on delete set null,
  constraint card_only_for_card check (method = 'card' or card_id is null),
  constraint import_only_for_invoice check (source = 'invoice' or invoice_import_id is null)
);
create index transactions_user_date on public.transactions (user_id, date desc);
create index transactions_card on public.transactions (card_id) where card_id is not null;
create index transactions_import on public.transactions (invoice_import_id) where invoice_import_id is not null;

-- ════════════════════════════════════════════════════════════════════
--  budgets — tetos por categoria. C: Novo teto · R: Metas · U: Ajustar
--  teto · D: Remover teto. (O teto do mês inteiro é profiles.month_cap.)
-- ════════════════════════════════════════════════════════════════════
create table public.budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  category      public.category not null,
  limit_amount  numeric(12,2) not null check (limit_amount > 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, category)  -- upsert on conflict (user_id, category)
);

-- ════════════════════════════════════════════════════════════════════
--  goals — CRUD completo: Nova meta · Detalhe da meta · Editar · Apagar
--  (apagar a meta apaga os depósitos ⇒ o valor volta para o saldo)
-- ════════════════════════════════════════════════════════════════════
create table public.goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  name           text not null check (char_length(name) between 1 and 30),
  target         numeric(12,2) not null check (target > 0),
  initial_saved  numeric(12,2) not null default 0 check (initial_saved >= 0), -- guardado fora do app
  target_month   date check (target_month = date_trunc('month', target_month)::date), -- 1º dia do mês
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (id, user_id)
);
create index goals_user on public.goals (user_id);

-- ════════════════════════════════════════════════════════════════════
--  goal_deposits — CRUD completo: Guardar · Detalhe da meta (histórico)
--  · Editar depósito · Apagar depósito. Cada depósito sai do saldo.
-- ════════════════════════════════════════════════════════════════════
create table public.goal_deposits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  goal_id     uuid not null,
  amount      numeric(12,2) not null check (amount > 0),
  date        date not null default current_date,
  note        text check (char_length(note) <= 40),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- a meta precisa ser da mesma pessoa (FK composta com user_id)
  foreign key (goal_id, user_id) references public.goals (id, user_id) on delete cascade
);
create index goal_deposits_goal on public.goal_deposits (goal_id, date desc);

-- ════════════════════════════════════════════════════════════════════
--  assistant_messages — Estágio 2. C: enviar pergunta / resposta
--  R: tela Assistente · D: Nova conversa (apaga tudo da pessoa).
--  U: mensagens não são editadas.
-- ════════════════════════════════════════════════════════════════════
create table public.assistant_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  role        public.chat_role not null,
  content     text not null check (char_length(content) <= 4000),
  created_at  timestamptz not null default now()
);
create index assistant_messages_user on public.assistant_messages (user_id, created_at);

-- ─── triggers de updated_at ─────────────────────────────────────────
create trigger profiles_updated      before update on public.profiles      for each row execute function public.set_updated_at();
create trigger cards_updated         before update on public.cards         for each row execute function public.set_updated_at();
create trigger transactions_updated  before update on public.transactions  for each row execute function public.set_updated_at();
create trigger budgets_updated       before update on public.budgets       for each row execute function public.set_updated_at();
create trigger goals_updated         before update on public.goals         for each row execute function public.set_updated_at();
create trigger goal_deposits_updated before update on public.goal_deposits for each row execute function public.set_updated_at();

-- ─── cartão do gasto/importação precisa ser da mesma pessoa ─────────
create or replace function public.check_card_owner() returns trigger
language plpgsql as $$
begin
  if new.card_id is not null and not exists (
    select 1 from public.cards c where c.id = new.card_id and c.user_id = new.user_id
  ) then
    raise exception 'card % não pertence a este usuário', new.card_id using errcode = '42501';
  end if;
  return new;
end $$;
create trigger transactions_card_owner before insert or update of card_id on public.transactions
  for each row execute function public.check_card_owner();
create trigger invoice_imports_card_owner before insert or update of card_id on public.invoice_imports
  for each row execute function public.check_card_owner();

-- ─── gasto no cartão soma na fatura dele (igual ao reducer: bumpInvoice) ──
create or replace function public.bump_card_invoice() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if tg_op in ('UPDATE','DELETE') and old.card_id is not null then
    update cards set invoice = greatest(0, invoice - old.amount) where id = old.card_id;
  end if;
  if tg_op in ('INSERT','UPDATE') and new.card_id is not null then
    update cards set invoice = invoice + new.amount where id = new.card_id;
  end if;
  return null;
end $$;
create trigger transactions_bump_invoice after insert or delete or update of amount, card_id on public.transactions
  for each row execute function public.bump_card_invoice();

-- ════════════════════════════════════════════════════════════════════
--  RPCs transacionais da fatura (Estágio 2). security invoker: o RLS vale.
-- ════════════════════════════════════════════════════════════════════
-- p_items: [{ "id": uuid?, "name", "category", "date", "amount", "is_subscription" }]
create or replace function public.import_invoice(p_card_id uuid, p_file_name text, p_items jsonb)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  v_import uuid;
  v_prev   numeric(12,2);
  v_total  numeric(12,2);
begin
  select invoice into v_prev from cards where id = p_card_id for update;
  if not found then raise exception 'cartão não encontrado' using errcode = 'P0002'; end if;
  select coalesce(sum((i->>'amount')::numeric), 0) into v_total from jsonb_array_elements(p_items) i;

  insert into invoice_imports (card_id, file_name, total, item_count, previous_invoice)
  values (p_card_id, p_file_name, v_total, jsonb_array_length(p_items), v_prev)
  returning id into v_import;

  insert into transactions (id, name, category, method, card_id, date, amount, source, invoice_import_id, is_subscription)
  select coalesce((i->>'id')::uuid, gen_random_uuid()), i->>'name', (i->>'category')::category, 'card', p_card_id,
         (i->>'date')::date, (i->>'amount')::numeric, 'invoice', v_import, coalesce((i->>'is_subscription')::boolean, false)
    from jsonb_array_elements(p_items) i;

  update cards set invoice = v_total where id = p_card_id; -- a fatura passa a ser o total lido
  return v_import;
end $$;

-- desfaz: os lançamentos saem por cascata e a fatura do cartão volta ao valor anterior
create or replace function public.undo_invoice_import(p_import_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare r invoice_imports%rowtype;
begin
  select * into r from invoice_imports where id = p_import_id;
  if not found then raise exception 'importação não encontrada' using errcode = 'P0002'; end if;
  delete from invoice_imports where id = p_import_id; -- lançamentos saem em cascata (o trigger desconta)
  if r.card_id is not null then update cards set invoice = r.previous_invoice where id = r.card_id; end if;
end $$;

-- ════════════════════════════════════════════════════════════════════
--  Views (security_invoker: respeitam o RLS de quem consulta)
-- ════════════════════════════════════════════════════════════════════
create view public.goal_progress with (security_invoker = true) as
  select g.*,
         coalesce(sum(d.amount), 0)                       as deposited,
         g.initial_saved + coalesce(sum(d.amount), 0)     as saved,
         count(d.id)                                      as deposit_count
    from public.goals g
    left join public.goal_deposits d on d.goal_id = g.id
   group by g.id;

create view public.account_summary with (security_invoker = true) as
  select p.id as user_id,
         p.base_balance,
         coalesce((select sum(amount) from public.transactions  t where t.user_id = p.id), 0) as spent_total,
         coalesce((select sum(amount) from public.goal_deposits d where d.user_id = p.id), 0) as moved_to_goals,
         p.base_balance
           - coalesce((select sum(amount) from public.transactions  t where t.user_id = p.id), 0)
           - coalesce((select sum(amount) from public.goal_deposits d where d.user_id = p.id), 0) as balance
    from public.profiles p;

create view public.monthly_totals with (security_invoker = true) as
  select user_id, date_trunc('month', date)::date as month, category, sum(amount) as total, count(*) as tx_count
    from public.transactions
   group by user_id, date_trunc('month', date), category;

-- ════════════════════════════════════════════════════════════════════
--  RLS — 4 políticas por tabela (uma por operação do CRUD)
-- ════════════════════════════════════════════════════════════════════
alter table public.profiles           enable row level security;
alter table public.cards              enable row level security;
alter table public.invoice_imports    enable row level security;
alter table public.transactions       enable row level security;
alter table public.budgets            enable row level security;
alter table public.goals              enable row level security;
alter table public.goal_deposits      enable row level security;
alter table public.assistant_messages enable row level security;

-- profiles: insert vem do trigger (security definer); delete vem da cascata de auth.users
create policy profiles_select on public.profiles for select using (id = auth.uid());
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['cards','invoice_imports','transactions','budgets','goals','goal_deposits','assistant_messages'] loop
    execute format('create policy %1$s_select on public.%1$s for select using (user_id = auth.uid())', t);
    execute format('create policy %1$s_insert on public.%1$s for insert with check (user_id = auth.uid())', t);
    execute format('create policy %1$s_update on public.%1$s for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('create policy %1$s_delete on public.%1$s for delete using (user_id = auth.uid())', t);
  end loop;
end $$;

-- mensagens do assistente não são editadas
drop policy assistant_messages_update on public.assistant_messages;

-- ════════════════════════════════════════════════════════════════════
--  Storage: fotos de perfil em avatars/<uid>/<arquivo>
-- ════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

create policy avatars_read   on storage.objects for select using (bucket_id = 'avatars');
create policy avatars_insert on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update on storage.objects for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete on storage.objects for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
