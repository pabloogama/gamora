import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { emptyState, seed, DEMO_ACCOUNT } from '@/data/mocks'
import type { Budget, Card, CategoryId, Goal, InvoiceItem, State, Transaction, User } from '@/types/finance'
import { toISODate, uid } from '@/lib/format'
import { localRepository as repository } from '@/services/storage'
import { auth } from '@/services/auth'

type Action =
  | { type: 'hydrate'; state: State }
  | { type: 'logout' }
  | { type: 'updateUser'; user: User }
  | { type: 'toggleBalance' }
  | { type: 'saveTx'; tx: Transaction }
  | { type: 'deleteTx'; id: string }
  | { type: 'importInvoice'; items: InvoiceItem[]; cardId: string; total: number }
  | { type: 'saveCard'; card: Card }
  | { type: 'deleteCard'; id: string }
  | { type: 'saveGoal'; goal: Goal }
  | { type: 'deleteGoal'; id: string }
  | { type: 'deposit'; goalId: string; amount: number }
  | { type: 'setBudget'; budget: Budget }
  | { type: 'setCap'; amount: number }
  | { type: 'reset' }

/** gasto num cartão entra na fatura dele (o resto da fatura foi digitado à mão) */
function bumpInvoice(cards: Card[], method: string, delta: number) {
  return cards.map((c) => (c.id === method ? { ...c, invoice: Math.max(0, +(c.invoice + delta).toFixed(2)) } : c))
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate': return a.state
    case 'logout': return { ...s, user: null }
    case 'updateUser': return { ...s, user: a.user }
    case 'toggleBalance': return { ...s, hideBalance: !s.hideBalance }
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
      const txs: Transaction[] = a.items.map((i) => ({
        id: uid(), name: i.name, category: i.category, method: a.cardId, date: i.date, amount: i.amount, source: 'invoice',
      }))
      return {
        ...s,
        transactions: [...txs, ...s.transactions],
        cards: s.cards.map((c) => (c.id === a.cardId ? { ...c, invoice: +a.total.toFixed(2) } : c)),
      }
    }
    case 'saveCard': {
      const exists = s.cards.some((c) => c.id === a.card.id)
      return { ...s, cards: exists ? s.cards.map((c) => (c.id === a.card.id ? a.card : c)) : [a.card, ...s.cards] }
    }
    case 'deleteCard': {
      // compras feitas nele continuam no histórico, marcadas como "Cartão removido"
      return { ...s, cards: s.cards.filter((c) => c.id !== a.id) }
    }
    case 'saveGoal': {
      const exists = s.goals.some((g) => g.id === a.goal.id)
      return { ...s, goals: exists ? s.goals.map((g) => (g.id === a.goal.id ? a.goal : g)) : [...s.goals, a.goal] }
    }
    case 'deleteGoal': {
      // o saldo não muda: o dinheiro guardado continua onde a pessoa guardou
      return { ...s, goals: s.goals.filter((x) => x.id !== a.id) }
    }
    case 'deposit':
      return {
        ...s,
        movedToGoals: s.movedToGoals + a.amount,
        goals: s.goals.map((g) => (g.id === a.goalId ? { ...g, saved: g.saved + a.amount } : g)),
      }
    case 'setBudget': {
      const exists = s.budgets.some((b) => b.category === a.budget.category)
      return { ...s, budgets: exists ? s.budgets.map((b) => (b.category === a.budget.category ? a.budget : b)) : [...s.budgets, a.budget] }
    }
    case 'setCap': return { ...s, monthCap: a.amount }
    case 'reset': return s.user?.email === DEMO_ACCOUNT.email ? seed() : emptyState(s.user)
  }
}

/** Abre a sessão salva (se houver) e carrega os dados daquela conta. */
function boot(): State {
  const user = auth.currentSession()
  if (!user) return emptyState(null)
  return loadFor(user)
}

export function loadFor(user: NonNullable<State['user']>, startingBalance = 0): State {
  const saved = repository.load(user.email)
  if (saved) return { ...saved, user: { ...saved.user, ...user } }
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

/** `initialState` e `persist` existem para o Storybook e testes; o app usa os padrões. */
export { repository }

export function StoreProvider({ children, initialState, persist = true }: { children: ReactNode; initialState?: State; persist?: boolean }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => init ?? boot())

  useEffect(() => { if (persist) repository.save(state) }, [state, persist])

  const d = useMemo<Derived>(() => {
    const ym = toISODate(new Date()).slice(0, 7)
    const monthTx = state.transactions.filter((t) => t.date.startsWith(ym))
    const monthTotal = monthTx.reduce((a, t) => a + t.amount, 0)
    const all = state.transactions.reduce((a, t) => a + t.amount, 0)
    const map = new Map<CategoryId, number>()
    monthTx.forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount))
    const byCategory = [...map.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total)
    return {
      balance: state.baseBalance - all - state.movedToGoals,
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
