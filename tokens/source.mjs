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
    gray: {
      'gray-25': c('#f7f8fb'), 'gray-50': c('#f6f7fb'), 'gray-75': c('#f2f5fb'), 'gray-100': c('#f2f4f9'),
      'gray-150': c('#edf0f7'), 'gray-200': c('#e3e7f0'), 'gray-250': c('#dfe4ee'), 'gray-300': c('#dce3f0'),
      'gray-400': c('#a3aec4'), 'gray-500': c('#8d99b1'), 'gray-600': c('#68738d'), 'gray-700': c('#56627c'),
    },
    slate: {
      'slate-700': c('#26344f'), 'slate-750': c('#202e48'), 'slate-775': c('#1e2b47'), 'slate-800': c('#1d2942'),
      'slate-850': c('#18243b'), 'slate-875': c('#16223a'), 'slate-900': c('#131e34'), 'slate-925': c('#121c30'),
    },
    blue: {
      'blue-100': c('#dbe4fb'), 'blue-200': c('#a7bff7'), 'blue-250': c('#a9bdf3'), 'blue-300': c('#93b2ff'),
      'blue-500': c('#2e64d4'), 'blue-600': c('#2d5392'), 'blue-700': c('#1f3b70'), 'blue-750': c('#1a3466'),
      'blue-775': c('#183262'), 'blue-800': c('#1c3060'), 'blue-850': c('#0e1c3b'), 'blue-900': c('#0e1a33'),
      'blue-950': c('#0a1222'),
    },
    lilac: {
      'lilac-50': c('#f1ebfd'), 'lilac-100': c('#e4d9fb'), 'lilac-200': c('#d6c8f8'), 'lilac-300': c('#cdbdf4'),
      'lilac-400': c('#b9a2f1'), 'lilac-500': c('#b29cf0'), 'lilac-600': c('#9f86e8'),
    },
    alpha: {
      ...alpha('white', '#ffffff', [6, 8, 10, 12, 15, 18, 20, 22, 25, 28, 35, 45, 55, 60, 65, 70, 75, 80, 85, 90]),
      ...alpha('blue-950', '#0a1222', [55]),
      ...alpha('blue-900', '#0e1a33', [10, 15, 35, 45]),
      ...alpha('shadow', '#162854', [7]),
      ...alpha('black', '#000000', [25, 35]),
    },
  },

  font: {
    family: {
      'font-family-satoshi': { type: 'fontFamily', value: 'Satoshi' },
      'font-family-manrope': { type: 'fontFamily', value: 'Manrope' },
      'font-family-ibm-plex-mono': { type: 'fontFamily', value: 'IBM Plex Mono' },
    },
    size: scale('font-size', [10, 11, 12, 12.5, 13, 14, 15, 16, 18, 19, 20, 22, 24, 26, 28, 29, 30, 32, 36, 40, 44, 46, 48, 52, 56, 60, 66]),
    weight: {
      'font-weight-400': { type: 'fontWeight', value: 400, label: 'Regular' },
      'font-weight-500': { type: 'fontWeight', value: 500, label: 'Medium' },
      'font-weight-600': { type: 'fontWeight', value: 600, label: 'Semibold' },
      'font-weight-700': { type: 'fontWeight', value: 700, label: 'Bold' },
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
    'shadow-soft-light': { type: 'shadow', value: { x: 0, y: 10, blur: 30, spread: 0, color: 'color.alpha.shadow-alpha-7' } },
    'shadow-soft-dark': { type: 'shadow', value: { x: 0, y: 10, blur: 30, spread: 0, color: 'color.alpha.black-alpha-35' } },
    'shadow-dock': { type: 'shadow', value: { x: 0, y: 18, blur: 44, spread: 0, color: 'color.alpha.blue-900-alpha-45' } },
    'shadow-pocket': { type: 'shadow', value: { x: 0, y: 22, blur: 44, spread: 0, color: 'color.alpha.blue-900-alpha-35' } },
    'shadow-card-wallet': { type: 'shadow', value: { x: 0, y: -6, blur: 24, spread: 0, color: 'color.alpha.blue-900-alpha-15' } },
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
      'color-bg-page': { ref: { light: 'color.gray.gray-100', dark: 'color.blue.blue-950' }, css: '--gm-bg', usage: 'Fundo da página.' },
      'color-bg-surface': { ref: { light: 'color.base.white', dark: 'color.slate.slate-925' }, css: '--gm-surface', usage: 'Cards, atalhos, linhas, campos.' },
      'color-bg-elevated': { ref: { light: 'color.gray.gray-50', dark: 'color.slate.slate-850' }, css: '--gm-elevated', usage: 'Hover/pressionado sobre surface.' },
      'color-bg-sheet': { ref: { light: 'color.base.white', dark: 'color.slate.slate-900' }, css: '--gm-sheet', usage: 'Folhas que sobem por cima da tela.' },
      'color-bg-subtle': { ref: { light: 'color.gray.gray-150', dark: 'color.slate.slate-800' }, css: '--gm-row', usage: 'Quadrado do ícone, chip inativo, botão secundário.' },
      'color-bg-card': { ref: { light: 'color.base.white', dark: 'color.slate.slate-875' }, css: '--gm-card', usage: 'Tiles de destaque.' },
      'color-bg-dock': { ref: { light: 'color.blue.blue-700', dark: 'color.blue.blue-800' }, css: '--gm-dock', usage: 'Dock flutuante do mobile.' },
      'color-bg-overlay': { ref: same('color.alpha.blue-950-alpha-55'), usage: 'Véu atrás das folhas.' },
    },
    band: {
      'color-band-start': { ref: { light: 'color.blue.blue-750', dark: 'color.blue.blue-850' }, css: '--gm-band-from', usage: 'Topo da faixa marinho / barra do desktop.' },
      'color-band-end': { ref: { light: 'color.blue.blue-600', dark: 'color.blue.blue-775' }, css: '--gm-band-to', usage: 'Fim da faixa e base do bolso sólido.' },
    },
    text: {
      'color-text-default': { ref: { light: 'color.blue.blue-900', dark: 'color.gray.gray-75' }, css: '--gm-text', usage: 'Texto e números principais.' },
      'color-text-emphasis': { ref: { light: 'color.slate.slate-775', dark: 'color.gray.gray-300' }, css: '--gm-text-2', usage: 'Texto de chips e rótulos fortes.' },
      'color-text-secondary': { ref: { light: 'color.gray.gray-700', dark: 'color.gray.gray-400' }, css: '--gm-secondary', usage: 'Texto de apoio.' },
      'color-text-muted': { ref: { light: 'color.gray.gray-600', dark: 'color.gray.gray-500' }, css: '--gm-muted', usage: 'Datas, dicas, kickers (em surface).' },
      'color-text-link': { ref: { light: 'color.blue.blue-500', dark: 'color.blue.blue-300' }, css: '--gm-accent', usage: 'Links e destaque dentro de frase.' },
      'color-text-on-action': { ref: { light: 'color.base.white', dark: 'color.blue.blue-950' }, css: '--gm-on-primary', usage: 'Texto sobre color-action-primary.' },
      'color-text-on-card': { ref: { light: 'color.blue.blue-900', dark: 'color.gray.gray-75' }, css: '--gm-on-card', usage: 'Texto sobre color-bg-card.' },
      'color-text-on-brand': { ref: same('color.blue.blue-900'), css: '--gm-on', usage: 'Texto sobre lilás e cartões claros.' },
      'color-text-on-band': { ref: same('color.base.white'), usage: 'Texto sobre a faixa marinho e o bolso.' },
      'color-text-on-band-muted': { ref: same('color.alpha.white-alpha-70'), usage: 'Texto secundário sobre a faixa.' },
    },
    action: {
      'color-action-primary': { ref: { light: 'color.blue.blue-700', dark: 'color.blue.blue-200' }, css: '--gm-primary', usage: 'Ação principal, chip selecionado, progresso.' },
      'color-action-brand': { ref: same('color.lilac.lilac-300'), css: '--gm-lilac', usage: 'Botão + do dock, Pergunte ao Gamora, Adicionar (desktop).' },
    },
    border: {
      'color-border-default': { ref: { light: 'color.gray.gray-200', dark: 'color.slate.slate-750' }, css: '--gm-border', usage: 'Divisórias.' },
      'color-border-control': { ref: { light: 'color.gray.gray-250', dark: 'color.slate.slate-700' }, css: '--gm-track', usage: 'Borda de campos; trilho de progresso.' },
      'color-border-focus': { ref: { light: 'color.blue.blue-500', dark: 'color.blue.blue-300' }, usage: 'Anel de foco e campo ativo.' },
      'color-border-glass': { ref: same('color.alpha.white-alpha-28'), usage: 'Borda do vidro.' },
      'color-border-stitch': { ref: same('color.alpha.white-alpha-35'), usage: 'Costura tracejada do bolso.' },
    },
    brand: {
      'color-brand-lilac': { ref: same('color.lilac.lilac-300'), usage: 'Cor da marca.' },
      'color-brand-lilac-strong': { ref: { light: 'color.lilac.lilac-600', dark: 'color.lilac.lilac-500' }, css: '--gm-lilac-strong', usage: 'Assinaturas, limite atingido, 3ª série.' },
    },
    glass: {
      'color-glass-fill-start': { ref: same('color.alpha.white-alpha-20'), usage: 'Vidro: topo.' },
      'color-glass-fill-end': { ref: same('color.alpha.white-alpha-8'), usage: 'Vidro: base.' },
      'color-glass-highlight': { ref: same('color.alpha.white-alpha-70'), usage: 'Reflexo de 1px na borda de cima do bolso.' },
    },
    card: {
      'color-card-lilac-start': { ref: same('color.lilac.lilac-400'), usage: 'Cartão lilás (gradiente 128°).' },
      'color-card-lilac-end': { ref: same('color.lilac.lilac-100'), usage: 'Cartão lilás, fim.' },
      'color-card-periwinkle-start': { ref: same('color.blue.blue-250'), usage: 'Cartão lavanda.' },
      'color-card-periwinkle-end': { ref: same('color.blue.blue-100'), usage: 'Cartão lavanda, fim.' },
      'color-card-silver-start': { ref: same('color.gray.gray-250'), usage: 'Cartão prata.' },
      'color-card-silver-end': { ref: same('color.gray.gray-25'), usage: 'Cartão prata, fim.' },
      'color-hero-start': { ref: same('color.lilac.lilac-400'), usage: 'Bolha do assistente/avatar: início.' },
      'color-hero-middle': { ref: same('color.lilac.lilac-200'), usage: 'Meio.' },
      'color-hero-end': { ref: same('color.lilac.lilac-50'), usage: 'Fim.' },
    },
    chart: {
      'color-chart-1': { ref: { light: 'color.blue.blue-700', dark: 'color.blue.blue-200' }, usage: '1ª série.' },
      'color-chart-2': { ref: { light: 'color.blue.blue-500', dark: 'color.blue.blue-300' }, usage: '2ª série.' },
      'color-chart-3': { ref: { light: 'color.lilac.lilac-600', dark: 'color.lilac.lilac-500' }, usage: '3ª série.' },
      'color-chart-rest': { ref: { light: 'color.gray.gray-250', dark: 'color.slate.slate-700' }, usage: 'Restante.' },
    },
  },

  typography: {
    'font-family-body': { ref: same('font.family.font-family-satoshi'), usage: 'Toda a interface (fallback Manrope).' },
    'font-family-body-fallback': { ref: same('font.family.font-family-manrope'), usage: 'Quando a Satoshi não carrega.' },
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
    'font-weight-wordmark': { ref: same('font.weight.font-weight-900'), usage: 'Palavra gamora.' },
    'font-weight-code': { ref: same('font.weight.font-weight-400'), usage: 'Mono.' },
    'line-height-body': { ref: same('font.line-height.line-height-22'), usage: 'Corpo 15px.' },
    'line-height-caption': { ref: same('font.line-height.line-height-16'), usage: 'Legenda e kicker.' },
    'line-height-section': { ref: same('font.line-height.line-height-24'), usage: 'Seção 18px.' },
    'letter-spacing-number': { ref: same('font.letter-spacing.letter-spacing-neg-45'), usage: 'Números (saldo, valores).' },
    'letter-spacing-title': { ref: same('font.letter-spacing.letter-spacing-neg-35'), usage: 'Títulos de tela.' },
    'letter-spacing-wordmark': { ref: same('font.letter-spacing.letter-spacing-neg-40'), usage: 'Palavra gamora.' },
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
