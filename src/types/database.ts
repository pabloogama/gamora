/**
 * Linhas das tabelas do Supabase (supabase/migrations/0001_init.sql), em snake_case.
 * Escrito à mão para o front já compilar contra o schema. Quando o projeto
 * Supabase existir, troque por `supabase gen types typescript` e mantenha os nomes.
 * Valores numeric chegam como number (PostgREST). Datas: 'yyyy-mm-dd'; timestamps: ISO.
 */
import type { CategoryId } from './finance'

type Timestamps = { created_at: string; updated_at: string }

export interface ProfileRow extends Timestamps {
  id: string
  name: string
  avatar_url: string | null
  base_balance: number
  month_cap: number
  hide_balance: boolean
  theme: 'light' | 'dark'
}

export interface CardRow extends Timestamps {
  id: string
  user_id: string
  nickname: string
  last4: string
  invoice: number
  credit_limit: number
  due_day: number
  color: 'gradient' | 'lilac' | 'offwhite'
}

export interface TransactionRow extends Timestamps {
  id: string
  user_id: string
  name: string
  category: CategoryId
  method: 'card' | 'pix' | 'dinheiro'
  card_id: string | null
  date: string
  amount: number
  source: 'manual' | 'invoice'
  invoice_import_id: string | null
  is_subscription: boolean
  note: string | null
}

export interface InvoiceImportRow {
  id: string
  user_id: string
  card_id: string | null
  file_name: string
  total: number
  item_count: number
  previous_invoice: number
  imported_at: string
}

export interface BudgetRow extends Timestamps {
  id: string
  user_id: string
  category: CategoryId
  limit_amount: number
}

export interface GoalRow extends Timestamps {
  id: string
  user_id: string
  name: string
  target: number
  initial_saved: number
  target_month: string | null // 'yyyy-mm-01'
}

/** view goal_progress */
export interface GoalProgressRow extends GoalRow { deposited: number; saved: number; deposit_count: number }

export interface GoalDepositRow extends Timestamps {
  id: string
  user_id: string
  goal_id: string
  amount: number
  date: string
  note: string | null
}

export interface AssistantMessageRow {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

/** view account_summary */
export interface AccountSummaryRow { user_id: string; base_balance: number; spent_total: number; moved_to_goals: number; balance: number }

/** O que o cliente manda num insert: sem user_id/created_at/updated_at (o banco preenche). */
export type Insert<R> = Omit<R, 'user_id' | 'created_at' | 'updated_at'>
/** O que o cliente manda num update: qualquer subconjunto, sem id/user_id. */
export type Update<R> = Partial<Omit<R, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
