-- ════════════════════════════════════════════════════════════════════
--  Gamora · dados de DEMONSTRAÇÃO (temporários)
--
--  Conta: pablo@gamora.app / gamora123 (já confirmada).
--  São os mesmos dados do protótipo (src/data/mocks.ts), com datas relativas
--  a hoje: saldo R$ 14.500, gastos do mês R$ 2.340 (−12% vs. mês anterior),
--  3 cartões, 4 tetos, 4 metas e 3 depósitos.
--
--  Idempotente: apaga a conta demo (e tudo dela, em cascata) e recria.
--  Para REMOVER de vez quando entrarem dados reais, rode só:
--    delete from auth.users where id = '6a6f6d6f-0000-4000-8000-000000000001';
--  e apague a pasta avatars/6a6f6d6f-0000-4000-8000-000000000001 no Storage.
-- ════════════════════════════════════════════════════════════════════
do $$
declare
  u   constant uuid := '6a6f6d6f-0000-4000-8000-000000000001';
  c1  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000c1'; -- Principal
  c2  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000c2'; -- Salário
  c3  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000c3'; -- Viagem
  gj  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000a1'; -- Viagem ao Japão
  gr  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000a2'; -- Reserva
  gc  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000a3'; -- Curso
  gv  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000a4'; -- Carro novo
  today date := current_date;
  -- datas "n dias atrás", sem voltar para o mês anterior (igual ao mock do app)
  d0 date; d1 date; d2 date; d3 date; d4 date; d5 date; d6 date; d8 date; d9 date; d10 date; d16 date;
  lm date := (date_trunc('month', current_date) - interval '1 month')::date; -- 1º dia do mês passado
begin
  d0 := today;
  d1  := greatest(date_trunc('month', today)::date, today - 1);
  d2  := greatest(date_trunc('month', today)::date, today - 2);
  d3  := greatest(date_trunc('month', today)::date, today - 3);
  d4  := greatest(date_trunc('month', today)::date, today - 4);
  d5  := greatest(date_trunc('month', today)::date, today - 5);
  d6  := greatest(date_trunc('month', today)::date, today - 6);
  d8  := greatest(date_trunc('month', today)::date, today - 8);
  d9  := greatest(date_trunc('month', today)::date, today - 9);
  d10 := greatest(date_trunc('month', today)::date, today - 10);
  d16 := greatest(date_trunc('month', today)::date, today - 16);

  delete from auth.users where id = u;

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', u, 'authenticated', 'authenticated', 'pablo@gamora.app',
          extensions.crypt('gamora123', extensions.gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"]}', '{"name":"Pablo Gama"}', now(), now(), '', '', '', '');

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), u, u::text,
          jsonb_build_object('sub', u::text, 'email', 'pablo@gamora.app', 'email_verified', true),
          'email', now(), now(), now());

  -- o trigger on_auth_user_created já criou o profile; completa os dados
  -- saldo = base − gastos − depósitos = 14.500
  update public.profiles
     set base_balance = 14500 + 2340 + 2659 + 1250,
         month_cap    = 3200,
         avatar_url   = 'https://uwthinqxfdmfunzbcyti.supabase.co/storage/v1/object/public/avatars/' || u || '/avatar.webp'
   where id = u;

  insert into public.cards (id, user_id, nickname, last4, credit_limit, due_day, color) values
    (c1, u, 'Principal', '4552', 3000, extract(day from today + 8)::int,  'gradient'),
    (c2, u, 'Salário',   '6917', 2500, extract(day from today + 12)::int, 'lilac'),
    (c3, u, 'Viagem',    '1180', 1500, extract(day from today + 27)::int, 'offwhite');

  -- mês atual: R$ 2.340
  insert into public.transactions (user_id, name, category, method, card_id, date, amount) values
    (u, 'Mercado',           'alimentacao', 'card',     c1,   d0,  412.80),
    (u, 'Netflix',           'assinaturas', 'card',     c1,   d0,   55.90),
    (u, 'Uber',              'transporte',  'pix',      null, d1,   38.40),
    (u, 'iFood',             'alimentacao', 'card',     c2,   d1,   89.00),
    (u, 'Spotify',           'assinaturas', 'card',     c3,   d3,   21.90),
    (u, 'Restaurante',       'alimentacao', 'card',     c2,   d4,  158.00),
    (u, 'Posto de gasolina', 'transporte',  'card',     c1,   d6,  220.00),
    (u, 'Cinema',            'lazer',       'dinheiro', null, d8,   64.00),
    (u, 'Conta de luz',      'moradia',     'pix',      null, d10,  80.00),
    (u, 'Aluguel',           'moradia',     'pix',      null, d16, 1200.00);

  -- mês passado: R$ 2.659 (dá o "−12%" da Home)
  insert into public.transactions (user_id, name, category, method, date, amount) values
    (u, 'Aluguel',      'moradia',     'pix',      lm + 4,  1200.00),
    (u, 'Mercado',      'alimentacao', 'pix',      lm + 6,   689.30),
    (u, 'Conta de luz', 'moradia',     'pix',      lm + 9,    92.40),
    (u, 'Uber',         'transporte',  'pix',      lm + 12,  187.60),
    (u, 'Netflix',      'assinaturas', 'pix',      lm + 14,   55.90),
    (u, 'Restaurante',  'alimentacao', 'pix',      lm + 18,  246.00),
    (u, 'Farmácia',     'saude',       'dinheiro', lm + 21,  187.80);

  -- a fatura de cada cartão é o valor digitado (o trigger somou as compras; fixa no valor do briefing)
  update public.cards set invoice = 1284 where id = c1;
  update public.cards set invoice = 640  where id = c2;
  update public.cards set invoice = 98   where id = c3;

  insert into public.budgets (user_id, category, limit_amount) values
    (u, 'alimentacao', 1064), (u, 'moradia', 1280), (u, 'transporte', 646), (u, 'lazer', 82);

  insert into public.goals (id, user_id, name, target, initial_saved, target_month) values
    (gj, u, 'Viagem ao Japão', 20000, 12600, '2027-12-01'),
    (gr, u, 'Reserva',         10000,  6950, null),
    (gc, u, 'Curso',            3000,  2700, null),
    (gv, u, 'Carro novo',      40000,  9600, null);

  insert into public.goal_deposits (user_id, goal_id, amount, date) values
    (u, gj, 500, d2), (u, gj, 500, d9), (u, gr, 250, d5);
end $$;

-- conferência
select p.name, s.balance, p.month_cap,
       (select sum(amount) from public.transactions t where t.user_id = p.id and date_trunc('month', t.date) = date_trunc('month', current_date)) as gasto_mes,
       (select sum(amount) from public.transactions t where t.user_id = p.id and date_trunc('month', t.date) = date_trunc('month', current_date) - interval '1 month') as gasto_mes_passado
  from public.profiles p join public.account_summary s on s.user_id = p.id
 where p.id = '6a6f6d6f-0000-4000-8000-000000000001';
