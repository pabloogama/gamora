-- ════════════════════════════════════════════════════════════════════
--  Gamora · RPCs usadas pelo app conectado (aplicada no Supabase como gamora_app_rpcs)
--  • import_invoice ganha p_import_id (id gerado no aparelho) e p_file_path (Storage)
--  • delete_my_account: excluir a conta pelo app, sem servidor
--  • reset_demo: "Restaurar dados de exemplo" — só a conta demo
-- ════════════════════════════════════════════════════════════════════

drop function if exists public.import_invoice(uuid, text, jsonb);
create or replace function public.import_invoice(p_card_id uuid, p_file_name text, p_items jsonb, p_import_id uuid default null, p_file_path text default null)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  v_import uuid := coalesce(p_import_id, gen_random_uuid());
  v_prev   numeric(12,2);
  v_total  numeric(12,2);
begin
  select invoice into v_prev from cards where id = p_card_id for update;
  if not found then raise exception 'cartão não encontrado' using errcode = 'P0002'; end if;
  select coalesce(sum((i->>'amount')::numeric), 0) into v_total from jsonb_array_elements(p_items) i;

  insert into invoice_imports (id, card_id, file_name, file_path, total, item_count, previous_invoice)
  values (v_import, p_card_id, p_file_name, p_file_path, v_total, jsonb_array_length(p_items), v_prev);

  insert into transactions (id, name, category, method, card_id, date, amount, source, invoice_import_id, is_subscription)
  select coalesce((i->>'id')::uuid, gen_random_uuid()), i->>'name', (i->>'category')::category, 'card', p_card_id,
         (i->>'date')::date, (i->>'amount')::numeric, 'invoice', v_import, coalesce((i->>'is_subscription')::boolean, false)
    from jsonb_array_elements(p_items) i;

  update cards set invoice = v_total where id = p_card_id;
  return v_import;
end $$;
revoke execute on function public.import_invoice(uuid, text, jsonb, uuid, text) from public, anon;
grant  execute on function public.import_invoice(uuid, text, jsonb, uuid, text) to authenticated;

-- Excluir a conta pelo app: apaga auth.users da própria pessoa (tudo sai em cascata).
-- Os arquivos do Storage são apagados pelo app antes (pela Storage API).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'sem sessão' using errcode = '42501'; end if;
  delete from auth.users where id = v_uid;
end $$;
comment on function public.delete_my_account() is 'SECURITY DEFINER intencional: apagar auth.users exige privilégio; só apaga a conta de quem chama (auth.uid()).';
revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;

-- "Restaurar dados de exemplo": só para a conta demo. Apaga os dados dela e recria o seed
-- (mesmos números de supabase/seed/demo.sql).
-- security invoker: só mexe nos dados da própria conta demo, então o RLS basta
create or replace function public.reset_demo()
returns void language plpgsql security invoker set search_path = '' as $$
declare
  u   constant uuid := '6a6f6d6f-0000-4000-8000-000000000001';
  c1  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000c1';
  c2  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000c2';
  c3  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000c3';
  gj  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000a1';
  gr  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000a2';
  gc  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000a3';
  gv  constant uuid := '6a6f6d6f-0000-4000-8000-0000000000a4';
  today date := current_date;
  m0 date := date_trunc('month', current_date)::date;
  lm date := (date_trunc('month', current_date) - interval '1 month')::date;
begin
  if auth.uid() is distinct from u then raise exception 'só a conta demo pode restaurar os dados de exemplo' using errcode = '42501'; end if;

  delete from public.assistant_messages where user_id = u;
  delete from public.goal_deposits where user_id = u;
  delete from public.goals where user_id = u;
  delete from public.budgets where user_id = u;
  delete from public.transactions where user_id = u;
  delete from public.invoice_imports where user_id = u;
  delete from public.cards where user_id = u;

  update public.profiles
     set name = 'Pablo Gama', base_balance = 14500 + 2340 + 2659 + 1250, month_cap = 3200, hide_balance = false,
         avatar_url = 'https://uwthinqxfdmfunzbcyti.supabase.co/storage/v1/object/public/avatars/' || u || '/avatar.webp'
   where id = u;

  insert into public.cards (id, user_id, nickname, last4, credit_limit, due_day, color) values
    (c1, u, 'Principal', '4552', 3000, extract(day from today + 8)::int,  'gradient'),
    (c2, u, 'Salário',   '6917', 2500, extract(day from today + 12)::int, 'lilac'),
    (c3, u, 'Viagem',    '1180', 1500, extract(day from today + 27)::int, 'offwhite');

  insert into public.transactions (user_id, name, category, method, card_id, date, amount) values
    (u, 'Mercado',           'alimentacao', 'card',     c1,   today,                    412.80),
    (u, 'Netflix',           'assinaturas', 'card',     c1,   today,                     55.90),
    (u, 'Uber',              'transporte',  'pix',      null, greatest(m0, today - 1),   38.40),
    (u, 'iFood',             'alimentacao', 'card',     c2,   greatest(m0, today - 1),   89.00),
    (u, 'Spotify',           'assinaturas', 'card',     c3,   greatest(m0, today - 3),   21.90),
    (u, 'Restaurante',       'alimentacao', 'card',     c2,   greatest(m0, today - 4),  158.00),
    (u, 'Posto de gasolina', 'transporte',  'card',     c1,   greatest(m0, today - 6),  220.00),
    (u, 'Cinema',            'lazer',       'dinheiro', null, greatest(m0, today - 8),   64.00),
    (u, 'Conta de luz',      'moradia',     'pix',      null, greatest(m0, today - 10),  80.00),
    (u, 'Aluguel',           'moradia',     'pix',      null, greatest(m0, today - 16), 1200.00);

  insert into public.transactions (user_id, name, category, method, date, amount) values
    (u, 'Aluguel',      'moradia',     'pix',      lm + 4,  1200.00),
    (u, 'Mercado',      'alimentacao', 'pix',      lm + 6,   689.30),
    (u, 'Conta de luz', 'moradia',     'pix',      lm + 9,    92.40),
    (u, 'Uber',         'transporte',  'pix',      lm + 12,  187.60),
    (u, 'Netflix',      'assinaturas', 'pix',      lm + 14,   55.90),
    (u, 'Restaurante',  'alimentacao', 'pix',      lm + 18,  246.00),
    (u, 'Farmácia',     'saude',       'dinheiro', lm + 21,  187.80);

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
    (u, gj, 500, greatest(m0, today - 2)), (u, gj, 500, greatest(m0, today - 9)), (u, gr, 250, greatest(m0, today - 5));
end $$;
revoke execute on function public.reset_demo() from public, anon;
grant  execute on function public.reset_demo() to authenticated;
