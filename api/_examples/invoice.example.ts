/**
 * EXEMPLO — Estágio 2 · Leitura de fatura (PDF ou foto)
 *
 * Status: DESLIGADO. Copie para api/invoice.ts para ativar.
 * Fluxo: front envia o arquivo → esta rota manda para a OpenAI (visão)
 * → devolve compras + assinaturas + total → a pessoa CONFIRMA no app
 * → os lançamentos entram no mesmo lugar do gasto manual.
 *
 * Observação: aqui o exemplo trata FOTO (imagem). Para PDF, use a Files API
 * da OpenAI (upload + file_id) ou extraia o texto antes de enviar.
 */

const PROMPT = `Leia esta fatura de cartão brasileira e responda SOMENTE JSON:
{"items":[{"name":string,"amount":number,"category":"moradia|alimentacao|transporte|lazer|assinaturas|saude|outros","isSubscription":boolean}],"total":number,"subscriptions":number}
Valores em reais, positivos, ponto como decimal.`

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return Response.json({ error: 'OPENAI_API_KEY ausente' }, { status: 500 })

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return Response.json({ error: 'Envie um arquivo' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: 'Arquivo acima de 10 MB' }, { status: 413 })
  if (!file.type.startsWith('image/')) return Response.json({ error: 'Exemplo aceita só imagem; ver nota sobre PDF' }, { status: 415 })

  const bytes = new Uint8Array(await file.arrayBuffer())
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  const dataUrl = `data:${file.type};base64,${btoa(bin)}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      }],
    }),
  })

  if (!res.ok) return Response.json({ error: 'Falha na OpenAI' }, { status: 502 })
  const data = await res.json()
  try {
    return Response.json(JSON.parse(data.choices?.[0]?.message?.content ?? '{}'))
  } catch {
    return Response.json({ error: 'Resposta inválida da IA' }, { status: 502 })
  }
}

export const config = { runtime: 'edge' }
