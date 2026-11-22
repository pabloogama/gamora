import { createContext, useContext } from 'react'
import type { Card, CategoryId, Goal, Transaction } from '@/types/finance'

/** Telas cheias. Estágio 1: home, cards, goals. Estágio 2: + invoice, assistant. */
export type View = 'home' | 'cards' | 'goals' | 'invoice' | 'assistant'

export type SheetState =
  | { kind: 'add'; tx?: Transaction }
  | { kind: 'tx'; id: string }
  | { kind: 'card'; card?: Card }
  | { kind: 'deposit'; goalId: string; amount?: number }
  | { kind: 'goal'; goal?: Goal }
  | { kind: 'budget'; category: CategoryId | 'cap' | 'new' }
  | { kind: 'account' }
  | { kind: 'profile' }

export interface Nav {
  view: View
  /** troca de destino principal (pilha volta para home + destino) */
  go: (v: View) => void
  /** empilha por cima da tela atual (ex.: Metas → Assistente) */
  push: (v: View) => void
  back: () => void
  open: (s: SheetState) => void
  close: () => void
  toast: (msg: string) => void
}

export const NavCtx = createContext<Nav | null>(null)
export function useNav() {
  const n = useContext(NavCtx)
  if (!n) throw new Error('useNav fora do App')
  return n
}
