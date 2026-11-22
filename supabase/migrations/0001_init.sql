-- ──────────────────────────────────────────────────────────────
--  Gamora · schema inicial (Estágio 1) — PRONTO, AINDA NÃO APLICADO
--  Espelha src/types/finance.ts. Valores em reais: numeric(12,2).
--  Toda tabela tem RLS: cada pessoa só vê e altera o que é dela.
-- ──────────────────────────────────────────────────────────────

create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  name          text not null,
  base_balance  numeric(12,2) not null default 0,
  month_cap     numeric(12,2) not null default 0,
  hide_balance  boolean not null default false,
  created_at    timestamptz not null default now()
);

create type public.category as enum
  ('moradia','alimentacao','transporte','lazer','assinaturas','saude','outros');

create type public.card_color as enum ('gradient','lilac','offwhite');

create table public.cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade default auth.uid(),
  nickname     text not null check (char_length(nickname) <= 20),
  last4        char(4) not null check (last4 ~ '^\d{4}$'),
  invoice      numeric(12,2) not null default 0,
  credit_limit numeric(12,2) not null check (credit_limit > 0),
  due_in_days  smallint not null default 10,
  color        public.card_color not null default 'lilac',
  created_at   timestamptz not null default now()
);

create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade default auth.uid(),
  name        text not null,
  category    public.category not null,
  method      text not null,            -- id do cartão, 'pix' ou 'dinheiro'
  date        date not null default current_date,
  amount      numeric(12,2) not null check (amount > 0),
  source      text not null default 'manual' check (source in ('manual','invoice')), -- 'invoice' = estágio 2
  created_at  timestamptz not null default now()
);
create index transactions_user_date on public.transactions (user_id, date desc);

create table public.budgets (
  user_id   uuid not null references auth.users on delete cascade default auth.uid(),
  category  public.category not null,
  "limit"   numeric(12,2) not null check ("limit" > 0),
  primary key (user_id, category)
);

create table public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade default auth.uid(),
  name        text not null,
  target      numeric(12,2) not null check (target > 0),
  saved       numeric(12,2) not null default 0,
  date_label  text,
  created_at  timestamptz not null default now()
);

create table public.goal_deposits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade default auth.uid(),
  goal_id    uuid not null references public.goals on delete cascade,
  amount     numeric(12,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- RLS ---------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.cards         enable row level security;
alter table public.transactions  enable row level security;
alter table public.budgets       enable row level security;
alter table public.goals         enable row level security;
alter table public.goal_deposits enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own cards" on public.cards
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own transactions" on public.transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own budgets" on public.budgets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own goals" on public.goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own deposits" on public.goal_deposits
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
