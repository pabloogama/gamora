# Gamora — Design tokens

> Gerado por `npm run tokens` a partir de `tokens/source.mjs`. Não edite à mão.
> Formato de troca: `tokens/primitives.json` e `tokens/semantic.json` (W3C Design Tokens) · `tokens/figma-variables.json` (coleções do Figma).

## Como está organizado

| Camada | O que é | Modos | Quantidade |
|---|---|---|---|
| **Primitivos** | Valores crus, sem significado. Nunca usados direto nos componentes. | um (`Value`) | 272 |
| **Semânticos** | Aliases em kebab-case que dizem *para que* serve. Componentes usam só estes. | `Light` · `Dark` | 141 |

**Nomenclatura (kebab-case):** `{categoria}-{papel}-{variante}` → `color-bg-surface`, `color-text-on-brand`, `space-inset-card`, `radius-wallet-card`.
No Figma o caminho vira grupo: `color/background/color-bg-surface`.

**Regra:** componente → semântico → primitivo. Mudou a marca? Troca-se o alias, não o componente.

## Primitivos

### color / base

| Token | Valor | Figma |
|---|---|---|
| `white` | `#ffffff` | `color/base/white` |
| `black` | `#000000` | `color/base/black` |

### color / gray

| Token | Valor | Figma |
|---|---|---|
| `gray-25` | `#f7f8fb` | `color/gray/gray-25` |
| `gray-50` | `#f6f7fb` | `color/gray/gray-50` |
| `gray-75` | `#f2f5fb` | `color/gray/gray-75` |
| `gray-100` | `#f2f4f9` | `color/gray/gray-100` |
| `gray-150` | `#edf0f7` | `color/gray/gray-150` |
| `gray-200` | `#e3e7f0` | `color/gray/gray-200` |
| `gray-250` | `#dfe4ee` | `color/gray/gray-250` |
| `gray-300` | `#dce3f0` | `color/gray/gray-300` |
| `gray-400` | `#a3aec4` | `color/gray/gray-400` |
| `gray-500` | `#8d99b1` | `color/gray/gray-500` |
| `gray-600` | `#68738d` | `color/gray/gray-600` |
| `gray-700` | `#56627c` | `color/gray/gray-700` |

### color / slate

| Token | Valor | Figma |
|---|---|---|
| `slate-700` | `#26344f` | `color/slate/slate-700` |
| `slate-750` | `#202e48` | `color/slate/slate-750` |
| `slate-775` | `#1e2b47` | `color/slate/slate-775` |
| `slate-800` | `#1d2942` | `color/slate/slate-800` |
| `slate-850` | `#18243b` | `color/slate/slate-850` |
| `slate-875` | `#16223a` | `color/slate/slate-875` |
| `slate-900` | `#131e34` | `color/slate/slate-900` |
| `slate-925` | `#121c30` | `color/slate/slate-925` |

### color / blue

| Token | Valor | Figma |
|---|---|---|
| `blue-100` | `#dbe4fb` | `color/blue/blue-100` |
| `blue-200` | `#a7bff7` | `color/blue/blue-200` |
| `blue-250` | `#a9bdf3` | `color/blue/blue-250` |
| `blue-300` | `#93b2ff` | `color/blue/blue-300` |
| `blue-500` | `#2e64d4` | `color/blue/blue-500` |
| `blue-600` | `#2d5392` | `color/blue/blue-600` |
| `blue-700` | `#1f3b70` | `color/blue/blue-700` |
| `blue-750` | `#1a3466` | `color/blue/blue-750` |
| `blue-775` | `#183262` | `color/blue/blue-775` |
| `blue-800` | `#1c3060` | `color/blue/blue-800` |
| `blue-850` | `#0e1c3b` | `color/blue/blue-850` |
| `blue-900` | `#0e1a33` | `color/blue/blue-900` |
| `blue-950` | `#0a1222` | `color/blue/blue-950` |

### color / lilac

| Token | Valor | Figma |
|---|---|---|
| `lilac-50` | `#f1ebfd` | `color/lilac/lilac-50` |
| `lilac-100` | `#e4d9fb` | `color/lilac/lilac-100` |
| `lilac-200` | `#d6c8f8` | `color/lilac/lilac-200` |
| `lilac-300` | `#cdbdf4` | `color/lilac/lilac-300` |
| `lilac-400` | `#b9a2f1` | `color/lilac/lilac-400` |
| `lilac-500` | `#b29cf0` | `color/lilac/lilac-500` |
| `lilac-600` | `#9f86e8` | `color/lilac/lilac-600` |

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
| `white-alpha-45` | `#ffffff @ 45%` | `color/alpha/white-alpha-45` |
| `white-alpha-55` | `#ffffff @ 55%` | `color/alpha/white-alpha-55` |
| `white-alpha-60` | `#ffffff @ 60%` | `color/alpha/white-alpha-60` |
| `white-alpha-65` | `#ffffff @ 65%` | `color/alpha/white-alpha-65` |
| `white-alpha-70` | `#ffffff @ 70%` | `color/alpha/white-alpha-70` |
| `white-alpha-75` | `#ffffff @ 75%` | `color/alpha/white-alpha-75` |
| `white-alpha-80` | `#ffffff @ 80%` | `color/alpha/white-alpha-80` |
| `white-alpha-85` | `#ffffff @ 85%` | `color/alpha/white-alpha-85` |
| `white-alpha-90` | `#ffffff @ 90%` | `color/alpha/white-alpha-90` |
| `blue-950-alpha-55` | `#0a1222 @ 55%` | `color/alpha/blue-950-alpha-55` |
| `blue-900-alpha-10` | `#0e1a33 @ 10%` | `color/alpha/blue-900-alpha-10` |
| `blue-900-alpha-15` | `#0e1a33 @ 15%` | `color/alpha/blue-900-alpha-15` |
| `blue-900-alpha-35` | `#0e1a33 @ 35%` | `color/alpha/blue-900-alpha-35` |
| `blue-900-alpha-45` | `#0e1a33 @ 45%` | `color/alpha/blue-900-alpha-45` |
| `shadow-alpha-7` | `#162854 @ 7%` | `color/alpha/shadow-alpha-7` |
| `black-alpha-25` | `#000000 @ 25%` | `color/alpha/black-alpha-25` |
| `black-alpha-35` | `#000000 @ 35%` | `color/alpha/black-alpha-35` |

### font / family

| Token | Valor | Figma |
|---|---|---|
| `font-family-satoshi` | `Satoshi` | `font/family/font-family-satoshi` |
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
| `shadow-soft-light` | `0 10px 30px 0 · #162854 @ 7%` | `shadow/shadow-soft-light` |
| `shadow-soft-dark` | `0 10px 30px 0 · #000000 @ 35%` | `shadow/shadow-soft-dark` |
| `shadow-dock` | `0 18px 44px 0 · #0e1a33 @ 45%` | `shadow/shadow-dock` |
| `shadow-pocket` | `0 22px 44px 0 · #0e1a33 @ 35%` | `shadow/shadow-pocket` |
| `shadow-card-wallet` | `0 -6px 24px 0 · #0e1a33 @ 15%` | `shadow/shadow-card-wallet` |

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
| `color-bg-page` | `gray-100` · #f2f4f9 | `blue-950` · #0a1222 | `--gm-bg` | Fundo da página. |
| `color-bg-surface` | `white` · #ffffff | `slate-925` · #121c30 | `--gm-surface` | Cards, atalhos, linhas, campos. |
| `color-bg-elevated` | `gray-50` · #f6f7fb | `slate-850` · #18243b | `--gm-elevated` | Hover/pressionado sobre surface. |
| `color-bg-sheet` | `white` · #ffffff | `slate-900` · #131e34 | `--gm-sheet` | Folhas que sobem por cima da tela. |
| `color-bg-subtle` | `gray-150` · #edf0f7 | `slate-800` · #1d2942 | `--gm-row` | Quadrado do ícone, chip inativo, botão secundário. |
| `color-bg-card` | `white` · #ffffff | `slate-875` · #16223a | `--gm-card` | Tiles de destaque. |
| `color-bg-dock` | `blue-700` · #1f3b70 | `blue-800` · #1c3060 | `--gm-dock` | Dock flutuante do mobile. |
| `color-bg-overlay` | `blue-950-alpha-55` · #0a1222 @ 55% | = | — | Véu atrás das folhas. |

### color / band

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-band-start` | `blue-750` · #1a3466 | `blue-850` · #0e1c3b | `--gm-band-from` | Topo da faixa marinho / barra do desktop. |
| `color-band-end` | `blue-600` · #2d5392 | `blue-775` · #183262 | `--gm-band-to` | Fim da faixa e base do bolso sólido. |

### color / text

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-text-default` | `blue-900` · #0e1a33 | `gray-75` · #f2f5fb | `--gm-text` | Texto e números principais. |
| `color-text-emphasis` | `slate-775` · #1e2b47 | `gray-300` · #dce3f0 | `--gm-text-2` | Texto de chips e rótulos fortes. |
| `color-text-secondary` | `gray-700` · #56627c | `gray-400` · #a3aec4 | `--gm-secondary` | Texto de apoio. |
| `color-text-muted` | `gray-600` · #68738d | `gray-500` · #8d99b1 | `--gm-muted` | Datas, dicas, kickers (em surface). |
| `color-text-link` | `blue-500` · #2e64d4 | `blue-300` · #93b2ff | `--gm-accent` | Links e destaque dentro de frase. |
| `color-text-on-action` | `white` · #ffffff | `blue-950` · #0a1222 | `--gm-on-primary` | Texto sobre color-action-primary. |
| `color-text-on-card` | `blue-900` · #0e1a33 | `gray-75` · #f2f5fb | `--gm-on-card` | Texto sobre color-bg-card. |
| `color-text-on-brand` | `blue-900` · #0e1a33 | = | `--gm-on` | Texto sobre lilás e cartões claros. |
| `color-text-on-band` | `white` · #ffffff | = | — | Texto sobre a faixa marinho e o bolso. |
| `color-text-on-band-muted` | `white-alpha-70` · #ffffff @ 70% | = | — | Texto secundário sobre a faixa. |

### color / action

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-action-primary` | `blue-700` · #1f3b70 | `blue-200` · #a7bff7 | `--gm-primary` | Ação principal, chip selecionado, progresso. |
| `color-action-brand` | `lilac-300` · #cdbdf4 | = | `--gm-lilac` | Botão + do dock, Pergunte ao Gamora, Adicionar (desktop). |

### color / border

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-border-default` | `gray-200` · #e3e7f0 | `slate-750` · #202e48 | `--gm-border` | Divisórias. |
| `color-border-control` | `gray-250` · #dfe4ee | `slate-700` · #26344f | `--gm-track` | Borda de campos; trilho de progresso. |
| `color-border-focus` | `blue-500` · #2e64d4 | `blue-300` · #93b2ff | — | Anel de foco e campo ativo. |
| `color-border-glass` | `white-alpha-28` · #ffffff @ 28% | = | — | Borda do vidro. |
| `color-border-stitch` | `white-alpha-35` · #ffffff @ 35% | = | — | Costura tracejada do bolso. |

### color / brand

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-brand-lilac` | `lilac-300` · #cdbdf4 | = | — | Cor da marca. |
| `color-brand-lilac-strong` | `lilac-600` · #9f86e8 | `lilac-500` · #b29cf0 | `--gm-lilac-strong` | Assinaturas, limite atingido, 3ª série. |

### color / glass

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-glass-fill-start` | `white-alpha-20` · #ffffff @ 20% | = | — | Vidro: topo. |
| `color-glass-fill-end` | `white-alpha-8` · #ffffff @ 8% | = | — | Vidro: base. |
| `color-glass-highlight` | `white-alpha-70` · #ffffff @ 70% | = | — | Reflexo de 1px na borda de cima do bolso. |

### color / card

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-card-lilac-start` | `lilac-400` · #b9a2f1 | = | — | Cartão lilás (gradiente 128°). |
| `color-card-lilac-end` | `lilac-100` · #e4d9fb | = | — | Cartão lilás, fim. |
| `color-card-periwinkle-start` | `blue-250` · #a9bdf3 | = | — | Cartão lavanda. |
| `color-card-periwinkle-end` | `blue-100` · #dbe4fb | = | — | Cartão lavanda, fim. |
| `color-card-silver-start` | `gray-250` · #dfe4ee | = | — | Cartão prata. |
| `color-card-silver-end` | `gray-25` · #f7f8fb | = | — | Cartão prata, fim. |
| `color-hero-start` | `lilac-400` · #b9a2f1 | = | — | Bolha do assistente/avatar: início. |
| `color-hero-middle` | `lilac-200` · #d6c8f8 | = | — | Meio. |
| `color-hero-end` | `lilac-50` · #f1ebfd | = | — | Fim. |

### color / chart

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `color-chart-1` | `blue-700` · #1f3b70 | `blue-200` · #a7bff7 | — | 1ª série. |
| `color-chart-2` | `blue-500` · #2e64d4 | `blue-300` · #93b2ff | — | 2ª série. |
| `color-chart-3` | `lilac-600` · #9f86e8 | `lilac-500` · #b29cf0 | — | 3ª série. |
| `color-chart-rest` | `gray-250` · #dfe4ee | `slate-700` · #26344f | — | Restante. |

### typography

| Token | Light | Dark | CSS | Uso |
|---|---|---|---|---|
| `font-family-body` | `font-family-satoshi` · Satoshi | = | — | Toda a interface (fallback Manrope). |
| `font-family-body-fallback` | `font-family-manrope` · Manrope | = | — | Quando a Satoshi não carrega. |
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
| `font-weight-wordmark` | `font-weight-900` · 900 (Black) | = | — | Palavra gamora. |
| `font-weight-code` | `font-weight-400` · 400 (Regular) | = | — | Mono. |
| `line-height-body` | `line-height-22` · 22px | = | — | Corpo 15px. |
| `line-height-caption` | `line-height-16` · 16px | = | — | Legenda e kicker. |
| `line-height-section` | `line-height-24` · 24px | = | — | Seção 18px. |
| `letter-spacing-number` | `letter-spacing-neg-45` · -4.5% | = | — | Números (saldo, valores). |
| `letter-spacing-title` | `letter-spacing-neg-35` · -3.5% | = | — | Títulos de tela. |
| `letter-spacing-wordmark` | `letter-spacing-neg-40` · -4% | = | — | Palavra gamora. |
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
| `shadow-surface` | `shadow-soft-light` · 0 10px 30px 0 · #162854 @ 7% | `shadow-soft-dark` · 0 10px 30px 0 · #000000 @ 35% | — | Todo card sobre a página. |
| `shadow-floating` | `shadow-dock` · 0 18px 44px 0 · #0e1a33 @ 45% | = | — | Dock e toast. |
| `shadow-pocket` | `shadow-pocket` · 0 22px 44px 0 · #0e1a33 @ 35% | = | — | Bolso sólido. |

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
| Cor (base, gray, slate, blue, lilac) | 42 |
| Cor com transparência | 28 |
| Fonte (família, tamanho, peso, altura de linha, espaçamento) | 58 |
| Espaço positivo / negativo | 26 / 14 |
| Raio | 13 |
| Stroke | 9 |
| Tamanho | 26 |
| Opacidade / Blur / Sombra | 22 / 7 / 5 |
| Duração / Easing / Z-index / Breakpoint | 8 / 3 / 7 / 4 |

**No Figma:** sombras viram *Effect styles* (`shadow/*`), porque variáveis do Figma não guardam sombra. Easing e família de fonte são variáveis de texto (STRING); o resto é número (FLOAT) ou cor (COLOR). Letter-spacing está em %.

**Conferência com o código:** ✅ todos os 22 tokens semânticos com variável CSS batem com `src/styles/index.css` nos dois temas.
