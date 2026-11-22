import { toISODate, uid } from '@/lib/format'
import { dueDayFromOffset } from '@/lib/cards'
import type { GoalDeposit, State, Transaction } from '@/types/finance'

const day = (offset: number) => {
  const d = new Date()
  d.setDate(Math.max(1, d.getDate() - offset))
  return toISODate(d)
}

/** Conta nova: tudo vazio, só o saldo inicial que a pessoa informou no cadastro. */
export function emptyState(user: State['user'], startingBalance = 0): State {
  return {
    version: 2, user, hideBalance: false, baseBalance: startingBalance, movedToGoals: 0, lastMonthTotal: 0, monthCap: 0,
    transactions: [], cards: [], budgets: [], goals: [], deposits: [], imports: [], chat: [],
  }
}

/** Conta de demonstração. A foto vem de public/avatars (caminho relativo ao BASE_URL do Vite). */
export const DEMO_ACCOUNT = { name: 'Pablo Gama', email: 'pablo@gamora.app', password: 'gamora123', avatar: `${import.meta.env.BASE_URL}avatars/pablo.webp` }

/** Dados de referência do briefing, tratados como se a pessoa tivesse digitado.
 *  Gastos do mês somam R$ 2.340 · saldo R$ 14.500 · −12% vs mês anterior. */
export function seed(): State {
  const transactions: Transaction[] = [
    { id: uid(), name: 'Mercado', category: 'alimentacao', method: 'principal', date: day(0), amount: 412.8 },
    { id: uid(), name: 'Netflix', category: 'assinaturas', method: 'principal', date: day(0), amount: 55.9 },
    { id: uid(), name: 'Uber', category: 'transporte', method: 'pix', date: day(1), amount: 38.4 },
    { id: uid(), name: 'iFood', category: 'alimentacao', method: 'salario', date: day(1), amount: 89 },
    { id: uid(), name: 'Spotify', category: 'assinaturas', method: 'viagem', date: day(3), amount: 21.9 },
    { id: uid(), name: 'Restaurante', category: 'alimentacao', method: 'salario', date: day(4), amount: 158 },
    { id: uid(), name: 'Posto de gasolina', category: 'transporte', method: 'principal', date: day(6), amount: 220 },
    { id: uid(), name: 'Cinema', category: 'lazer', method: 'dinheiro', date: day(8), amount: 64 },
    { id: uid(), name: 'Conta de luz', category: 'moradia', method: 'pix', date: day(10), amount: 80 },
    { id: uid(), name: 'Aluguel', category: 'moradia', method: 'pix', date: day(16), amount: 1200 },
  ]
  // depósitos feitos pelo app (saem do saldo). O resto de "saved" já estava guardado antes.
  const deposits: GoalDeposit[] = [
    { id: uid(), goalId: 'japao', amount: 500, date: day(2) },
    { id: uid(), goalId: 'japao', amount: 500, date: day(9) },
    { id: uid(), goalId: 'reserva', amount: 250, date: day(5) },
  ]
  const moved = deposits.reduce((a, x) => a + x.amount, 0)
  return {
    version: 2,
    user: { name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email, avatar: DEMO_ACCOUNT.avatar },
    hideBalance: false,
    baseBalance: 14500 + 2340 + moved, // saldo de R$ 14.500 depois dos gastos e dos depósitos
    movedToGoals: moved,
    lastMonthTotal: 2659,
    monthCap: 3200,
    transactions,
    cards: [
      { id: 'principal', nickname: 'Principal', last4: '4552', invoice: 1284, limit: 3000, dueDay: dueDayFromOffset(8), color: 'gradient' },
      { id: 'salario', nickname: 'Salário', last4: '6917', invoice: 640, limit: 2500, dueDay: dueDayFromOffset(12), color: 'lilac' },
      { id: 'viagem', nickname: 'Viagem', last4: '1180', invoice: 98, limit: 1500, dueDay: dueDayFromOffset(27), color: 'offwhite' },
    ],
    budgets: [
      { category: 'alimentacao', limit: 1064 },
      { category: 'moradia', limit: 1280 },
      { category: 'transporte', limit: 646 },
      { category: 'lazer', limit: 82 },
    ],
    goals: [
      { id: 'japao', name: 'Viagem ao Japão', initialSaved: 12600, saved: 13600, target: 20000, date: '2027-12' },
      { id: 'reserva', name: 'Reserva', initialSaved: 6950, saved: 7200, target: 10000 },
      { id: 'curso', name: 'Curso', initialSaved: 2700, saved: 2700, target: 3000 },
      { id: 'carro', name: 'Carro novo', initialSaved: 9600, saved: 9600, target: 40000 },
    ],
    deposits,
    imports: [],
    chat: [],
  }
}
