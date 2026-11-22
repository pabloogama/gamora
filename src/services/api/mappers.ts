/**
 * Domínio (camelCase, src/types/finance.ts) ⇄ linha do banco (snake_case, src/types/database.ts).
 * Um mapper por entidade, nos dois sentidos. O repositório Supabase só usa estes.
 */
import type { Budget, Card, ChatEntry, Goal, GoalDeposit, InvoiceImport, Transaction, User } from '@/types/finance'
import type {
  AssistantMessageRow, BudgetRow, CardRow, GoalDepositRow, GoalProgressRow, GoalRow, Insert,
  InvoiceImportRow, ProfileRow, TransactionRow,
} from '@/types/database'

const toNull = <T>(v: T | undefined) => (v === undefined || v === '' ? null : v)

/* cartões */
export const cardFromRow = (r: CardRow): Card => ({
  id: r.id, nickname: r.nickname, last4: r.last4, invoice: r.invoice, limit: r.credit_limit, dueDay: r.due_day, color: r.color,
})
export const cardToRow = (c: Card): Insert<CardRow> => ({
  id: c.id, nickname: c.nickname, last4: c.last4, invoice: c.invoice, credit_limit: c.limit, due_day: c.dueDay, color: c.color,
})

/* lançamentos: no app `method` é o id do cartão, 'pix' ou 'dinheiro' */
export const REMOVED_CARD = 'removed-card'
export const txFromRow = (r: TransactionRow): Transaction => ({
  id: r.id, name: r.name, category: r.category,
  method: r.method === 'card' ? (r.card_id ?? REMOVED_CARD) : r.method,
  date: r.date, amount: r.amount, source: r.source,
  importId: r.invoice_import_id ?? undefined, isSubscription: r.is_subscription || undefined, note: r.note ?? undefined,
})
export const txToRow = (t: Transaction): Insert<TransactionRow> => {
  const isCash = t.method === 'pix' || t.method === 'dinheiro'
  return {
    id: t.id, name: t.name, category: t.category,
    method: isCash ? (t.method as 'pix' | 'dinheiro') : 'card',
    card_id: isCash || t.method === REMOVED_CARD ? null : t.method,
    date: t.date, amount: t.amount, source: t.source ?? 'manual',
    invoice_import_id: t.importId ?? null, is_subscription: !!t.isSubscription, note: toNull(t.note),
  }
}

/* faturas importadas */
export const importFromRow = (r: InvoiceImportRow): InvoiceImport => ({
  id: r.id, cardId: r.card_id ?? REMOVED_CARD, fileName: r.file_name, total: r.total, itemCount: r.item_count,
  date: r.imported_at.slice(0, 10), previousInvoice: r.previous_invoice,
})
export const importToRow = (i: InvoiceImport): Omit<InvoiceImportRow, 'user_id' | 'imported_at'> => ({
  id: i.id, card_id: i.cardId === REMOVED_CARD ? null : i.cardId, file_name: i.fileName, total: i.total,
  item_count: i.itemCount, previous_invoice: i.previousInvoice,
})

/* tetos */
export const budgetFromRow = (r: BudgetRow): Budget => ({ category: r.category, limit: r.limit_amount })
export const budgetToRow = (b: Budget): Omit<Insert<BudgetRow>, 'id'> => ({ category: b.category, limit_amount: b.limit })

/* metas: target_month 'yyyy-mm-01' ⇄ 'yyyy-mm' */
export const goalFromRow = (r: GoalProgressRow | GoalRow): Goal => ({
  id: r.id, name: r.name, target: r.target, initialSaved: r.initial_saved,
  saved: 'saved' in r ? r.saved : r.initial_saved,
  date: r.target_month ? r.target_month.slice(0, 7) : undefined,
})
export const goalToRow = (g: Goal): Insert<GoalRow> => ({
  id: g.id, name: g.name, target: g.target, initial_saved: g.initialSaved,
  target_month: g.date && /^\d{4}-\d{2}$/.test(g.date) ? `${g.date}-01` : null,
})

/* depósitos */
export const depositFromRow = (r: GoalDepositRow): GoalDeposit => ({ id: r.id, goalId: r.goal_id, amount: r.amount, date: r.date, note: r.note ?? undefined })
export const depositToRow = (d: GoalDeposit): Insert<GoalDepositRow> => ({ id: d.id, goal_id: d.goalId, amount: d.amount, date: d.date, note: toNull(d.note) })

/* assistente */
export const chatFromRow = (r: AssistantMessageRow): ChatEntry => ({ id: r.id, role: r.role, content: r.content, createdAt: r.created_at })
export const chatToRow = (c: ChatEntry): Omit<AssistantMessageRow, 'user_id'> => ({ id: c.id, role: c.role, content: c.content, created_at: c.createdAt })

/* perfil (o e-mail vem de auth.users, não de profiles) */
export const userFromRow = (r: ProfileRow, email: string): User => ({ name: r.name, email, avatar: r.avatar_url ?? undefined })
