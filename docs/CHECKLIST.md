# Checklist de telas — Gamora × briefing

Legenda: ✅ feito e testado no navegador · 🟡 feito com dados simulados · ⏳ fica para a integração · ➕ além do briefing

## Estágio 1 — App nativo

| Item do briefing | Status | Onde |
|---|---|---|
| Home: avatar + "Olá, Lucas" (sem sino, sem busca) | ✅ | `features/home` |
| Card hero: Seu saldo R$ 14.500, olho para ocultar, gradiente lima → lilás | ✅ | `features/home` |
| Atalhos: Adicionar · Cartões · Metas | ✅ | `features/home` |
| Este mês: R$ 2.340 · "12% menos que em outubro" · 3 categorias | ✅ | `features/home` |
| Transações; toque abre folha de detalhe (editar / apagar) | ✅ | `features/sheets` |
| Folha Adicionar gasto: valor, categoria, cartão/dinheiro/pix, data (hoje), salvar | ✅ | `features/sheets` |
| Salvar atualiza saldo, mês, metas e fatura do cartão | ✅ | `store` |
| Cartões: pilha Viagem · Salário · Principal, toque troca a frente | ✅ | `features/cards` |
| Cartões: fatura atual, limite usado 43%, próximas faturas | ✅ | `features/cards` |
| Folha novo / editar cartão (apelido, final, limite, fatura à mão) | ✅ | `features/sheets` |
| ➕ Cartões: disponível, compras do cartão, apagar cartão | ✅ | `features/cards` |
| Metas: Ainda pode gastar R$ 860 de R$ 3.200 | ✅ | `features/goals` |
| Metas: grid Alimentação 62% · Moradia 100% · Transporte 40% · Lazer 78% | ✅ | `features/goals` |
| Toque no bloco = folha para ajustar o teto | ✅ | `features/sheets` |
| Guardando: Viagem ao Japão · Dez 2027 · R$ 13.600 · 68% | ✅ | `features/goals` |
| Guardar R$ 500 (folha rápida) | ✅ | `features/sheets` |
| Lista curta: Reserva 72% · Curso 90% · Carro 24% | ✅ | `features/goals` |
| + nova meta (nome, valor, data) | ✅ | `features/sheets` |
| ➕ Metas: quanto guardar por mês até a data, meta concluída, apagar meta, teto por categoria nova | ✅ | `features/goals` |
| Folha Conta: nome, e-mail, ocultar saldo, Sair com "Deseja sair?" | ✅ | `features/sheets` |
| Toast / loading / empty | ✅ | todas as telas |
| Login simples (e-mail + senha) | ✅ | `features/auth` |
| ➕ Cadastro (nome, e-mail, senha, confirmação, saldo inicial) | ✅ | `features/auth` |
| Validação de formulários (gasto, cartão, meta, teto, login, cadastro) | ✅ | |
| Mobile-first + desktop (~800px / ~1100px), mesma home mais larga, sem sidebar | ✅ | |
| Persistência real (auth, transações, cartões, metas) | ⏳ | hoje: localStorage por conta; schema em `supabase/migrations` |

## Estágio 2 — OpenAI (interface pronta, respostas simuladas)

| Item do briefing | Status | Onde |
|---|---|---|
| Atalhos: Adicionar · Fatura · Cartões · Metas | ✅ | `VITE_APP_STAGE=2` |
| Fatura: escolher PDF ou foto → "Lendo sua fatura" → Encontramos | 🟡 | `features/invoice` |
| 34 compras · 6 assinaturas · total R$ 1.284 · `fatura-novembro.pdf` | 🟡 | `services/ai/mock.ts` |
| Confirmar antes de entrar; lançamentos caem na home | ✅ | marcados com selo "Fatura" |
| Validação do upload (tipo e tamanho) + progresso + cancelar | ✅ | |
| Assistente: "Pergunte sobre seu dinheiro", bolhas lima + resposta em gradiente | 🟡 | `features/assistant` |
| Respostas com número + consequência, usando os dados do app | 🟡 | regras locais no lugar da OpenAI |
| Espera do chat (digitando) e efeito de streaming | ✅ | |
| Card lilás ASSISTENTE GAMORA em Metas → abre o Assistente | ✅ | |
| Botão no hero → Assistente (não vira aba) | ✅ | |
| OpenAI no servidor, chave só no servidor | ⏳ | exemplos em `api/_examples` |
| Leitura real de PDF | ⏳ | exemplo cobre foto; PDF precisa da Files API |

## Identidade visual Gamora

Tirada da peça de identidade: **Suas finanças, em família.** Tokens em `src/styles/index.css` (`--gm-*`) e `tokens/source.mjs`.

| Papel | Cor | Uso no app |
|---|---|---|
| Primária | `#0B1230` | texto, botão principal, chip selecionado |
| Secundária | `#7B5CFF` | violeta da marca: cartão, 1ª série dos gráficos, assinaturas (só preenchimento; texto usa `#5B3FE0`) |
| Acento | `#00C2A8` | verde-água: barras e anéis de progresso, 2ª série (nunca texto sobre branco) |
| Superfície | `#EDE9FF` | ícones de categoria, chips, botões secundários |
| Fundo | `#F8F9FF` | fundo da página |

| Item | Status |
|---|---|
| Logo "G" em gradiente violeta → verde-água (componente `LogoMark`) e ícone da aba | ✅ |
| Tipografia Manrope (Google Fonts) | ✅ |
| Faixa do topo em roxo profundo, dock e bolso da carteira na mesma família | ✅ |
| Cartão Gamora: violeta com logo, chip e aproximação; variações verde-água e lavanda | ✅ |
| Login com slogan e os 4 pilares (gastos, família, metas, patrimônio) | ✅ |
| Tema claro como padrão; escuro opcional (botão no topo), escolha salva | ✅ |
| Contraste AA conferido nas combinações de texto dos dois temas | ✅ |

## Conta e perfil

| Item | Status |
|---|---|
| Folha **Editar perfil** (Conta → Editar perfil): foto, nome completo, e-mail | ✅ |
| Foto: escolher/trocar/remover, recorte quadrado e redução para 256 px no navegador | ✅ |
| Saudação usa o primeiro nome ("Olá, Pablo") | ✅ |
| Conta de demonstração: **Pablo Gama** · `pablo@gamora.app` · `gamora123`, com foto | ✅ |
| Persistência do perfil (recarregar, sair/entrar) | ✅ local · ⏳ Supabase (`auth.updateUser` + `profiles`) |

## Lacunas conhecidas

- **ESLint**: o briefing cita, o projeto ainda não tem configuração de lint.
- **Modo estágio 1** (`VITE_APP_STAGE=1`): implementado, mas não foi testado no navegador.
- **Alvo da Viagem ao Japão**: o briefing não define; usamos R$ 20.000 (68% de R$ 13.600 ≈ R$ 20.000).
- **Dock flutuante no mobile**: veio da imagem de referência, não do briefing ("sem menu de abas").
- **Contraste**: tokens escolhidos para WCAG AA (texto secundário ≥ 4.5:1 nos dois temas), mas sem auditoria automática.
