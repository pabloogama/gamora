/**
 * Cliente Supabase do navegador.
 *
 * Usa só a chave PUBLICÁVEL (VITE_SUPABASE_ANON_KEY). Quem protege os dados
 * é o RLS (supabase/migrations). A service role key NUNCA entra no front.
 * A sessão fica no localStorage e é renovada sozinha.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '@/config/env'

/** true quando o app deve ler e gravar no Supabase (VITE_DATA_SOURCE=supabase + URL e chave). */
export const useSupabase = env.dataSource === 'supabase' && isSupabaseConfigured

export const supabase: SupabaseClient | null = useSupabase
  ? createClient(env.supabase.url, env.supabase.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'gamora:supabase-auth' },
    })
  : null

export function sb(): SupabaseClient {
  if (!supabase) throw new Error('[supabase] Configure VITE_DATA_SOURCE=supabase, VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  return supabase
}

/** id da pessoa logada (para os caminhos do Storage). */
export async function currentUserId(): Promise<string> {
  const { data } = await sb().auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error('Sessão expirada. Entre de novo.')
  return id
}

/** URL pública do Storage com versão (a foto nova não fica presa no cache). */
export function publicUrl(bucket: string, path: string) {
  return `${sb().storage.from(bucket).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`
}
