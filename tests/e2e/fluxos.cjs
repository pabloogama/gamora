const { chromium, devices } = require('playwright');
const out = process.env.SHOTS || 'tests/e2e/shots';
require('fs').mkdirSync(out, { recursive: true });
const results = [];
const ok = (name, cond) => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const ctx = await b.newContext({ ...devices['iPhone 14'] });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && !/TUNNEL|fontshare/.test(m.text()) && errs.push(m.text()));
  await p.goto((process.env.APP_URL || 'http://localhost:5173/')); await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/01-login.png`, fullPage: true });
  ok('abre na tela de login', await p.getByRole('heading', { name: 'Olá de novo.' }).isVisible());

  // validação + senha errada
  await p.getByRole('button', { name: 'Entrar', exact: true }).last().click();
  ok('login valida campos vazios', await p.getByText('Digite um e-mail válido.').isVisible());
  await p.fill('#login-email', 'lucas@gamora.app'); await p.fill('#login-password', 'errada1');
  await p.getByRole('button', { name: 'Entrar', exact: true }).last().click(); await p.waitForTimeout(900);
  ok('senha errada mostra erro', await p.getByText('E-mail ou senha incorretos.').isVisible());

  // cadastro de conta nova
  await p.getByRole('tab', { name: 'Criar conta' }).click();
  await p.getByRole('button', { name: 'Criar conta', exact: true }).last().click();
  ok('cadastro valida campos', await p.getByText('As senhas não são iguais.').count() === 0 && await p.getByText('Como podemos te chamar?').isVisible());
  await p.fill('#signup-name', 'Ana'); await p.fill('#signup-email', 'ana@teste.com');
  await p.fill('#signup-password', 'senha123'); await p.fill('#signup-confirm', 'senha124');
  await p.getByRole('button', { name: 'Criar conta', exact: true }).last().click();
  ok('senhas diferentes bloqueiam', await p.getByText('As senhas não são iguais.').isVisible());
  await p.fill('#signup-confirm', 'senha123');
  await p.getByLabel('Saldo inicial').fill('250000');
  await p.screenshot({ path: `${out}/02-cadastro.png`, fullPage: true });
  await p.getByRole('button', { name: 'Criar conta', exact: true }).last().click(); await p.waitForTimeout(1600);
  ok('conta nova entra com saldo inicial', await p.getByText('R$ 2.500').first().isVisible());
  ok('conta nova mostra estado vazio', await p.getByText('Nenhum gasto por aqui').isVisible());
  await p.screenshot({ path: `${out}/03-home-vazia.png`, fullPage: true });

  // sair
  await p.getByRole('button', { name: 'Abrir conta' }).first().click(); await p.waitForTimeout(400);
  await p.getByRole('button', { name: 'Sair' }).click();
  ok('sair pede confirmação', await p.getByText('Deseja sair?').isVisible());
  await p.getByRole('button', { name: 'Sair', exact: true }).last().click(); await p.waitForTimeout(500);
  ok('saiu para o login', await p.getByRole('heading', { name: 'Olá de novo.' }).isVisible());

  // e-mail duplicado
  await p.getByRole('tab', { name: 'Criar conta' }).click();
  await p.fill('#signup-name', 'Ana'); await p.fill('#signup-email', 'ana@teste.com');
  await p.fill('#signup-password', 'senha123'); await p.fill('#signup-confirm', 'senha123');
  await p.getByRole('button', { name: 'Criar conta', exact: true }).last().click(); await p.waitForTimeout(1100);
  ok('e-mail duplicado bloqueia', await p.getByText('Este e-mail já tem uma conta').isVisible());

  // demo
  await p.getByRole('tab', { name: 'Entrar' }).click();
  await p.getByText('Conta de demonstração').click();
  await p.getByRole('button', { name: 'Entrar', exact: true }).last().click(); await p.waitForTimeout(1500);
  ok('demo entra com R$ 14.500', await p.getByText('R$ 14.500').first().isVisible());
  ok('4 atalhos (estágio 2)', await p.getByRole('region', { name: 'Atalhos' }).getByRole('button').count() === 4);
  await p.screenshot({ path: `${out}/04-home.png`, fullPage: true });

  // fatura
  await p.getByRole('region', { name: 'Atalhos' }).getByRole('button', { name: 'Fatura' }).click(); await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/05-fatura-escolher.png`, fullPage: true });
  await p.setInputFiles('#invoice-pdf', { name: 'virus.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('x') });
  ok('fatura rejeita arquivo inválido', await p.getByText('Envie um PDF ou uma foto').isVisible());
  await p.getByRole('button', { name: /Testar com um exemplo/ }).click(); await p.waitForTimeout(1300);
  await p.screenshot({ path: `${out}/06-fatura-lendo.png` });
  ok('estado "Lendo sua fatura"', await p.getByText('Lendo sua fatura').isVisible());
  await p.waitForTimeout(3200);
  await p.screenshot({ path: `${out}/07-fatura-encontramos.png`, fullPage: true });
  ok('encontrou 34 compras', await p.getByText('compras', { exact: true }).isVisible() && await p.getByText('34', { exact: true }).isVisible());
  ok('total R$ 1.284,00', await p.getByText('R$ 1.284,00').first().isVisible());
  await p.getByRole('button', { name: 'Confirmar', exact: true }).click(); await p.waitForTimeout(900);
  ok('confirmar volta à home com lançamentos', await p.getByText('34 lançamentos adicionados').isVisible());
  await p.screenshot({ path: `${out}/08-home-pos-fatura.png`, fullPage: true });

  // cartões
  await p.getByRole('region', { name: 'Atalhos' }).getByRole('button', { name: 'Cartões' }).click(); await p.waitForTimeout(900);
  ok('cartões mostra disponível', await p.getByText('Disponível').isVisible());
  await p.screenshot({ path: `${out}/09-cartoes.png`, fullPage: true });

  // metas
  await p.goBack(); await p.waitForTimeout(400);
  await p.getByRole('region', { name: 'Atalhos' }).getByRole('button', { name: 'Metas' }).click(); await p.waitForTimeout(1200);
  ok('metas mostra quanto guardar por mês', await p.getByText(/\/mês por \d+ meses/).isVisible());
  await p.screenshot({ path: `${out}/10-metas.png`, fullPage: true });
  await p.getByRole('button', { name: 'Guardar R$ 500' }).click(); await p.waitForTimeout(500);
  await p.getByRole('button', { name: /^Guardar R\$ 500$/ }).last().click(); await p.waitForTimeout(500);
  ok('guardou R$ 500 (toast)', await p.getByText('R$ 500 guardados em Viagem ao Japão').isVisible());

  // assistente
  await p.getByRole('button', { name: /Assistente Gamora/ }).click(); await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/11-assistente.png`, fullPage: true });
  await p.getByRole('button', { name: 'Quanto gastei com delivery?' }).click(); await p.waitForTimeout(3500);
  ok('assistente responde com número', await p.getByText(/Delivery: R\$/).isVisible());
  await p.fill('#assistant-input', 'Quanto ainda posso gastar?'); await p.keyboard.press('Enter'); await p.waitForTimeout(3000);
  await p.screenshot({ path: `${out}/12-assistente-chat.png`, fullPage: true });
  await p.goBack(); await p.waitForTimeout(500);
  ok('voltar do assistente cai em Metas', await p.getByRole('heading', { name: 'Metas' }).isVisible());
  await ctx.close();

  // desktop
  const dctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const d = await dctx.newPage();
  d.on('pageerror', e => errs.push('desktop: ' + e.message));
  await d.goto((process.env.APP_URL || 'http://localhost:5173/')); await d.waitForTimeout(500);
  await d.screenshot({ path: `${out}/13-d-login.png` });
  await d.getByText('Conta de demonstração').click();
  await d.getByRole('button', { name: 'Entrar', exact: true }).last().click(); await d.waitForTimeout(1500);
  await d.screenshot({ path: `${out}/14-d-home.png`, fullPage: true });
  await d.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Fatura' }).click(); await d.waitForTimeout(600);
  await d.screenshot({ path: `${out}/15-d-fatura.png`, fullPage: true });
  await d.getByRole('button', { name: /Testar com um exemplo/ }).click(); await d.waitForTimeout(4200);
  await d.screenshot({ path: `${out}/16-d-fatura-review.png`, fullPage: true });
  await d.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Cartões' }).click(); await d.waitForTimeout(900);
  await d.screenshot({ path: `${out}/17-d-cartoes.png`, fullPage: true });
  await d.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Metas' }).click(); await d.waitForTimeout(1200);
  await d.screenshot({ path: `${out}/18-d-metas.png`, fullPage: true });
  await d.getByRole('button', { name: /Assistente Gamora/ }).click(); await d.waitForTimeout(500);
  await d.getByRole('button', { name: 'Como guardo mais para a viagem?' }).click(); await d.waitForTimeout(3500);
  await d.screenshot({ path: `${out}/19-d-assistente.png`, fullPage: true });
  await dctx.close();

  console.log(results.join('\n'));
  console.log('ERROS:', errs.length ? errs.join('\n') : 'nenhum');
  await b.close();
})();
