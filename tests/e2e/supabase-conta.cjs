// Fluxos de CONTA no app conectado ao Supabase: editar nome e foto (Storage),
// alterar senha e excluir conta. Usa uma conta descartável criada antes no SQL
// (ver docs/SUPABASE.md) — a conta demo não é tocada.
//
//   APP_URL=... SUPABASE_URL=... SUPABASE_KEY=... E2E_EMAIL=e2e-conta@gamora.app E2E_PASSWORD=senha-e2e-1 \
//   PHOTO=caminho/foto.png node tests/e2e/supabase-conta.cjs
const { chromium, devices } = require('playwright');

const APP = process.env.APP_URL || 'http://localhost:5173/';
const SB = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_KEY;
const EMAIL = process.env.E2E_EMAIL || 'e2e-conta@gamora.app';
const PASS1 = process.env.E2E_PASSWORD || 'senha-e2e-1', PASS2 = 'senha-e2e-2';
const PHOTO = process.env.PHOTO || 'public/avatars/pablo.webp';
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && extra ? `  → ${extra}` : ''}`);
const until = async (fn, ms = 8000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 300)) } return false };

async function login(password) {
  const r = await fetch(`${SB}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: KEY, 'content-type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password }) });
  return r.ok ? (await r.json()) : null;
}

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const b = await chromium.launch({ proxy });
  const p = await (await b.newContext({ ...devices['iPhone 14'] })).newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && !/400|401|Failed to load resource/.test(m.text()) && errs.push(m.text()));
  const wait = (ms = 400) => p.waitForTimeout(ms);
  const dialog = () => p.getByRole('dialog');
  const toast = async (text) => { try { await p.getByRole('status').filter({ hasText: text }).first().waitFor({ timeout: 8000 }); return true } catch { return false } };
  const openAccount = async () => { await p.getByRole('button', { name: 'Abrir conta' }).first().click(); await wait() };

  try {
    const s = await login(PASS1);
    const uid = s.user.id, tk = s.access_token;
    const rest = async (path) => (await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, authorization: `Bearer ${tk}` } })).json();

    await p.goto(APP); await wait(1500);
    await p.fill('#login-email', EMAIL); await p.fill('#login-password', PASS1);
    await p.getByRole('button', { name: 'Entrar', exact: true }).last().click();
    await p.getByText('R$ 1.000').first().waitFor({ timeout: 15000 });
    ok('conta nova entra com o saldo inicial do cadastro (R$ 1.000)', true);
    ok('conta nova começa vazia', await p.getByText('Nenhum gasto por aqui').isVisible());

    /* editar perfil: nome + foto */
    await openAccount();
    await dialog().getByRole('button', { name: 'Editar perfil' }).click(); await wait();
    await p.fill('#profile-name', 'Conta E2E Editada');
    await p.setInputFiles('#profile-photo', PHOTO); await wait(1200);
    await dialog().getByRole('button', { name: 'Salvar alterações' }).click();
    ok('[perfil] U: salvo', await toast('Perfil atualizado'));
    ok('[perfil] nome novo no banco', await until(async () => (await rest('profiles?select=name'))[0]?.name === 'Conta E2E Editada'));
    const files = await (await fetch(`${SB}/storage/v1/object/list/avatars`, { method: 'POST', headers: { apikey: KEY, authorization: `Bearer ${tk}`, 'content-type': 'application/json' }, body: JSON.stringify({ prefix: uid }) })).json();
    ok('[perfil] foto enviada para avatars/<uid>/', files.length === 1, JSON.stringify(files));
    const url = (await rest('profiles?select=avatar_url'))[0]?.avatar_url;
    ok('[perfil] avatar_url aponta para o Storage e a foto abre', !!url && (await fetch(url)).ok);
    ok('[perfil] topo mostra "Olá, Conta"', await p.getByText('Olá, Conta').first().isVisible());

    /* alterar senha */
    await openAccount();
    await dialog().getByRole('button', { name: 'Alterar senha' }).click(); await wait();
    await p.fill('#pw-current', 'errada-123'); await p.fill('#pw-next', PASS2); await p.fill('#pw-again', PASS2);
    await dialog().getByRole('button', { name: 'Alterar senha' }).click();
    ok('[senha] senha atual errada é recusada', await dialog().getByText('A senha atual não confere.').waitFor({ timeout: 8000 }).then(() => true, () => false));
    await p.fill('#pw-current', PASS1);
    await dialog().getByRole('button', { name: 'Alterar senha' }).click();
    ok('[senha] U: alterada', await toast('Senha alterada'));
    ok('[senha] antiga não entra mais; nova entra', !(await login(PASS1)) && !!(await login(PASS2)));

    /* excluir conta */
    await p.keyboard.press('Escape'); await wait();
    await openAccount();
    await dialog().getByRole('button', { name: 'Excluir conta' }).click(); await wait();
    await p.fill('#delete-password', PASS1);
    await dialog().getByRole('button', { name: 'Excluir conta' }).click();
    ok('[conta] D: senha errada é recusada', await dialog().getByText('Senha incorreta.').waitFor({ timeout: 8000 }).then(() => true, () => false));
    await p.fill('#delete-password', PASS2);
    await dialog().getByRole('button', { name: 'Excluir conta' }).click();
    ok('[conta] D: volta ao login', await p.getByRole('heading', { name: 'Olá de novo.' }).waitFor({ timeout: 10000 }).then(() => true, () => false));
    ok('[conta] D: login não funciona mais (auth.users apagado)', !(await login(PASS2)));
    const anonList = await (await fetch(`${SB}/storage/v1/object/public/avatars/${uid}/avatar.webp`)).status;
    ok('[conta] D: foto apagada do Storage', anonList >= 400);
  } catch (e) {
    results.push('FAIL  travou: ' + e.message.split('\n')[0]);
    await p.screenshot({ path: 'tests/e2e/shots/sb-conta-erro.png' });
  }
  console.log(results.join('\n'));
  console.log(`\n${results.filter((r) => r.startsWith('PASS')).length}/${results.length} passaram`);
  console.log('ERROS NO NAVEGADOR:', errs.length ? errs.join('\n') : 'nenhum');
  await b.close();
})();
