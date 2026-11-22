/** Vencimento do cartão. No banco guardamos o DIA do vencimento (1–31);
 *  "vence em N dias" muda todo dia, então é sempre calculado. */
import type { Card } from '@/types/finance'

const lastDay = (y: number, m: number) => new Date(y, m + 1, 0).getDate()

/** Próxima data de vencimento a partir de hoje (hoje conta como "vence hoje"). */
export function nextDueDate(dueDay: number, today = new Date()) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let y = t.getFullYear()
  let m = t.getMonth()
  let d = Math.min(dueDay, lastDay(y, m))
  if (d < t.getDate()) {
    m += 1
    if (m > 11) { m = 0; y += 1 }
    d = Math.min(dueDay, lastDay(y, m))
  }
  return new Date(y, m, d)
}

export function daysUntilDue(dueDay: number, today = new Date()) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((nextDueDate(dueDay, today).getTime() - t.getTime()) / 86_400_000)
}

export const dueIn = (c: Pick<Card, 'dueDay'>) => daysUntilDue(c.dueDay)

/** "vence hoje" / "vence amanhã" / "vence em 8 dias" */
export function dueLabel(c: Pick<Card, 'dueDay'>) {
  const n = dueIn(c)
  return n === 0 ? 'hoje' : n === 1 ? 'amanhã' : `em ${n} dias`
}

/** Dia do mês que fica a N dias de hoje (usado nos dados de exemplo e na migração). */
export function dueDayFromOffset(days: number, today = new Date()) {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return d.getDate()
}
