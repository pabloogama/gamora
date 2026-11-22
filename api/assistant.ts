/**
 * POST /api/assistant — Estágio 2 · Assistente Gamora (OpenAI).
 *
 * Corpo: { messages: { role: 'user' | 'assistant', content: string }[] }
 * Cabeçalho: Authorization: Bearer <access_token do Supabase>
 * Resposta: { reply: string }
 *
 * O contexto financeiro é montado AQUI, lendo o banco com o login da própria
 * pessoa (RLS valendo). O corpo da requisição não é usado como fonte de dados.
 */
import { fail, HttpError, json, openai, requireUser, rest, toResponse, type AuthedUser } from './_lib/shared.js'

interface ChatMessage { role: 'user' | 'assistant'; content: string }

const SYSTEM = `Você é o Assistente Gamora, de um app brasileiro de finanças pessoais e familiares.
Responda em português do Brasil, curto e direto (no máximo 3 frases).
Formato: o número primeiro, depois a consequência prática em uma linha.
Ex.: "Delivery: R$ 480 este mês. Cortando para R$ 360, a Viagem ao Japão chega 3 meses antes."
Use SOMENTE os dados do contexto; se faltar dado, diga o que falta e como registrar no app.
Valores no formato R$ 1.234,56. Sem conselhos genéricos, sem tom de coach, sem recomendar investimentos.`

const ymd = (d: Date) => d.toISOString().slice(0, 10)

async function buildContext(user: AuthedUser) {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const lastStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate()
  const uid = `user_id=eq.${user.id}`

  type Tx = { name: string; category: string; date: string; amount: number; method: string; is_subscription: boolean }
  const [profile, summary, cards, goals, budgets, txs] = await Promise.all([
    rest<{ name: string; month_cap: number }[]>(user, `profiles?id=eq.${user.id}&select=name,month_cap`),
    rest<{ balance: number }[]>(user, `account_summary?${uid}&select=balance`),
    rest<{ nickname: string; invoice: number; credit_limit: number; due_day: number }[]>(user, `cards?${uid}&select=nickname,invoice,credit_limit,due_day`),
    rest<{ name: string; target: number; saved: number; target_month: string | null }[]>(user, `goal_progress?${uid}&select=name,target,saved,target_month`),
    rest<{ category: string; limit_amount: number }[]>(user, `budgets?${uid}&select=category,limit_amount`),
    rest<Tx[]>(user, `transactions?${uid}&date=gte.${ymd(lastStart)}&select=name,category,date,amount,method,is_subscription&order=date.desc&limit=500`),
  ])

  const thisMonth = txs.filter((t) => t.date >= ymd(monthStart))
  const lastMonth = txs.filter((t) => t.date < ymd(monthStart))
  const sum = (l: Tx[]) => +l.reduce((a, t) => a + Number(t.amount), 0).toFixed(2)
  const byCat = (l: Tx[]) => l.reduce<Record<string, number>>((m, t) => ({ ...m, [t.category]: +((m[t.category] ?? 0) + Number(t.amount)).toFixed(2) }), {})
  const spent = sum(thisMonth)
  const cap = Number(profile[0]?.month_cap ?? 0)

  return {
    hoje: ymd(now),
    diasRestantesNoMes: daysInMonth - now.getUTCDate(),
    nome: profile[0]?.name,
    saldo: Number(summary[0]?.balance ?? 0),
    mesAtual: { total: spent, porCategoria: byCat(thisMonth), tetoDoMes: cap || null, aindaPodeGastar: cap ? +(cap - spent).toFixed(2) : null },
    mesPassado: { total: sum(lastMonth), porCategoria: byCat(lastMonth) },
    tetosPorCategoria: budgets.map((b) => ({ categoria: b.category, teto: Number(b.limit_amount), gasto: byCat(thisMonth)[b.category] ?? 0 })),
    cartoes: cards.map((c) => ({ apelido: c.nickname, fatura: Number(c.invoice), limite: Number(c.credit_limit), diaVencimento: c.due_day })),
    metas: goals.map((g) => ({ nome: g.name, alvo: Number(g.target), guardado: Number(g.saved), ate: g.target_month?.slice(0, 7) ?? null })),
    assinaturas: thisMonth.filter((t) => t.is_subscription || t.category === 'assinaturas').map((t) => ({ nome: t.name, valor: Number(t.amount) })),
    lancamentosDoMes: thisMonth.slice(0, 120).map((t) => ({ nome: t.name, categoria: t.category, data: t.date, valor: Number(t.amount) })),
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await requireUser(req)
    if (user instanceof Response) return user

    const body = (await req.json().catch(() => null)) as { messages?: ChatMessage[] } | null
    const messages = (body?.messages ?? [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    if (!messages.length || messages[messages.length - 1].role !== 'user') return fail(400, 'Envie uma pergunta.')

    const context = await buildContext(user)
    const reply = await openai({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'system', content: `Contexto financeiro da pessoa (JSON):\n${JSON.stringify(context)}` },
        ...messages,
      ],
    })
    if (!reply.trim()) throw new HttpError(502, 'A IA não respondeu agora. Tente de novo.')
    return json({ reply: reply.trim() })
  } catch (e) {
    return toResponse(e)
  }
}
