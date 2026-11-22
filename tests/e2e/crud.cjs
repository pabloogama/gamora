// Teste do CRUD completo pela interface: criar · ver · editar · apagar em cada entidade.
const { chromium, devices } = require('playwright');
const out = process.env.SHOTS || 'tests/e2e/shots';
require('fs').mkdirSync(out, { recursive: true });
const results = [];
const ok = (name, cond) => { results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}`); };
const URL = (process.env.APP_URL || 'http://localhost:5173/');

(async () => {
  const b = await chromium.launch();
  const errs = [];
  const ctx = await b.newContext({ ...devices['iPhone 14'] });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  const wait = (ms = 350) => p.waitForTimeout(ms);
  const toast = async (text) => { try { await p.getByRole('status').filter({ hasText: text }).first().waitFor({ timeout: 2500 }); return true } catch { return false } };
  const dialog = () => p.getByRole('dialog');
  const money = (label, digits) => dialog().getByLabel(label, { exact: true }).fill(digits);
  const openAccount = async () => { await p.getByRole('button', { name: 'Abrir conta' }).first().click(); await wait() };
  const go = async (label) => { await p.getByRole('navigation', { name: 'Navegação' }).getByRole('button', { name: label }).click(); await wait(500) };

  try {
  await p.goto(URL); await wait(500);
  await p.getByText('Conta de demonstração').click();
  await p.getByRole('button', { name: 'Entrar', exact: true }).last().click(); await wait(1500);
  ok('entra na demo', await p.getByText('R$ 14.500').first().isVisible());

  /* ───────── LANÇAMENTOS ───────── */
  await p.getByRole('navigation', { name: 'Navegação' }).getByRole('button', { name: 'Adicionar gasto' }).click(); await wait();
  await money('Valor da compra', '12345');
  await dialog().getByPlaceholder('Alimentação').fill('Teste CRUD');
  await dialog().getByRole('button', { name: 'Salvar' }).click();
  ok('[gasto] C: criar', await toast('Gasto de R$ 123,45 salvo'));
  await wait(900); await p.getByRole('button', { name: 'Ver extrato' }).scrollIntoViewIfNeeded(); await p.getByRole('button', { name: 'Ver extrato' }).click(); await wait(600);
  ok('[gasto] R: extrato abre', await p.getByRole('heading', { name: 'Extrato' }).isVisible());
  await p.fill('#tx-search', 'Teste CRUD'); await wait();
  ok('[gasto] R: busca acha 1', await p.getByText('1 lançamento com esse filtro').isVisible());
  await p.screenshot({ path: `${out}/crud-01-extrato.png` });
  await p.getByRole('button', { name: /Teste CRUD/ }).click(); await wait();
  ok('[gasto] R: detalhe', await dialog().getByText('Digitado por você').isVisible());
  await dialog().getByRole('button', { name: 'Editar' }).click(); await wait();
  await money('Valor da compra', '20000');
  await dialog().getByRole('button', { name: 'Salvar' }).click();
  ok('[gasto] U: editar', await toast('Gasto atualizado'));
  ok('[gasto] U: valor novo no extrato', await p.getByText('−R$ 200,00').first().isVisible());
  await p.getByRole('button', { name: /Teste CRUD/ }).click(); await wait();
  await dialog().getByRole('button', { name: 'Apagar' }).click();
  await dialog().getByRole('button', { name: 'Apagar' }).last().click();
  ok('[gasto] D: apagar', await toast('Gasto apagado'));
  ok('[gasto] D: some do extrato', await p.getByText('Nada encontrado').isVisible());
  await p.fill('#tx-search', ''); await p.selectOption('#tx-month', 'all'); await wait();
  ok('[gasto] R: filtro "todos os meses"', await p.getByText(/10 lançamentos/).isVisible());

  /* ───────── CARTÕES ───────── */
  await go('Cartões');
  await p.getByRole('button', { name: 'Novo cartão' }).click(); await wait();
  await dialog().getByPlaceholder('Principal, Viagem…').fill('Reserva');
  await dialog().getByPlaceholder('0000').fill('1234');
  await p.fill('#card-due', '5');
  ok('[cartão] dia do vencimento mostra prazo', await dialog().getByText(/^Vence (hoje|amanhã|em \d+ dias)$/).isVisible());
  await money('Limite', '100000');
  await dialog().getByRole('button', { name: 'Salvar cartão' }).click();
  ok('[cartão] C: criar', await toast('Cartão adicionado'));
  const row = p.getByRole('button', { name: /Reserva •• 1234/ });
  ok('[cartão] R: aparece em Próximas faturas', await row.isVisible());
  await row.click(); await wait();
  await dialog().getByPlaceholder('Principal, Viagem…').fill('Reserva 2');
  await dialog().getByRole('button', { name: 'Salvar cartão' }).click();
  ok('[cartão] U: editar', await toast('Cartão atualizado'));
  await p.getByRole('button', { name: /Reserva 2 •• 1234/ }).click(); await wait();
  await dialog().getByRole('button', { name: 'Apagar cartão' }).click();
  await dialog().getByRole('button', { name: 'Apagar', exact: true }).click();
  ok('[cartão] D: apagar', await toast('Cartão apagado'));
  ok('[cartão] D: some da lista', await p.getByRole('button', { name: /Reserva 2/ }).count() === 0);

  /* ───────── METAS + DEPÓSITOS ───────── */
  await go('Metas');
  await p.getByRole('button', { name: 'Nova meta' }).click(); await wait();
  await p.fill('#goal-name', 'Bike');
  await money('Valor alvo', '300000');
  await money('Já tinha guardado', '50000');
  await dialog().getByRole('button', { name: 'Salvar meta' }).click();
  ok('[meta] C: criar', await toast('Meta criada'));
  await p.getByRole('button', { name: 'Ver Bike' }).click(); await wait();
  ok('[meta] R: detalhe', await dialog().getByText('Já tinha guardado').isVisible() && await dialog().getByText('Nenhum depósito ainda').isVisible());
  await dialog().getByRole('button', { name: 'Guardar' }).click(); await wait();
  await money('Quanto você guardou', '10000');
  await p.fill('#deposit-note', 'primeiro');
  await dialog().getByRole('button', { name: /^Guardar/ }).click();
  ok('[depósito] C: guardar', await toast('R$ 100 guardados em Bike'));
  ok('[depósito] C: saldo caiu R$ 100', await p.getByText('R$ 14.400').count() > 0 || (await (async () => { await go('Início'); const v = await p.getByText('R$ 14.400').first().isVisible(); await go('Metas'); return v })()));
  await p.getByRole('button', { name: 'Ver Bike' }).click(); await wait();
  ok('[depósito] R: histórico', await dialog().getByText('+R$ 100').isVisible() && await dialog().getByText(/primeiro/).isVisible());
  await p.screenshot({ path: `${out}/crud-02-meta-detalhe.png` });
  await dialog().getByRole('button', { name: 'Editar depósito de R$ 100' }).click(); await wait();
  await money('Quanto você guardou', '15000');
  await dialog().getByRole('button', { name: 'Salvar depósito' }).click();
  ok('[depósito] U: editar', await toast('Depósito atualizado'));
  ok('[depósito] U: volta ao detalhe com valor novo', await dialog().getByText('+R$ 150').isVisible());
  await dialog().getByRole('button', { name: 'Editar depósito de R$ 150' }).click(); await wait();
  await dialog().getByRole('button', { name: 'Apagar depósito' }).click();
  await dialog().getByRole('button', { name: 'Apagar', exact: true }).click();
  ok('[depósito] D: apagar', await toast('Depósito apagado'));
  ok('[depósito] D: some do histórico', await dialog().getByText('Nenhum depósito ainda').isVisible());
  await dialog().getByRole('button', { name: 'Editar meta' }).click(); await wait();
  await p.fill('#goal-name', 'Bike nova');
  await dialog().getByRole('button', { name: 'Salvar meta' }).click();
  ok('[meta] U: editar', await toast('Meta atualizada') && await dialog().getByRole('heading', { name: 'Bike nova' }).isVisible());
  await dialog().getByRole('button', { name: 'Editar meta' }).click(); await wait();
  await dialog().getByRole('button', { name: 'Apagar meta' }).click();
  await dialog().getByRole('button', { name: 'Apagar', exact: true }).click();
  ok('[meta] D: apagar', await toast('Meta apagada'));
  ok('[meta] D: some da lista', await p.getByRole('button', { name: 'Ver Bike nova' }).count() === 0);

  /* ───────── TETOS ───────── */
  await p.getByRole('button', { name: 'Teto por categoria' }).click(); await wait();
  await dialog().getByRole('radio', { name: 'Saúde' }).click();
  await money('Teto', '30000');
  await dialog().getByRole('button', { name: 'Salvar teto' }).click();
  ok('[teto] C: criar', await toast('Teto criado'));
  const saude = p.getByRole('button', { name: /^Saúde/ });
  ok('[teto] R: aparece em Metas', await saude.isVisible());
  await saude.click(); await wait();
  await money('Teto', '45000');
  await dialog().getByRole('button', { name: 'Salvar teto' }).click();
  ok('[teto] U: editar', await toast('Teto atualizado') && await p.getByText('R$ 0 de R$ 450').isVisible());
  await saude.click(); await wait();
  await dialog().getByRole('button', { name: 'Remover teto' }).click();
  await dialog().getByRole('button', { name: 'Remover', exact: true }).click();
  ok('[teto] D: remover', await toast('Teto removido') && await saude.count() === 0);
  await p.getByRole('button', { name: /Ainda pode gastar/ }).click(); await wait();
  await dialog().getByRole('button', { name: 'Remover teto do mês' }).click();
  await dialog().getByRole('button', { name: 'Remover', exact: true }).click();
  ok('[teto do mês] D: remover', await toast('Teto removido') && await p.getByText('Quanto você quer gastar por mês?').isVisible());
  await p.getByRole('button', { name: /Quanto você quer gastar por mês/ }).click(); await wait();
  await money('Teto', '320000');
  await dialog().getByRole('button', { name: 'Salvar teto' }).click();
  ok('[teto do mês] C: criar de novo', await toast('Teto criado'));

  /* ───────── FATURA IMPORTADA ───────── */
  await go('Fatura'); await wait(300);
  await p.getByRole('button', { name: /Testar com um exemplo/ }).click(); await p.waitForTimeout(6000);
  await p.getByRole('button', { name: 'Confirmar', exact: true }).click();
  ok('[fatura] C: importar', await toast('desfaça em Cartões'));
  await go('Cartões');
  const imp = p.getByRole('button', { name: /fatura.*\.pdf/i }).first();
  ok('[fatura] R: aparece em Faturas importadas', await imp.isVisible());
  await imp.click(); await wait();
  ok('[fatura] R: detalhe lista os lançamentos', await dialog().getByText(/34 de 34 lançamentos/).isVisible());
  await p.screenshot({ path: `${out}/crud-03-fatura-importada.png` });
  await dialog().getByRole('button', { name: 'Desfazer importação' }).click();
  await dialog().getByRole('button', { name: 'Desfazer', exact: true }).click();
  ok('[fatura] D: desfazer', await toast('Importação desfeita'));
  ok('[fatura] D: fatura volta a R$ 1.284', await p.getByText('R$ 1.284,00').first().isVisible());

  /* ───────── ASSISTENTE ───────── */
  await go('Início');
  await p.getByRole('button', { name: /Pergunte/ }).first().click(); await wait(500);
  await p.getByRole('button', { name: 'Quanto ainda posso gastar?' }).click(); await p.waitForTimeout(3500);
  await p.getByRole('button', { name: 'Voltar' }).click(); await wait(500);
  await p.getByRole('button', { name: /Pergunte/ }).first().click(); await wait(500);
  ok('[assistente] R: conversa continua salva', await p.getByText('Quanto ainda posso gastar?').count() === 1 && await p.getByRole('button', { name: 'Nova conversa' }).isVisible());
  await p.getByRole('button', { name: 'Nova conversa' }).click(); await wait();
  ok('[assistente] D: nova conversa apaga', await p.getByText('Experimente:').isVisible());
  await p.getByRole('button', { name: 'Voltar' }).click(); await wait(500);

  /* ───────── PERFIL / CONTA ───────── */
  await openAccount();
  await dialog().getByRole('button', { name: /Ajustar saldo/ }).click(); await wait();
  await money('Saldo atual', '1000000');
  await dialog().getByRole('button', { name: 'Salvar saldo' }).click();
  ok('[saldo] U: ajustar', await toast('Saldo ajustado'));
  await p.keyboard.press('Escape'); await wait();
  ok('[saldo] U: home mostra R$ 10.000', await p.getByText('R$ 10.000').first().isVisible());

  await openAccount();
  await dialog().getByRole('button', { name: 'Alterar senha' }).click(); await wait();
  await p.fill('#pw-current', 'errada'); await p.fill('#pw-next', 'nova1234'); await p.fill('#pw-again', 'nova1234');
  await dialog().getByRole('button', { name: 'Alterar senha' }).click(); await wait(800);
  ok('[senha] valida senha atual', await dialog().getByText('A senha atual não confere.').isVisible());
  await p.fill('#pw-current', 'gamora123');
  await dialog().getByRole('button', { name: 'Alterar senha' }).click();
  ok('[senha] U: alterar', await toast('Senha alterada'));
  await dialog().getByRole('button', { name: 'Sair' }).click();
  await dialog().getByRole('button', { name: 'Sair', exact: true }).last().click(); await wait(500);
  await p.fill('#login-email', 'pablo@gamora.app'); await p.fill('#login-password', 'gamora123');
  await p.getByRole('button', { name: 'Entrar', exact: true }).last().click(); await wait(1000);
  ok('[senha] antiga deixa de funcionar', await p.getByText('E-mail ou senha incorretos.').isVisible());
  await p.fill('#login-password', 'nova1234');
  await p.getByRole('button', { name: 'Entrar', exact: true }).last().click(); await wait(1300);
  ok('[senha] nova funciona e os dados continuam', await p.getByText('R$ 10.000').first().isVisible());

  // excluir conta: cria uma conta nova e exclui
  await openAccount();
  await dialog().getByRole('button', { name: 'Sair' }).click();
  await dialog().getByRole('button', { name: 'Sair', exact: true }).last().click(); await wait(500);
  await p.getByRole('tab', { name: 'Criar conta' }).click();
  await p.fill('#signup-name', 'Teste Excluir'); await p.fill('#signup-email', 'excluir@teste.com');
  await p.fill('#signup-password', 'senha123'); await p.fill('#signup-confirm', 'senha123');
  await p.getByRole('button', { name: 'Criar conta', exact: true }).last().click(); await wait(1600);
  await openAccount();
  await dialog().getByRole('button', { name: 'Excluir conta' }).click(); await wait();
  await p.screenshot({ path: `${out}/crud-04-excluir-conta.png` });
  await p.fill('#delete-password', 'errada');
  await dialog().getByRole('button', { name: 'Excluir conta' }).click(); await wait(900);
  ok('[conta] D: pede a senha certa', await dialog().getByText('Senha incorreta.').isVisible());
  await p.fill('#delete-password', 'senha123');
  await dialog().getByRole('button', { name: 'Excluir conta' }).click(); await wait(1200);
  ok('[conta] D: excluir volta ao login', await p.getByRole('heading', { name: 'Olá de novo.' }).isVisible());
  await p.fill('#login-email', 'excluir@teste.com'); await p.fill('#login-password', 'senha123');
  await p.getByRole('button', { name: 'Entrar', exact: true }).last().click(); await wait(1000);
  ok('[conta] D: conta não existe mais', await p.getByText('E-mail ou senha incorretos.').isVisible());
  ok('[conta] D: dados apagados do aparelho', await p.evaluate(() => localStorage.getItem('gamora:data:excluir@teste.com') === null));

  /* ───────── MIGRAÇÃO DE DADOS ANTIGOS (v1) ───────── */
  await p.evaluate(() => {
    localStorage.setItem('gamora:data:pablo@gamora.app', JSON.stringify({
      user: { name: 'Pablo Gama', email: 'pablo@gamora.app' }, hideBalance: false, baseBalance: 5000, movedToGoals: 500, lastMonthTotal: 0, monthCap: 0,
      transactions: [{ id: 'a', name: 'Mercado', category: 'alimentacao', method: 'c1', date: new Date().toISOString().slice(0, 10), amount: 100 }],
      cards: [{ id: 'c1', nickname: 'Antigo', last4: '9999', invoice: 100, limit: 1000, dueInDays: 8, color: 'lilac' }],
      budgets: [], goals: [{ id: 'g', name: 'Velha', saved: 800, target: 1000 }],
    }))
  });
  await p.fill('#login-email', 'pablo@gamora.app'); await p.fill('#login-password', 'nova1234');
  await p.getByRole('button', { name: 'Entrar', exact: true }).last().click(); await wait(1300);
  ok('[migração] saldo igual ao de antes (R$ 4.400)', await p.getByText('R$ 4.400').first().isVisible());
  await go('Cartões');
  ok('[migração] "vence em 8 dias" vira dia do vencimento', await p.getByText('em 8 dias').first().isVisible());
  await go('Metas');
  ok('[migração] meta mantém R$ 800', await p.getByText('R$ 800').first().isVisible());

  } catch (e) { results.push('FAIL  travou: ' + e.message.split('\n')[0]) }
  console.log(results.join('\n'));
  console.log(`\n${results.filter((r) => r.startsWith('PASS')).length}/${results.length} passaram`);
  console.log('ERROS:', errs.length ? errs.join('\n') : 'nenhum');
  await b.close();
})();
