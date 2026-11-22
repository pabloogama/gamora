/**
 * Contratos de dados por entidade — o que o backend precisa oferecer.
 *
 * Hoje o app guarda o State inteiro no localStorage (services/storage.ts) e as
 * operações acontecem no reducer (store/index.tsx). Na integração com o Supabase,
 * cada ação do reducer vira uma chamada destes repositórios (ver docs/CRUD.md):
 *
 *   saveCard     → cards.create | cards.update     deleteCard    → cards.remove
 *   saveTx       → transactions.create | update    deleteTx      → transactions.remove
 *   saveGoal     → goals.create | goals.update     deleteGoal    → goals.remove (cascata nos depósitos)
 *   saveDeposit  → deposits.create | update        deleteDeposit → deposits.remove
 *   setBudget    → budgets.upsert                  deleteBudget  → budgets.remove
 *   importInvoice→ imports.create (+ transactions em lote, numa RPC/edge function)
 *   deleteImport → imports.remove (cascata nos lançamentos) + cards.update(invoice anterior)
 *   setCap / setBalance / toggleBalance / updateUser → profile.update
 *   chatAdd      → chat.create                     chatClear     → chat.clear
 *
 * Todas as funções são async porque no Supabase são chamadas de rede.
 * O user_id nunca vai do cliente: o banco usa auth.uid() (default + RLS).
 */
import type { Budget, Card, CategoryId, ChatEntry, Goal, GoalDeposit, InvoiceImport, Transaction, User } from '@/types/finance'

/** CRUD genérico: list (ver todos) · get (ver um) · create · update · remove. */
export interface CrudRepository<T, Id = string> {
  list(): Promise<T[]>
  get(id: Id): Promise<T | null>
  create(item: T): Promise<T>
  update(id: Id, patch: Partial<T>): Promise<T>
  remove(id: Id): Promise<void>
}

export interface TransactionQuery {
  month?: string // 'yyyy-mm'
  category?: CategoryId
  method?: string
  search?: string
  limit?: number
}

export interface TransactionsRepository extends CrudRepository<Transaction> {
  /** extrato com filtros (tela Extrato) */
  query(q: TransactionQuery): Promise<Transaction[]>
}

export interface GoalsRepository extends CrudRepository<Goal> {}

export interface DepositsRepository extends CrudRepository<GoalDeposit> {
  listByGoal(goalId: string): Promise<GoalDeposit[]>
}

/** Tetos têm chave natural (categoria): upsert faz criar e editar. */
export interface BudgetsRepository {
  list(): Promise<Budget[]>
  upsert(b: Budget): Promise<Budget>
  remove(category: CategoryId): Promise<void>
}

export interface ImportsRepository {
  list(cardId?: string): Promise<InvoiceImport[]>
  get(id: string): Promise<InvoiceImport | null>
  /** cria o registro e os lançamentos numa transação (RPC `import_invoice`) */
  create(imp: InvoiceImport, items: Transaction[]): Promise<InvoiceImport>
  /** apaga a importação; os lançamentos saem por cascata */
  remove(id: string): Promise<void>
}

export interface ChatRepository {
  list(): Promise<ChatEntry[]>
  create(entry: ChatEntry): Promise<ChatEntry>
  clear(): Promise<void>
}

export interface ProfileSettings {
  baseBalance: number
  monthCap: number
  hideBalance: boolean
  theme: 'light' | 'dark'
}

export interface ProfileRepository {
  get(): Promise<{ user: User; settings: ProfileSettings }>
  update(patch: Partial<User & ProfileSettings>): Promise<void>
  /** sobe a foto para Storage (avatars/<uid>/avatar.webp) e devolve a URL pública */
  uploadAvatar(file: Blob): Promise<string>
}

/** Tudo que o app precisa do backend, num lugar só. */
export interface DataApi {
  profile: ProfileRepository
  cards: CrudRepository<Card>
  transactions: TransactionsRepository
  goals: GoalsRepository
  deposits: DepositsRepository
  budgets: BudgetsRepository
  imports: ImportsRepository
  chat: ChatRepository
}
