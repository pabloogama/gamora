import type { User } from '@/types/finance'

/** Erro mostrado para a pessoa (texto já em português). */
export class AuthError extends Error {}
/** Não é erro: a ação deu certo mas precisa de um passo da pessoa (ex.: confirmar o e-mail). */
export class AuthNotice extends Error {}

export interface AuthService {
  signIn(email: string, password: string): Promise<User>
  /** Pode lançar AuthNotice quando o projeto exige confirmar o e-mail antes de entrar. */
  signUp(name: string, email: string, password: string, startingBalance?: number): Promise<User>
  signOut(): Promise<void>
  /** Sessão salva neste aparelho (async: no Supabase a sessão é validada). */
  currentSession(): Promise<User | null>
  /** Atualiza nome, e-mail e foto. `pendingEmail`: o e-mail novo só vale depois de confirmado. */
  updateProfile(currentEmail: string, next: User): Promise<User & { pendingEmail?: string }>
  /** Troca a senha. Confere a senha atual antes. */
  changePassword(email: string, current: string, next: string): Promise<void>
  /** Apaga a conta e todos os dados. Confere a senha antes. */
  deleteAccount(email: string, password: string): Promise<void>
}
