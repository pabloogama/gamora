# Gamora — Design tokens

> Gerado por `npm run tokens` a partir de `tokens/source.mjs`. Não edite à mão.
> Formato de troca: `tokens/primitives.json` e `tokens/semantic.json` (W3C Design Tokens) · `tokens/figma-variables.json` (coleções do Figma).

## Como está organizado

| Camada | O que é | Modos | Quantidade |
|---|---|---|---|
| **Primitivos** | Valores crus, sem significado. Nunca usados direto nos componentes. | um (`Value`) | 271 |
| **Semânticos** | Aliases em kebab-case que dizem *para que* serve. Componentes usam só estes. | `Light` · `Dark` | 149 |

**Nomenclatura (kebab-case):** `{categoria}-{papel}-{variante}` → `color-bg-surface`, `color-text-on-brand`, `space-inset-card`, `radius-wallet-card`.
No Figma o caminho vira grupo: `color/background/color-bg-surface`.

**Regra:** componente → semântico → primitivo. Mudou a marca? Troca-se o alias, não o componente.

## Primitivos

### color / base

| Token | Valor | Figma |
|---|---|---|
| `white` | `#ffffff` | `color/base/white` |
| `black` | `#000000` | `color/base/black` |

### color / neutral

| Token | Valor | Figma |
|---|---|---|
| `neutral-25` | `#f8f9ff` | `color/neutral/neutral-25` |
| `neutral-50` | `#f3f2ff` | `color/neutral/neutral-50` |
| `neutral-100` | `#ede9ff` | `color/neutral/neutral-100` |
| `neutral-150` | `#e6e2f7` | `color/neutral/neutral-150` |
| `neutral-200` | `#dedcf5` | `color/neutral/neutral-200` |
| `neutral-400` | `#a9abca` | `color/neutral/neutral-400` |
| `neutral-500` | `#9295b6` | `color/neutral/neutral-500` |
| `neutral-600` | `#676b8a` | `color/neutral/neutral-600` |
| `neutral-700` | `#54597a` | `color/neutral/neutral-700` |

### color / ink

| Token | Valor | Figma |
|---|---|---|
| `ink-650` | `#2a3055` | `color/ink/ink-650` |
| `ink-700` | `#222849` | `color/ink/ink-700` |
| `ink-725` | `#1c2142` | `color/ink/ink-725` |
| `ink-750` | `#1b2147` | `color/ink/ink-750` |
| `ink-775` | `#171c3a` | `color/ink/ink-775` |
| `ink-800` | `#151a36` | `color/ink/ink-800` |
| `ink-825` | `#121733` | `color/ink/ink-825` |
| `ink-850` | `#11152f` | `color/ink/ink-850` |
| `ink-900` | `#0b1230` | `color/ink/ink-900` |
| `ink-925` | `#0b0d2a` | `color/ink/ink-925` |
| `ink-950` | `#070a1f` | `color/ink/ink-950` |

### color / violet

| Token | Valor | Figma |
|---|---|---|
| `violet-100` | `#ede9ff` | `color/violet/violet-100` |
| `violet-200` | `#b9a8ff` | `color/violet/violet-200` |
| `violet-300` | `#a897ff` | `color/violet/violet-300` |
| `violet-400` | `#8f74ff` | `color/violet/violet-400` |
| `violet-500` | `#7b5cff` | `color/violet/violet-500` |
| `violet-600` | `#5b3fe0` | `color/violet/violet-600` |
| `violet-700` | `#3a2a8f` | `color/violet/violet-700` |
| `violet-750` | `#2c2378` | `color/violet/violet-750` |
| `violet-775` | `#2b1f7a` | `color/violet/violet-775` |
| `violet-800` | `#241a63` | `color/violet/violet-800` |
| `violet-850` | `#1a1150` | `color/violet/violet-850` |
| `violet-875` | `#18124a` | `color/violet/violet-875` |
| `violet-950` | `#0d0a2e` | `color/violet/violet-950` |

### color / teal

| Token | Valor | Figma |
|---|---|---|
| `teal-200` | `#7be3d4` | `color/teal/teal-200` |
| `teal-400` | `#2ed8bf` | `color/teal/teal-400` |
| `teal-500` | `#00c2a8` | `color/teal/teal-500` |

### color / blue

| Token | Valor | Figma |
|---|---|---|
| `blue-400` | `#5b8bff` | `color/blue/blue-400` |

### color / alpha

| Token | Valor | Figma |
|---|---|---|
| `white-alpha-6` | `#ffffff @ 6%` | `color/alpha/white-alpha-6` |
| `white-alpha-8` | `#ffffff @ 8%` | `color/alpha/white-alpha-8` |
| `white-alpha-10` | `#ffffff @ 10%` | `color/alpha/white-alpha-10` |
| `white-alpha-12` | `#ffffff @ 12%` | `color/alpha/white-alpha-12` |
| `white-alpha-15` | `#ffffff @ 15%` | `color/alpha/white-alpha-15` |
| `white-alpha-18` | `#ffffff @ 18%` | `color/alpha/white-alpha-18` |
| `white-alpha-20` | `#ffffff @ 20%` | `color/alpha/white-alpha-20` |
| `white-alpha-22` | `#ffffff @ 22%` | `color/alpha/white-alpha-22` |
| `white-alpha-25` | `#ffffff @ 25%` | `color/alpha/white-alpha-25` |
| `white-alpha-28` | `#ffffff @ 28%` | `color/alpha/white-alpha-28` |
| `white-alpha-35` | `#ffffff @ 35%` | `color/alpha/white-alpha-35` |
| `white-alpha-38` | `#ffffff @ 38%` | `color/alpha/white-alpha-38` |
| `white-alpha-45` | `#ffffff @ 45%` | `color/alpha/white-alpha-45` |
| `white-alpha-55` | `#ffffff @ 55%` | `color/alpha/white-alpha-55` |
| `white-alpha-60` | `#ffffff @ 60%` | `color/alpha/white-alpha-60` |
| `white-alpha-65` | `#ffffff @ 65%` | `color/alpha/white-alpha-65` |
| `white-alpha-70` | `#ffffff @ 70%` | `color/alpha/white-alpha-70` |
| `white-alpha-75` | `#ffffff @ 75%` | `color/alpha/white-alpha-75` |
| `white-alpha-80` | `#ffffff @ 80%` | `color/alpha/white-alpha-80` |
| `white-alpha-85` | `#ffffff @ 85%` | `color/alpha/white-alpha-85` |
| `white-alpha-90` | `#ffffff @ 90%` | `color/alpha/white-alpha-90` |
| `ink-900-alpha-7` | `#0b1230 @ 7%` | `color/alpha/ink-900-alpha-7` |
| `ink-900-alpha-22` | `#0b1230 @ 22%` | `color/alpha/ink-900-alpha-22` |
| `ink-900-alpha-30` | `#0b1230 @ 30%` | `color/alpha/ink-900-alpha-30` |
| `ink-900-alpha-40` | `#0b1230 @ 40%` | `color/alpha/ink-900-alpha-40` |
| `ink-900-alpha-55` | `#0b1230 @ 55%` | `color/alpha/ink-900-alpha-55` |
| `violet-500-alpha-45` | `#7b5cff @ 45%` | `color/alpha/violet-500-alpha-45` |
| `black-alpha-25` | `#000000 @ 25%` | `color/alpha/black-alpha-25` |
| `black-alpha-35` | `#000000 @ 35%` | `color/alpha/black-alpha-35` |

### font / family

| Token | Valor | Figma |
|---|---|---|
| `font-family-manrope` | `Manrope` | `font/family/font-family-manrope` |
| `font-family-ibm-plex-mono` | `IBM Plex Mono` | `font/family/font-family-ibm-plex-mono` |

### font / size

| Token | Valor | Figma |
|---|---|---|
| `font-size-10` | `10px` | `font/size/font-size-10` |
| `font-size-11` | `11px` | `font/size/font-size-11` |
| `font-size-12` | `12px` | `font/size/font-size-12` |
| `font-size-12-5` | `12.5px` | `font/size/font-size-12-5` |
| `font-size-13` | `13px` | `font/size/font-size-13` |
| `font-size-14` | `14px` | `font/size/font-size-14` |
| `font-size-15` | `15px` | `font/size/font-size-15` |
| `font-size-16` | `16px` | `font/size/font-size-16` |
| `font-size-18` | `18px` | `font/size/font-size-18` |
| `font-size-19` | `19px` | `font/size/font-size-19` |
| `font-size-20` | `20px` | `font/size/font-size-20` |
| `font-size-22` | `22px` | `font/size/font-size-22` |
| `font-size-24` | `24px` | `font/size/font-size-24` |
| `font-size-26` | `26px` | `font/size/font-size-26` |
| `font-size-28` | `28px` | `font/size/font-size-28` |
| `font-size-29` | `29px` | `font/size/font-size-29` |
| `font-size-30` | `30px` | `font/size/font-size-30` |
| `font-size-32` | `32px` | `font/size/font-size-32` |
| `font-size-36` | `36px` | `font/size/font-size-36` |
| `font-size-40` | `40px` | `font/size/font-size-40` |
| `font-size-44` | `44px` | `font/size/font-size-44` |
| `font-size-46` | `46px` | `font/size/font-size-46` |
| `font-size-48` | `48px` | `font/size/font-size-48` |
| `font-size-52` | `52px` | `font/size/font-size-52` |
| `font-size-56` | `56px` | `font/size/font-size-56` |
| `font-size-60` | `60px` | `font/size/font-size-60` |
| `font-size-66` | `66px` | `font/size/font-size-66` |

### font / weight

| Token | Valor | Figma |
|---|---|---|
| `font-weight-400` | `400 (Regular)` | `font/weight/font-weight-400` |
| `font-weight-500` | `500 (Medium)` | `font/weight/font-weight-500` |
| `font-weight-600` | `600 (Semibold)` | `font/weight/font-weight-600` |
| `font-weight-700` | `700 (Bold)` | `font/weight/font-weight-700` |
| `font-weight-800` | `800 (ExtraBold)` | `font/weight/font-weight-800` |
| `font-weight-900` | `900 (Black)` | `font/weight/font-weight-900` |

### font / line-height

| Token | Valor | Figma |
|---|---|---|
| `line-height-16` | `16px` | `font/line-height/line-height-16` |
| `line-height-18` | `18px` | `font/line-height/line-height-18` |
| `line-height-20` | `20px` | `font/line-height/line-height-20` |
| `line-height-22` | `22px` | `font/line-height/line-height-22` |
| `line-height-24` | `24px` | `font/line-height/line-height-24` |
| `line-height-26` | `26px` | `font/line-height/line-height-26` |
| `line-height-30` | `30px` | `font/line-height/line-height-30` |
| `line-height-32` | `32px` | `font/line-height/line-height-32` |
| `line-height-36` | `36px` | `font/line-height/line-height-36` |
| `line-height-40` | `40px` | `font/line-height/line-height-40` |
| `line-height-44` | `44px` | `font/line-height/line-height-44` |
| `line-height-52` | `52px` | `font/line-height/line-height-52` |
| `line-height-56` | `56px` | `font/line-height/line-height-56` |
| `line-height-66` | `66px` | `font/line-height/line-height-66` |

### font / letter-spacing

| Token | Valor | Figma |
|---|---|---|
| `letter-spacing-neg-45` | `-4.5%` | `font/letter-spacing/letter-spacing-neg-45` |
| `letter-spacing-neg-40` | `-4%` | `font/letter-spacing/letter-spacing-neg-40` |
| `letter-spacing-neg-35` | `-3.5%` | `font/letter-spacing/letter-spacing-neg-35` |
| `letter-spacing-neg-30` | `-3%` | `font/letter-spacing/letter-spacing-neg-30` |
| `letter-spacing-neg-20` | `-2%` | `font/letter-spacing/letter-spacing-neg-20` |
| `letter-spacing-neg-10` | `-1%` | `font/letter-spacing/letter-spacing-neg-10` |
| `letter-spacing-0` | `0%` | `font/letter-spacing/letter-spacing-0` |
| `letter-spacing-80` | `8%` | `font/letter-spacing/letter-spacing-80` |
| `letter-spacing-120` | `12%` | `font/letter-spacing/letter-spacing-120` |

### space / positive

| Token | Valor | Figma |
|---|---|---|
| `space-0` | `0px` | `space/positive/space-0` |
| `space-1` | `1px` | `space/positive/space-1` |
| `space-2` | `2px` | `space/positive/space-2` |
| `space-4` | `4px` | `space/positive/space-4` |
| `space-6` | `6px` | `space/positive/space-6` |
| `space-7` | `7px` | `space/positive/space-7` |
| `space-8` | `8px` | `space/positive/space-8` |
| `space-10` | `10px` | `space/positive/space-10` |
| `space-12` | `12px` | `space/positive/space-12` |
| `space-14` | `14px` | `space/positive/space-14` |
| `space-16` | `16px` | `space/positive/space-16` |
| `space-20` | `20px` | `space/positive/space-20` |
| `space-22` | `22px` | `space/positive/space-22` |
| `space-24` | `24px` | `space/positive/space-24` |
| `space-28` | `28px` | `space/positive/space-28` |
| `space-32` | `32px` | `space/positive/space-32` |
| `space-36` | `36px` | `space/positive/space-36` |
| `space-40` | `40px` | `space/positive/space-40` |
| `space-44` | `44px` | `space/positive/space-44` |
| `space-48` | `48px` | `space/positive/space-48` |
| `space-56` | `56px` | `space/positive/space-56` |
| `space-64` | `64px` | `space/positive/space-64` |
| `space-72` | `72px` | `space/positive/space-72` |
| `space-80` | `80px` | `space/positive/space-80` |
| `space-96` | `96px` | `space/positive/space-96` |
| `space-112` | `112px` | `space/positive/space-112` |

### space / negative

| Token | Valor | Figma |
|---|---|---|
| `space-neg-1` | `-1px` | `space/negative/space-neg-1` |
| `space-neg-2` | `-2px` | `space/negative/space-neg-2` |
| `space-neg-4` | `-4px` | `space/negative/space-neg-4` |
| `space-neg-6` | `-6px` | `space/negative/space-neg-6` |
| `space-neg-8` | `-8px` | `space/negative/space-neg-8` |
| `space-neg-10` | `-10px` | `space/negative/space-neg-10` |
| `space-neg-12` | `-12px` | `space/negative/space-neg-12` |
| `space-neg-16` | `-16px` | `space/negative/space-neg-16` |
| `space-neg-20` | `-20px` | `space/negative/space-neg-20` |
| `space-neg-24` | `-24px` | `space/negative/space-neg-24` |
| `space-neg-32` | `-32px` | `space/negative/space-neg-32` |
| `space-neg-40` | `-40px` | `space/negative/space-neg-40` |
| `space-neg-48` | `-48px` | `space/negative/space-neg-48` |
| `space-neg-64` | `-64px` | `space/negative/space-neg-64` |

### radius

| Token | Valor | Figma |
|---|---|---|
| `radius-0` | `0px` | `radius/radius-0` |
| `radius-8` | `8px` | `radius/radius-8` |
| `radius-9` | `9px` | `radius/radius-9` |
| `radius-12` | `12px` | `radius/radius-12` |
| `radius-14` | `14px` | `radius/radius-14` |
| `radius-18` | `18px` | `radius/radius-18` |
| `radius-22` | `22px` | `radius/radius-22` |
| `radius-24` | `24px` | `radius/radius-24` |
| `radius-26` | `26px` | `radius/radius-26` |
| `radius-30` | `30px` | `radius/radius-30` |
| `radius-32` | `32px` | `radius/radius-32` |
| `radius-34` | `34px` | `radius/radius-34` |
| `radius-full` | `999px` | `radius/radius-full` |

### stroke

| Token | Valor | Figma |
|---|---|---|
| `stroke-width-0` | `0px` | `stroke/stroke-width-0` |
| `stroke-width-1` | `1px` | `stroke/stroke-width-1` |
| `stroke-width-1-5` | `1.5px` | `stroke/stroke-width-1-5` |
| `stroke-width-1-75` | `1.75px` | `stroke/stroke-width-1-75` |
| `stroke-width-1-9` | `1.9px` | `stroke/stroke-width-1-9` |
| `stroke-width-2` | `2px` | `stroke/stroke-width-2` |
| `stroke-width-2-5` | `2.5px` | `stroke/stroke-width-2-5` |
| `stroke-width-3` | `3px` | `stroke/stroke-width-3` |
| `stroke-width-4` | `4px` | `stroke/stroke-width-4` |

### size

| Token | Valor | Figma |
|---|---|---|
| `size-4` | `4px` | `size/size-4` |
| `size-6` | `6px` | `size/size-6` |
| `size-8` | `8px` | `size/size-8` |
| `size-10` | `10px` | `size/size-10` |
| `size-12` | `12px` | `size/size-12` |
| `size-14` | `14px` | `size/size-14` |
| `size-15` | `15px` | `size/size-15` |
| `size-16` | `16px` | `size/size-16` |
| `size-17` | `17px` | `size/size-17` |
| `size-18` | `18px` | `size/size-18` |
| `size-19` | `19px` | `size/size-19` |
| `size-20` | `20px` | `size/size-20` |
| `size-21` | `21px` | `size/size-21` |
| `size-22` | `22px` | `size/size-22` |
| `size-24` | `24px` | `size/size-24` |
| `size-26` | `26px` | `size/size-26` |
| `size-28` | `28px` | `size/size-28` |
| `size-32` | `32px` | `size/size-32` |
| `size-36` | `36px` | `size/size-36` |
| `size-40` | `40px` | `size/size-40` |
| `size-42` | `42px` | `size/size-42` |
| `size-44` | `44px` | `size/size-44` |
| `size-48` | `48px` | `size/size-48` |
| `size-56` | `56px` | `size/size-56` |
| `size-60` | `60px` | `size/size-60` |
| `size-64` | `64px` | `size/size-64` |

### opacity

| Token | Valor | Figma |
|---|---|---|
| `opacity-0` | `0` | `opacity/opacity-0` |
| `opacity-8` | `8` | `opacity/opacity-8` |
| `opacity-10` | `10` | `opacity/opacity-10` |
| `opacity-12` | `12` | `opacity/opacity-12` |
| `opacity-15` | `15` | `opacity/opacity-15` |
| `opacity-18` | `18` | `opacity/opacity-18` |
| `opacity-20` | `20` | `opacity/opacity-20` |
| `opacity-25` | `25` | `opacity/opacity-25` |
| `opacity-30` | `30` | `opacity/opacity-30` |
| `opacity-35` | `35` | `opacity/opacity-35` |
| `opacity-40` | `40` | `opacity/opacity-40` |
| `opacity-45` | `45` | `opacity/opacity-45` |
| `opacity-55` | `55` | `opacity/opacity-55` |
| `opacity-60` | `60` | `opacity/opacity-60` |
| `opacity-65` | `65` | `opacity/opacity-65` |
| `opacity-70` | `70` | `opacity/opacity-70` |
| `opacity-75` | `75` | `opacity/opacity-75` |
| `opacity-80` | `80` | `opacity/opacity-80` |
| `opacity-85` | `85` | `opacity/opacity-85` |
| `opacity-90` | `90` | `opacity/opacity-90` |
| `opacity-95` | `95` | `opacity/opacity-95` |
| `opacity-100` | `100` | `opacity/opacity-100` |

### blur

| Token | Valor | Figma |
|---|---|---|
| `blur-2` | `2px` | `blur/blur-2` |
| `blur-3` | `3px` | `blur/blur-3` |
| `blur-12` | `12px` | `blur/blur-12` |
| `blur-16` | `16px` | `blur/blur-16` |
| `blur-18` | `18px` | `blur/blur-18` |
| `blur-24` | `24px` | `blur/blur-24` |
| `blur-40` | `40px` | `blur/blur-40` |

### shadow

| Token | Valor | Figma |
|---|---|---|
| `shadow-soft-light` | `0 10px 30px 0 · #0b1230 @ 7%` | `shadow/shadow-soft-light` |
| `shadow-soft-dark` | `0 10px 30px 0 · #000000 @ 35%` | `shadow/shadow-soft-dark` |
| `shadow-dock` | `0 18px 44px 0 · #0b1230 @ 40%` | `shadow/shadow-dock` |
| `shadow-pocket` | `0 22px 44px 0 · #0b1230 @ 30%` | `shadow/shadow-pocket` |
| `shadow-glow-brand` | `0 8px 24px 0 · #7b5cff @ 45%` | `shadow/shadow-glow-brand` |
| `shadow-card-wallet` | `0 -6px 24px 0 · #0b1230 @ 22%` | `shadow/shadow-card-wallet` |

### duration

| Token | Valor | Figma |
|---|---|---|
| `duration-150` | `150ms` | `duration/duration-150` |
| `duration-200` | `200ms` | `duration/duration-200` |
| `duration-250` | `250ms` | `duration/duration-250` |
| `duration-320` | `320ms` | `duration/duration-320` |
| `duration-350` | `350ms` | `duration/duration-350` |
| `duration-500` | `500ms` | `duration/duration-500` |
| `duration-700` | `700ms` | `duration/duration-700` |
| `duration-900` | `900ms` | `duration/duration-900` |

### easing

| Token | Valor | Figma |
|---|---|---|
| `easing-standard` | `cubic-bezier(0.2, 0.9, 0.25, 1)` | `easing/easing-standard` |
| `easing-spring` | `cubic-bezier(0.2, 0.9, 0.25, 1.2)` | `easing/easing-spring` |
| `easing-ease-out` | `cubic-bezier(0, 0, 0.58, 1)` | `easing/easing-ease-out` |

### z-index

| Token | Valor | Figma |
|---|---|---|
| `z-index-0` | `0` | `z-index/z-index-0` |
| `z-index-10` | `10` | `z-index/z-index-10` |
| `z-index-20` | `20` | `z-index/z-index-20` |
| `z-index-30` | `30` | `z-index/z-index-30` |
| `z-index-40` | `40` | `z-index/z-index-40` |
| `z-index-50` | `50` | `z-index/z-index-50` |
| `z-index-60` | `60` | `z-index/z-index-60` |

### breakpoint

| Token | Valor | Figma |
|---|---|---|
| `breakpoint-400` | `400px` | `breakpoint/breakpoint-400` |
| `breakpoint-800` | `800px` | `breakpoint/breakpoint-800` |
| `breakpoint-1100` | `1100px` | `breakpoint/breakpoint-1100` |
| `breakpoint-1240` | `1240px` | `breakpoint/breakpoint-1240` |

## Semânticos

Cada linha: alias → primitivo → valor resolvido, nos dois temas. A coluna **CSS** é a variável usada hoje em `src/styles/index.css`.

### color / background

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-bg-page` | `neutral-25` · #f8f9ff | `ink-950` · #070a1f | `--gm-bg` | Fundo da página (Fundo #F8F9FF). |
| `color-bg-surface` | `white` · #ffffff | `ink-850` · #11152f | `--gm-surface` | Cards, atalhos, linhas, campos. |
| `color-bg-elevated` | `neutral-50` · #f3f2ff | `ink-775` · #171c3a | `--gm-elevated` | Hover/pressionado sobre surface. |
| `color-bg-sheet` | `white` · #ffffff | `ink-825` · #121733 | `--gm-sheet` | Folhas que sobem por cima da tela. |
| `color-bg-subtle` | `neutral-100` · #ede9ff | `ink-725` · #1c2142 | `--gm-row` | Superfície lavanda (#EDE9FF): ícone, chip inativo, botão secundário. |
| `color-bg-card` | `white` · #ffffff | `ink-800` · #151a36 | `--gm-card` | Tiles de destaque. |
| `color-bg-dock` | `violet-850` · #1a1150 | `violet-800` · #241a63 | `--gm-dock` | Dock flutuante do mobile. |
| `color-bg-overlay` | `ink-900-alpha-55` · #0b1230 @ 55% | = | — | Véu atrás das folhas. |

### color / band

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-band-start` | `violet-850` · #1a1150 | `violet-950` · #0d0a2e | `--gm-band-from` | Topo da faixa roxa / barra do desktop. |
| `color-band-end` | `violet-700` · #3a2a8f | `violet-800` · #241a63 | `--gm-band-to` | Fim da faixa roxa. |

### color / text

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-text-default` | `ink-900` · #0b1230 | `neutral-50` · #f3f2ff | `--gm-text` | Texto e números principais (Primária #0B1230). |
| `color-text-emphasis` | `ink-750` · #1b2147 | `neutral-200` · #dedcf5 | `--gm-text-2` | Texto de chips e rótulos fortes. |
| `color-text-secondary` | `neutral-700` · #54597a | `neutral-400` · #a9abca | `--gm-secondary` | Texto de apoio. |
| `color-text-muted` | `neutral-600` · #676b8a | `neutral-500` · #9295b6 | `--gm-muted` | Datas, dicas, kickers. |
| `color-text-link` | `violet-600` · #5b3fe0 | `violet-300` · #a897ff | `--gm-accent` | Links e destaque em frase (violeta escuro: 6.5:1 no branco). |
| `color-text-on-action` | `white` · #ffffff | `ink-900` · #0b1230 | `--gm-on-primary` | Texto sobre color-action-primary. |
| `color-text-on-card` | `ink-900` · #0b1230 | `neutral-50` · #f3f2ff | `--gm-on-card` | Texto sobre color-bg-card. |
| `color-text-on-brand` | `ink-900` · #0b1230 | = | `--gm-on` | Texto sobre lilás, verde-água e cartões claros. |
| `color-text-on-band` | `white` · #ffffff | = | — | Texto sobre a faixa roxa e o bolso. |
| `color-text-on-band-muted` | `white-alpha-70` · #ffffff @ 70% | = | — | Texto secundário sobre a faixa. |

### color / action

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-action-primary` | `ink-900` · #0b1230 | `violet-200` · #b9a8ff | `--gm-primary` | Ação principal (Primária), chip selecionado. |
| `color-action-brand` | `violet-200` · #b9a8ff | = | `--gm-lilac` | Pergunte ao Gamora, + do dock, Adicionar (desktop). |

### color / border

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-border-default` | `neutral-150` · #e6e2f7 | `ink-700` · #222849 | `--gm-border` | Divisórias. |
| `color-border-control` | `neutral-200` · #dedcf5 | `ink-650` · #2a3055 | `--gm-track` | Borda de campos; trilho de progresso. |
| `color-border-focus` | `violet-600` · #5b3fe0 | `violet-300` · #a897ff | — | Anel de foco e campo ativo. |
| `color-border-glass` | `white-alpha-28` · #ffffff @ 28% | = | — | Borda do vidro. |
| `color-border-stitch` | `white-alpha-38` · #ffffff @ 38% | = | — | Costura tracejada do bolso. |

### color / brand

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-brand-violet` | `violet-500` · #7b5cff | `violet-400` · #8f74ff | `--gm-lilac-strong` | Secundária #7B5CFF: preenchimentos, 1ª série, assinaturas. |
| `color-brand-teal` | `teal-500` · #00c2a8 | `teal-400` · #2ed8bf | `--gm-teal` | Acento #00C2A8: barras e anéis de progresso, 2ª série. |
| `color-brand-lilac` | `violet-200` · #b9a8ff | = | — | Lilás de apoio. |
| `color-logo-start` | `violet-500` · #7b5cff | = | — | Logo G: início. |
| `color-logo-middle` | `blue-400` · #5b8bff | = | — | Logo G: meio. |
| `color-logo-end` | `teal-500` · #00c2a8 | = | — | Logo G: fim. |

### color / glass

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-glass-fill-start` | `white-alpha-20` · #ffffff @ 20% | = | — | Vidro: topo. |
| `color-glass-fill-end` | `white-alpha-8` · #ffffff @ 8% | = | — | Vidro: base. |
| `color-glass-highlight` | `white-alpha-70` · #ffffff @ 70% | = | — | Reflexo de 1px. |
| `color-pocket-start` | `violet-750` · #2c2378 | = | — | Bolso da carteira: topo. |
| `color-pocket-middle` | `violet-875` · #18124a | = | — | Bolso: meio. |
| `color-pocket-end` | `ink-925` · #0b0d2a | = | — | Bolso: base. |

### color / card

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-card-brand-light` | `violet-400` · #8f74ff | = | — | Cartão Gamora (radial, canto de cima à direita). |
| `color-card-brand-middle` | `violet-600` · #5b3fe0 | = | — | Cartão Gamora: meio. |
| `color-card-brand-dark` | `violet-775` · #2b1f7a | = | — | Cartão Gamora: base. Texto branco. |
| `color-card-teal-start` | `teal-500` · #00c2a8 | = | — | Cartão verde-água. |
| `color-card-teal-end` | `teal-200` · #7be3d4 | = | — | Cartão verde-água, fim. |
| `color-card-lavender-start` | `violet-100` · #ede9ff | = | — | Cartão lavanda. |
| `color-card-lavender-end` | `white` · #ffffff | = | — | Cartão lavanda, fim. |
| `color-hero-start` | `violet-200` · #b9a8ff | = | — | Bolha do assistente/avatar: início. |
| `color-hero-middle` | `violet-100` · #ede9ff | = | — | Meio. |
| `color-hero-end` | `neutral-25` · #f8f9ff | = | — | Fim. |

### color / chart

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-chart-1` | `violet-500` · #7b5cff | `violet-400` · #8f74ff | — | 1ª série. |
| `color-chart-2` | `teal-500` · #00c2a8 | `teal-400` · #2ed8bf | — | 2ª série. |
| `color-chart-3` | `ink-900` · #0b1230 | `violet-200` · #b9a8ff | — | 3ª série. |
| `color-chart-rest` | `neutral-200` · #dedcf5 | `ink-650` · #2a3055 | — | Restante. |

### typography

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `font-family-body` | `font-family-manrope` · Manrope | = | — | Toda a interface (Manrope: moderna, legível e versátil). |
| `font-family-code` | `font-family-ibm-plex-mono` · IBM Plex Mono | = | — | Kickers e número do cartão. |
| `font-size-balance` | `font-size-40` · 40px | = | — | Saldo no mobile. |
| `font-size-balance-desktop` | `font-size-52` · 52px | = | — | Saldo no desktop. |
| `font-size-display` | `font-size-46` · 46px | = | — | Números de destaque (Ainda pode gastar). |
| `font-size-figure` | `font-size-28` · 28px | = | — | Números em cards. |
| `font-size-screen-title` | `font-size-29` · 29px | = | — | Título de tela (mobile). |
| `font-size-screen-title-desktop` | `font-size-36` · 36px | = | — | Título de tela (desktop). |
| `font-size-sheet-title` | `font-size-24` · 24px | = | — | Título de folha. |
| `font-size-section` | `font-size-18` · 18px | = | — | Título de seção. |
| `font-size-body-lg` | `font-size-16` · 16px | = | — | Nome na linha, campos. |
| `font-size-body` | `font-size-15` · 15px | = | — | Texto corrido. |
| `font-size-label` | `font-size-13` · 13px | = | — | Rótulos. |
| `font-size-caption` | `font-size-12` · 12px | = | — | Legendas e datas. |
| `font-size-kicker` | `font-size-11` · 11px | = | — | Kicker mono maiúsculo. |
| `font-weight-body` | `font-weight-500` · 500 (Medium) | = | — | Corpo. |
| `font-weight-strong` | `font-weight-700` · 700 (Bold) | = | — | Títulos, números, botões. |
| `font-weight-wordmark` | `font-weight-800` · 800 (ExtraBold) | = | — | Palavra Gamora. |
| `font-weight-code` | `font-weight-400` · 400 (Regular) | = | — | Mono. |
| `line-height-body` | `line-height-22` · 22px | = | — | Corpo 15px. |
| `line-height-caption` | `line-height-16` · 16px | = | — | Legenda e kicker. |
| `line-height-section` | `line-height-24` · 24px | = | — | Seção 18px. |
| `letter-spacing-number` | `letter-spacing-neg-45` · -4.5% | = | — | Números (saldo, valores). |
| `letter-spacing-title` | `letter-spacing-neg-35` · -3.5% | = | — | Títulos de tela. |
| `letter-spacing-wordmark` | `letter-spacing-neg-30` · -3% | = | — | Palavra Gamora. |
| `letter-spacing-kicker` | `letter-spacing-80` · 8% | = | — | Kicker. |
| `letter-spacing-card-number` | `letter-spacing-120` · 12% | = | — | •••• 4552. |

### spacing

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `space-gutter-mobile` | `space-20` · 20px | = | — | Margem lateral < 800px. |
| `space-gutter-desktop` | `space-32` · 32px | = | — | Margem lateral ≥ 800px. |
| `space-inset-card` | `space-24` · 24px | = | — | Padding de cards e bolso. |
| `space-inset-tile` | `space-20` · 20px | = | — | Padding de tiles. |
| `space-inset-row` | `space-16` · 16px | = | — | Padding horizontal da linha. |
| `space-inset-stitch` | `space-7` · 7px | = | — | Recuo da costura do bolso. |
| `gap-inline-xs` | `space-6` · 6px | = | — | Ícone + texto em chip. |
| `gap-inline-sm` | `space-8` · 8px | = | — | Ícone + texto em botão. |
| `gap-inline-md` | `space-12` · 12px | = | — | Avatar + saudação; atalhos. |
| `gap-stack-list` | `space-8` · 8px | = | — | Entre linhas de transação. |
| `gap-stack-form` | `space-20` · 20px | = | — | Entre campos. |
| `gap-stack-section` | `space-24` · 24px | = | — | Entre seções. |
| `gap-grid-tiles` | `space-12` · 12px | = | — | Grade de tiles e atalhos. |
| `gap-columns-desktop` | `space-32` · 32px | = | — | Colunas no desktop. |
| `wallet-peek` | `space-44` · 44px | = | — | Quanto o cartão de trás aparece na Home. |
| `offset-lift-hover` | `space-neg-6` · -6px | = | — | Cartão sobe ao passar o mouse. |
| `offset-dock-active` | `space-neg-6` · -6px | = | — | Círculo ativo do dock sobressai. |
| `offset-bleed-list` | `space-neg-12` · -12px | = | — | Lista sangra até a borda. |

### radius

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `radius-control` | `radius-12` · 12px | = | — | Campos; ícone de categoria. |
| `radius-checkbox` | `radius-8` · 8px | = | — | Checkbox da fatura. |
| `radius-chart-segment` | `radius-14` · 14px | = | — | Segmento do mês. |
| `radius-row` | `radius-22` · 22px | = | — | Linha de transação, bolhas. |
| `radius-stitch` | `radius-24` · 24px | = | — | Costura do bolso. |
| `radius-tile` | `radius-26` · 26px | = | — | Atalhos, tiles, botões grandes. |
| `radius-pocket` | `radius-30` · 30px | = | — | Bolso da carteira. |
| `radius-wallet-card` | `radius-32` · 32px | = | — | Cartões. |
| `radius-section` | `radius-34` · 34px | = | — | Cards de seção, folhas. |
| `radius-pill` | `radius-full` · 999px | = | — | Chips, botões redondos, dock. |

### stroke

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `stroke-border` | `stroke-width-1` · 1px | = | — | Bordas e divisórias. |
| `stroke-focus` | `stroke-width-2` · 2px | = | — | Anel de foco. |
| `stroke-icon` | `stroke-width-1-75` · 1.75px | = | — | Ícones de linha. |
| `stroke-icon-strong` | `stroke-width-2-5` · 2.5px | = | — | Ícone + e seta. |
| `stroke-stitch` | `stroke-width-1` · 1px | = | — | Costura tracejada. |
| `stroke-dock-ring` | `stroke-width-4` · 4px | = | — | Anel do item ativo no dock. |

### size

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `size-control` | `size-44` · 44px | = | — | Botão redondo, campo. |
| `size-control-sm` | `size-40` · 40px | = | — | Botão redondo compacto. |
| `size-dock-item` | `size-48` · 48px | = | — | Item do dock. |
| `size-dock-active` | `size-56` · 56px | = | — | Item ativo do dock. |
| `size-category-icon` | `size-44` · 44px | = | — | Quadrado do ícone de categoria. |
| `size-avatar` | `size-44` · 44px | = | — | Avatar no topo. |
| `size-icon` | `size-20` · 20px | = | — | Ícone padrão. |
| `size-icon-sm` | `size-16` · 16px | = | — | Ícone em chips e botões pequenos. |
| `size-progress-sm` | `size-4` · 4px | = | — | Barra fina. |
| `size-progress-md` | `size-8` · 8px | = | — | Barra média. |

### effect

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `opacity-disabled` | `opacity-40` · 40 | = | — | Controle desabilitado. |
| `opacity-deselected` | `opacity-45` · 45 | = | — | Item desmarcado na fatura. |
| `blur-glass` | `blur-18` · 18px | = | — | Vidro sobre a faixa. |
| `blur-pocket` | `blur-16` · 16px | = | — | Bolso sólido. |
| `blur-header` | `blur-24` · 24px | = | — | Cabeçalho ao rolar. |
| `shadow-surface` | `shadow-soft-light` · 0 10px 30px 0 · #0b1230 @ 7% | `shadow-soft-dark` · 0 10px 30px 0 · #000000 @ 35% | — | Todo card sobre a página. |
| `shadow-floating` | `shadow-dock` · 0 18px 44px 0 · #0b1230 @ 40% | = | — | Dock e toast. |
| `shadow-brand-glow` | `shadow-glow-brand` · 0 8px 24px 0 · #7b5cff @ 45% | = | — | Brilho do botão Pergunte. |
| `shadow-pocket` | `shadow-pocket` · 0 22px 44px 0 · #0b1230 @ 30% | = | — | Bolso sólido. |

### motion

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `motion-duration-fast` | `duration-200` · 200ms | = | — | Fade, hover. |
| `motion-duration-sheet` | `duration-320` · 320ms | = | — | Folha subindo. |
| `motion-duration-pop` | `duration-350` · 350ms | = | — | Entrada de tela e toast. |
| `motion-duration-card` | `duration-500` · 500ms | = | — | Troca de cartão. |
| `motion-duration-progress` | `duration-700` · 700ms | = | — | Barras de progresso. |
| `motion-easing-standard` | `easing-standard` · cubic-bezier(0.2, 0.9, 0.25, 1) | = | — | Padrão. |
| `motion-easing-spring` | `easing-spring` · cubic-bezier(0.2, 0.9, 0.25, 1.2) | = | — | Entrada com leve sobra. |

### layer

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `z-band` | `z-index-0` · 0 | = | — | Faixa de fundo. |
| `z-pocket` | `z-index-10` · 10 | = | — | Bolso sobre os cartões. |
| `z-header` | `z-index-30` · 30 | = | — | Cabeçalho fixo. |
| `z-dock` | `z-index-40` · 40 | = | — | Dock e barras fixas. |
| `z-sheet` | `z-index-50` · 50 | = | — | Folhas. |
| `z-toast` | `z-index-60` · 60 | = | — | Toast. |

### layout

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `breakpoint-tablet` | `breakpoint-800` · 800px | = | — | Tablet. |
| `breakpoint-desktop` | `breakpoint-1100` · 1100px | = | — | Desktop: duas colunas, barra superior. |
| `container-max` | `breakpoint-1240` · 1240px | = | — | Largura máxima do conteúdo. |

## Resumo por família (primitivos)

| Família | Tokens |
|---|---|
| Cor (base, gray, slate, blue, lilac) | 39 |
| Cor com transparência | 29 |
| Fonte (família, tamanho, peso, altura de linha, espaçamento) | 58 |
| Espaço positivo / negativo | 26 / 14 |
| Raio | 13 |
| Stroke | 9 |
| Tamanho | 26 |
| Opacidade / Blur / Sombra | 22 / 7 / 6 |
| Duração / Easing / Z-index / Breakpoint | 8 / 3 / 7 / 4 |

**No Figma:** sombras viram *Effect styles* (`shadow/*`), porque variáveis do Figma não guardam sombra. Easing e família de fonte são variáveis de texto (STRING); o resto é número (FLOAT) ou cor (COLOR). Letter-spacing está em %.

**Conferência com o código:** ✅ todos os 23 tokens semânticos com variável CSS batem com `src/styles/index.css` nos dois temas.
