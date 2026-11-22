// App CONECTADO ao Supabase (VITE_DATA_SOURCE=supabase): cada operação feita na tela
// é conferida direto no banco pela API (com o login da própria conta demo).
// No fim, "Restaurar dados de exemplo" devolve a demo ao estado original.
//
//   APP_URL=http://localhost:5173/ SUPABASE_URL=https://<ref>.supabase.co SUPABASE_KEY=<publicável> node tests/e2e/supabase.cjs
const { chromium, devices } = require('playwright');
const fs = require('fs');

const APP = process.env.APP_URL || 'http://localhost:5173/';
const SB = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_KEY;
const out = process.env.SHOTS || 'tests/e2e/shots';
fs.mkdirSync(out, { recursive: true });
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && extra ? `  → ${extra}` : ''}`);

// leitura direta do banco (mesma conta, RLS valendo)
let token;
async function db(path) {
  if (!token) {
    const r = await fetch(`${SB}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: KEY, 'content-type': 'application/json' }, body: JSON.stringify({ email: 'pablo@gamora.app', password: 'gamora123' }) });
    token = (await r.json()).access_token;
  }
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, authorization: `Bearer ${token}` } });
  return r.json();
}
async function bucket(name, prefix) {
  const r = await fetch(`${SB}/storage/v1/object/list/${name}`, { method: 'POST', headers: { apikey: KEY, authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ prefix }) });
  return r.json();
}
const until = async (fn, ms = 6000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 300)) } return false };

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const b = await chromium.launch({ proxy });
  const ctx = await b.newContext({ ...devices['iPhone 14'] });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  const wait = (ms = 400) => p.waitForTimeout(ms);
  const dialog = () => p.getByRole('dialog');
  const money = (label, digits) => dialog().getByLabel(label, { exact: true }).fill(digits);
  const toast = async (text) => { try { await p.getByRole('status').filter({ hasText: text }).first().waitFor({ timeout: 4000 }); return true } catch { return false } };
  const go = async (label) => { await p.getByRole('navigation', { name: 'Navegação' }).getByRole('button', { name: label }).click(); await wait(700) };

  try {
    await p.goto(APP); await wait(1500);
    ok('login não mostra atalho da conta demo (só entra quem tem login)', (await p.getByText('Conta de demonstração').count()) === 0);
    await p.fill('#login-email', 'pablo@gamora.app'); await p.fill('#login-password', 'gamora123');
    await p.getByRole('button', { name: 'Entrar', exact: true }).last().click();
    await p.getByText('R$ 14.500').first().waitFor({ timeout: 15000 });
    const me = (await db('profiles?select=id'))[0].id;

    /* ── leitura: os dados da tela vêm do Supabase ── */
    ok('login no Supabase Auth com a conta demo', true);
    ok('Home: saldo R$ 14.500 vindo do banco', await p.getByText('R$ 14.500').first().isVisible());
    ok('Home: "−12%" calculado com o mês passado do banco', await p.getByText(/12% menos que em/).isVisible());
    ok('foto de perfil vem do Storage', (await p.locator('img[src*="supabase.co/storage/v1/object/public/avatars"]').count()) > 0);
    await p.screenshot({ path: `${out}/sb-01-home.png` });

    /* ── gasto: criar, editar, apagar ── */
    await p.getByRole('navigation', { name: 'Navegação' }).getByRole('button', { name: 'Adicionar gasto' }).click(); await wait();
    await money('Valor da compra', '4321');
    await dialog().getByPlaceholder('Alimentação').fill('E2E Supabase');
    await dialog().getByRole('radio', { name: 'Pix' }).click();
    await dialog().getByRole('button', { name: 'Salvar' }).click();
    ok('[gasto] C: gravado no banco', await until(async () => (await db('transactions?name=eq.E2E%20Supabase&select=amount')).length === 1));
    await wait(900);
    await p.getByRole('button', { name: /E2E Supabase/ }).first().click(); await wait();
    await dialog().getByRole('button', { name: 'Editar' }).click(); await wait();
    await money('Valor da compra', '5000');
    await dialog().getByRole('button', { name: 'Salvar' }).click();
    ok('[gasto] U: valor novo no banco', await until(async () => Number((await db('transactions?name=eq.E2E%20Supabase&select=amount'))[0]?.amount) === 50));

    /* recarregar a página: sessão e dados voltam do servidor */
    await p.reload(); await p.getByText('E2E Supabase').first().waitFor({ timeout: 15000 });
    ok('recarregar: sessão mantida e gasto continua (veio do banco)', true);
    await p.getByRole('button', { name: /E2E Supabase/ }).first().click(); await wait();
    await dialog().getByRole('button', { name: 'Apagar' }).click();
    await dialog().getByRole('button', { name: 'Apagar' }).last().click();
    ok('[gasto] D: apagado no banco', await until(async () => (await db('transactions?name=eq.E2E%20Supabase')).length === 0));

    /* ── cartão ── */
    await go('Cartões');
    await p.getByRole('button', { name: 'Novo cartão' }).click(); await wait();
    await dialog().getByPlaceholder('Principal, Viagem…').fill('E2E Cartão');
    await dialog().getByPlaceholder('0000').fill('9876');
    await p.fill('#card-due', '15');
    await money('Limite', '200000');
    await dialog().getByRole('button', { name: 'Salvar cartão' }).click();
    ok('[cartão] C: gravado no banco (dia 15)', await until(async () => (await db('cards?nickname=eq.E2E%20Cart%C3%A3o&select=due_day'))[0]?.due_day === 15));
    await wait(800);
    await p.getByRole('button', { name: /E2E Cartão •• 9876/ }).click(); await wait();
    await dialog().getByPlaceholder('Principal, Viagem…').fill('E2E Cartão 2');
    await dialog().getByRole('button', { name: 'Salvar cartão' }).click();
    ok('[cartão] U: nome novo no banco', await until(async () => (await db('cards?nickname=eq.E2E%20Cart%C3%A3o%202')).length === 1));
    await wait(800);
    await p.getByRole('button', { name: /E2E Cartão 2 •• 9876/ }).click(); await wait();
    await dialog().getByRole('button', { name: 'Apagar cartão' }).click();
    await dialog().getByRole('button', { name: 'Apagar', exact: true }).click();
    ok('[cartão] D: apagado no banco', await until(async () => (await db('cards?nickname=like.E2E*')).length === 0));

    /* ── meta + depósito ── */
    await go('Metas');
    await p.getByRole('button', { name: 'Nova meta' }).click(); await wait();
    await p.fill('#goal-name', 'E2E Meta');
    await money('Valor alvo', '100000');
    await dialog().getByRole('button', { name: 'Salvar meta' }).click();
    ok('[meta] C: gravada no banco', await until(async () => (await db('goals?name=eq.E2E%20Meta')).length === 1));
    await wait(800);
    await p.getByRole('button', { name: 'Ver E2E Meta' }).click(); await wait();
    await dialog().getByRole('button', { name: 'Guardar' }).click(); await wait();
    await money('Quanto você guardou', '20000');
    await dialog().getByRole('button', { name: /^Guardar/ }).click();
    ok('[depósito] C: gravado e o saldo do banco caiu R$ 200', await until(async () => Number((await db('account_summary?select=balance'))[0]?.balance) === 14300));
    await wait(800);
    await p.getByRole('button', { name: 'Ver E2E Meta' }).click(); await wait();
    await dialog().getByRole('button', { name: 'Editar depósito de R$ 200' }).click(); await wait();
    await money('Quanto você guardou', '25000');
    await dialog().getByRole('button', { name: 'Salvar depósito' }).click();
    ok('[depósito] U: R$ 250 no banco (view goal_progress)', await until(async () => Number((await db('goal_progress?name=eq.E2E%20Meta&select=saved'))[0]?.saved) === 250));
    await wait(600);
    await dialog().getByRole('button', { name: 'Editar meta' }).click(); await wait();
    await dialog().getByRole('button', { name: 'Apagar meta' }).click();
    await dialog().getByRole('button', { name: 'Apagar', exact: true }).click();
    ok('[meta] D: meta e depósitos apagados; saldo volta a R$ 14.500', await until(async () => (await db('goals?name=eq.E2E%20Meta')).length === 0 && Number((await db('account_summary?select=balance'))[0]?.balance) === 14500));

    /* ── teto ── */
    await wait(600);
    await p.getByRole('button', { name: 'Teto por categoria' }).click(); await wait();
    await dialog().getByRole('radio', { name: 'Saúde' }).click();
    await money('Teto', '30000');
    await dialog().getByRole('button', { name: 'Salvar teto' }).click();
    ok('[teto] C: gravado no banco', await until(async () => Number((await db('budgets?category=eq.saude&select=limit_amount'))[0]?.limit_amount) === 300));
    await wait(800);
    await p.getByRole('button', { name: /^Saúde/ }).click(); await wait();
    await dialog().getByRole('button', { name: 'Remover teto' }).click();
    await dialog().getByRole('button', { name: 'Remover', exact: true }).click();
    ok('[teto] D: removido do banco', await until(async () => (await db('budgets?category=eq.saude')).length === 0));

    /* ── fatura: importar (arquivo vai para o Storage) e desfazer ── */
    await go('Fatura');
    await p.getByRole('button', { name: /Testar com um exemplo/ }).click(); await p.waitForTimeout(6500);
    await p.getByRole('button', { name: 'Confirmar', exact: true }).click();
    ok('[fatura] C: importação e 34 lançamentos no banco', await until(async () => (await db('transactions?source=eq.invoice&select=id')).length === 34, 10000));
    ok('[fatura] arquivo salvo no Storage privado', await until(async () => (await bucket('invoices', me)).length === 1));
    ok('[fatura] fatura do cartão = total lido no banco', Number((await db('cards?nickname=eq.Principal&select=invoice'))[0]?.invoice) === 1284);
    await go('Cartões');
    await p.getByRole('button', { name: /fatura-novembro\.pdf/ }).first().click(); await wait();
    await dialog().getByRole('button', { name: 'Desfazer importação' }).click();
    await dialog().getByRole('button', { name: 'Desfazer', exact: true }).click();
    ok('[fatura] D: lançamentos, registro e arquivo apagados', await until(async () => (await db('transactions?source=eq.invoice')).length === 0 && (await db('invoice_imports')).length === 0 && (await bucket('invoices', me)).length === 0));

    /* ── assistente ── */
    await go('Início');
    await p.getByRole('button', { name: /Pergunte/ }).first().click(); await wait(600);
    await p.getByRole('button', { name: 'Quanto ainda posso gastar?' }).click(); await p.waitForTimeout(3500);
    ok('[assistente] C: pergunta e resposta no banco', await until(async () => (await db('assistant_messages?select=role')).length === 2));
    await p.getByRole('button', { name: 'Nova conversa' }).click();
    ok('[assistente] D: conversa apagada no banco', await until(async () => (await db('assistant_messages')).length === 0));
    await p.getByRole('button', { name: 'Voltar' }).click(); await wait(600);

    /* ── perfil: ocultar valores, saldo, teto do mês ── */
    await p.getByRole('button', { name: 'Abrir conta' }).first().click(); await wait();
    await dialog().getByRole('switch').check({ force: true });
    ok('[perfil] U: ocultar valores gravado', await until(async () => (await db('profiles?select=hide_balance'))[0]?.hide_balance === true));
    await dialog().getByRole('switch').uncheck({ force: true });
    await until(async () => (await db('profiles?select=hide_balance'))[0]?.hide_balance === false);
    await dialog().getByRole('button', { name: /Ajustar saldo/ }).click(); await wait();
    await money('Saldo atual', '1500000');
    await dialog().getByRole('button', { name: 'Salvar saldo' }).click();
    ok('[perfil] U: saldo ajustado no banco (R$ 15.000)', await until(async () => Number((await db('account_summary?select=balance'))[0]?.balance) === 15000));

    /* ── restaurar dados de exemplo (RPC reset_demo) ── */
    await wait(600);
    await dialog().getByRole('button', { name: /Restaurar dados de exemplo/ }).click();
    ok('restaurar: demo volta ao original no banco (R$ 14.500, 17 lançamentos)', await until(async () => Number((await db('account_summary?select=balance'))[0]?.balance) === 14500 && (await db('transactions?select=id')).length === 17, 10000));
    await wait(1200);
    ok('restaurar: a tela recarrega do banco', await p.getByText('R$ 14.500').first().isVisible());

    /* ── sair ── */
    await p.getByRole('button', { name: 'Abrir conta' }).first().click(); await wait();
    await dialog().getByRole('button', { name: 'Sair' }).click();
    await dialog().getByRole('button', { name: 'Sair', exact: true }).last().click(); await wait(800);
    await p.reload(); await wait(2500);
    ok('sair: depois de recarregar continua no login', await p.getByRole('heading', { name: 'Olá de novo.' }).isVisible());
  } catch (e) {
    results.push('FAIL  travou: ' + e.message.split('\n')[0]);
    await p.screenshot({ path: `${out}/sb-erro.png` });
  }

  console.log(results.join('\n'));
  console.log(`\n${results.filter((r) => r.startsWith('PASS')).length}/${results.length} passaram`);
  console.log('ERROS NO NAVEGADOR:', errs.length ? errs.join('\n') : 'nenhum');
  await b.close();
})();
