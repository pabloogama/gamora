import { toISODate, uid } from '@/lib/format'
import type { State, Transaction } from '@/types/finance'

const day = (offset: number) => {
  const d = new Date()
  d.setDate(Math.max(1, d.getDate() - offset))
  return toISODate(d)
}

/** Dados de referência do briefing, tratados como se Lucas tivesse digitado.
 *  Gastos do mês somam R$ 2.340 · saldo R$ 14.500 · −12% vs mês anterior. */
/** Conta nova: tudo vazio, só o saldo inicial que a pessoa informou no cadastro. */
export function emptyState(user: State['user'], startingBalance = 0): State {
  return {
    user, hideBalance: false, baseBalance: startingBalance, movedToGoals: 0, lastMonthTotal: 0, monthCap: 0,
    transactions: [], cards: [], budgets: [], goals: [],
  }
}

export const DEMO_ACCOUNT = { name: 'Lucas', email: 'lucas@gamora.app', password: 'gamora123' }

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
  return {
    user: { name: 'Lucas', email: 'lucas@gamora.app' },
    hideBalance: false,
    baseBalance: 14500 + 2340,
    movedToGoals: 0,
    lastMonthTotal: 2659,
    monthCap: 3200,
    transactions,
    cards: [
      { id: 'principal', nickname: 'Principal', last4: '4552', invoice: 1284, limit: 3000, dueInDays: 8, color: 'gradient' },
      { id: 'salario', nickname: 'Salário', last4: '6917', invoice: 640, limit: 2500, dueInDays: 12, color: 'lilac' },
      { id: 'viagem', nickname: 'Viagem', last4: '1180', invoice: 98, limit: 1500, dueInDays: 27, color: 'offwhite' },
    ],
    budgets: [
      { category: 'alimentacao', limit: 1064 },
      { category: 'moradia', limit: 1280 },
      { category: 'transporte', limit: 646 },
      { category: 'lazer', limit: 82 },
    ],
    goals: [
      { id: 'japao', name: 'Viagem ao Japão', saved: 13600, target: 20000, date: '2027-12' },
      { id: 'reserva', name: 'Reserva', saved: 7200, target: 10000 },
      { id: 'curso', name: 'Curso', saved: 2700, target: 3000 },
      { id: 'carro', name: 'Carro novo', saved: 9600, target: 40000 },
    ],
  }
}
