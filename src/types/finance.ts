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
  /** fatura importada que criou este lançamento (desfazer a importação apaga os dela) */
  importId?: string
  /** a leitura de fatura marcou como assinatura recorrente */
  isSubscription?: boolean
  note?: string
}

export interface Card {
  id: string
  nickname: string
  last4: string
  invoice: number // fatura atual (à mão)
  limit: number
  /** dia do mês em que a fatura vence (1–31). "Vence em N dias" é calculado: lib/cards.ts */
  dueDay: number
  color: 'gradient' | 'lilac' | 'offwhite'
}

export interface Goal {
  id: string
  name: string
  target: number
  /** quanto a pessoa já tinha guardado antes de criar a meta no app (não sai do saldo) */
  initialSaved: number
  /** DERIVADO: initialSaved + soma dos depósitos. O store recalcula; no banco é a view goal_progress */
  saved: number
  date?: string // "YYYY-MM" (aceita também texto livre legado, ex: "Dez 2027")
}

/** Cada vez que a pessoa guarda um valor numa meta. Sai do saldo. */
export interface GoalDeposit {
  id: string
  goalId: string
  amount: number
  date: string // yyyy-mm-dd
  note?: string
}

/** Registro de uma fatura lida e confirmada (estágio 2). */
export interface InvoiceImport {
  id: string
  cardId: string
  fileName: string
  total: number
  itemCount: number
  date: string // yyyy-mm-dd
  /** valor da fatura do cartão antes da importação — volta a ele se a importação for desfeita */
  previousInvoice: number
}

/** Mensagem salva da conversa com o assistente (estágio 2). */
export interface ChatEntry {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string // ISO
}

export interface Budget { category: CategoryId; limit: number }

export interface User {
  name: string
  email: string
  /** foto de perfil: caminho público (ex.: avatars/pablo.webp) ou data URL enviada pela pessoa */
  avatar?: string
}

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
  /** versão do formato salvo; loadFor migra dados antigos */
  version: 2
  user: User | null
  hideBalance: boolean
  baseBalance: number // saldo antes dos gastos e do que foi guardado
  /** DERIVADO: soma de deposits (o store recalcula) */
  movedToGoals: number
  lastMonthTotal: number
  monthCap: number
  transactions: Transaction[]
  cards: Card[]
  budgets: Budget[]
  goals: Goal[]
  deposits: GoalDeposit[]
  imports: InvoiceImport[]
  chat: ChatEntry[]
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
