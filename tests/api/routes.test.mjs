// Testa as rotas /api (assistant, invoice) com Supabase REAL e uma OpenAI FALSA local
// (registra o que a rota manda e devolve respostas prontas). Não gasta créditos da OpenAI.
//
//   npx tsc -p tsconfig.api.json --noEmit false --rootDir api --outDir /tmp/apibuild
//   echo '{"type":"module"}' > /tmp/apibuild/package.json
//   API_BUILD=/tmp/apibuild VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node tests/api/routes.test.mjs
import http from 'node:http'

const BUILD = process.env.API_BUILD
const SB = process.env.VITE_SUPABASE_URL, KEY = process.env.VITE_SUPABASE_ANON_KEY
const results = []
const ok = (n, c, x = '') => results.push(`${c ? 'PASS' : 'FAIL'}  ${n}${!c && x ? `  → ${x}` : ''}`)

/* ── OpenAI falsa ── */
let last = null
let next = { status: 200, content: 'ok' }
const stub = http.createServer((req, res) => {
  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    last = { auth: req.headers.authorization, path: req.url, body: JSON.parse(body || '{}') }
    res.writeHead(next.status, { 'content-type': 'application/json' })
    res.end(next.status === 200 ? JSON.stringify({ choices: [{ message: { content: next.content } }] }) : '{"error":{"message":"x"}}')
  })
})
await new Promise((r) => stub.listen(0, '127.0.0.1', r))
process.env.OPENAI_BASE_URL = `http://127.0.0.1:${stub.address().port}/v1`
process.env.OPENAI_API_KEY = 'sk-teste-falsa'

const { POST: assistant } = await import(`${BUILD}/assistant.js`)
const { POST: invoice } = await import(`${BUILD}/invoice.js`)

const login = await (await fetch(`${SB}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: KEY, 'content-type': 'application/json' }, body: JSON.stringify({ email: 'pablo@gamora.app', password: 'gamora123' }) })).json()
const auth = { authorization: `Bearer ${login.access_token}` }
const ask = (headers, body) => assistant(new Request('http://x/api/assistant', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }))
const send = (headers, file) => { const f = new FormData(); if (file) f.append('file', file); return invoice(new Request('http://x/api/invoice', { method: 'POST', headers, body: f })) }
const body = async (r) => r.json()

try {
  /* ── /api/assistant ── */
  let r = await ask({}, { messages: [{ role: 'user', content: 'oi' }] })
  ok('assistant: sem login → 401', r.status === 401)
  r = await ask({ authorization: 'Bearer token-falso' }, { messages: [{ role: 'user', content: 'oi' }] })
  ok('assistant: token inválido → 401', r.status === 401)
  r = await ask(auth, { messages: [] })
  ok('assistant: sem pergunta → 400', r.status === 400)

  next = { status: 200, content: 'Saldo: R$ 14.500. Dá para guardar R$ 500 este mês.' }
  r = await ask(auth, { messages: [{ role: 'user', content: 'Quanto posso gastar?' }], context: { saldo: 999999 } })
  const j = await body(r)
  ok('assistant: com login → resposta da IA', r.status === 200 && j.reply.startsWith('Saldo: R$ 14.500'), JSON.stringify(j))
  ok('assistant: chave enviada só no servidor (Bearer da OpenAI)', last.auth === 'Bearer sk-teste-falsa' && last.path === '/v1/chat/completions')
  const ctxMsg = last.body.messages.find((m) => m.content.startsWith('Contexto financeiro'))
  const ctx = JSON.parse(ctxMsg.content.split('\n').slice(1).join('\n'))
  ok('assistant: contexto vem do BANCO (saldo 14.500), não do corpo (999999)', ctx.saldo === 14500, JSON.stringify(ctx.saldo))
  ok('assistant: contexto com mês atual R$ 2.340 e mês passado R$ 2.659', ctx.mesAtual.total === 2340 && ctx.mesPassado.total === 2659)
  ok('assistant: contexto com cartões, metas e tetos', ctx.cartoes.length === 3 && ctx.metas.length === 4 && ctx.tetosPorCategoria.length === 4)
  ok('assistant: modelo padrão gpt-4o-mini, última mensagem é a pergunta', last.body.model === 'gpt-4o-mini' && last.body.messages.at(-1).content === 'Quanto posso gastar?')

  next = { status: 401 }
  r = await ask(auth, { messages: [{ role: 'user', content: 'oi' }] })
  ok('assistant: chave recusada pela OpenAI → mensagem clara', r.status === 502 && (await body(r)).error.includes('OPENAI_API_KEY'))
  next = { status: 429 }
  r = await ask(auth, { messages: [{ role: 'user', content: 'oi' }] })
  ok('assistant: sem cota (429) → mensagem clara', r.status === 429 && (await body(r)).error.includes('cota'))
  const keep = process.env.OPENAI_API_KEY; delete process.env.OPENAI_API_KEY
  r = await ask(auth, { messages: [{ role: 'user', content: 'oi' }] })
  ok('assistant: sem OPENAI_API_KEY → 503 avisando', r.status === 503)
  process.env.OPENAI_API_KEY = keep

  /* ── /api/invoice ── */
  const pdf = new File(['%PDF-1.4 fatura'], 'fatura.pdf', { type: 'application/pdf' })
  r = await send({}, pdf)
  ok('invoice: sem login → 401', r.status === 401)
  r = await send(auth, null)
  ok('invoice: sem arquivo → 400', r.status === 400)
  r = await send(auth, new File(['x'], 'foto.heic', { type: 'image/heic' }))
  ok('invoice: HEIC → 415 pedindo JPG/PNG', r.status === 415 && (await body(r)).error.includes('HEIC'))
  r = await send(auth, new File([new Uint8Array(4 * 1024 * 1024 + 10)], 'g.pdf', { type: 'application/pdf' }))
  ok('invoice: acima de 4 MB → 413', r.status === 413)

  next = { status: 200, content: JSON.stringify({ items: [
    { name: 'Netflix', amount: 55.9, date: '2026-11-03', category: 'assinaturas', isSubscription: true },
    { name: 'Estorno esquisito', amount: -20, date: '2026-11-04', category: 'outros', isSubscription: false },
    { name: 'Padaria', amount: 32.456, date: 'ontem', category: 'comida', isSubscription: false },
    { name: '  ', amount: 0, date: '2026-11-05', category: 'lazer', isSubscription: false },
  ] }) }
  r = await send(auth, pdf)
  const inv = await body(r)
  const part = last.body.messages[0].content[1]
  ok('invoice: PDF vai como arquivo para a OpenAI', part.type === 'file' && part.file.file_data.startsWith('data:application/pdf;base64,'))
  ok('invoice: resposta em JSON com schema fixo', last.body.response_format?.type === 'json_schema' && last.body.response_format.json_schema.strict === true)
  ok('invoice: itens normalizados (valor 0 e estorno negativo saem)', inv.items.length === 2, JSON.stringify(inv.items))
  const pad = inv.items.find((i) => i.name === 'Padaria')
  ok('invoice: categoria inválida → outros; data inválida → hoje; 2 casas', pad.category === 'outros' && /^\d{4}-\d{2}-\d{2}$/.test(pad.date) && pad.amount === 32.46)
  ok('invoice: cada item com id UUID', inv.items.every((i) => /^[0-9a-f-]{36}$/.test(i.id)))
  ok('invoice: total recalculado no servidor (55,90 + 32,46)', inv.total === 88.36, String(inv.total))

  next = { status: 200, content: '{"items":[]}' }
  r = await send(auth, new File([new Uint8Array([0xff, 0xd8, 0xff])], 'f.jpg', { type: 'image/jpeg' }))
  ok('invoice: foto vai como imagem', last.body.messages[0].content[1].type === 'image_url')
  ok('invoice: nada encontrado → 422 com explicação', r.status === 422)
} catch (e) {
  results.push('FAIL  travou: ' + e.message)
}
stub.close()
console.log(results.join('\n'))
console.log(`\n${results.filter((x) => x.startsWith('PASS')).length}/${results.length} passaram`)
