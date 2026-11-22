import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { emptyState, seed, DEMO_ACCOUNT } from '@/data/mocks'
import type { Budget, Card, CategoryId, ChatEntry, Goal, GoalDeposit, InvoiceItem, State, Transaction, User } from '@/types/finance'
import { toISODate, uid } from '@/lib/format'
import { dueDayFromOffset } from '@/lib/cards'
import { localRepository as repository } from '@/services/storage'
import { auth } from '@/services/auth'

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
  | { type: 'importInvoice'; items: InvoiceItem[]; cardId: string; total: number; fileName: string }
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

/** Abre a sessão salva (se houver) e carrega os dados daquela conta. */
function boot(): State {
  const user = auth.currentSession()
  if (!user) return emptyState(null)
  return loadFor(user)
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

interface Derived {
  balance: number
  monthTx: Transaction[]
  monthTotal: number
  byCategory: { category: CategoryId; total: number }[]
  spentIn: (c: CategoryId) => number
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action>; d: Derived } | null>(null)

export { repository }

/** `initialState` e `persist` existem para o Storybook e testes; o app usa os padrões. */
export function StoreProvider({ children, initialState, persist = true }: { children: ReactNode; initialState?: State; persist?: boolean }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => init ?? boot())

  useEffect(() => { if (persist) repository.save(state) }, [state, persist])

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

  return <Ctx.Provider value={{ state, dispatch, d }}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore fora do StoreProvider')
  return v
}
