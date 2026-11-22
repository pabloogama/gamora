/**
 * Respostas SIMULADAS do estágio 2 (VITE_FEATURE_AI=false).
 * Servem para validar a interface. Os números do assistente são calculados
 * a partir dos dados reais do app, como a OpenAI fará com o mesmo contexto.
 */
import type { CategoryId, InvoiceItem, InvoiceResult, State } from '@/types/finance'
import { CATEGORIES } from '@/types/finance'
import { money, toISODate, uid } from '@/lib/format'
import { monthsUntil } from '@/lib/goals'
import { dueLabel } from '@/lib/cards'

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Cancelado', 'AbortError')) })
  })

/* ---------------- Leitura de fatura ---------------- */

// 6 assinaturas + 28 compras = 34 itens · total R$ 1.284,00 (dados do briefing)
const SUBS: [string, number][] = [
  ['Smart Fit', 119.9], ['Netflix', 55.9], ['Disney+', 43.9], ['YouTube Premium', 24.9], ['Spotify', 21.9], ['iCloud+', 12.9],
]
const BUYS: [string, CategoryId, number][] = [
  ['iFood', 'alimentacao', 62.4], ['Uber', 'transporte', 23.8], ['Mercado Extra', 'alimentacao', 58.35], ['iFood', 'alimentacao', 48.9],
  ['Drogasil', 'saude', 36.7], ['Uber', 'transporte', 18.6], ['Padaria Real', 'alimentacao', 21.5], ['Shell', 'transporte', 50],
  ['iFood', 'alimentacao', 57.3], ['Cinemark', 'lazer', 48], ['99', 'transporte', 15.9], ['Restaurante Mocotó', 'alimentacao', 46.4],
  ['Amazon', 'outros', 34.9], ['iFood', 'alimentacao', 39.9], ['Uber', 'transporte', 27.4], ['Café Coado', 'alimentacao', 14.5],
  ['Livraria Cultura', 'lazer', 39.9], ['Estapar', 'transporte', 22], ['iFood', 'alimentacao', 44.6], ['Petz', 'outros', 33.9],
  ['Uber', 'transporte', 19.7], ['Hortifruti', 'alimentacao', 27.85], ['Ingresso.com', 'lazer', 31.5], ['Padaria Real', 'alimentacao', 12.8],
  ['Riachuelo', 'outros', 0], // ajustado abaixo para fechar o total
  ['iFood', 'alimentacao', 36.2], ['Uber', 'transporte', 14.9], ['Farmácia Pague Menos', 'saude', 21.4],
]
const TOTAL = 1284

function buildItems(): InvoiceItem[] {
  const subsSum = SUBS.reduce((a, [, v]) => a + v, 0)
  const buysSum = BUYS.reduce((a, [, , v]) => a + v, 0)
  const filler = +(TOTAL - subsSum - buysSum).toFixed(2)
  const now = new Date()
  const dateBack = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); return toISODate(d) }
  const items: InvoiceItem[] = [
    ...SUBS.map(([name, amount], i) => ({ id: uid(), name, amount, category: 'assinaturas' as CategoryId, date: dateBack(2 + i * 4), isSubscription: true })),
    ...BUYS.map(([name, category, amount], i) => ({ id: uid(), name, category, amount: amount || filler, date: dateBack(1 + ((i * 7) % 29)), isSubscription: false })),
  ]
  return items.sort((a, b) => b.date.localeCompare(a.date))
}

export async function mockReadInvoice(file: File, onStep: (step: number) => void, signal?: AbortSignal): Promise<InvoiceResult> {
  for (let step = 0; step < 4; step++) { onStep(step); await wait(850, signal) }
  const items = buildItems()
  return { fileName: file.name, items, total: +items.reduce((a, i) => a + i.amount, 0).toFixed(2) }
}

/* ---------------- Assistente ---------------- */

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w))
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export interface Insight { context: string; number: string; consequence: string }

/** Insight para o card de Metas: maior ganho fácil nos dados atuais. */
export function topInsight(s: State): Insight | null {
  const subs = s.transactions.filter((t) => t.category === 'assinaturas')
  const byName = new Map<string, number>()
  subs.forEach((t) => byName.set(t.name, Math.max(byName.get(t.name) ?? 0, t.amount)))
  const top2 = [...byName.values()].sort((a, b) => b - a).slice(0, 2)
  const goal = s.goals[0]
  if (top2.length >= 2) {
    const save = top2[0] + top2[1]
    const per = goal ? monthlyNeed(goal.target - goal.saved, goal.date) : 0
    const ahead = per > 0 ? Math.floor((save * monthsUntil(goal!.date)) / per) : 0
    return {
      context: 'Assinaturas',
      number: `+ ${money(save)}/mês`,
      consequence: goal && ahead > 0 ? `Cancelando 2 assinaturas, ${goal.name} chega ${ahead} ${ahead === 1 ? 'mês' : 'meses'} antes.` : 'Cancelando 2 assinaturas, sobra esse valor todo mês.',
    }
  }
  if (goal) {
    const per = monthlyNeed(goal.target - goal.saved, goal.date)
    return { context: 'Objetivo', number: `${money(per, true)}/mês`, consequence: `É o que falta guardar por mês para ${goal.name} no prazo.` }
  }
  return null
}

function monthlyNeed(left: number, date?: string) {
  const m = monthsUntil(date)
  return left <= 0 ? 0 : m > 0 ? Math.ceil(left / m) : left
}

export async function mockAsk(question: string, s: State, signal?: AbortSignal): Promise<string> {
  await wait(900, signal)
  const q = norm(question)
  const ym = toISODate(new Date()).slice(0, 7)
  const month = s.transactions.filter((t) => t.date.startsWith(ym))
  const monthTotal = month.reduce((a, t) => a + t.amount, 0)
  const goal = s.goals[0]

  if (has(q, 'delivery', 'ifood', 'pedido', 'comida')) {
    const delivery = month.filter((t) => /ifood|rappi|delivery|ze delivery/i.test(t.name))
    const total = delivery.reduce((a, t) => a + t.amount, 0)
    if (!total) return 'Delivery: R$ 0 este mês. Nenhuma compra de iFood ou delivery registrada.'
    const cut = Math.round(total * 0.25)
    const tail = goal ? ` Cortando um quarto disso, ${money(cut, true)}/mês vão para ${goal.name}.` : ''
    return `Delivery: ${money(total)} este mês, em ${delivery.length} pedidos.${tail}`
  }
  if (has(q, 'viagem', 'japao', 'guardar', 'guardo', 'meta', 'objetivo')) {
    if (!goal) return 'Você ainda não tem metas. Crie uma em Metas e eu calculo quanto guardar por mês.'
    const left = goal.target - goal.saved
    const per = monthlyNeed(left, goal.date)
    const m = monthsUntil(goal.date)
    if (left <= 0) return `${goal.name}: meta batida. Você já guardou ${money(goal.saved, true)}.`
    return `${goal.name}: faltam ${money(left, true)}.${m > 0 ? ` Guardando ${money(per, true)}/mês, você chega lá em ${m} meses.` : ''} Reduzindo R$ 120/mês em delivery, sobra mais para ela.`
  }
  if (has(q, 'assinatura', 'netflix', 'spotify', 'cancelar')) {
    const subs = s.transactions.filter((t) => t.category === 'assinaturas')
    const names = [...new Map(subs.map((t) => [t.name, t.amount])).entries()].sort((a, b) => b[1] - a[1])
    if (!names.length) return 'Nenhuma assinatura registrada. Envie a fatura e eu encontro as recorrentes.'
    const sum = names.reduce((a, [, v]) => a + v, 0)
    const top = names.slice(0, 2)
    return `Assinaturas: ${money(sum)}/mês em ${names.length} serviços. Cancelando ${top.map(([n]) => n).join(' e ')}, sobram ${money(top[0][1] + (top[1]?.[1] ?? 0))} por mês.`
  }
  if (has(q, 'cartao', 'fatura', 'limite')) {
    const c = s.cards[0]
    if (!c) return 'Você ainda não cadastrou cartões.'
    const total = s.cards.reduce((a, x) => a + x.invoice, 0)
    return `${c.nickname}: fatura de ${money(c.invoice)}, ${Math.round((c.invoice / c.limit) * 100)}% do limite, vence ${dueLabel(c)}. Somando todos os cartões: ${money(total)}.`
  }
  if (has(q, 'posso gastar', 'sobra', 'sobrou', 'resta', 'teto', 'orcamento')) {
    if (!s.monthCap) return 'Defina o teto do mês em Metas e eu digo quanto ainda pode gastar.'
    const left = s.monthCap - monthTotal
    return left >= 0
      ? `Ainda pode gastar ${money(left, true)} de ${money(s.monthCap, true)} este mês.`
      : `Você passou do teto em ${money(-left, true)}. Segurar os próximos gastos evita puxar da reserva.`
  }
  if (has(q, 'gastei', 'gasto', 'mes', 'categoria', 'onde')) {
    const byCat = new Map<CategoryId, number>()
    month.forEach((t) => byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount))
    const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0]
    if (!top) return 'Nenhum gasto registrado este mês ainda.'
    return `Este mês: ${money(monthTotal)}. A maior parte foi ${CATEGORIES[top[0]].label}, com ${money(top[1])} (${Math.round((top[1] / monthTotal) * 100)}%).`
  }
  return 'Posso responder com os seus números: gastos do mês, delivery, assinaturas, cartões e metas. Tente "Quanto gastei com delivery?".'
}

