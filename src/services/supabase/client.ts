/**
 * Cliente Supabase — PREPARADO, AINDA NÃO CONECTADO.
 *
 * Para ativar:
 *   1. npm install @supabase/supabase-js
 *   2. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env
 *   3. Rode supabase/migrations/0001_init.sql no projeto Supabase
 *   4. Descomente o bloco abaixo e troque VITE_DATA_SOURCE para "supabase"
 *
 * A anon key é pública por design: quem protege os dados é o RLS (já
 * definido na migration). A service role key NUNCA entra no front.
 */
import { env, isSupabaseConfigured } from '@/config/env'

// import { createClient } from '@supabase/supabase-js'
// export const supabase = isSupabaseConfigured
//   ? createClient(env.supabase.url, env.supabase.anonKey, {
//       auth: { persistSession: true, autoRefreshToken: true },
//     })
//   : null

export const supabase = null

export function assertSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(`[supabase] Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (${env.appName}).`)
  }
}
