-- ════════════════════════════════════════════════════════════════════
--  Gamora · papel de administrador (aplicada no Supabase como gamora_admin_role + gamora_admin_merge_policies)
--
--  Admin = app_metadata.app_role = 'admin' no auth.users. Só o servidor/SQL
--  altera app_metadata, então ninguém se promove pelo app.
--  Admin tem acesso completo às linhas de TODAS as contas (as operações
--  seguem os GRANTs de authenticated) e vê/apaga arquivos do Storage.
--  O app sempre filtra por user_id: a tela do admin mostra só os dados dele.
--
--  Promover / rebaixar (SQL Editor):
--    update auth.users set raw_app_meta_data = raw_app_meta_data || '{"app_role":"admin"}' where email = '<email>';
--    update auth.users set raw_app_meta_data = raw_app_meta_data - 'app_role'            where email = '<email>';
--  (a mudança vale no próximo login / renovação do token)
-- ════════════════════════════════════════════════════════════════════
create or replace function public.is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin', false)
$$;
revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;

-- Uma política por operação: dono OU admin (sem políticas permissivas duplicadas)
alter policy profiles_select on public.profiles using (id = (select auth.uid()) or (select public.is_admin()));
alter policy profiles_update on public.profiles using (id = (select auth.uid()) or (select public.is_admin())) with check (id = (select auth.uid()) or (select public.is_admin()));

do $$
declare t text;
begin
  foreach t in array array['cards','invoice_imports','transactions','budgets','goals','goal_deposits','assistant_messages'] loop
    execute format('alter policy %1$s_select on public.%1$s using (user_id = (select auth.uid()) or (select public.is_admin()))', t);
    execute format('alter policy %1$s_insert on public.%1$s with check (user_id = (select auth.uid()) or (select public.is_admin()))', t);
    execute format('alter policy %1$s_delete on public.%1$s using (user_id = (select auth.uid()) or (select public.is_admin()))', t);
    if t <> 'assistant_messages' then -- mensagens não se editam
      execute format('alter policy %1$s_update on public.%1$s using (user_id = (select auth.uid()) or (select public.is_admin())) with check (user_id = (select auth.uid()) or (select public.is_admin()))', t);
    end if;
  end loop;
end $$;

-- Storage: dono da pasta OU admin para ver e apagar
alter policy avatars_read    on storage.objects using (bucket_id = 'avatars'  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));
alter policy avatars_delete  on storage.objects using (bucket_id = 'avatars'  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));
alter policy invoices_read   on storage.objects using (bucket_id = 'invoices' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));
alter policy invoices_delete on storage.objects using (bucket_id = 'invoices' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));
