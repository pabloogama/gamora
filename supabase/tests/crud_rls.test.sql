-- Testes do CRUD + RLS. Roda num Postgres puro com supabase/tests/_supabase_stub.sql (ver supabase/tests/README.md).
\set ON_ERROR_STOP on
-- os GRANTs vêm da migração
grant execute on all functions in schema public to authenticated;
-- duas contas (o trigger cria os profiles)
insert into auth.users (id, email, raw_user_meta_data) values
 ('11111111-1111-1111-1111-111111111111','a@x.com','{"name":"Pablo Gama","starting_balance":"1000"}'),
 ('22222222-2222-2222-2222-222222222222','b@x.com','{"name":"Bia"}');
select 'profiles criados', count(*) from profiles;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
-- C
insert into cards (id,nickname,last4,credit_limit,due_day) values ('aaaaaaaa-0000-0000-0000-000000000001','Principal','4552',3000,15);
insert into transactions (name,category,method,card_id,amount) values ('Mercado','alimentacao','card','aaaaaaaa-0000-0000-0000-000000000001',100),('Uber','transporte','pix',null,40);
insert into goals (id,name,target,initial_saved,target_month) values ('bbbbbbbb-0000-0000-0000-000000000001','Japão',20000,12600,'2027-12-01');
insert into goal_deposits (goal_id,amount) values ('bbbbbbbb-0000-0000-0000-000000000001',500),('bbbbbbbb-0000-0000-0000-000000000001',500);
insert into budgets (category,limit_amount) values ('alimentacao',1000);
insert into assistant_messages (role,content) values ('user','oi');
-- U
select 'fatura após gasto', invoice from cards;
update transactions set amount = 120 where name='Mercado';
select 'fatura após editar', invoice from cards;
insert into budgets (category,limit_amount) values ('alimentacao',1200) on conflict (user_id,category) do update set limit_amount = excluded.limit_amount;
update profiles set month_cap = 3200;
-- R (views)
select 'meta', name, saved, deposit_count from goal_progress;
select 'saldo', balance from account_summary;   -- 1000 − 160 − 1000 = −160
-- RPC fatura
select import_invoice('aaaaaaaa-0000-0000-0000-000000000001','fatura.pdf','[{"name":"Netflix","category":"assinaturas","date":"2026-11-02","amount":55.9,"is_subscription":true},{"name":"Riachuelo","category":"outros","date":"2026-11-03","amount":95.3}]') as import_id \gset
select 'após importar', invoice, (select count(*) from transactions where source='invoice') from cards;
select undo_invoice_import(:'import_id');
select 'após desfazer', invoice, (select count(*) from transactions where source='invoice') from cards;

-- isolamento: B não vê nada de A e não consegue escrever no nome de A
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select 'B vê', (select count(*) from cards), (select count(*) from transactions), (select count(*) from goals), (select count(*) from profiles);
update transactions set amount = 1;   -- 0 linhas
delete from goals;                     -- 0 linhas
do $$ begin
  begin insert into cards (user_id,nickname,last4,credit_limit) values ('11111111-1111-1111-1111-111111111111','X','0000',1); raise exception 'FALHOU: inseriu em nome de outra conta';
  exception when insufficient_privilege then raise notice 'ok: RLS bloqueou insert em nome de A'; end;
  begin insert into transactions (name,category,method,card_id,amount) values ('x','outros','card','aaaaaaaa-0000-0000-0000-000000000001',1); raise exception 'FALHOU: usou cartão de A';
  exception when insufficient_privilege then raise notice 'ok: trigger bloqueou cartão de outra conta'; end;
  begin insert into goal_deposits (goal_id,amount) values ('bbbbbbbb-0000-0000-0000-000000000001',1); raise exception 'FALHOU: depositou em meta de A';
  exception when foreign_key_violation then raise notice 'ok: FK composta bloqueou depósito na meta de A'; end;
  begin insert into transactions (name,category,method,card_id,amount) values ('x','outros','pix','aaaaaaaa-0000-0000-0000-000000000001',1); raise exception 'FALHOU';
  exception when check_violation or insufficient_privilege then raise notice 'ok: card_id só com method=card'; end;
end $$;

-- D
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
delete from transactions where name='Uber';
select 'apagou gasto pix', count(*) from transactions;
delete from cards;   -- gastos ficam, card_id → null
select 'cartão apagado', count(*), count(card_id) from transactions;
delete from goals;   -- depósitos em cascata
select 'meta apagada', (select count(*) from goal_deposits), (select balance from account_summary);
delete from budgets where category='alimentacao';
delete from assistant_messages;
do $$ begin
  begin update assistant_messages set content='x'; exception when others then null; end;
end $$;
reset role;
delete from auth.users where email='a@x.com';  -- excluir conta
select 'conta excluída: sobras', (select count(*) from profiles where name='Pablo Gama') + (select count(*) from transactions) + (select count(*) from cards);
