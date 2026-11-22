const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const brl0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

/** R$ 1.284,00 — or R$ 14.500 when the value is whole and `compact` is set */
export function money(v: number, compact = false) {
  const s = compact && Number.isInteger(v) ? brl0.format(v) : brl.format(v)
  return s.replace(/ /g, ' ')
}

export const pct = (part: number, whole: number) => (whole <= 0 ? 0 : Math.round((part / whole) * 100))

export function parseMoney(input: string): number {
  const clean = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = Number(clean)
  return Number.isFinite(n) ? n : NaN
}

/** typed digits → "1.234,56" mask (cents-first, like bank apps) */
export function maskMoney(raw: string) {
  const digits = raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 11)
  if (!digits) return ''
  const n = Number(digits) / 100
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const toISODate = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

export function relativeDay(iso: string) {
  const today = toISODate(new Date())
  const y = new Date(); y.setDate(y.getDate() - 1)
  if (iso === today) return 'Hoje'
  if (iso === toISODate(y)) return 'Ontem'
  const [yy, mm, dd] = iso.split('-').map(Number)
  return new Date(yy, mm - 1, dd).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

export const monthName = (d: Date, offset = 0) =>
  new Date(d.getFullYear(), d.getMonth() + offset, 1).toLocaleDateString('pt-BR', { month: 'long' })

export const daysLeftInMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate()

/** id gerado no aparelho. UUID v4 para o banco aceitar o mesmo id (tabelas usam uuid). */
export const uid = (): string => {
  try { if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID() } catch { /* contexto sem crypto */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
