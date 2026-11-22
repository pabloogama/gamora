import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { emptyState, seed, DEMO_ACCOUNT } from '@/data/mocks'
import type { Budget, Card, CategoryId, ChatEntry, Goal, GoalDeposit, InvoiceItem, State, Transaction, User } from '@/types/finance'
import { toISODate, uid } from '@/lib/format'
import { dueDayFromOffset } from '@/lib/cards'
import { localRepository as repository } from '@/services/storage'
import { auth } from '@/services/auth'
import { useSupabase } from '@/services/supabase/client'
import { loadRemote, syncRemote, SyncError } from '@/services/supabase/data'

/**
 * Ações do store, agrupadas por entidade. Cada entidade criada pela pessoa tem
 * as 4 operações (criar · ver · editar · apagar). Ver = leitura do state.
 * O mapa completo (tela, ação, tabela, política RLS) está em docs/CRUD.md.
 */
export type Action =
  // sessão / perfil
  | { type: 'hydrate'; state: State }
  | { type: 'logout' }
  | { type: 'updateUser'; user: User }
  | { type: 'toggleBalance' }
  | { type: 'setBalance'; balance: number } // ajusta o saldo atual (mexe em baseBalance)
  | { type: 'reset' }
  // lançamentos
  | { type: 'saveTx'; tx: Transaction } // cria ou edita
  | { type: 'deleteTx'; id: string }
  // faturas importadas (estágio 2)
  | { type: 'importInvoice'; items: InvoiceItem[]; cardId: string; total: number; fileName: string; file?: File } // file: vai para o Storage
  | { type: 'deleteImport'; id: string } // desfaz: apaga os lançamentos dela e devolve a fatura anterior
  // cartões
  | { type: 'saveCard'; card: Card }
  | { type: 'deleteCard'; id: string }
  // metas e depósitos
  | { type: 'saveGoal'; goal: Goal }
  | { type: 'deleteGoal'; id: string }
  | { type: 'saveDeposit'; deposit: GoalDeposit } // cria ou edita
  | { type: 'deleteDeposit'; id: string }
  // tetos
  | { type: 'setBudget'; budget: Budget } // cria ou edita
  | { type: 'deleteBudget'; category: CategoryId }
  | { type: 'setCap'; amount: number } // 0 = sem teto do mês
  // assistente (estágio 2)
  | { type: 'chatAdd'; entry: ChatEntry }
  | { type: 'chatClear' }

/** gasto num cartão entra na fatura dele (o resto da fatura foi digitado à mão) */
function bumpInvoice(cards: Card[], method: string, delta: number) {
  return cards.map((c) => (c.id === method ? { ...c, invoice: Math.max(0, +(c.invoice + delta).toFixed(2)) } : c))
}

/** Campos derivados: saved de cada meta e o total que saiu do saldo para as metas. */
function derive(s: State): State {
  const byGoal = new Map<string, number>()
  s.deposits.forEach((x) => byGoal.set(x.goalId, (byGoal.get(x.goalId) ?? 0) + x.amount))
  const movedToGoals = +s.deposits.reduce((a, x) => a + x.amount, 0).toFixed(2)
  const goals = s.goals.map((g) => ({ ...g, saved: +(g.initialSaved + (byGoal.get(g.id) ?? 0)).toFixed(2) }))
  return { ...s, goals, movedToGoals }
}

const spentAll = (s: State) => s.transactions.reduce((a, t) => a + t.amount, 0)

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate': return a.state
    case 'logout': return { ...s, user: null }
    case 'updateUser': return { ...s, user: a.user }
    case 'toggleBalance': return { ...s, hideBalance: !s.hideBalance }
    case 'setBalance':
      // saldo = base − gastos − guardado  ⇒  base = saldo + gastos + guardado
      return { ...s, baseBalance: +(a.balance + spentAll(s) + s.movedToGoals).toFixed(2) }
    case 'reset': return s.user?.email === DEMO_ACCOUNT.email ? seed() : emptyState(s.user)

    case 'saveTx': {
      const prev = s.transactions.find((t) => t.id === a.tx.id)
      let cards = s.cards
      if (prev) cards = bumpInvoice(cards, prev.method, -prev.amount)
      cards = bumpInvoice(cards, a.tx.method, a.tx.amount)
      const transactions = prev ? s.transactions.map((t) => (t.id === a.tx.id ? a.tx : t)) : [a.tx, ...s.transactions]
      return { ...s, cards, transactions }
    }
    case 'deleteTx': {
      const prev = s.transactions.find((t) => t.id === a.id)
      if (!prev) return s
      return { ...s, cards: bumpInvoice(s.cards, prev.method, -prev.amount), transactions: s.transactions.filter((t) => t.id !== a.id) }
    }

    case 'importInvoice': {
      // A fatura lida vira lançamentos e o valor da fatura do cartão passa a ser o total lido.
      const card = s.cards.find((c) => c.id === a.cardId)
      const importId = uid()
      const date = toISODate(new Date())
      const txs: Transaction[] = a.items.map((i) => ({
        id: uid(), name: i.name, category: i.category, method: a.cardId, date: i.date, amount: i.amount,
        source: 'invoice', importId, isSubscription: i.isSubscription || undefined,
      }))
      return {
        ...s,
        transactions: [...txs, ...s.transactions],
        cards: s.cards.map((c) => (c.id === a.cardId ? { ...c, invoice: +a.total.toFixed(2) } : c)),
        imports: [{ id: importId, cardId: a.cardId, fileName: a.fileName, total: +a.total.toFixed(2), itemCount: txs.length, date, previousInvoice: card?.invoice ?? 0 }, ...s.imports],
      }
    }
    case 'deleteImport': {
      const imp = s.imports.find((i) => i.id === a.id)
      if (!imp) return s
      return {
        ...s,
        imports: s.imports.filter((i) => i.id !== a.id),
        transactions: s.transactions.filter((t) => t.importId !== a.id),
        cards: s.cards.map((c) => (c.id === imp.cardId ? { ...c, invoice: imp.previousInvoice } : c)),
      }
    }

    case 'saveCard': {
      const exists = s.cards.some((c) => c.id === a.card.id)
      return { ...s, cards: exists ? s.cards.map((c) => (c.id === a.card.id ? a.card : c)) : [a.card, ...s.cards] }
    }
    case 'deleteCard':
      // compras feitas nele continuam no histórico ("Cartão removido"); no banco: card_id → null
      return { ...s, cards: s.cards.filter((c) => c.id !== a.id) }

    case 'saveGoal': {
      const exists = s.goals.some((g) => g.id === a.goal.id)
      return derive({ ...s, goals: exists ? s.goals.map((g) => (g.id === a.goal.id ? a.goal : g)) : [...s.goals, a.goal] })
    }
    case 'deleteGoal':
      // os depósitos da meta saem junto (no banco: on delete cascade) e o valor volta para o saldo
      return derive({ ...s, goals: s.goals.filter((x) => x.id !== a.id), deposits: s.deposits.filter((x) => x.goalId !== a.id) })
    case 'saveDeposit': {
      const exists = s.deposits.some((x) => x.id === a.deposit.id)
      return derive({ ...s, deposits: exists ? s.deposits.map((x) => (x.id === a.deposit.id ? a.deposit : x)) : [a.deposit, ...s.deposits] })
    }
    case 'deleteDeposit':
      return derive({ ...s, deposits: s.deposits.filter((x) => x.id !== a.id) })

    case 'setBudget': {
      const exists = s.budgets.some((b) => b.category === a.budget.category)
      return { ...s, budgets: exists ? s.budgets.map((b) => (b.category === a.budget.category ? a.budget : b)) : [...s.budgets, a.budget] }
    }
    case 'deleteBudget': return { ...s, budgets: s.budgets.filter((b) => b.category !== a.category) }
    case 'setCap': return { ...s, monthCap: Math.max(0, a.amount) }

    case 'chatAdd': return { ...s, chat: [...s.chat, a.entry].slice(-100) }
    case 'chatClear': return { ...s, chat: [] }
  }
}

type Legacy = Omit<Partial<State>, 'cards' | 'goals'> & {
  cards?: (Omit<Card, 'dueDay'> & { dueDay?: number; dueInDays?: number })[]
  goals?: (Omit<Goal, 'initialSaved'> & { initialSaved?: number })[]
}

/**
 * Dados salvos antes da v2: cartões tinham "vence em N dias", metas tinham só `saved`
 * e não havia histórico de depósitos. Converte sem mudar o saldo que a pessoa via.
 */
export function migrate(raw: Legacy, user: User): State {
  if (raw.version === 2) return derive({ ...(raw as unknown as State), user: { ...raw.user, ...user } })
  const base = emptyState(user)
  const moved = raw.movedToGoals ?? 0
  return derive({
    ...base,
    ...raw,
    version: 2,
    user: { ...raw.user, ...user },
    baseBalance: (raw.baseBalance ?? 0) - moved, // antes não havia depósitos registrados
    cards: (raw.cards ?? []).map(({ dueInDays, ...c }) => ({ ...c, dueDay: c.dueDay ?? dueDayFromOffset(dueInDays ?? 10) })),
    goals: (raw.goals ?? []).map((g) => ({ ...g, initialSaved: g.initialSaved ?? g.saved ?? 0 })),
    deposits: raw.deposits ?? [],
    imports: raw.imports ?? [],
    chat: raw.chat ?? [],
  })
}

export function loadFor(user: User, startingBalance = 0): State {
  const saved = repository.load(user.email)
  if (saved) return migrate(saved as Legacy, user)
  if (user.email === DEMO_ACCOUNT.email) return seed()
  return emptyState(user, startingBalance)
}

/** Dados da conta que acabou de entrar: do Supabase (VITE_DATA_SOURCE=supabase) ou do aparelho. */
export async function loadUser(user: User, startingBalance = 0): Promise<State> {
  if (useSupabase) return derive(await loadRemote(user))
  return loadFor(user, startingBalance)
}

interface Derived {
  balance: number
  monthTx: Transaction[]
  monthTotal: number
  byCategory: { category: CategoryId; total: number }[]
  spentIn: (c: CategoryId) => number
}

export type StoreStatus = 'booting' | 'ready'

const Ctx = createContext<{
  state: State
  dispatch: (a: Action) => void
  d: Derived
  /** 'booting' enquanto a sessão salva e os dados são carregados */
  status: StoreStatus
  /** último erro de gravação no servidor (o app mostra num toast) */
  syncError: { msg: string; id: number } | null
} | null>(null)

export { repository }

/**
 * `initialState` e `persist` existem para o Storybook e testes; o app usa os padrões.
 * Com o Supabase ligado, cada ação é aplicada na tela na hora e gravada no banco em
 * seguida (em ordem). Se o banco recusar, aparece um aviso e o estado é relido do servidor.
 */
export function StoreProvider({ children, initialState, persist = true }: { children: ReactNode; initialState?: State; persist?: boolean }) {
  const remote = persist && useSupabase
  const [state, raw] = useReducer(reducer, initialState ?? emptyState(null))
  const [status, setStatus] = useState<StoreStatus>(initialState ? 'ready' : 'booting')
  const [syncError, setSyncError] = useState<{ msg: string; id: number } | null>(null)
  const ref = useRef(state)
  const queue = useRef<Promise<unknown>>(Promise.resolve())

  // abre a sessão salva neste aparelho e carrega os dados dela
  useEffect(() => {
    if (initialState) return
    let alive = true
    ;(async () => {
      try {
        const user = await auth.currentSession()
        if (user && alive) {
          const loaded = await loadUser(user)
          ref.current = loaded
          raw({ type: 'hydrate', state: loaded })
        }
      } catch (e) {
        console.error('[store] não foi possível abrir a sessão', e)
      } finally {
        if (alive) setStatus('ready')
      }
    })()
    return () => { alive = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // modo local: guarda o estado inteiro no aparelho
  useEffect(() => { if (persist && !useSupabase) repository.save(state) }, [state, persist])

  const dispatch = useCallback((a: Action) => {
    const prev = ref.current
    const next = reducer(prev, a)
    ref.current = next
    raw({ type: 'hydrate', state: next })
    if (!remote || !prev.user || a.type === 'hydrate' || a.type === 'logout') return
    const user = prev.user
    // grava em ordem (uma ação de cada vez), para editar logo depois de criar funcionar
    queue.current = queue.current.then(async () => {
      try {
        const fresh = await syncRemote(a, prev, next)
        if (fresh && ref.current.user?.email === user.email) {
          const s = derive(fresh)
          ref.current = s
          raw({ type: 'hydrate', state: s })
        }
      } catch (e) {
        console.error('[store] gravação falhou', a.type, e)
        setSyncError({ msg: e instanceof SyncError ? e.message : 'Não foi possível salvar. Recarregamos seus dados.', id: Date.now() })
        try {
          if (ref.current.user?.email !== user.email) return
          const s = derive(await loadRemote(user))
          ref.current = s
          raw({ type: 'hydrate', state: s })
        } catch { /* sem conexão: fica o estado da tela */ }
      }
    })
  }, [remote])
  const d = useMemo<Derived>(() => {
    const ym = toISODate(new Date()).slice(0, 7)
    const monthTx = state.transactions.filter((t) => t.date.startsWith(ym))
    const monthTotal = monthTx.reduce((a, t) => a + t.amount, 0)
    const map = new Map<CategoryId, number>()
    monthTx.forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount))
    const byCategory = [...map.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total)
    return {
      balance: state.baseBalance - spentAll(state) - state.movedToGoals,
      monthTx,
      monthTotal,
      byCategory,
      spentIn: (c) => map.get(c) ?? 0,
    }
  }, [state])

  return <Ctx.Provider value={{ state, dispatch, d, status, syncError }}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore fora do StoreProvider')
  return v
}
