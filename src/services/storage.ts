import type { State } from '@/types/finance'

/**
 * Contrato de persistência, por usuário. Hoje: localStorage.
 * Na integração, `supabaseRepository` implementa o mesmo contrato
 * (as tabelas já filtram por auth.uid() via RLS).
 */
export interface FinanceRepository {
  load(email: string): State | null
  save(state: State): void
}

const key = (email: string) => `gamora:data:${email}`

export const localRepository: FinanceRepository = {
  load(email) {
    try {
      const raw = localStorage.getItem(key(email))
      return raw ? (JSON.parse(raw) as State) : null
    } catch {
      return null
    }
  },
  save(state) {
    if (!state.user) return
    try { localStorage.setItem(key(state.user.email), JSON.stringify(state)) } catch { /* storage indisponível */ }
  },
}
