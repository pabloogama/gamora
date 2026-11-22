/**
 * EXEMPLO — Estágio 2 · Assistente (chat com o dinheiro da pessoa)
 *
 * Status: DESLIGADO. Pastas/arquivos com "_" em /api não viram função na Vercel.
 * Para ativar: copie para api/assistant.ts, configure OPENAI_API_KEY na Vercel
 * (Settings → Environment Variables) e defina VITE_FEATURE_AI=true.
 *
 * Segurança:
 *  • A chave só existe aqui (process.env), nunca no navegador.
 *  • O contexto vem do app; na versão com Supabase, busque-o no servidor
 *    pelo usuário autenticado em vez de confiar no corpo da requisição.
 */

interface ChatMessage { role: 'user' | 'assistant'; content: string }

const SYSTEM = `Você é o Assistente Gamora. Responda em PT-BR, curto e direto.
Sempre: número primeiro + consequência em uma linha (ex.: "Delivery: R$ 480. Reduzindo para R$ 360, a viagem chega 3 meses antes.").
Use apenas os dados do contexto. Sem conselhos genéricos, sem tom de coach, sem investimentos.`

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return Response.json({ error: 'OPENAI_API_KEY ausente' }, { status: 500 })

  const { messages, context } = (await req.json()) as { messages: ChatMessage[]; context: unknown }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'system', content: `Contexto financeiro (JSON): ${JSON.stringify(context)}` },
        ...messages.slice(-12),
      ],
    }),
  })

  if (!res.ok) return Response.json({ error: 'Falha na OpenAI' }, { status: 502 })
  const data = await res.json()
  return Response.json({ reply: data.choices?.[0]?.message?.content ?? '' })
}

export const config = { runtime: 'edge' }
