// Conta ADMIN no app conectado ao Supabase.
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... APP_URL=... SUPABASE_URL=... SUPABASE_KEY=... node tests/e2e/supabase-admin.cjs
// Confere: admin entra, vê o selo, a TELA mostra só os dados dele, a API dá acesso a todas as
// contas (papel admin) e uma conta comum continua isolada.
const { chromium, devices } = require('playwright');
const APP = process.env.APP_URL || 'http://localhost:5173/';
const SB = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_KEY;
const AE = process.env.ADMIN_EMAIL, AP = process.env.ADMIN_PASSWORD;
const results = [];
const ok = (n, c, x = '') => results.push(`${c ? 'PASS' : 'FAIL'}  ${n}${!c && x ? `  → ${x}` : ''}`);
const until = async (fn, ms = 8000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 300)) } return false };
const login = async (email, password) => (await (await fetch(`${SB}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: KEY, 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) })).json());
const rest = (tk) => async (path, init = {}) => { const r = await fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { apikey: KEY, authorization: `Bearer ${tk}`, 'content-type': 'application/json', prefer: 'return=representation', ...(init.headers || {}) } }); const t = await r.text(); return { status: r.status, data: t ? JSON.parse(t) : null } };

(async () => {
  if (!AE || !AP) throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD');
  const admin = await login(AE, AP), demo = await login('pablo@gamora.app', 'gamora123');
  ok('admin entra pela API e o token traz app_role = admin', admin.user?.app_metadata?.app_role === 'admin');
  const A = rest(admin.access_token), D = rest(demo.access_token);

  /* API: admin enxerga e altera todas as contas; conta comum não */
  const allCards = (await A('cards?select=user_id')).data;
  ok('admin (API) vê cartões de todas as contas', new Set(allCards.map((c) => c.user_id)).size >= 2, JSON.stringify(allCards.length));
  ok('admin (API) vê todos os profiles', (await A('profiles?select=id')).data.length >= 2);
  ok('conta comum vê só os próprios cartões', (await D('cards?select=user_id')).data.every((c) => c.user_id === demo.user.id));
  ok('conta comum não vê o profile do admin', (await D(`profiles?id=eq.${admin.user.id}`)).data.length === 0);
  const demoCard = (await D('cards?select=id,nickname&nickname=eq.Viagem')).data[0];
  const up = await A(`cards?id=eq.${demoCard.id}`, { method: 'PATCH', body: JSON.stringify({ nickname: 'Viagem' }) });
  ok('admin (API) consegue editar dado de outra conta', up.data?.length === 1);
  const blocked = await D(`cards?user_id=eq.${admin.user.id}`, { method: 'PATCH', body: JSON.stringify({ nickname: 'x' }) });
  ok('conta comum não edita dado do admin', blocked.data?.length === 0);
  ok('conta comum não consegue virar admin (is_admin = false)', (await D('rpc/is_admin', { method: 'POST', body: '{}' })).data === false);

  /* TELA: o admin vê só os dados dele */
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const b = await chromium.launch({ proxy });
  const p = await (await b.newContext({ ...devices['iPhone 14'] })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  try {
    await p.goto(APP); await p.waitForTimeout(1500);
    await p.fill('#login-email', AE); await p.fill('#login-password', AP);
    await p.getByRole('button', { name: 'Entrar', exact: true }).last().click();
    await p.getByText('R$ 14.500').first().waitFor({ timeout: 15000 });
    ok('admin entra pela tela', true);
    await p.getByRole('button', { name: 'Ver extrato' }).click(); await p.waitForTimeout(800);
    await p.selectOption('#tx-month', 'all'); await p.waitForTimeout(400);
    ok('a tela do admin mostra só os lançamentos dele (17)', await p.getByText(/^17 lançamentos/).isVisible());
    await p.getByRole('button', { name: 'Abrir conta' }).first().click(); await p.waitForTimeout(500);
    ok('folha Conta mostra o selo Administrador', await p.getByRole('dialog').getByText('Administrador').isVisible());
    await p.screenshot({ path: 'tests/e2e/shots/sb-admin-conta.png' });
  } catch (e) { results.push('FAIL  travou: ' + e.message.split('\n')[0]) }
  await b.close();
  console.log(results.join('\n'));
  console.log(`\n${results.filter((r) => r.startsWith('PASS')).length}/${results.length} passaram`);
  console.log('ERROS NO NAVEGADOR:', errs.length ? errs.join('\n') : 'nenhum');
})();
