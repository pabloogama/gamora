/**
 * Cliente do Estágio 2 (OpenAI).
 *
 * VITE_FEATURE_AI=false → respostas simuladas (./mock.ts), para validar a interface.
 * VITE_FEATURE_AI=true  → chama as rotas do NOSSO servidor (/api/*, Vercel Functions),
 *                         que guardam a OPENAI_API_KEY. O navegador nunca fala com a OpenAI.
 * Exemplos de rota: api/_examples/*.example.ts
 */
import { env } from '@/config/env'
import type { InvoiceResult, State } from '@/types/finance'
import { mockAsk, mockReadInvoice } from './mock'

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export const INVOICE_LIMIT_MB = 10
export const INVOICE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']

/** Valida antes de enviar. Retorna a mensagem de erro, ou '' se estiver ok. */
export function validateInvoiceFile(file: File) {
  const okType = INVOICE_TYPES.includes(file.type) || /\.(pdf|jpe?g|png|webp|heic)$/i.test(file.name)
  if (!okType) return 'Envie um PDF ou uma foto (JPG, PNG, WEBP ou HEIC).'
  if (file.size > INVOICE_LIMIT_MB * 1024 * 1024) return `O arquivo passa de ${INVOICE_LIMIT_MB} MB. Envie uma versão menor.`
  return ''
}

/** Contexto enviado ao assistente: só o necessário, nunca dados de login. */
export function buildContext(s: State) {
  return {
    transactions: s.transactions.slice(0, 200).map(({ name, category, date, amount }) => ({ name, category, date, amount })),
    cards: s.cards.map(({ nickname, invoice, limit, dueInDays }) => ({ nickname, invoice, limit, dueInDays })),
    goals: s.goals.map(({ name, saved, target, date }) => ({ name, saved, target, date })),
    budgets: s.budgets,
    monthCap: s.monthCap,
  }
}

/** POST /api/assistant — chat com o contexto do app. */
export async function askAssistant(messages: ChatMessage[], state: State, signal?: AbortSignal): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? ''
  if (!env.featureAI) return mockAsk(last, state, signal)
  const res = await fetch(`${env.apiBaseUrl}/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context: buildContext(state) }),
    signal,
  })
  if (!res.ok) throw new Error(`Assistente indisponível (${res.status})`)
  return ((await res.json()) as { reply: string }).reply
}

/** POST /api/invoice — PDF ou foto; volta a lista para a pessoa confirmar. */
export async function readInvoice(file: File, onStep: (step: number) => void, signal?: AbortSignal): Promise<InvoiceResult> {
  if (!env.featureAI) return mockReadInvoice(file, onStep, signal)
  onStep(0)
  const body = new FormData()
  body.append('file', file)
  const res = await fetch(`${env.apiBaseUrl}/invoice`, { method: 'POST', body, signal })
  onStep(3)
  if (!res.ok) throw new Error(`Não foi possível ler a fatura (${res.status})`)
  const data = (await res.json()) as Omit<InvoiceResult, 'fileName'>
  return { ...data, fileName: file.name }
}
