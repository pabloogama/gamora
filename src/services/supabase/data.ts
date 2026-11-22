/**
 * Dados no Supabase.
 *
 *   load(user)            → lê tudo da pessoa (o RLS só devolve o que é dela) e monta o State
 *   sync(action, prev, next) → grava no banco o efeito de cada ação do store (write-through)
 *
 * O store aplica a ação na tela na hora (otimista) e chama sync. Se o banco recusar,
 * o store mostra o erro e recarrega o estado do servidor (ver store/index.tsx).
 * Regras que o banco também aplica sozinho (não gravar duas vezes):
 *   • gasto no cartão → trigger bump_card_invoice soma/desconta a fatura
 *   • quanto a meta tem e o saldo → views goal_progress / account_summary
 */
import type { Action } from '@/store'
import type { State, Transaction, User } from '@/types/finance'
import type {
  AssistantMessageRow, BudgetRow, CardRow, GoalDepositRow, GoalProgressRow, InvoiceImportRow, ProfileRow, TransactionRow,
} from '@/types/database'
import {
  budgetFromRow, budgetToRow, cardFromRow, cardToRow, chatFromRow, chatToRow, depositFromRow, depositToRow,
  goalFromRow, goalToRow, importFromRow, txFromRow, txToRow,
} from '@/services/api/mappers'
import { toISODate } from '@/lib/format'
import { DEMO_ACCOUNT } from '@/data/mocks'
import { currentUserId, sb } from './client'

/** Erro de gravação com texto para a pessoa. */
export class SyncError extends Error {}

function check<T>(res: { data: T; error: { message: string; code?: string } | null }, what: string): T {
  if (res.error) {
    console.error(`[supabase] ${what}:`, res.error)
    const offline = /fetch|network/i.test(res.error.message)
    throw new SyncError(offline ? 'Sem conexão. A última alteração não foi salva.' : `Não foi possível salvar (${what}). Recarregamos seus dados.`)
  }
  return res.data
}

const prevMonth = () => {
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1)
  return toISODate(d).slice(0, 7)
}

/** Lê todos os dados da pessoa logada. */
export async function loadRemote(user: User): Promise<State> {
  const db = sb()
  const uid = await currentUserId()
  const [profile, cards, txs, imports, budgets, goals, deposits, chat] = await Promise.all([
    db.from('profiles').select('*').eq('id', uid).single(),
    db.from('cards').select('*').order('created_at'),
    db.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
    db.from('invoice_imports').select('*').order('imported_at', { ascending: false }),
    db.from('budgets').select('*').order('created_at'),
    db.from('goal_progress').select('*').order('created_at'),
    db.from('goal_deposits').select('*').order('date', { ascending: false }),
    db.from('assistant_messages').select('*').order('created_at'),
  ])
  const p = check(profile, 'perfil') as ProfileRow
  const transactions = (check(txs, 'lançamentos') as TransactionRow[]).map(txFromRow).map(numbers)
  const last = prevMonth()
  return {
    version: 2,
    user: { name: p.name, email: user.email, avatar: p.avatar_url ?? undefined },
    hideBalance: p.hide_balance,
    baseBalance: Number(p.base_balance),
    movedToGoals: 0, // o store recalcula a partir dos depósitos
    lastMonthTotal: +transactions.filter((t) => t.date.startsWith(last)).reduce((a, t) => a + t.amount, 0).toFixed(2),
    monthCap: Number(p.month_cap),
    transactions,
    cards: (check(cards, 'cartões') as CardRow[]).map(cardFromRow).map((c) => ({ ...c, invoice: Number(c.invoice), limit: Number(c.limit) })),
    budgets: (check(budgets, 'tetos') as BudgetRow[]).map(budgetFromRow).map((b) => ({ ...b, limit: Number(b.limit) })),
    goals: (check(goals, 'metas') as GoalProgressRow[]).map(goalFromRow).map((g) => ({ ...g, target: Number(g.target), initialSaved: Number(g.initialSaved), saved: Number(g.saved) })),
    deposits: (check(deposits, 'depósitos') as GoalDepositRow[]).map(depositFromRow).map((d) => ({ ...d, amount: Number(d.amount) })),
    imports: (check(imports, 'faturas') as InvoiceImportRow[]).map(importFromRow).map((i) => ({ ...i, total: Number(i.total), previousInvoice: Number(i.previousInvoice) })),
    chat: (check(chat, 'conversa') as AssistantMessageRow[]).map(chatFromRow),
  }
}

/** numeric chega como string em alguns casos: normaliza. */
const numbers = (t: Transaction): Transaction => ({ ...t, amount: Number(t.amount) })

const exists = <T extends { id: string }>(list: T[], id: string) => list.some((x) => x.id === id)

/**
 * Grava o efeito de uma ação. Devolve um State quando o servidor precisa ser
 * relido (ex.: restaurar dados de exemplo).
 */
export async function syncRemote(a: Action, prev: State, next: State): Promise<State | void> {
  const db = sb()
  switch (a.type) {
    case 'hydrate':
    case 'logout':
    case 'updateUser': // nome/foto/e-mail são gravados pelo auth.updateProfile
      return

    case 'toggleBalance':
      check(await db.from('profiles').update({ hide_balance: next.hideBalance }).eq('id', await currentUserId()), 'ocultar valores')
      return
    case 'setBalance':
      check(await db.from('profiles').update({ base_balance: next.baseBalance }).eq('id', await currentUserId()), 'saldo')
      return
    case 'setCap':
      check(await db.from('profiles').update({ month_cap: next.monthCap }).eq('id', await currentUserId()), 'teto do mês')
      return

    case 'saveTx': {
      const row = txToRow(a.tx)
      if (exists(prev.transactions, a.tx.id)) {
        const { id, ...patch } = row
        check(await db.from('transactions').update(patch).eq('id', id), 'gasto')
      } else {
        check(await db.from('transactions').insert(row), 'gasto')
      }
      return
    }
    case 'deleteTx':
      check(await db.from('transactions').delete().eq('id', a.id), 'apagar gasto')
      return

    case 'saveCard': {
      const row = cardToRow(a.card)
      if (exists(prev.cards, a.card.id)) {
        const { id, ...patch } = row
        check(await db.from('cards').update(patch).eq('id', id), 'cartão')
      } else {
        check(await db.from('cards').insert(row), 'cartão')
      }
      return
    }
    case 'deleteCard':
      check(await db.from('cards').delete().eq('id', a.id), 'apagar cartão')
      return

    case 'saveGoal': {
      const row = goalToRow(a.goal)
      if (exists(prev.goals, a.goal.id)) {
        const { id, ...patch } = row
        check(await db.from('goals').update(patch).eq('id', id), 'meta')
      } else {
        check(await db.from('goals').insert(row), 'meta')
      }
      return
    }
    case 'deleteGoal':
      check(await db.from('goals').delete().eq('id', a.id), 'apagar meta')
      return

    case 'saveDeposit': {
      const row = depositToRow(a.deposit)
      if (exists(prev.deposits, a.deposit.id)) {
        const { id, ...patch } = row
        check(await db.from('goal_deposits').update(patch).eq('id', id), 'depósito')
      } else {
        check(await db.from('goal_deposits').insert(row), 'depósito')
      }
      return
    }
    case 'deleteDeposit':
      check(await db.from('goal_deposits').delete().eq('id', a.id), 'apagar depósito')
      return

    case 'setBudget':
      check(await db.from('budgets').upsert(budgetToRow(a.budget), { onConflict: 'user_id,category' }), 'teto')
      return
    case 'deleteBudget':
      check(await db.from('budgets').delete().eq('category', a.category), 'remover teto')
      return

    case 'importInvoice': {
      const imp = next.imports.find((i) => !prev.imports.some((p) => p.id === i.id))
      if (!imp) return
      const items = next.transactions.filter((t) => t.importId === imp.id)
      // guarda o arquivo enviado no Storage privado (invoices/<uid>/<importação>-<nome>)
      let filePath: string | null = null
      if (a.file) {
        const uid = await currentUserId()
        const safe = imp.fileName.normalize('NFD').replace(/[^\w.-]+/g, '-').slice(-80)
        filePath = `${uid}/${imp.id}-${safe}`
        const up = await db.storage.from('invoices').upload(filePath, a.file, { contentType: a.file.type || 'application/pdf', upsert: true })
        if (up.error) { console.warn('[supabase] arquivo da fatura não foi salvo:', up.error.message); filePath = null }
      }
      check(await db.rpc('import_invoice', {
        p_card_id: a.cardId,
        p_file_name: imp.fileName,
        p_import_id: imp.id,
        p_file_path: filePath,
        p_items: items.map((t) => ({ id: t.id, name: t.name, category: t.category, date: t.date, amount: t.amount, is_subscription: !!t.isSubscription })),
      }), 'importar fatura')
      return
    }
    case 'deleteImport': {
      const { data } = await db.from('invoice_imports').select('file_path').eq('id', a.id).maybeSingle()
      check(await db.rpc('undo_invoice_import', { p_import_id: a.id }), 'desfazer importação')
      if (data?.file_path) await db.storage.from('invoices').remove([data.file_path])
      return
    }

    case 'chatAdd':
      check(await db.from('assistant_messages').insert(chatToRow(a.entry)), 'conversa')
      return
    case 'chatClear':
      check(await db.from('assistant_messages').delete().eq('user_id', await currentUserId()), 'apagar conversa')
      return

    case 'reset': {
      if (prev.user?.email === DEMO_ACCOUNT.email) {
        check(await db.rpc('reset_demo'), 'restaurar dados de exemplo')
      } else {
        // conta comum: "restaurar" = começar do zero (mantém perfil e saldo inicial)
        for (const t of ['assistant_messages', 'goal_deposits', 'goals', 'budgets', 'transactions', 'invoice_imports', 'cards'] as const) {
          check(await db.from(t).delete().not('id', 'is', null), 'restaurar')
        }
        check(await db.from('profiles').update({ month_cap: 0 }).eq('id', await currentUserId()), 'restaurar')
      }
      return loadRemote(prev.user!)
    }
  }
}
