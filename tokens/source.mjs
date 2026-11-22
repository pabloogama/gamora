/**
 * Gamora — fonte única dos design tokens.
 *
 *   primitives → valores crus (sem significado), um modo só.
 *   semantic   → aliases kebab-case que apontam para primitivos; cores têm modos light/dark.
 *
 * `npm run tokens` gera: tokens/primitives.json, tokens/semantic.json (formato W3C DTCG),
 * tokens/figma-variables.json e docs/TOKENS.md — e confere se os valores batem com
 * src/styles/index.css (campo `css` de cada token semântico).
 */

const px = (n) => ({ type: 'dimension', value: n, unit: 'px' })
const scale = (prefix, list, make = px) => Object.fromEntries(list.map((n) => [`${prefix}-${String(n).replace('.', '-')}`, make(n)]))
const neg = (list) => Object.fromEntries(list.map((n) => [`space-neg-${n}`, px(-n)]))
const alpha = (prefix, hex, list) =>
  Object.fromEntries(list.map((a) => [`${prefix}-alpha-${a}`, { type: 'color', value: hex, alpha: a / 100 }]))
const c = (value) => ({ type: 'color', value })

/* ═════════════════════════════ PRIMITIVOS ═════════════════════════════ */
export const primitives = {
  color: {
    base: { white: c('#ffffff'), black: c('#000000') },
    // cinzas-lavanda (fundo, superfícies claras, textos de apoio)
    neutral: {
      'neutral-25': c('#f8f9ff'), 'neutral-50': c('#f3f2ff'), 'neutral-100': c('#ede9ff'), 'neutral-150': c('#e6e2f7'),
      'neutral-200': c('#dedcf5'), 'neutral-400': c('#a9abca'), 'neutral-500': c('#9295b6'), 'neutral-600': c('#676b8a'),
      'neutral-700': c('#54597a'),
    },
    // azul-noite da primária #0B1230 e superfícies do tema escuro
    ink: {
      'ink-650': c('#2a3055'), 'ink-700': c('#222849'), 'ink-725': c('#1c2142'), 'ink-750': c('#1b2147'),
      'ink-775': c('#171c3a'), 'ink-800': c('#151a36'), 'ink-825': c('#121733'), 'ink-850': c('#11152f'),
      'ink-900': c('#0b1230'), 'ink-925': c('#0b0d2a'), 'ink-950': c('#070a1f'),
    },
    // violeta da marca (secundária #7B5CFF)
    violet: {
      'violet-100': c('#ede9ff'), 'violet-200': c('#b9a8ff'), 'violet-300': c('#a897ff'), 'violet-400': c('#8f74ff'), 'violet-500': c('#7b5cff'), 'violet-600': c('#5b3fe0'), 'violet-700': c('#3a2a8f'),
      'violet-750': c('#2c2378'), 'violet-775': c('#2b1f7a'), 'violet-800': c('#241a63'), 'violet-850': c('#1a1150'),
      'violet-875': c('#18124a'), 'violet-950': c('#0d0a2e'),
    },
    // verde-água (acento #00C2A8) — só preenchimento, nunca texto sobre branco
    teal: {
      'teal-200': c('#7be3d4'), 'teal-400': c('#2ed8bf'), 'teal-500': c('#00c2a8'),
    },
    // azul intermediário do gradiente do logo
    blue: { 'blue-400': c('#5b8bff') },
    alpha: {
      ...alpha('white', '#ffffff', [6, 8, 10, 12, 15, 18, 20, 22, 25, 28, 35, 38, 45, 55, 60, 65, 70, 75, 80, 85, 90]),
      ...alpha('ink-900', '#0b1230', [7, 22, 30, 40, 55]),
      ...alpha('violet-500', '#7b5cff', [45]),
      ...alpha('black', '#000000', [25, 35]),
    },
  },

  font: {
    family: {
            'font-family-manrope': { type: 'fontFamily', value: 'Manrope' },
      'font-family-ibm-plex-mono': { type: 'fontFamily', value: 'IBM Plex Mono' },
    },
    size: scale('font-size', [10, 11, 12, 12.5, 13, 14, 15, 16, 18, 19, 20, 22, 24, 26, 28, 29, 30, 32, 36, 40, 44, 46, 48, 52, 56, 60, 66]),
    weight: {
      'font-weight-400': { type: 'fontWeight', value: 400, label: 'Regular' },
      'font-weight-500': { type: 'fontWeight', value: 500, label: 'Medium' },
      'font-weight-600': { type: 'fontWeight', value: 600, label: 'Semibold' },
      'font-weight-700': { type: 'fontWeight', value: 700, label: 'Bold' },
      'font-weight-800': { type: 'fontWeight', value: 800, label: 'ExtraBold' },
      'font-weight-900': { type: 'fontWeight', value: 900, label: 'Black' },
    },
    'line-height': scale('line-height', [16, 18, 20, 22, 24, 26, 30, 32, 36, 40, 44, 52, 56, 66]),
    'letter-spacing': Object.fromEntries(
      [['neg-45', -4.5], ['neg-40', -4], ['neg-35', -3.5], ['neg-30', -3], ['neg-20', -2], ['neg-10', -1], ['0', 0], ['80', 8], ['120', 12]]
        .map(([k, v]) => [`letter-spacing-${k}`, { type: 'dimension', value: v, unit: '%' }]),
    ),
  },

  space: {
    positive: scale('space', [0, 1, 2, 4, 6, 7, 8, 10, 12, 14, 16, 20, 22, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96, 112]),
    negative: neg([1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64]),
  },

  radius: {
    ...scale('radius', [0, 8, 9, 12, 14, 18, 22, 24, 26, 30, 32, 34]),
    'radius-full': px(999),
  },

  stroke: scale('stroke-width', [0, 1, 1.5, 1.75, 1.9, 2, 2.5, 3, 4]),

  size: scale('size', [4, 6, 8, 10, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 32, 36, 40, 42, 44, 48, 56, 60, 64]),

  opacity: Object.fromEntries([0, 8, 10, 12, 15, 18, 20, 25, 30, 35, 40, 45, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
    .map((n) => [`opacity-${n}`, { type: 'number', value: n }])),

  blur: scale('blur', [2, 3, 12, 16, 18, 24, 40]),

  shadow: {
    'shadow-soft-light': { type: 'shadow', value: { x: 0, y: 10, blur: 30, spread: 0, color: 'color.alpha.ink-900-alpha-7' } },
    'shadow-soft-dark': { type: 'shadow', value: { x: 0, y: 10, blur: 30, spread: 0, color: 'color.alpha.black-alpha-35' } },
    'shadow-dock': { type: 'shadow', value: { x: 0, y: 18, blur: 44, spread: 0, color: 'color.alpha.ink-900-alpha-40' } },
    'shadow-pocket': { type: 'shadow', value: { x: 0, y: 22, blur: 44, spread: 0, color: 'color.alpha.ink-900-alpha-30' } },
    'shadow-glow-brand': { type: 'shadow', value: { x: 0, y: 8, blur: 24, spread: 0, color: 'color.alpha.violet-500-alpha-45' } },
    'shadow-card-wallet': { type: 'shadow', value: { x: 0, y: -6, blur: 24, spread: 0, color: 'color.alpha.ink-900-alpha-22' } },
  },

  duration: Object.fromEntries([150, 200, 250, 320, 350, 500, 700, 900].map((n) => [`duration-${n}`, { type: 'duration', value: n, unit: 'ms' }])),
  easing: {
    'easing-standard': { type: 'cubicBezier', value: [0.2, 0.9, 0.25, 1] },
    'easing-spring': { type: 'cubicBezier', value: [0.2, 0.9, 0.25, 1.2] },
    'easing-ease-out': { type: 'cubicBezier', value: [0, 0, 0.58, 1] },
  },
  'z-index': Object.fromEntries([0, 10, 20, 30, 40, 50, 60].map((n) => [`z-index-${n}`, { type: 'number', value: n }])),
  breakpoint: Object.fromEntries([400, 800, 1100, 1240].map((n) => [`breakpoint-${n}`, px(n)])),
}

/* ═════════════════════════════ SEMÂNTICOS ═════════════════════════════
 * ref: caminho do primitivo ("grupo.subgrupo.nome"). Cor: { light, dark }.
 * css: variável correspondente em src/styles/index.css (checada no build). */
const same = (ref) => ({ light: ref, dark: ref })

export const semantic = {
  color: {
    background: {
      'color-bg-page': { ref: { light: 'color.neutral.neutral-25', dark: 'color.ink.ink-950' }, css: '--gm-bg', usage: 'Fundo da página (Fundo #F8F9FF).' },
      'color-bg-surface': { ref: { light: 'color.base.white', dark: 'color.ink.ink-850' }, css: '--gm-surface', usage: 'Cards, atalhos, linhas, campos.' },
      'color-bg-elevated': { ref: { light: 'color.neutral.neutral-50', dark: 'color.ink.ink-775' }, css: '--gm-elevated', usage: 'Hover/pressionado sobre surface.' },
      'color-bg-sheet': { ref: { light: 'color.base.white', dark: 'color.ink.ink-825' }, css: '--gm-sheet', usage: 'Folhas que sobem por cima da tela.' },
      'color-bg-subtle': { ref: { light: 'color.neutral.neutral-100', dark: 'color.ink.ink-725' }, css: '--gm-row', usage: 'Superfície lavanda (#EDE9FF): ícone, chip inativo, botão secundário.' },
      'color-bg-card': { ref: { light: 'color.base.white', dark: 'color.ink.ink-800' }, css: '--gm-card', usage: 'Tiles de destaque.' },
      'color-bg-dock': { ref: { light: 'color.violet.violet-850', dark: 'color.violet.violet-800' }, css: '--gm-dock', usage: 'Dock flutuante do mobile.' },
      'color-bg-overlay': { ref: same('color.alpha.ink-900-alpha-55'), usage: 'Véu atrás das folhas.' },
    },
    band: {
      'color-band-start': { ref: { light: 'color.violet.violet-850', dark: 'color.violet.violet-950' }, css: '--gm-band-from', usage: 'Topo da faixa roxa / barra do desktop.' },
      'color-band-end': { ref: { light: 'color.violet.violet-700', dark: 'color.violet.violet-800' }, css: '--gm-band-to', usage: 'Fim da faixa roxa.' },
    },
    text: {
      'color-text-default': { ref: { light: 'color.ink.ink-900', dark: 'color.neutral.neutral-50' }, css: '--gm-text', usage: 'Texto e números principais (Primária #0B1230).' },
      'color-text-emphasis': { ref: { light: 'color.ink.ink-750', dark: 'color.neutral.neutral-200' }, css: '--gm-text-2', usage: 'Texto de chips e rótulos fortes.' },
      'color-text-secondary': { ref: { light: 'color.neutral.neutral-700', dark: 'color.neutral.neutral-400' }, css: '--gm-secondary', usage: 'Texto de apoio.' },
      'color-text-muted': { ref: { light: 'color.neutral.neutral-600', dark: 'color.neutral.neutral-500' }, css: '--gm-muted', usage: 'Datas, dicas, kickers.' },
      'color-text-link': { ref: { light: 'color.violet.violet-600', dark: 'color.violet.violet-300' }, css: '--gm-accent', usage: 'Links e destaque em frase (violeta escuro: 6.5:1 no branco).' },
      'color-text-on-action': { ref: { light: 'color.base.white', dark: 'color.ink.ink-900' }, css: '--gm-on-primary', usage: 'Texto sobre color-action-primary.' },
      'color-text-on-card': { ref: { light: 'color.ink.ink-900', dark: 'color.neutral.neutral-50' }, css: '--gm-on-card', usage: 'Texto sobre color-bg-card.' },
      'color-text-on-brand': { ref: same('color.ink.ink-900'), css: '--gm-on', usage: 'Texto sobre lilás, verde-água e cartões claros.' },
      'color-text-on-band': { ref: same('color.base.white'), usage: 'Texto sobre a faixa roxa e o bolso.' },
      'color-text-on-band-muted': { ref: same('color.alpha.white-alpha-70'), usage: 'Texto secundário sobre a faixa.' },
    },
    action: {
      'color-action-primary': { ref: { light: 'color.ink.ink-900', dark: 'color.violet.violet-200' }, css: '--gm-primary', usage: 'Ação principal (Primária), chip selecionado.' },
      'color-action-brand': { ref: same('color.violet.violet-200'), css: '--gm-lilac', usage: 'Pergunte ao Gamora, + do dock, Adicionar (desktop).' },
    },
    border: {
      'color-border-default': { ref: { light: 'color.neutral.neutral-150', dark: 'color.ink.ink-700' }, css: '--gm-border', usage: 'Divisórias.' },
      'color-border-control': { ref: { light: 'color.neutral.neutral-200', dark: 'color.ink.ink-650' }, css: '--gm-track', usage: 'Borda de campos; trilho de progresso.' },
      'color-border-focus': { ref: { light: 'color.violet.violet-600', dark: 'color.violet.violet-300' }, usage: 'Anel de foco e campo ativo.' },
      'color-border-glass': { ref: same('color.alpha.white-alpha-28'), usage: 'Borda do vidro.' },
      'color-border-stitch': { ref: same('color.alpha.white-alpha-38'), usage: 'Costura tracejada do bolso.' },
    },
    brand: {
      'color-brand-violet': { ref: { light: 'color.violet.violet-500', dark: 'color.violet.violet-400' }, css: '--gm-lilac-strong', usage: 'Secundária #7B5CFF: preenchimentos, 1ª série, assinaturas.' },
      'color-brand-teal': { ref: { light: 'color.teal.teal-500', dark: 'color.teal.teal-400' }, css: '--gm-teal', usage: 'Acento #00C2A8: barras e anéis de progresso, 2ª série.' },
      'color-brand-lilac': { ref: same('color.violet.violet-200'), usage: 'Lilás de apoio.' },
      'color-logo-start': { ref: same('color.violet.violet-500'), usage: 'Logo G: início.' },
      'color-logo-middle': { ref: same('color.blue.blue-400'), usage: 'Logo G: meio.' },
      'color-logo-end': { ref: same('color.teal.teal-500'), usage: 'Logo G: fim.' },
    },
    glass: {
      'color-glass-fill-start': { ref: same('color.alpha.white-alpha-20'), usage: 'Vidro: topo.' },
      'color-glass-fill-end': { ref: same('color.alpha.white-alpha-8'), usage: 'Vidro: base.' },
      'color-glass-highlight': { ref: same('color.alpha.white-alpha-70'), usage: 'Reflexo de 1px.' },
      'color-pocket-start': { ref: same('color.violet.violet-750'), usage: 'Bolso da carteira: topo.' },
      'color-pocket-middle': { ref: same('color.violet.violet-875'), usage: 'Bolso: meio.' },
      'color-pocket-end': { ref: same('color.ink.ink-925'), usage: 'Bolso: base.' },
    },
    card: {
      'color-card-brand-light': { ref: same('color.violet.violet-400'), usage: 'Cartão Gamora (radial, canto de cima à direita).' },
      'color-card-brand-middle': { ref: same('color.violet.violet-600'), usage: 'Cartão Gamora: meio.' },
      'color-card-brand-dark': { ref: same('color.violet.violet-775'), usage: 'Cartão Gamora: base. Texto branco.' },
      'color-card-teal-start': { ref: same('color.teal.teal-500'), usage: 'Cartão verde-água.' },
      'color-card-teal-end': { ref: same('color.teal.teal-200'), usage: 'Cartão verde-água, fim.' },
      'color-card-lavender-start': { ref: same('color.violet.violet-100'), usage: 'Cartão lavanda.' },
      'color-card-lavender-end': { ref: same('color.base.white'), usage: 'Cartão lavanda, fim.' },
      'color-hero-start': { ref: same('color.violet.violet-200'), usage: 'Bolha do assistente/avatar: início.' },
      'color-hero-middle': { ref: same('color.violet.violet-100'), usage: 'Meio.' },
      'color-hero-end': { ref: same('color.neutral.neutral-25'), usage: 'Fim.' },
    },
    chart: {
      'color-chart-1': { ref: { light: 'color.violet.violet-500', dark: 'color.violet.violet-400' }, usage: '1ª série.' },
      'color-chart-2': { ref: { light: 'color.teal.teal-500', dark: 'color.teal.teal-400' }, usage: '2ª série.' },
      'color-chart-3': { ref: { light: 'color.ink.ink-900', dark: 'color.violet.violet-200' }, usage: '3ª série.' },
      'color-chart-rest': { ref: { light: 'color.neutral.neutral-200', dark: 'color.ink.ink-650' }, usage: 'Restante.' },
    },
  },

  typography: {
    'font-family-body': { ref: same('font.family.font-family-manrope'), usage: 'Toda a interface (Manrope: moderna, legível e versátil).' },
    'font-family-code': { ref: same('font.family.font-family-ibm-plex-mono'), usage: 'Kickers e número do cartão.' },
    'font-size-balance': { ref: same('font.size.font-size-40'), usage: 'Saldo no mobile.' },
    'font-size-balance-desktop': { ref: same('font.size.font-size-52'), usage: 'Saldo no desktop.' },
    'font-size-display': { ref: same('font.size.font-size-46'), usage: 'Números de destaque (Ainda pode gastar).' },
    'font-size-figure': { ref: same('font.size.font-size-28'), usage: 'Números em cards.' },
    'font-size-screen-title': { ref: same('font.size.font-size-29'), usage: 'Título de tela (mobile).' },
    'font-size-screen-title-desktop': { ref: same('font.size.font-size-36'), usage: 'Título de tela (desktop).' },
    'font-size-sheet-title': { ref: same('font.size.font-size-24'), usage: 'Título de folha.' },
    'font-size-section': { ref: same('font.size.font-size-18'), usage: 'Título de seção.' },
    'font-size-body-lg': { ref: same('font.size.font-size-16'), usage: 'Nome na linha, campos.' },
    'font-size-body': { ref: same('font.size.font-size-15'), usage: 'Texto corrido.' },
    'font-size-label': { ref: same('font.size.font-size-13'), usage: 'Rótulos.' },
    'font-size-caption': { ref: same('font.size.font-size-12'), usage: 'Legendas e datas.' },
    'font-size-kicker': { ref: same('font.size.font-size-11'), usage: 'Kicker mono maiúsculo.' },
    'font-weight-body': { ref: same('font.weight.font-weight-500'), usage: 'Corpo.' },
    'font-weight-strong': { ref: same('font.weight.font-weight-700'), usage: 'Títulos, números, botões.' },
    'font-weight-wordmark': { ref: same('font.weight.font-weight-800'), usage: 'Palavra Gamora.' },
    'font-weight-code': { ref: same('font.weight.font-weight-400'), usage: 'Mono.' },
    'line-height-body': { ref: same('font.line-height.line-height-22'), usage: 'Corpo 15px.' },
    'line-height-caption': { ref: same('font.line-height.line-height-16'), usage: 'Legenda e kicker.' },
    'line-height-section': { ref: same('font.line-height.line-height-24'), usage: 'Seção 18px.' },
    'letter-spacing-number': { ref: same('font.letter-spacing.letter-spacing-neg-45'), usage: 'Números (saldo, valores).' },
    'letter-spacing-title': { ref: same('font.letter-spacing.letter-spacing-neg-35'), usage: 'Títulos de tela.' },
    'letter-spacing-wordmark': { ref: same('font.letter-spacing.letter-spacing-neg-30'), usage: 'Palavra Gamora.' },
    'letter-spacing-kicker': { ref: same('font.letter-spacing.letter-spacing-80'), usage: 'Kicker.' },
    'letter-spacing-card-number': { ref: same('font.letter-spacing.letter-spacing-120'), usage: '•••• 4552.' },
  },

  spacing: {
    'space-gutter-mobile': { ref: same('space.positive.space-20'), usage: 'Margem lateral < 800px.' },
    'space-gutter-desktop': { ref: same('space.positive.space-32'), usage: 'Margem lateral ≥ 800px.' },
    'space-inset-card': { ref: same('space.positive.space-24'), usage: 'Padding de cards e bolso.' },
    'space-inset-tile': { ref: same('space.positive.space-20'), usage: 'Padding de tiles.' },
    'space-inset-row': { ref: same('space.positive.space-16'), usage: 'Padding horizontal da linha.' },
    'space-inset-stitch': { ref: same('space.positive.space-7'), usage: 'Recuo da costura do bolso.' },
    'gap-inline-xs': { ref: same('space.positive.space-6'), usage: 'Ícone + texto em chip.' },
    'gap-inline-sm': { ref: same('space.positive.space-8'), usage: 'Ícone + texto em botão.' },
    'gap-inline-md': { ref: same('space.positive.space-12'), usage: 'Avatar + saudação; atalhos.' },
    'gap-stack-list': { ref: same('space.positive.space-8'), usage: 'Entre linhas de transação.' },
    'gap-stack-form': { ref: same('space.positive.space-20'), usage: 'Entre campos.' },
    'gap-stack-section': { ref: same('space.positive.space-24'), usage: 'Entre seções.' },
    'gap-grid-tiles': { ref: same('space.positive.space-12'), usage: 'Grade de tiles e atalhos.' },
    'gap-columns-desktop': { ref: same('space.positive.space-32'), usage: 'Colunas no desktop.' },
    'wallet-peek': { ref: same('space.positive.space-44'), usage: 'Quanto o cartão de trás aparece na Home.' },
    'offset-lift-hover': { ref: same('space.negative.space-neg-6'), usage: 'Cartão sobe ao passar o mouse.' },
    'offset-dock-active': { ref: same('space.negative.space-neg-6'), usage: 'Círculo ativo do dock sobressai.' },
    'offset-bleed-list': { ref: same('space.negative.space-neg-12'), usage: 'Lista sangra até a borda.' },
  },

  radius: {
    'radius-control': { ref: same('radius.radius-12'), usage: 'Campos; ícone de categoria.' },
    'radius-checkbox': { ref: same('radius.radius-8'), usage: 'Checkbox da fatura.' },
    'radius-chart-segment': { ref: same('radius.radius-14'), usage: 'Segmento do mês.' },
    'radius-row': { ref: same('radius.radius-22'), usage: 'Linha de transação, bolhas.' },
    'radius-stitch': { ref: same('radius.radius-24'), usage: 'Costura do bolso.' },
    'radius-tile': { ref: same('radius.radius-26'), usage: 'Atalhos, tiles, botões grandes.' },
    'radius-pocket': { ref: same('radius.radius-30'), usage: 'Bolso da carteira.' },
    'radius-wallet-card': { ref: same('radius.radius-32'), usage: 'Cartões.' },
    'radius-section': { ref: same('radius.radius-34'), usage: 'Cards de seção, folhas.' },
    'radius-pill': { ref: same('radius.radius-full'), usage: 'Chips, botões redondos, dock.' },
  },

  stroke: {
    'stroke-border': { ref: same('stroke.stroke-width-1'), usage: 'Bordas e divisórias.' },
    'stroke-focus': { ref: same('stroke.stroke-width-2'), usage: 'Anel de foco.' },
    'stroke-icon': { ref: same('stroke.stroke-width-1-75'), usage: 'Ícones de linha.' },
    'stroke-icon-strong': { ref: same('stroke.stroke-width-2-5'), usage: 'Ícone + e seta.' },
    'stroke-stitch': { ref: same('stroke.stroke-width-1'), usage: 'Costura tracejada.' },
    'stroke-dock-ring': { ref: same('stroke.stroke-width-4'), usage: 'Anel do item ativo no dock.' },
  },

  size: {
    'size-control': { ref: same('size.size-44'), usage: 'Botão redondo, campo.' },
    'size-control-sm': { ref: same('size.size-40'), usage: 'Botão redondo compacto.' },
    'size-dock-item': { ref: same('size.size-48'), usage: 'Item do dock.' },
    'size-dock-active': { ref: same('size.size-56'), usage: 'Item ativo do dock.' },
    'size-category-icon': { ref: same('size.size-44'), usage: 'Quadrado do ícone de categoria.' },
    'size-avatar': { ref: same('size.size-44'), usage: 'Avatar no topo.' },
    'size-icon': { ref: same('size.size-20'), usage: 'Ícone padrão.' },
    'size-icon-sm': { ref: same('size.size-16'), usage: 'Ícone em chips e botões pequenos.' },
    'size-progress-sm': { ref: same('size.size-4'), usage: 'Barra fina.' },
    'size-progress-md': { ref: same('size.size-8'), usage: 'Barra média.' },
  },

  effect: {
    'opacity-disabled': { ref: same('opacity.opacity-40'), usage: 'Controle desabilitado.' },
    'opacity-deselected': { ref: same('opacity.opacity-45'), usage: 'Item desmarcado na fatura.' },
    'blur-glass': { ref: same('blur.blur-18'), usage: 'Vidro sobre a faixa.' },
    'blur-pocket': { ref: same('blur.blur-16'), usage: 'Bolso sólido.' },
    'blur-header': { ref: same('blur.blur-24'), usage: 'Cabeçalho ao rolar.' },
    'shadow-surface': { ref: { light: 'shadow.shadow-soft-light', dark: 'shadow.shadow-soft-dark' }, usage: 'Todo card sobre a página.' },
    'shadow-floating': { ref: same('shadow.shadow-dock'), usage: 'Dock e toast.' },
    'shadow-brand-glow': { ref: same('shadow.shadow-glow-brand'), usage: 'Brilho do botão Pergunte.' },
    'shadow-pocket': { ref: same('shadow.shadow-pocket'), usage: 'Bolso sólido.' },
  },

  motion: {
    'motion-duration-fast': { ref: same('duration.duration-200'), usage: 'Fade, hover.' },
    'motion-duration-sheet': { ref: same('duration.duration-320'), usage: 'Folha subindo.' },
    'motion-duration-pop': { ref: same('duration.duration-350'), usage: 'Entrada de tela e toast.' },
    'motion-duration-card': { ref: same('duration.duration-500'), usage: 'Troca de cartão.' },
    'motion-duration-progress': { ref: same('duration.duration-700'), usage: 'Barras de progresso.' },
    'motion-easing-standard': { ref: same('easing.easing-standard'), usage: 'Padrão.' },
    'motion-easing-spring': { ref: same('easing.easing-spring'), usage: 'Entrada com leve sobra.' },
  },

  layer: {
    'z-band': { ref: same('z-index.z-index-0'), usage: 'Faixa de fundo.' },
    'z-pocket': { ref: same('z-index.z-index-10'), usage: 'Bolso sobre os cartões.' },
    'z-header': { ref: same('z-index.z-index-30'), usage: 'Cabeçalho fixo.' },
    'z-dock': { ref: same('z-index.z-index-40'), usage: 'Dock e barras fixas.' },
    'z-sheet': { ref: same('z-index.z-index-50'), usage: 'Folhas.' },
    'z-toast': { ref: same('z-index.z-index-60'), usage: 'Toast.' },
  },

  layout: {
    'breakpoint-tablet': { ref: same('breakpoint.breakpoint-800'), usage: 'Tablet.' },
    'breakpoint-desktop': { ref: same('breakpoint.breakpoint-1100'), usage: 'Desktop: duas colunas, barra superior.' },
    'container-max': { ref: same('breakpoint.breakpoint-1240'), usage: 'Largura máxima do conteúdo.' },
  },
}
