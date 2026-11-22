/**
 * Código comum das rotas /api (Vercel Functions, runtime Node).
 * Pastas/arquivos com "_" não viram rota: só são importados.
 *
 * Variáveis (Vercel → Settings → Environment Variables):
 *   OPENAI_API_KEY        segredo, SEM prefixo VITE_
 *   OPENAI_MODEL          opcional (padrão gpt-4o-mini)
 *   OPENAI_VISION_MODEL   opcional (padrão gpt-4o-mini)
 *   VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY  as mesmas do app (a Vercel também as entrega às funções)
 */

export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
export const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''
const OPENAI_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1' // trocável só para testes

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

export const fail = (status: number, error: string) => json({ error }, status)

export interface AuthedUser { id: string; email: string; token: string }

/** Confere o login do Supabase (Bearer <access_token>). Sem login, sem IA: ninguém gasta a chave chamando /api direto. */
export async function requireUser(req: Request): Promise<AuthedUser | Response> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return fail(500, 'Supabase não configurado no servidor.')
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return fail(401, 'Entre na sua conta para usar a IA.')
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${token}` } })
  if (!r.ok) return fail(401, 'Sessão expirada. Entre de novo.')
  const u = (await r.json()) as { id: string; email?: string }
  return { id: u.id, email: u.email ?? '', token }
}

/** Lê do banco com o login da pessoa (o RLS vale). */
export async function rest<T>(user: AuthedUser, path: string): Promise<T> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${user.token}` } })
  if (!r.ok) throw new Error(`Supabase ${r.status} em ${path.split('?')[0]}`)
  return (await r.json()) as T
}

/** Chat Completions da OpenAI. Erros viram mensagens em português. */
export async function openai(body: Record<string, unknown>): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new HttpError(503, 'A IA ainda não foi configurada (OPENAI_API_KEY).')
  const r = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const detail = await r.text().catch(() => '')
    console.error('[openai]', r.status, detail.slice(0, 500))
    if (r.status === 401) throw new HttpError(502, 'A chave da OpenAI foi recusada. Confira a OPENAI_API_KEY.')
    if (r.status === 429) throw new HttpError(429, 'A IA está sem cota ou recebendo pedidos demais. Tente daqui a pouco.')
    throw new HttpError(502, 'A IA não respondeu agora. Tente de novo.')
  }
  const data = (await r.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export const toResponse = (e: unknown) => {
  if (e instanceof HttpError) return fail(e.status, e.message)
  console.error('[api]', e)
  return fail(500, 'Algo deu errado no servidor. Tente de novo.')
}
