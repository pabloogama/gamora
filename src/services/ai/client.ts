/**
 * Cliente do Estágio 2 (OpenAI).
 *
 * VITE_FEATURE_AI=false → respostas simuladas (./mock.ts), para validar a interface.
 * VITE_FEATURE_AI=true  → chama as rotas do NOSSO servidor (/api/*, Vercel Functions),
 *                         que guardam a OPENAI_API_KEY. O navegador nunca fala com a OpenAI.
 * Rotas: api/assistant.ts e api/invoice.ts (exigem login do Supabase: mandamos o access_token).
 */
import { env } from '@/config/env'
import type { InvoiceResult, State } from '@/types/finance'
import { mockAsk, mockReadInvoice } from './mock'
import { supabase } from '@/services/supabase/client'

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

/** Com a IA ligada, o arquivo passa por uma Vercel Function (corpo máximo ≈ 4,5 MB). */
export const INVOICE_LIMIT_MB = env.featureAI ? 4 : 10
export const INVOICE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']

/** Valida antes de enviar. Retorna a mensagem de erro, ou '' se estiver ok. */
export function validateInvoiceFile(file: File) {
  const okType = INVOICE_TYPES.includes(file.type) || /\.(pdf|jpe?g|png|webp|heic)$/i.test(file.name)
  if (!okType) return 'Envie um PDF ou uma foto (JPG, PNG, WEBP ou HEIC).'
  if (file.size > INVOICE_LIMIT_MB * 1024 * 1024) return `O arquivo passa de ${INVOICE_LIMIT_MB} MB. Envie uma versão menor.`
  return ''
}

/** Cabeçalho com o login atual: as rotas /api recusam quem não está logado. */
async function authHeaders(): Promise<Record<string, string>> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Entre na sua conta para usar a IA.')
  return { Authorization: `Bearer ${token}` }
}

/** Mensagem de erro que a rota devolveu ({ error }), ou uma genérica. */
async function apiError(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { error?: string } | null
  return new Error(body?.error || `${fallback} (${res.status})`)
}

/** POST /api/assistant — o servidor monta o contexto pelo login (não confia no navegador). */
export async function askAssistant(messages: ChatMessage[], state: State, signal?: AbortSignal): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? ''
  if (!env.featureAI) return mockAsk(last, state, signal)
  const res = await fetch(`${env.apiBaseUrl}/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ messages: messages.slice(-12) }),
    signal,
  })
  if (!res.ok) throw await apiError(res, 'Assistente indisponível')
  return ((await res.json()) as { reply: string }).reply
}

/** POST /api/invoice — PDF ou foto; volta a lista para a pessoa confirmar. */
export async function readInvoice(file: File, onStep: (step: number) => void, signal?: AbortSignal, sample = false): Promise<InvoiceResult> {
  // "Testar com um exemplo" usa sempre a leitura simulada (o arquivo de exemplo não é uma fatura real)
  if (!env.featureAI || sample) return mockReadInvoice(file, onStep, signal)
  onStep(0)
  const body = new FormData()
  body.append('file', file)
  // a leitura real não tem progresso: avança as etapas enquanto espera
  let step = 0
  const timer = setInterval(() => { if (step < 2) onStep(++step) }, 2500)
  let res: Response
  try {
    res = await fetch(`${env.apiBaseUrl}/invoice`, { method: 'POST', body, signal, headers: await authHeaders() })
  } finally {
    clearInterval(timer)
  }
  onStep(3)
  if (!res.ok) throw await apiError(res, 'Não foi possível ler a fatura')
  const data = (await res.json()) as Omit<InvoiceResult, 'fileName'>
  return { ...data, fileName: file.name }
}
