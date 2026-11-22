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

## Identidade visual (mudança pedida sobre o briefing)

O briefing pedia preto + lima + lilás. Por pedido posterior, o visual segue a imagem de referência:
marinho + lilás + branco, carteira com cartões saindo de um bolso de vidro com costura tracejada,
cards brancos com sombra suave e dock marinho. Tokens em `src/styles/index.css` (`--gm-*`).

| Item | Status |
|---|---|
| Tema claro (referência) e tema escuro (marinho profundo) | ✅ |
| Botão de tema no topo (mobile e desktop), no login e na folha Conta | ✅ |
| Tema salvo no navegador; sem escolha, segue o sistema; sem piscar ao carregar | ✅ |
| Carteira na Home (saldo dentro do bolso) e em Cartões (pilha saindo do bolso) | ✅ |

## Lacunas conhecidas

- **ESLint**: o briefing cita, o projeto ainda não tem configuração de lint.
- **Modo estágio 1** (`VITE_APP_STAGE=1`): implementado, mas não foi testado no navegador.
- **Alvo da Viagem ao Japão**: o briefing não define; usamos R$ 20.000 (68% de R$ 13.600 ≈ R$ 20.000).
- **Fonte Satoshi**: vem do Fontshare; sem rede para lá, cai na Manrope.
- **Dock flutuante no mobile**: veio da imagem de referência, não do briefing ("sem menu de abas").
- **Contraste**: tokens escolhidos para WCAG AA (texto secundário ≥ 4.5:1 nos dois temas), mas sem auditoria automática.
