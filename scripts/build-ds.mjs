#!/usr/bin/env node
/**
 * Gera o site estático do Design System Gamora a partir dos tokens do repositório.
 *
 *   node scripts/build-ds.mjs [pasta-de-saída]     (padrão: dist/design-system)
 *
 * Fonte: tokens/primitives.json e tokens/semantic.json (gerados por `npm run tokens`
 * a partir de tokens/source.mjs) + design-system/assets (logos).
 * Saída: index.html (página única, sem dependências) + downloads/ (tokens, Figma, logos).
 * Publicado na Vercel em /design-system/ (ver vercel.json e o script build:vercel).
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs'
import { join, dirname, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolvePath(root, process.argv[2] || 'dist/design-system')
const P = JSON.parse(readFileSync(join(root, 'tokens/primitives.json'), 'utf8'))
const S = JSON.parse(readFileSync(join(root, 'tokens/semantic.json'), 'utf8'))

/* ── resolver de tokens ───────────────────────────────────────────── */
const isRef = (v) => typeof v === 'string' && /^\{[^}]+\}$/.test(v)
const lookup = (path) => path.split('.').reduce((o, k) => o?.[k], P)
function resolve(v, depth = 0) {
  if (depth > 10) throw new Error('alias em loop')
  if (isRef(v)) {
    const t = lookup(v.slice(1, -1))
    if (!t) throw new Error(`alias quebrado: ${v}`)
    return resolve(t.$value, depth + 1)
  }
  return v
}
function css(v) {
  v = resolve(v)
  if (v && typeof v === 'object' && 'unit' in v) return `${v.value}${v.unit}`
  if (v && typeof v === 'object' && 'offsetY' in v) {
    const list = Array.isArray(v) ? v : [v]
    return list.map((s) => `${s.inset ? 'inset ' : ''}${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${css(s.color)}`).join(', ')
  }
  if (Array.isArray(v) && typeof v[0] === 'object') return v.map((s) => `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${css(s.color)}`).join(', ')
  if (Array.isArray(v) && v.length === 4 && typeof v[0] === 'number') return `cubic-bezier(${v.join(', ')})`
  return String(v)
}
const tokens = (group) => Object.entries(group).filter(([k]) => !k.startsWith('$'))
const leaves = (group) => tokens(group).filter(([, t]) => t && '$value' in t)
/** semântico → { name, desc, css, light, dark, alias } */
function sem(name, t) {
  const modes = t.$extensions?.['app.gamora']?.modes ?? {}
  return {
    name,
    desc: t.$description ?? '',
    cssVar: t.$extensions?.['app.gamora']?.css ?? null,
    alias: isRef(t.$value) ? t.$value.slice(1, -1).split('.').pop() : '',
    light: css(modes.light ?? t.$value),
    dark: css(modes.dark ?? t.$value),
    aliasDark: isRef(modes.dark) ? modes.dark.slice(1, -1).split('.').pop() : '',
  }
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const label = (k) => k.replace(/-/g, ' ')

/* ── dados ───────────────────────────────────────────────────────── */
const semColor = Object.fromEntries(tokens(S.color).map(([g, grp]) => [g, leaves(grp).map(([n, t]) => sem(n, t))]))
const allSemColors = Object.values(semColor).flat()
// variáveis de tema da própria página (claro/escuro), vindas dos tokens
const themeVars = (mode) => allSemColors.filter((c) => c.cssVar).map((c) => `${c.cssVar}:${mode === 'dark' ? c.dark : c.light};`).join('')
const counts = {
  primitives: Object.values(P).reduce((a, g) => a + JSON.stringify(g).split('"$value"').length - 1, 0),
  semantic: Object.values(S).reduce((a, g) => a + JSON.stringify(g).split('"$value"').length - 1, 0),
}

const GROUP_NAMES = {
  background: 'Fundos', band: 'Faixa roxa (topo)', text: 'Texto', action: 'Ação', border: 'Bordas',
  brand: 'Marca', glass: 'Vidro', card: 'Cartões', chart: 'Gráficos',
}
const FAMILY_NAMES = { base: 'Base', neutral: 'Neutros (lavanda)', ink: 'Ink (azul-noite)', violet: 'Violeta (marca)', teal: 'Verde-água (acento)', blue: 'Azul', alpha: 'Transparências' }

/* ── seções ──────────────────────────────────────────────────────── */
const swatch = (bg, extra = '') => `<span class="sw" style="background:${bg}${extra}"></span>`

function semanticColors() {
  return tokens(semColor).map(([g, list]) => `
    <h3>${GROUP_NAMES[g] ?? label(g)}</h3>
    <div class="table" role="table">
      <div class="tr th" role="row"><span>Token</span><span>Claro</span><span>Escuro</span><span>Uso</span></div>
      ${list.map((c) => `
      <div class="tr" role="row">
        <span><code class="tok">${c.name}</code>${c.cssVar ? `<code class="var">var(${c.cssVar})</code>` : ''}</span>
        <span class="val">${swatch(c.light)}<span><code>${esc(c.light)}</code><small>${c.alias}</small></span></span>
        <span class="val">${swatch(c.dark)}<span><code>${esc(c.dark)}</code><small>${c.aliasDark}</small></span></span>
        <span class="desc">${esc(c.desc)}</span>
      </div>`).join('')}
    </div>`).join('')
}

function primitiveColors() {
  return tokens(P.color).map(([fam, grp]) => `
    <h3>${FAMILY_NAMES[fam] ?? label(fam)}</h3>
    <div class="swatches ${fam === 'alpha' ? 'alpha' : ''}">
      ${leaves(grp).map(([n, t]) => `<figure>${swatch(css(t.$value))}<figcaption><b>${n}</b><code>${css(t.$value)}</code></figcaption></figure>`).join('')}
    </div>`).join('')
}

function typography() {
  const fam = leaves(P.font.family).map(([n, t]) => `<div class="fam" style="font-family:'${t.$value}'"><span class="big">Aa</span><span><b>${t.$value}</b><code>${n}</code></span></div>`).join('')
  const sizes = leaves(S.typography).filter(([n]) => n.startsWith('font-size')).map(([n, t]) => {
    const s = sem(n, t)
    const mono = n.includes('kicker') || n.includes('code')
    return `<div class="tr type"><span><code class="tok">${n}</code><small>${s.light} · ${s.alias}</small></span><span class="sample" style="font-size:${s.light};${mono ? "font-family:'IBM Plex Mono'" : ''}">${n.includes('balance') || n.includes('figure') || n.includes('display') ? 'R$ 14.500' : 'Suas finanças, em família.'}</span><span class="desc">${esc(s.desc)}</span></div>`
  }).join('')
  const other = leaves(S.typography).filter(([n]) => !n.startsWith('font-size') && !n.startsWith('font-family')).map(([n, t]) => { const s = sem(n, t); return `<div class="chip"><code>${n}</code><b>${esc(s.light)}</b><small>${esc(s.desc)}</small></div>` }).join('')
  const weights = leaves(P.font.weight).map(([n, t]) => `<span style="font-weight:${css(t.$value)}">${css(t.$value)} · Gamora</span>`).join('')
  return `<div class="fams">${fam}</div>
    <h3>Escala semântica</h3><div class="table">${sizes}</div>
    <h3>Pesos</h3><div class="weights">${weights}</div>
    ${other ? `<h3>Altura de linha e espaçamento</h3><div class="chips">${other}</div>` : ''}`
}

const dimRows = (group, draw) => leaves(group).map(([n, t]) => {
  const s = sem(n, t)
  return `<div class="tr dim"><span><code class="tok">${n}</code><small>${s.alias}</small></span><span class="viz">${draw(s.light)}</span><span class="v"><b>${esc(s.light)}</b></span><span class="desc">${esc(s.desc)}</span></div>`
}).join('')

const section = (id, title, intro, body) => `<section id="${id}"><h2>${title}</h2>${intro ? `<p class="intro">${intro}</p>` : ''}${body}</section>`

const downloads = [
  ['tokens/primitives.json', 'Tokens primitivos', 'W3C Design Tokens (DTCG)'],
  ['tokens/semantic.json', 'Tokens semânticos', 'Aliases com modos claro e escuro'],
  ['tokens/figma-variables.json', 'Variáveis do Figma', 'Coleções Primitivos e Semânticos + estilos de sombra'],
  ['TOKENS.md', 'Documentação dos tokens', 'Markdown gerado'],
  ['logos/gamora-mark.svg', 'Símbolo G', 'SVG em gradiente'],
  ['logos/gamora-app-icon.svg', 'Ícone do app', 'SVG, fundo #0B1230'],
]

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gamora · Design System</title>
<meta name="description" content="Design System do Gamora: marca, cores, tipografia, espaçamento e tokens." />
<link rel="icon" href="downloads/logos/gamora-app-icon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<script>(function(){var t=null;try{t=localStorage.getItem('gamora:theme')}catch(e){}document.documentElement.dataset.theme=t==='dark'?'dark':'light'})()</script>
<style>
:root{${themeVars('light')}color-scheme:light}
:root[data-theme="dark"]{${themeVars('dark')}color-scheme:dark}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:88px}
body{margin:0;background:var(--gm-bg);color:var(--gm-text);font:500 15px/1.55 Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
code{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:12.5px}
a{color:var(--gm-accent)}
.top{position:sticky;top:0;z-index:10;background:linear-gradient(90deg,var(--gm-band-from),var(--gm-band-to));color:#fff}
.top .in{max-width:1240px;margin:auto;display:flex;align-items:center;gap:16px;padding:14px 20px}
.brand{flex:none;display:flex;align-items:center;gap:10px;font-weight:800;font-size:20px;letter-spacing:-.02em;color:#fff;text-decoration:none}
.brand img{width:34px;height:34px}
.brand small{font-weight:500;font-size:12px;opacity:.7;font-family:'IBM Plex Mono';letter-spacing:.08em;text-transform:uppercase}
nav.links{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
nav.links a,.btn{white-space:nowrap;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);cursor:pointer;font-family:inherit}
nav.links a:hover,.btn:hover{background:rgba(255,255,255,.2)}
.layout{max-width:1240px;margin:auto;display:grid;grid-template-columns:200px minmax(0,1fr);gap:40px;padding:32px 20px 80px}
aside{position:sticky;top:96px;align-self:start}
aside a{display:block;padding:7px 12px;border-radius:12px;color:var(--gm-text-2);text-decoration:none;font-weight:600;font-size:14px}
aside a:hover{background:var(--gm-row)}
section{margin-bottom:64px}
h1{font-size:clamp(40px,6vw,64px);line-height:1;letter-spacing:-.045em;font-weight:800;margin:0}
h2{font-size:30px;letter-spacing:-.03em;margin:0 0 8px;font-weight:800}
h3{font-size:16px;margin:32px 0 12px;font-weight:800}
.kicker{font-family:'IBM Plex Mono';text-transform:uppercase;letter-spacing:.12em;font-size:12px;color:var(--gm-muted)}
.intro{color:var(--gm-secondary);max-width:720px;margin:0 0 20px}
.hero{border-radius:34px;padding:40px;color:#fff;background:linear-gradient(135deg,#1a1150,#3a2a8f);position:relative;overflow:hidden;margin-bottom:56px}
.hero p{max-width:560px;color:rgba(255,255,255,.82);font-size:17px}
.hero .stats{display:flex;gap:28px;flex-wrap:wrap;margin-top:24px}
.hero .stats b{display:block;font-size:30px;letter-spacing:-.03em}
.hero .stats span{font-size:13px;opacity:.75}
.hero .glow{position:absolute;right:-120px;bottom:-140px;width:420px;height:420px;border-radius:50%;background:linear-gradient(135deg,#7b5cff,#00c2a8);opacity:.3;filter:blur(60px)}
.card{background:var(--gm-surface);border-radius:26px;padding:24px;box-shadow:0 10px 30px rgba(11,18,48,.07)}
:root[data-theme="dark"] .card{box-shadow:none;border:1px solid var(--gm-border)}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.brandc{border-radius:26px;padding:20px;min-height:140px;border:1px solid var(--gm-border);display:flex;flex-direction:column;justify-content:flex-end;font-weight:700}
.brandc code{opacity:.75}
.grad{height:110px;border-radius:26px;display:flex;align-items:flex-end;padding:14px;color:#fff;font-weight:700;font-size:13px}
.logos{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.logo{display:grid;place-items:center;gap:12px;padding:28px;border-radius:26px;background:var(--gm-surface);text-align:center}
.logo img{height:72px}
.wordmark{display:flex;align-items:center;gap:12px;font-size:34px;font-weight:800;letter-spacing:-.03em}
.table{background:var(--gm-surface);border-radius:22px;overflow:hidden;border:1px solid var(--gm-border)}
.tr{display:grid;grid-template-columns:minmax(180px,1.2fr) 1fr 1fr 1.4fr;gap:14px;padding:12px 18px;border-top:1px solid var(--gm-border);align-items:center}
.tr:first-child{border-top:0}
.th{font-size:12px;font-family:'IBM Plex Mono';text-transform:uppercase;letter-spacing:.08em;color:var(--gm-muted);background:var(--gm-elevated)}
.tr.type{grid-template-columns:minmax(200px,1fr) 2fr 1.2fr}
.tr.dim{grid-template-columns:minmax(200px,1fr) 1.4fr 80px 1.4fr}
.tr.dim .v b{font-family:'IBM Plex Mono';font-size:11.5px;font-weight:500;word-break:break-word}
.tok{display:block;font-weight:500;color:var(--gm-text)}
.var{display:block;color:var(--gm-muted);font-size:11.5px}
.tr small,.chip small,figcaption small{display:block;color:var(--gm-muted);font-size:12px}
.val{display:flex;align-items:center;gap:10px;min-width:0}
.val code{display:block;overflow:hidden;text-overflow:ellipsis}
.desc{color:var(--gm-secondary);font-size:13.5px}
.sw{flex:none;width:40px;height:40px;border-radius:12px;border:1px solid rgba(127,127,160,.25);background-image:linear-gradient(45deg,rgba(127,127,160,.15) 25%,transparent 25%,transparent 75%,rgba(127,127,160,.15) 75%),linear-gradient(45deg,rgba(127,127,160,.15) 25%,transparent 25%,transparent 75%,rgba(127,127,160,.15) 75%);background-size:10px 10px;background-position:0 0,5px 5px}
.val .sw,.swatches .sw{background-blend-mode:normal}
.swatches{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
.swatches figure{margin:0;background:var(--gm-surface);border-radius:18px;padding:10px;border:1px solid var(--gm-border)}
.swatches .sw{width:100%;height:64px;border-radius:12px}
figcaption{margin-top:8px;font-size:12.5px}
figcaption b{display:block;font-weight:700}
figcaption code{color:var(--gm-muted);font-size:11.5px}
.fams{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.fam{display:flex;align-items:center;gap:18px;background:var(--gm-surface);border-radius:22px;padding:20px;border:1px solid var(--gm-border)}
.fam .big{font-size:56px;font-weight:700;line-height:1}
.fam b{display:block;font-size:18px}
.sample{font-weight:700;letter-spacing:-.02em;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.weights{display:flex;flex-wrap:wrap;gap:10px 28px;font-size:22px}
.chips{display:flex;flex-wrap:wrap;gap:10px}
.chip{background:var(--gm-surface);border:1px solid var(--gm-border);border-radius:16px;padding:10px 14px}
.chip b{display:block}
.bar{height:14px;border-radius:7px;background:linear-gradient(90deg,#7b5cff,#00c2a8)}
.rad{width:64px;height:48px;background:var(--gm-row);border:2px solid var(--gm-lilac-strong)}
.shadow{height:56px;width:100%;max-width:160px;border-radius:18px;background:var(--gm-surface)}
.motion{width:30px;height:30px;border-radius:10px;background:var(--gm-lilac-strong)}
.tr.dim:hover .motion{transform:translateX(120px)}
.tone{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.tone div{background:var(--gm-surface);border-radius:22px;padding:18px;border:1px solid var(--gm-border)}
.tone b{display:block;margin-bottom:4px}
.dl{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.dl a{display:block;text-decoration:none;color:inherit;background:var(--gm-surface);border:1px solid var(--gm-border);border-radius:20px;padding:16px 18px}
.dl a:hover{border-color:var(--gm-accent)}
.dl b{display:block;color:var(--gm-text)}
.dl small{color:var(--gm-muted)}
footer{color:var(--gm-muted);font-size:13px;border-top:1px solid var(--gm-border);padding-top:20px}
@media (max-width:900px){.layout{grid-template-columns:1fr}aside{display:none}.tr,.tr.type,.tr.dim{grid-template-columns:1fr 1fr}.tr .desc{grid-column:1/-1}.th{display:none}.hero{padding:28px}}
@media (max-width:560px){nav.links a.opt,.brand small{display:none}.top .in{gap:10px;padding:12px 16px}nav.links{gap:4px;flex-wrap:nowrap}nav.links a,.btn{padding:7px 11px;font-size:12px}.tr,.tr.type,.tr.dim{grid-template-columns:1fr}}
</style>
</head>
<body>
<header class="top"><div class="in">
  <a class="brand" href="#inicio"><img src="downloads/logos/gamora-app-icon.svg" alt="" />Gamora <small>Design System</small></a>
  <nav class="links" aria-label="Links">
    <a href="../">App</a>
    <a href="../storybook/">Storybook</a>
    <a class="opt" href="#downloads">Downloads</a>
    <button class="btn" id="theme" type="button" aria-label="Trocar tema">Escuro</button>
  </nav>
</div></header>

<div class="layout">
<aside aria-label="Seções">
  <a href="#marca">Marca</a><a href="#cores">Cores semânticas</a><a href="#paleta">Paleta primitiva</a>
  <a href="#tipografia">Tipografia</a><a href="#espaco">Espaçamento</a><a href="#forma">Raios e bordas</a>
  <a href="#efeitos">Sombras e efeitos</a><a href="#movimento">Movimento</a><a href="#layout">Camadas e layout</a>
  <a href="#tom">Conteúdo e tom</a><a href="#downloads">Downloads</a>
</aside>
<main>
  <div class="hero" id="inicio">
    <span class="glow"></span>
    <p class="kicker" style="color:rgba(255,255,255,.65)">Design System</p>
    <h1>Suas finanças, em família.</h1>
    <p>Gamora organiza saldo, cartões, gastos e metas da família num só lugar. Esta página é gerada dos mesmos tokens que o app usa (<code>tokens/source.mjs</code>), então está sempre igual ao produto.</p>
    <div class="stats"><div><b>${counts.primitives}</b><span>tokens primitivos</span></div><div><b>${counts.semantic}</b><span>tokens semânticos</span></div><div><b>2</b><span>temas: claro (padrão) e escuro</span></div></div>
  </div>

  ${section('marca', 'Marca', 'Paleta da peça de identidade, gradientes e símbolo.', `
    <div class="grid">
      ${[['Primária', '#0B1230', '#fff', 'texto, botão principal'], ['Secundária', '#7B5CFF', '#fff', 'violeta: preenchimento (texto usa #5B3FE0)'], ['Acento', '#00C2A8', '#0B1230', 'verde-água: progresso, 2ª série'], ['Superfície', '#EDE9FF', '#0B1230', 'ícones, chips, botões secundários'], ['Fundo', '#F8F9FF', '#0B1230', 'fundo da página']]
        .map(([n, hex, fg, use]) => `<div class="brandc" style="background:${hex};color:${fg}"><span>${n}</span><code>${hex}</code><small style="opacity:.75;font-weight:500">${use}</small></div>`).join('')}
    </div>
    <h3>Gradientes</h3>
    <div class="grid">
      <div class="grad" style="background:linear-gradient(135deg,#7B5CFF,#5B8BFF,#00C2A8)">Logo</div>
      <div class="grad" style="background:radial-gradient(120% 120% at 100% 0%,#8F74FF,#5B3FE0 45%,#2B1F7A)">Cartão Gamora</div>
      <div class="grad" style="background:linear-gradient(135deg,#00C2A8,#7BE3D4);color:#0B1230">Cartão verde-água</div>
      <div class="grad" style="background:linear-gradient(135deg,#EDE9FF,#FFFFFF);color:#0B1230;border:1px solid #e6e2f7">Cartão lavanda</div>
      <div class="grad" style="background:linear-gradient(180deg,#2C2378,#18124A 60%,#0B0D2A)">Bolso da carteira</div>
      <div class="grad" style="background:linear-gradient(180deg,#1A1150,#3A2A8F)">Faixa do topo</div>
    </div>
    <h3>Símbolo</h3>
    <div class="logos">
      <div class="logo"><img src="downloads/logos/gamora-mark.svg" alt="Símbolo G" /><small>Símbolo G · traço único em gradiente</small></div>
      <div class="logo"><img src="downloads/logos/gamora-app-icon.svg" alt="Ícone do app" /><small>Ícone do app · G sobre #0B1230</small></div>
      <div class="logo"><span class="wordmark"><img src="downloads/logos/gamora-mark.svg" alt="" style="height:40px" />Gamora</span><small>Assinatura · Manrope 800</small></div>
    </div>`)}

  ${section('cores', 'Cores semânticas', 'Use sempre estes nomes no código (variáveis <code>--gm-*</code>), nunca o hex direto. Cada um aponta para um primitivo e muda com o tema.', semanticColors())}
  ${section('paleta', 'Paleta primitiva', 'Valores crus, sem significado. Servem de base para os semânticos.', primitiveColors())}
  ${section('tipografia', 'Tipografia', 'Manrope em tudo; IBM Plex Mono só nos kickers e no número do cartão. Números com tracking negativo e algarismos tabulares.', typography())}
  ${section('espaco', 'Espaçamento', 'Margem lateral 20px no celular e 32px a partir de 800px.', `<div class="table">${dimRows(S.spacing, (v) => `<span class="bar" style="display:block;width:min(100%,${parseFloat(v) * 3}px)"></span>`)}</div>`)}
  ${section('forma', 'Raios, bordas e tamanhos', '', `
    <h3>Raios</h3><div class="table">${dimRows(S.radius, (v) => `<span class="rad" style="display:block;border-radius:${v}"></span>`)}</div>
    <h3>Bordas</h3><div class="table">${dimRows(S.stroke, (v) => `<span style="display:block;width:100px;border-top:${v} solid var(--gm-text)"></span>`)}</div>
    <h3>Tamanhos</h3><div class="table">${dimRows(S.size, (v) => `<span style="display:block;width:${v};height:${v};max-width:100%;border-radius:999px;background:var(--gm-row);border:1px solid var(--gm-lilac-strong)"></span>`)}</div>`)}
  ${section('efeitos', 'Sombras e efeitos', 'Cards sobre a página sempre com <code>shadow-surface</code>. No tema escuro, sombras quase somem.', `<div class="table">${dimRows(S.effect, (v) => (v.includes('px ') ? `<span class="shadow" style="display:block;box-shadow:${v}"></span>` : /^\d+$/.test(v) ? `<span style="display:block;width:64px;height:28px;border-radius:10px;background:var(--gm-lilac-strong);opacity:${Number(v) / 100}"></span>` : ''))}</div>`)}
  ${section('movimento', 'Movimento', 'Passe o mouse numa linha para ver a curva.', `<div class="table">${dimRows(S.motion, (v) => `<span class="motion" style="display:block;transition:transform ${v.includes('ms') ? v : '500ms'} ${v.includes('cubic') ? v : 'ease'}"></span>`)}</div>`)}
  ${section('layout', 'Camadas e layout', '', `<div class="table">${dimRows(S.layer, () => '')}${dimRows(S.layout, () => '')}</div>`)}

  ${section('tom', 'Conteúdo e tom', 'Próximo, claro, em português do Brasil, para a família.', `
    <div class="tone">
      <div><b>Número primeiro</b>“Delivery: R$ 480. Reduzindo R$ 120/mês, a viagem chega 3 meses antes.”</div>
      <div><b>Segunda pessoa, frases curtas</b>“Seu saldo”, “Ainda pode gastar”, “Olá, Pablo”.</div>
      <div><b>Sem coach de dinheiro</b>Nada de “fique rico”, sem julgamento, sem exclamação, sem emoji.</div>
      <div><b>Valor negativo só com o sinal</b><code>−R$ 412,80</code>, nunca em vermelho.</div>
      <div><b>Caixa de frase</b>Em títulos e botões. Kickers em mono maiúsculo: <code>ESTE MÊS · NOVEMBRO</code>.</div>
      <div><b>Uma ação principal por tela</b>Botão <code>primary</code> (#0B1230, texto branco).</div>
    </div>`)}

  ${section('downloads', 'Downloads', 'Os mesmos arquivos que estão no repositório, gerados por <code>npm run tokens</code>.', `
    <div class="dl">${downloads.map(([f, t, d]) => `<a href="downloads/${f}" download><b>${t}</b><small>${d} · <code>${f.split('/').pop()}</code></small></a>`).join('')}</div>`)}

  <footer>Gerado em ${new Date().toISOString().slice(0, 10)} a partir de <code>tokens/</code> · <a href="../storybook/">Componentes no Storybook</a> · <a href="../">Abrir o app</a></footer>
</main>
</div>
<script>
(function(){
  var b=document.getElementById('theme'),r=document.documentElement;
  function label(){b.textContent=r.dataset.theme==='dark'?'Claro':'Escuro'}
  label();
  b.addEventListener('click',function(){r.dataset.theme=r.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('gamora:theme',r.dataset.theme)}catch(e){}label()});
})();
</script>
</body>
</html>
`

/* ── escrita ─────────────────────────────────────────────────────── */
mkdirSync(join(out, 'downloads/tokens'), { recursive: true })
mkdirSync(join(out, 'downloads/logos'), { recursive: true })
writeFileSync(join(out, 'index.html'), html)
for (const f of ['primitives.json', 'semantic.json', 'figma-variables.json']) copyFileSync(join(root, 'tokens', f), join(out, 'downloads/tokens', f))
copyFileSync(join(root, 'docs/TOKENS.md'), join(out, 'downloads/TOKENS.md'))
for (const f of readdirSync(join(root, 'design-system/assets'))) copyFileSync(join(root, 'design-system/assets', f), join(out, 'downloads/logos', f))
console.log(`Design System → ${out} (${counts.primitives} primitivos · ${counts.semantic} semânticos)`)
