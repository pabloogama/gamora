/**
 * POST /api/invoice — Estágio 2 · Leitura de fatura (OpenAI).
 *
 * Corpo: multipart/form-data com o campo "file" (PDF, JPG, PNG ou WEBP; até 4 MB,
 *        limite de corpo das Vercel Functions ≈ 4,5 MB).
 * Cabeçalho: Authorization: Bearer <access_token do Supabase>
 * Resposta: { items: InvoiceItem[], total: number } — a pessoa REVISA e CONFIRMA no app;
 *           só então os lançamentos são gravados (RPC import_invoice).
 */
import { randomUUID } from 'node:crypto'
import { fail, HttpError, json, openai, requireUser, toResponse } from './_lib/shared.js'

const CATEGORIES = ['moradia', 'alimentacao', 'transporte', 'lazer', 'assinaturas', 'saude', 'outros'] as const
type Category = (typeof CATEGORIES)[number]
const MAX_BYTES = 4 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const PROMPT = `Você recebe a fatura de um cartão de crédito brasileiro (PDF ou foto).
Liste TODAS as compras/débitos do período, uma por linha da fatura:
- name: nome do estabelecimento, curto e legível (ex.: "iFood", "Posto Shell", "Netflix").
- amount: valor em reais, positivo, ponto como separador decimal. Compra parcelada: só o valor da parcela desta fatura.
- date: data da compra no formato YYYY-MM-DD (deduza o ano pelo vencimento da fatura).
- category: uma de moradia, alimentacao, transporte, lazer, assinaturas, saude, outros.
- isSubscription: true para cobranças recorrentes (streaming, música, apps, academia, nuvem).
NÃO inclua: pagamentos da fatura anterior, créditos, estornos, saldo anterior nem totais.
Inclua tarifas, anuidade, IOF e juros como category "outros".
Se a imagem não for uma fatura legível, devolva items vazio.`

const SCHEMA = {
  name: 'fatura',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['items'],
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'amount', 'date', 'category', 'isSubscription'],
          properties: {
            name: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string' },
            category: { type: 'string', enum: [...CATEGORIES] },
            isSubscription: { type: 'boolean' },
          },
        },
      },
    },
  },
}

const today = () => new Date().toISOString().slice(0, 10)

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await requireUser(req)
    if (user instanceof Response) return user

    const form = await req.formData().catch(() => null)
    const file = form?.get('file')
    if (!file || typeof file === 'string') return fail(400, 'Envie o arquivo da fatura.')
    if (file.size > MAX_BYTES) return fail(413, 'O arquivo passa de 4 MB. Envie uma versão menor.')
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    if (!isPdf && !IMAGE_TYPES.includes(file.type)) {
      return fail(415, file.type === 'image/heic' || /\.heic$/i.test(file.name)
        ? 'Foto em HEIC ainda não é lida. Envie em JPG ou PNG.'
        : 'Envie um PDF ou uma foto (JPG, PNG ou WEBP).')
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
    const attachment = isPdf
      ? { type: 'file', file: { filename: file.name || 'fatura.pdf', file_data: `data:application/pdf;base64,${base64}` } }
      : { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}`, detail: 'high' } }

    const raw = await openai({
      model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_schema', json_schema: SCHEMA },
      messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, attachment] }],
    })

    let parsed: { items?: { name: string; amount: number; date: string; category: string; isSubscription: boolean }[] }
    try { parsed = JSON.parse(raw) } catch { throw new HttpError(502, 'A IA devolveu uma resposta inválida. Tente de novo.') }

    // nunca confiar cegamente: normaliza tudo antes de mandar para a tela
    const items = (parsed.items ?? [])
      .map((i) => ({
        id: randomUUID(),
        name: String(i.name ?? '').trim().slice(0, 40) || 'Compra',
        amount: Math.round(Number(i.amount) * 100) / 100, // negativo = estorno/crédito: sai no filtro abaixo
        date: /^\d{4}-\d{2}-\d{2}$/.test(i.date) && !Number.isNaN(Date.parse(i.date)) ? i.date : today(),
        category: (CATEGORIES as readonly string[]).includes(i.category) ? (i.category as Category) : 'outros',
        isSubscription: Boolean(i.isSubscription),
      }))
      .filter((i) => Number.isFinite(i.amount) && i.amount > 0)
    if (!items.length) return fail(422, 'Não encontramos compras nesse arquivo. Confira se é a fatura do cartão e se está legível.')

    const total = Math.round(items.reduce((a, i) => a + i.amount, 0) * 100) / 100
    return json({ items, total })
  } catch (e) {
    return toResponse(e)
  }
}
