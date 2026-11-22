/**
 * Autenticação por e-mail e senha — implementação LOCAL (protótipo).
 *
 * Mesmo contrato que o Supabase vai cumprir:
 *   signIn  → supabase.auth.signInWithPassword({ email, password })
 *   signUp  → supabase.auth.signUp({ email, password, options: { data: { name } } })
 *   signOut → supabase.auth.signOut()
 *   currentSession → supabase.auth.getSession()
 *
 * Aqui as contas ficam no localStorage deste navegador, com a senha em
 * SHA-256 (só para não guardar texto puro; não é segurança de produção).
 */
import { DEMO_ACCOUNT } from '@/data/mocks'
import type { User } from '@/types/finance'

export class AuthError extends Error {}

export interface AuthService {
  signIn(email: string, password: string): Promise<User>
  signUp(name: string, email: string, password: string): Promise<User>
  signOut(): Promise<void>
  currentSession(): User | null
}

interface StoredAccount { name: string; email: string; hash: string }
const USERS = 'gamora:accounts'
const SESSION = 'gamora:session'
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const norm = (e: string) => e.trim().toLowerCase()

async function sha256(text: string) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return `plain:${text}` // contexto sem crypto.subtle (http não-local)
  }
}

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback } catch { return fallback }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage indisponível */ }
}

async function accounts(): Promise<StoredAccount[]> {
  const list = read<StoredAccount[]>(USERS, [])
  if (!list.some((a) => a.email === DEMO_ACCOUNT.email)) {
    list.push({ name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email, hash: await sha256(DEMO_ACCOUNT.password) })
    write(USERS, list)
  }
  return list
}

export const localAuth: AuthService = {
  async signIn(email, password) {
    await wait(650)
    const acc = (await accounts()).find((a) => a.email === norm(email))
    if (!acc || acc.hash !== (await sha256(password))) throw new AuthError('E-mail ou senha incorretos.')
    const user = { name: acc.name, email: acc.email }
    write(SESSION, user)
    return user
  },
  async signUp(name, email, password) {
    await wait(800)
    const list = await accounts()
    if (list.some((a) => a.email === norm(email))) throw new AuthError('Este e-mail já tem uma conta. Entre com ele.')
    const acc = { name: name.trim(), email: norm(email), hash: await sha256(password) }
    write(USERS, [...list, acc])
    const user = { name: acc.name, email: acc.email }
    write(SESSION, user)
    return user
  },
  async signOut() {
    try { localStorage.removeItem(SESSION) } catch { /* ok */ }
  },
  currentSession() {
    return read<User | null>(SESSION, null)
  },
}

export const auth: AuthService = localAuth
