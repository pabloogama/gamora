const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Aceita "YYYY-MM" e o formato legado "Dez 2027". */
export function parseGoalDate(date?: string): { y: number; m: number } | null {
  if (!date) return null
  const iso = /^(\d{4})-(\d{2})$/.exec(date)
  if (iso) return { y: +iso[1], m: +iso[2] - 1 }
  const legacy = /^([a-zç]{3})\w*\.?\s+(\d{4})$/i.exec(date.trim())
  if (legacy) {
    const m = MONTHS.indexOf(legacy[1].toLowerCase())
    if (m >= 0) return { y: +legacy[2], m }
  }
  return null
}

export function formatGoalDate(date?: string) {
  const p = parseGoalDate(date)
  if (!p) return date ?? ''
  const s = MONTHS[p.m]
  return `${s.charAt(0).toUpperCase()}${s.slice(1)} ${p.y}`
}

/** Meses inteiros de hoje até o mês da meta (0 se já passou ou sem data). */
export function monthsUntil(date?: string) {
  const p = parseGoalDate(date)
  if (!p) return 0
  const now = new Date()
  return Math.max(0, (p.y - now.getFullYear()) * 12 + (p.m - now.getMonth()))
}

export function toMonthInput(date?: string) {
  const p = parseGoalDate(date)
  return p ? `${p.y}-${String(p.m + 1).padStart(2, '0')}` : ''
}
