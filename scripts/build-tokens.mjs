// Gera os artefatos de tokens a partir de tokens/source.mjs e confere contra o CSS do app.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { primitives, semantic } from '../tokens/source.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = (p, s) => { mkdirSync(dirname(resolve(root, p)), { recursive: true }); writeFileSync(resolve(root, p), s) }

/* ---------- utilidades ---------- */
const isToken = (o) => o && typeof o === 'object' && 'type' in o && 'value' in o
const isSem = (o) => o && typeof o === 'object' && 'ref' in o

function flatten(tree, test, path = []) {
  const list = []
  for (const [k, v] of Object.entries(tree)) {
    if (test(v)) list.push({ path: [...path, k], name: k, token: v })
    else list.push(...flatten(v, test, [...path, k]))
  }
  return list
}
const prim = flatten(primitives, isToken)
const sem = flatten(semantic, isSem)
const primByPath = new Map(prim.map((p) => [p.path.join('.'), p]))

const hex2 = (a) => Math.round(a * 255).toString(16).padStart(2, '0')
function display(t) {
  switch (t.type) {
    case 'color': return t.alpha != null ? `${t.value} @ ${Math.round(t.alpha * 100)}%` : t.value
    case 'dimension': return `${t.value}${t.unit}`
    case 'duration': return `${t.value}ms`
    case 'cubicBezier': return `cubic-bezier(${t.value.join(', ')})`
    case 'fontWeight': return `${t.value} (${t.label})`
    case 'shadow': { const v = t.value; return `${v.x} ${v.y}px ${v.blur}px ${v.spread} · ${display(primByPath.get(v.color).token)}` }
    default: return String(t.value)
  }
}
const cssValue = (t) => t.type === 'color' ? (t.alpha != null ? `${t.value}${hex2(t.alpha)}` : t.value) : display(t)
const resolveRef = (ref) => {
  const p = primByPath.get(ref)
  if (!p) throw new Error(`Alias quebrado: ${ref}`)
  return p
}

/* ---------- checagem contra src/styles/index.css ---------- */
const css = readFileSync(resolve(root, 'src/styles/index.css'), 'utf8')
const block = (sel) => {
  const i = css.indexOf(sel); if (i < 0) return ''
  const s = css.indexOf('{', i); let depth = 0
  for (let j = s; j < css.length; j++) { if (css[j] === '{') depth++; if (css[j] === '}' && --depth === 0) return css.slice(s, j) }
  return ''
}
const readVars = (b) => Object.fromEntries([...b.matchAll(/(--gm-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().toLowerCase()]))
const lightVars = readVars(block('/* ── Tema claro'))
const darkVars = { ...lightVars, ...readVars(block(':root[data-theme="dark"]')) }
const problems = []
for (const s of sem) {
  if (!s.token.css) continue
  for (const [mode, vars] of [['light', lightVars], ['dark', darkVars]]) {
    const want = vars[s.token.css]
    const got = resolveRef(s.token.ref[mode]).token.value.toLowerCase()
    if (!want) problems.push(`${s.name}: ${s.token.css} não existe no CSS (${mode})`)
    else if (want !== got) problems.push(`${s.name} (${mode}): token ${got} ≠ CSS ${want}`)
  }
}

/* ---------- DTCG (W3C) ---------- */
function setDeep(obj, path, val) { let o = obj; path.slice(0, -1).forEach((k) => (o = o[k] ??= {})); o[path.at(-1)] = val }
const dtcgPrim = {}
for (const p of prim) {
  const t = p.token
  let $value = t.value
  if (t.type === 'color' && t.alpha != null) $value = `${t.value}${hex2(t.alpha)}`
  if (t.type === 'dimension') $value = { value: t.value, unit: t.unit }
  if (t.type === 'duration') $value = { value: t.value, unit: 'ms' }
  if (t.type === 'shadow') $value = { offsetX: `${t.value.x}px`, offsetY: `${t.value.y}px`, blur: `${t.value.blur}px`, spread: `${t.value.spread}px`, color: `{${t.value.color}}` }
  setDeep(dtcgPrim, p.path, { $type: t.type === 'number' ? 'number' : t.type, $value })
}
const dtcgSem = {}
for (const s of sem) {
  const { light, dark } = s.token.ref
  setDeep(dtcgSem, s.path, {
    $value: `{${light}}`,
    $description: s.token.usage,
    $extensions: { 'app.gamora': { modes: { light: `{${light}}`, dark: `{${dark}}` }, css: s.token.css ?? null } },
  })
}

/* ---------- Figma (coleções Primitives / Semantic) ---------- */
const figmaType = (t) => (t.type === 'color' ? 'COLOR' : ['fontFamily', 'cubicBezier'].includes(t.type) ? 'STRING' : 'FLOAT')
const figmaValue = (t) => {
  if (t.type === 'color') {
    const h = t.value.replace('#', '')
    return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255, a: t.alpha ?? 1 }
  }
  if (t.type === 'cubicBezier') return `cubic-bezier(${t.value.join(', ')})`
  return t.value
}
const figmaName = (path) => path.join('/')
const figma = {
  collections: [
    {
      name: 'Primitives', modes: ['Value'],
      variables: prim.filter((p) => p.token.type !== 'shadow').map((p) => ({
        name: figmaName(p.path), type: figmaType(p.token), values: { Value: figmaValue(p.token) },
        description: display(p.token),
      })),
    },
    {
      name: 'Semantic', modes: ['Light', 'Dark'],
      variables: sem.filter((s) => resolveRef(s.token.ref.light).token.type !== 'shadow').map((s) => ({
        name: figmaName(s.path), type: figmaType(resolveRef(s.token.ref.light).token),
        aliases: { Light: figmaName(resolveRef(s.token.ref.light).path), Dark: figmaName(resolveRef(s.token.ref.dark).path) },
        description: s.token.usage,
      })),
    },
  ],
  effectStyles: prim.filter((p) => p.token.type === 'shadow').map((p) => ({
    name: `shadow/${p.name}`, ...p.token.value, color: figmaValue(primByPath.get(p.token.value.color).token),
  })),
}

/* ---------- Markdown ---------- */
const count = (pred) => prim.filter(pred).length
let md = `# Gamora — Design tokens

> Gerado por \`npm run tokens\` a partir de \`tokens/source.mjs\`. Não edite à mão.
> Formato de troca: \`tokens/primitives.json\` e \`tokens/semantic.json\` (W3C Design Tokens) · \`tokens/figma-variables.json\` (coleções do Figma).

## Como está organizado

| Camada | O que é | Modos | Quantidade |
|---|---|---|---|
| **Primitivos** | Valores crus, sem significado. Nunca usados direto nos componentes. | um (\`Value\`) | ${prim.length} |
| **Semânticos** | Aliases em kebab-case que dizem *para que* serve. Componentes usam só estes. | \`Light\` · \`Dark\` | ${sem.length} |

**Nomenclatura (kebab-case):** \`{categoria}-{papel}-{variante}\` → \`color-bg-surface\`, \`color-text-on-brand\`, \`space-inset-card\`, \`radius-wallet-card\`.
No Figma o caminho vira grupo: \`color/background/color-bg-surface\`.

**Regra:** componente → semântico → primitivo. Mudou a marca? Troca-se o alias, não o componente.

`

md += `## Primitivos\n\n`
const primGroups = new Map()
for (const p of prim) { const g = p.path.slice(0, -1).join(' / '); if (!primGroups.has(g)) primGroups.set(g, []); primGroups.get(g).push(p) }
for (const [g, list] of primGroups) {
  md += `### ${g}\n\n| Token | Valor | Figma |\n|---|---|---|\n`
  for (const p of list) md += `| \`${p.name}\` | ${p.token.type === 'color' ? `![](https://placehold.co/12x12/${p.token.value.slice(1)}/${p.token.value.slice(1)}.png) ` : ''}\`${display(p.token)}\` | \`${figmaName(p.path)}\` |\n`
  md += '\n'
}
md = md.replace(/!\[\]\(https:\/\/placehold\.co[^)]*\) /g, '') // sem imagens externas

md += `## Semânticos\n\nCada linha: alias → primitivo → valor resolvido, nos dois temas. A coluna **CSS** é a variável usada hoje em \`src/styles/index.css\`.\n\n`
const semGroups = new Map()
for (const s of sem) { const g = s.path.slice(0, -1).join(' / '); if (!semGroups.has(g)) semGroups.set(g, []); semGroups.get(g).push(s) }
for (const [g, list] of semGroups) {
  md += `### ${g}\n\n| Token | Light | Dark | CSS | Uso |\n|---|---|---|---|---|\n`
  for (const s of list) {
    const L = resolveRef(s.token.ref.light), D = resolveRef(s.token.ref.dark)
    const cell = (p) => `\`${p.name}\` · ${display(p.token)}`
    md += `| \`${s.name}\` | ${cell(L)} | ${L === D ? '=' : cell(D)} | ${s.token.css ? `\`${s.token.css}\`` : '—'} | ${s.token.usage} |\n`
  }
  md += '\n'
}
md += `## Resumo por família (primitivos)

| Família | Tokens |
|---|---|
| Cor (base, gray, slate, blue, lilac) | ${count((p) => p.token.type === 'color' && p.token.alpha == null)} |
| Cor com transparência | ${count((p) => p.token.alpha != null)} |
| Fonte (família, tamanho, peso, altura de linha, espaçamento) | ${count((p) => p.path[0] === 'font')} |
| Espaço positivo / negativo | ${count((p) => p.path[1] === 'positive')} / ${count((p) => p.path[1] === 'negative')} |
| Raio | ${count((p) => p.path[0] === 'radius')} |
| Stroke | ${count((p) => p.path[0] === 'stroke')} |
| Tamanho | ${count((p) => p.path[0] === 'size')} |
| Opacidade / Blur / Sombra | ${count((p) => p.path[0] === 'opacity')} / ${count((p) => p.path[0] === 'blur')} / ${count((p) => p.path[0] === 'shadow')} |
| Duração / Easing / Z-index / Breakpoint | ${count((p) => p.path[0] === 'duration')} / ${count((p) => p.path[0] === 'easing')} / ${count((p) => p.path[0] === 'z-index')} / ${count((p) => p.path[0] === 'breakpoint')} |

**No Figma:** sombras viram *Effect styles* (\`shadow/*\`), porque variáveis do Figma não guardam sombra. Easing e família de fonte são variáveis de texto (STRING); o resto é número (FLOAT) ou cor (COLOR). Letter-spacing está em %.

**Conferência com o código:** ${problems.length ? `⚠️ ${problems.length} divergência(s) — veja a saída de \`npm run tokens\`.` : `✅ todos os ${sem.filter((s) => s.token.css).length} tokens semânticos com variável CSS batem com \`src/styles/index.css\` nos dois temas.`}
`

out('tokens/primitives.json', JSON.stringify(dtcgPrim, null, 2) + '\n')
out('tokens/semantic.json', JSON.stringify(dtcgSem, null, 2) + '\n')
out('tokens/figma-variables.json', JSON.stringify(figma, null, 2) + '\n')
out('docs/TOKENS.md', md)

console.log(`primitivos: ${prim.length} · semânticos: ${sem.length} · variáveis Figma: ${figma.collections[0].variables.length} + ${figma.collections[1].variables.length} · effect styles: ${figma.effectStyles.length}`)
if (problems.length) { console.error('Divergências com o CSS:\n- ' + problems.join('\n- ')); process.exit(1) }
console.log('OK: tokens semânticos batem com src/styles/index.css')
