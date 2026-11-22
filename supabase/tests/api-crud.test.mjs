// Validação do CRUD + RLS + Storage pela API REAL do Supabase (como o app vai usar).
// Sem dependências: Node 20+ (fetch nativo).
//
//   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_KEY=<anon/publishable> \
//   B_EMAIL=teste-rls@gamora.app B_PASSWORD=... node supabase/tests/api-crud.test.mjs
//
// Usa a conta demo (pablo@gamora.app) e uma segunda conta (B_*) para o isolamento.
// Tudo que o teste cria é apagado no fim; os dados de demonstração ficam como estavam.
import { readFileSync } from 'node:fs'

const URL_ = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_KEY
const AVATAR = process.env.AVATAR_FILE ?? 'public/avatars/pablo.webp'
if (!URL_ || !KEY) throw new Error('Defina SUPABASE_URL e SUPABASE_KEY')

const results = []
const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && extra ? `  → ${extra}` : ''}`)

async function login(email, password) {
  const r = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: KEY, 'content-type': 'application/json' }, body: JSON.stringify({ email, password }),
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`login ${email}: ${JSON.stringify(j)}`)
  return { token: j.access_token, id: j.user.id }
}

function client(token) {
  const h = (extra = {}) => ({ apikey: KEY, authorization: `Bearer ${token ?? KEY}`, 'content-type': 'application/json', ...extra })
  const call = async (method, path, body, extra) => {
    const r = await fetch(`${URL_}/rest/v1/${path}`, { method, headers: h({ prefer: 'return=representation', ...extra }), body: body ? JSON.stringify(body) : undefined })
    const text = await r.text()
    let data; try { data = text ? JSON.parse(text) : null } catch { data = text }
    return { status: r.status, data }
  }
  return {
    get: (p) => call('GET', p),
    post: (p, b, extra) => call('POST', p, b, extra),
    patch: (p, b) => call('PATCH', p, b),
    del: (p) => call('DELETE', p),
    rpc: (fn, b) => call('POST', `rpc/${fn}`, b),
    upload: (bucket, path, bytes, type) => fetch(`${URL_}/storage/v1/object/${bucket}/${path}`, { method: 'POST', headers: { apikey: KEY, authorization: `Bearer ${token ?? KEY}`, 'content-type': type, 'x-upsert': 'true' }, body: bytes }),
    download: (bucket, path) => fetch(`${URL_}/storage/v1/object/authenticated/${bucket}/${path}`, { headers: { apikey: KEY, authorization: `Bearer ${token ?? KEY}` } }),
    list: async (bucket, prefix) => (await (await fetch(`${URL_}/storage/v1/object/list/${bucket}`, { method: 'POST', headers: h(), body: JSON.stringify({ prefix }) })).json()),
    removeObj: (bucket, path) => fetch(`${URL_}/storage/v1/object/${bucket}`, { method: 'DELETE', headers: h(), body: JSON.stringify({ prefixes: [path] }) }),
  }
}

const A = await login('pablo@gamora.app', 'gamora123')
const B = await login(process.env.B_EMAIL ?? 'teste-rls@gamora.app', process.env.B_PASSWORD ?? 'teste-rls-123')
const a = client(A.token), b = client(B.token), anon = client(null)
ok('login: conta demo e conta B entram', !!A.token && !!B.token)

/* ── estado inicial (dados de demonstração) ── */
const sum0 = (await a.get('account_summary?select=balance')).data?.[0]
ok('R view account_summary: saldo demo R$ 14.500', Number(sum0?.balance) === 14500, JSON.stringify(sum0))
const cards0 = (await a.get('cards?select=id,nickname,invoice&order=nickname')).data
ok('R cards: 3 cartões da demo', cards0?.length === 3)
const principal = cards0.find((c) => c.nickname === 'Principal')

/* ── STORAGE ── */
const img = readFileSync(AVATAR)
const up = await a.upload('avatars', `${A.id}/avatar.webp`, img, 'image/webp')
ok('Storage C: foto de perfil enviada (avatars/<uid>/avatar.webp)', up.ok, await up.text())
const pub = await fetch(`${URL_}/storage/v1/object/public/avatars/${A.id}/avatar.webp`)
ok('Storage R: foto abre pela URL pública', pub.ok && pub.headers.get('content-type')?.includes('image'))
const prof = (await a.get('profiles?select=avatar_url')).data?.[0]
ok('profiles.avatar_url aponta para o Storage', prof?.avatar_url?.endsWith(`/avatars/${A.id}/avatar.webp`))
const upB = await b.upload('avatars', `${A.id}/intruso.webp`, img, 'image/webp')
ok('Storage RLS: B não grava na pasta de A', !upB.ok)
const pdf = new TextEncoder().encode('%PDF-1.4 fatura de teste')
const upInv = await a.upload('invoices', `${A.id}/teste-api.pdf`, pdf, 'application/pdf')
ok('Storage C: fatura enviada no bucket privado', upInv.ok, await upInv.text())
ok('Storage R: dona baixa a fatura', (await a.download('invoices', `${A.id}/teste-api.pdf`)).ok)
ok('Storage RLS: B não baixa a fatura de A', !(await b.download('invoices', `${A.id}/teste-api.pdf`)).ok)
ok('Storage: fatura não tem URL pública', !(await fetch(`${URL_}/storage/v1/object/public/invoices/${A.id}/teste-api.pdf`)).ok)
await a.removeObj('invoices', `${A.id}/teste-api.pdf`)
ok('Storage D: fatura apagada', !(await a.list('invoices', A.id)).some((f) => f.name === 'teste-api.pdf'))

/* ── CARTÕES ── */
let r = await a.post('cards', { nickname: 'Teste API', last4: '0001', credit_limit: 500, due_day: 5, color: 'lilac' })
const card = r.data?.[0]
ok('cards C', r.status === 201 && card?.user_id === A.id, JSON.stringify(r.data))
ok('cards R', (await a.get(`cards?id=eq.${card.id}`)).data?.length === 1)
r = await a.patch(`cards?id=eq.${card.id}`, { nickname: 'Teste API 2', due_day: 31 })
ok('cards U', r.data?.[0]?.nickname === 'Teste API 2' && r.data[0].due_day === 31)
ok('cards validação: dia 32 é recusado', (await a.patch(`cards?id=eq.${card.id}`, { due_day: 32 })).status === 400)

/* ── LANÇAMENTOS (+ fatura do cartão) ── */
r = await a.post('transactions', { name: 'Teste API', category: 'lazer', method: 'card', card_id: card.id, amount: 100 })
const tx = r.data?.[0]
ok('transactions C', r.status === 201, JSON.stringify(r.data))
ok('transactions R (extrato com filtro)', (await a.get('transactions?name=eq.Teste%20API&category=eq.lazer')).data?.length === 1)
ok('trigger: gasto soma na fatura do cartão', Number((await a.get(`cards?id=eq.${card.id}&select=invoice`)).data[0].invoice) === 100)
r = await a.patch(`transactions?id=eq.${tx.id}`, { amount: 150, note: 'editado' })
ok('transactions U', Number(r.data?.[0]?.amount) === 150 && r.data[0].note === 'editado')
ok('trigger: editar valor ajusta a fatura', Number((await a.get(`cards?id=eq.${card.id}&select=invoice`)).data[0].invoice) === 150)
ok('transactions validação: valor 0 recusado', (await a.post('transactions', { name: 'x', category: 'outros', method: 'pix', amount: 0 })).status === 400)
ok('transactions validação: pix com cartão recusado', (await a.post('transactions', { name: 'x', category: 'outros', method: 'pix', card_id: card.id, amount: 1 })).status === 400)
r = await a.del(`transactions?id=eq.${tx.id}`)
ok('transactions D', r.data?.length === 1 && (await a.get(`transactions?id=eq.${tx.id}`)).data.length === 0)
ok('trigger: apagar gasto desconta a fatura', Number((await a.get(`cards?id=eq.${card.id}&select=invoice`)).data[0].invoice) === 0)

/* ── FATURA IMPORTADA (RPCs) ── */
r = await a.rpc('import_invoice', { p_card_id: card.id, p_file_name: 'teste-api.pdf', p_items: [
  { name: 'Netflix', category: 'assinaturas', date: new Date().toISOString().slice(0, 10), amount: 55.9, is_subscription: true },
  { name: 'Riachuelo', category: 'outros', date: new Date().toISOString().slice(0, 10), amount: 95.3 },
] })
const impId = r.data
ok('invoice_imports C (RPC import_invoice)', r.status === 200 && typeof impId === 'string', JSON.stringify(r.data))
ok('invoice_imports R + lançamentos dela', (await a.get(`invoice_imports?id=eq.${impId}`)).data?.length === 1 && (await a.get(`transactions?invoice_import_id=eq.${impId}`)).data?.length === 2)
ok('fatura do cartão = total lido (151,20)', Number((await a.get(`cards?id=eq.${card.id}&select=invoice`)).data[0].invoice) === 151.2)
r = await a.rpc('undo_invoice_import', { p_import_id: impId })
ok('invoice_imports D (RPC undo): lançamentos saem e fatura volta', r.status === 204 && (await a.get(`transactions?invoice_import_id=eq.${impId}`)).data.length === 0 && Number((await a.get(`cards?id=eq.${card.id}&select=invoice`)).data[0].invoice) === 0)
ok('RPC bloqueada sem login', (await anon.rpc('import_invoice', { p_card_id: card.id, p_file_name: 'x', p_items: [] })).status >= 400)

/* ── METAS + DEPÓSITOS ── */
r = await a.post('goals', { name: 'Teste API', target: 1000, initial_saved: 100, target_month: '2027-06-01' })
const goal = r.data?.[0]
ok('goals C', r.status === 201, JSON.stringify(r.data))
r = await a.post('goal_deposits', { goal_id: goal.id, amount: 50, note: 'primeiro' })
const dep = r.data?.[0]
ok('goal_deposits C', r.status === 201, JSON.stringify(r.data))
let gp = (await a.get(`goal_progress?id=eq.${goal.id}`)).data?.[0]
ok('goals R (view goal_progress: 100 + 50 = 150)', Number(gp?.saved) === 150 && Number(gp.deposit_count) === 1)
ok('saldo caiu R$ 50 com o depósito', Number((await a.get('account_summary?select=balance')).data[0].balance) === 14450)
r = await a.patch(`goal_deposits?id=eq.${dep.id}`, { amount: 80 })
ok('goal_deposits U', Number(r.data?.[0]?.amount) === 80)
r = await a.patch(`goals?id=eq.${goal.id}`, { name: 'Teste API 2', target: 2000 })
ok('goals U', r.data?.[0]?.name === 'Teste API 2')
ok('goals validação: mês precisa ser dia 1', (await a.patch(`goals?id=eq.${goal.id}`, { target_month: '2027-06-15' })).status === 400)
r = await a.del(`goal_deposits?id=eq.${dep.id}`)
ok('goal_deposits D', r.data?.length === 1)
await a.post('goal_deposits', { goal_id: goal.id, amount: 30 })
r = await a.del(`goals?id=eq.${goal.id}`)
ok('goals D (depósitos em cascata)', r.data?.length === 1 && (await a.get(`goal_deposits?goal_id=eq.${goal.id}`)).data.length === 0)
ok('saldo volta a R$ 14.500 depois de apagar a meta', Number((await a.get('account_summary?select=balance')).data[0].balance) === 14500)

/* ── TETOS ── */
r = await a.post('budgets', { category: 'saude', limit_amount: 300 })
ok('budgets C', r.status === 201, JSON.stringify(r.data))
r = await a.post('budgets?on_conflict=user_id,category', { category: 'saude', limit_amount: 450 }, { prefer: 'return=representation,resolution=merge-duplicates' })
ok('budgets U (upsert por categoria)', Number(r.data?.[0]?.limit_amount) === 450, JSON.stringify(r.data))
ok('budgets R', (await a.get('budgets?select=category')).data?.length === 5)
ok('budgets D', (await a.del('budgets?category=eq.saude')).data?.length === 1)

/* ── PERFIL ── */
r = await a.patch(`profiles?id=eq.${A.id}`, { month_cap: 0, hide_balance: true, theme: 'dark' })
ok('profiles U (teto do mês, ocultar, tema)', Number(r.data?.[0]?.month_cap) === 0 && r.data[0].theme === 'dark')
await a.patch(`profiles?id=eq.${A.id}`, { month_cap: 3200, hide_balance: false, theme: 'light' })
ok('profiles: não dá para criar profile pela API', (await a.post('profiles', { id: A.id, name: 'x' })).status >= 400)

/* ── ASSISTENTE ── */
r = await a.post('assistant_messages', { role: 'user', content: 'Quanto posso gastar?' })
const msg = r.data?.[0]
ok('assistant_messages C', r.status === 201)
ok('assistant_messages R', (await a.get(`assistant_messages?id=eq.${msg.id}`)).data?.length === 1)
const upd = await a.patch(`assistant_messages?id=eq.${msg.id}`, { content: 'x' })
ok('assistant_messages U bloqueado (mensagens não se editam)', upd.status >= 400 || upd.data?.length === 0)
ok('assistant_messages D (Nova conversa)', (await a.del(`assistant_messages?user_id=eq.${A.id}`)).data?.length >= 1)

/* ── ISOLAMENTO ENTRE CONTAS ── */
ok('RLS: B não vê cartões de A', (await b.get('cards')).data?.length === 0)
ok('RLS: B não vê lançamentos de A', (await b.get('transactions')).data?.length === 0)
ok('RLS: B só vê o próprio profile', (await b.get('profiles')).data?.length === 1)
ok('RLS: B não edita cartão de A', (await b.patch(`cards?id=eq.${principal.id}`, { nickname: 'hack' })).data?.length === 0)
ok('RLS: B não apaga cartão de A', (await b.del(`cards?id=eq.${principal.id}`)).data?.length === 0)
ok('RLS: B não grava em nome de A', (await b.post('cards', { user_id: A.id, nickname: 'x', last4: '0000', credit_limit: 1 })).status >= 400)
ok('RLS: B não lança gasto no cartão de A', (await b.post('transactions', { name: 'x', category: 'outros', method: 'card', card_id: principal.id, amount: 1 })).status >= 400)
const blocked = (x) => x.status >= 400 || x.data?.length === 0
ok('RLS: sem login não vê nada', blocked(await anon.get('cards')) && blocked(await anon.get('profiles')) && blocked(await anon.get('transactions')))
ok('RLS: sem login não grava', (await anon.post('cards', { nickname: 'x', last4: '0000', credit_limit: 1 })).status >= 400)

/* ── limpeza e conferência final ── */
ok('cards D', (await a.del(`cards?id=eq.${card.id}`)).data?.length === 1)
const fin = (await a.get('account_summary?select=balance')).data[0]
const cardsF = (await a.get('cards?select=nickname,invoice&order=nickname')).data
ok('demo intacta no fim: saldo R$ 14.500 e faturas 1.284/640/98', Number(fin.balance) === 14500 && cardsF.map((c) => Number(c.invoice)).join() === '1284,640,98', JSON.stringify(cardsF))

console.log(results.join('\n'))
console.log(`\n${results.filter((x) => x.startsWith('PASS')).length}/${results.length} passaram`)
process.exit(results.some((x) => x.startsWith('FAIL')) ? 1 : 0)
