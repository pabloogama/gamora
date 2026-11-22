/** Modelo de domínio do Gamora.
 *  Espelha as tabelas previstas em supabase/migrations — mantenha os dois em sincronia. */

export type CategoryId = 'moradia' | 'alimentacao' | 'transporte' | 'lazer' | 'assinaturas' | 'saude' | 'outros'
export type PayMethod = string // card id, 'dinheiro' or 'pix'

export interface Transaction {
  id: string
  name: string
  category: CategoryId
  method: PayMethod
  date: string // yyyy-mm-dd
  amount: number // gasto, sempre positivo (exibido com −)
  source?: 'manual' | 'invoice' // 'invoice' = veio da leitura de fatura (estágio 2)
}

export interface Card {
  id: string
  nickname: string
  last4: string
  invoice: number // fatura atual (à mão)
  limit: number
  dueInDays: number
  color: 'gradient' | 'lilac' | 'offwhite'
}

export interface Goal {
  id: string
  name: string
  saved: number
  target: number
  date?: string // "YYYY-MM" (aceita também texto livre legado, ex: "Dez 2027")
}

export interface Budget { category: CategoryId; limit: number }

export interface User { name: string; email: string }

/** Item que a leitura de fatura devolve para a pessoa confirmar */
export interface InvoiceItem {
  id: string
  name: string
  amount: number
  category: CategoryId
  date: string
  isSubscription: boolean
}

export interface InvoiceResult {
  fileName: string
  items: InvoiceItem[]
  total: number
}

export interface State {
  user: User | null
  hideBalance: boolean
  baseBalance: number // saldo antes dos gastos e do que foi guardado
  movedToGoals: number
  lastMonthTotal: number
  monthCap: number
  transactions: Transaction[]
  cards: Card[]
  budgets: Budget[]
  goals: Goal[]
}

export const CATEGORIES: Record<CategoryId, { label: string }> = {
  moradia: { label: 'Moradia' },
  alimentacao: { label: 'Alimentação' },
  transporte: { label: 'Transporte' },
  lazer: { label: 'Lazer' },
  assinaturas: { label: 'Assinaturas' },
  saude: { label: 'Saúde' },
  outros: { label: 'Outros' },
}
