/**
 * Autenticação por e-mail e senha — implementação LOCAL (protótipo).
 *
 * Mesmo contrato que o Supabase vai cumprir:
 *   signIn  → supabase.auth.signInWithPassword({ email, password })
 *   signUp  → supabase.auth.signUp({ email, password, options: { data: { name } } })
 *   signOut → supabase.auth.signOut()
 *   currentSession → supabase.auth.getSession()
 *   updateProfile  → supabase.auth.updateUser({ email }) + update em profiles (nome, avatar_url)
 *   changePassword → supabase.auth.updateUser({ password }) (reautentica antes)
 *   deleteAccount  → função /api/account (service role) chama auth.admin.deleteUser(id);
 *                    as tabelas apagam em cascata (on delete cascade em auth.users)
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
  /** Atualiza nome, e-mail e foto da conta logada. Supabase: auth.updateUser + tabela profiles. */
  updateProfile(currentEmail: string, next: User): Promise<User>
  /** Troca a senha. Confere a senha atual antes. */
  changePassword(email: string, current: string, next: string): Promise<void>
  /** Apaga a conta e encerra a sessão. Confere a senha antes. Os dados financeiros são apagados pelo chamador (repository.remove). */
  deleteAccount(email: string, password: string): Promise<void>
}

interface StoredAccount { name: string; email: string; hash: string; avatar?: string }
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
    list.push({ name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email, hash: await sha256(DEMO_ACCOUNT.password), avatar: DEMO_ACCOUNT.avatar })
    write(USERS, list)
  }
  return list
}

export const localAuth: AuthService = {
  async signIn(email, password) {
    await wait(650)
    const acc = (await accounts()).find((a) => a.email === norm(email))
    if (!acc || acc.hash !== (await sha256(password))) throw new AuthError('E-mail ou senha incorretos.')
    const user: User = { name: acc.name, email: acc.email, avatar: acc.avatar }
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
  async updateProfile(currentEmail, next) {
    await wait(500)
    const list = await accounts()
    const email = norm(next.email)
    if (email !== norm(currentEmail) && list.some((a) => a.email === email)) throw new AuthError('Este e-mail já é usado por outra conta.')
    const updated = list.map((a) => (a.email === norm(currentEmail) ? { ...a, name: next.name.trim(), email, avatar: next.avatar } : a))
    write(USERS, updated)
    const user: User = { name: next.name.trim(), email, avatar: next.avatar }
    write(SESSION, user)
    return user
  },
  async changePassword(email, current, next) {
    await wait(500)
    const list = await accounts()
    const acc = list.find((a) => a.email === norm(email))
    if (!acc || acc.hash !== (await sha256(current))) throw new AuthError('A senha atual não confere.')
    if (next.length < 6) throw new AuthError('A nova senha precisa de pelo menos 6 caracteres.')
    const hash = await sha256(next)
    write(USERS, list.map((a) => (a.email === acc.email ? { ...a, hash } : a)))
  },
  async deleteAccount(email, password) {
    await wait(600)
    const list = await accounts()
    const acc = list.find((a) => a.email === norm(email))
    if (!acc || acc.hash !== (await sha256(password))) throw new AuthError('Senha incorreta.')
    write(USERS, list.filter((a) => a.email !== acc.email))
    try { localStorage.removeItem(SESSION) } catch { /* ok */ }
  },
}

export const auth: AuthService = localAuth
