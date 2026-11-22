/* eslint-disable @typescript-eslint/no-explicit-any */
import { primitives, semantic } from '../../../tokens/source.mjs'

type Tok = { type: string; value: any; unit?: string; alpha?: number; label?: string }
type Sem = { ref: { light: string; dark: string }; css?: string; usage: string }

const isTok = (o: any) => o && typeof o === 'object' && 'type' in o && 'value' in o
const isSem = (o: any) => o && typeof o === 'object' && 'ref' in o

function flatten<T>(tree: any, test: (o: any) => boolean, path: string[] = []): { path: string[]; name: string; token: T }[] {
  return Object.entries(tree).flatMap(([k, v]) => (test(v) ? [{ path: [...path, k], name: k, token: v as T }] : flatten<T>(v, test, [...path, k])))
}
export const prim = flatten<Tok>(primitives, isTok)
export const sem = flatten<Sem>(semantic, isSem)
const byPath = new Map(prim.map((p) => [p.path.join('.'), p]))
export const resolve = (ref: string) => byPath.get(ref)!

export const cssColor = (t: Tok) => {
  if (t.type !== 'color') return undefined
  if (t.alpha == null) return t.value
  const h = t.value.replace('#', '')
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${t.alpha})`
}
export const show = (t: Tok): string => {
  switch (t.type) {
    case 'color': return t.alpha != null ? `${t.value} · ${Math.round(t.alpha * 100)}%` : t.value
    case 'dimension': return `${t.value}${t.unit}`
    case 'duration': return `${t.value}ms`
    case 'cubicBezier': return `cubic-bezier(${t.value.join(', ')})`
    case 'fontWeight': return `${t.value} · ${t.label}`
    case 'shadow': return `${t.value.x}px ${t.value.y}px ${t.value.blur}px · ${show(resolve(t.value.color).token)}`
    default: return String(t.value)
  }
}
const shadowCss = (t: Tok) => `${t.value.x}px ${t.value.y}px ${t.value.blur}px ${t.value.spread}px ${cssColor(resolve(t.value.color).token)}`

const checker = 'repeating-conic-gradient(var(--gm-track) 0% 25%, transparent 0% 50%) 50% / 12px 12px'

export function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
      {desc && <p className="mt-1 max-w-[680px] text-[14px] text-gm-secondary">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

const Name = ({ children }: { children: React.ReactNode }) => <code className="font-mono text-[12px] text-gm-text">{children}</code>
const Val = ({ children }: { children: React.ReactNode }) => <span className="font-mono text-[12px] text-gm-muted">{children}</span>

/* ---------- Primitivos ---------- */
export function PrimitiveColors() {
  const groups = ['base', 'gray', 'slate', 'blue', 'lilac', 'alpha']
  return (
    <>
      {groups.map((g) => (
        <Section key={g} title={`color / ${g}`} desc={g === 'alpha' ? 'Transparências usadas no vidro, no véu das folhas e nas sombras.' : undefined}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {prim.filter((p) => p.path[0] === 'color' && p.path[1] === g).map((p) => (
              <div key={p.name} className="overflow-hidden rounded-[18px] bg-gm-surface shadow-soft">
                <div className="h-16" style={{ background: p.token.alpha != null ? `linear-gradient(${cssColor(p.token)}, ${cssColor(p.token)}), ${checker}` : p.token.value }} />
                <div className="space-y-0.5 p-3"><Name>{p.name}</Name><div><Val>{show(p.token)}</Val></div></div>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  )
}

export function PrimitiveTypography() {
  const fams = prim.filter((p) => p.path[1] === 'family')
  const sizes = prim.filter((p) => p.path[1] === 'size')
  const weights = prim.filter((p) => p.path[1] === 'weight')
  const lh = prim.filter((p) => p.path[1] === 'line-height')
  const ls = prim.filter((p) => p.path[1] === 'letter-spacing')
  return (
    <>
      <Section title="font / family">
        {fams.map((p) => (
          <div key={p.name} className="flex items-baseline justify-between gap-4 border-b border-gm-border py-3">
            <span className="text-[24px]" style={{ fontFamily: `"${p.token.value}"` }}>Seu saldo R$ 14.500</span>
            <span className="text-right"><Name>{p.name}</Name><br /><Val>{p.token.value}</Val></span>
          </div>
        ))}
      </Section>
      <Section title="font / size">
        {sizes.map((p) => (
          <div key={p.name} className="flex items-center gap-6 border-b border-gm-border py-2">
            <span className="w-40 shrink-0"><Name>{p.name}</Name></span>
            <span className="truncate font-bold" style={{ fontSize: p.token.value, letterSpacing: '-0.02em' }}>R$ 2.340 este mês</span>
          </div>
        ))}
      </Section>
      <Section title="font / weight">
        <div className="grid gap-2 sm:grid-cols-5">
          {weights.map((p) => <div key={p.name} className="rounded-[18px] bg-gm-surface p-4 shadow-soft"><p className="text-[28px]" style={{ fontWeight: p.token.value }}>Aa</p><Name>{p.name}</Name><br /><Val>{show(p.token)}</Val></div>)}
        </div>
      </Section>
      <Section title="font / line-height · letter-spacing">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>{lh.map((p) => <div key={p.name} className="flex justify-between border-b border-gm-border py-1.5"><Name>{p.name}</Name><Val>{show(p.token)}</Val></div>)}</div>
          <div>{ls.map((p) => (
            <div key={p.name} className="flex items-center justify-between gap-4 border-b border-gm-border py-1.5">
              <span className="text-[20px] font-bold" style={{ letterSpacing: `${p.token.value / 100}em` }}>14.500</span>
              <span className="text-right"><Name>{p.name}</Name> <Val>{show(p.token)}</Val></span>
            </div>
          ))}</div>
        </div>
      </Section>
    </>
  )
}

export function PrimitiveSpace() {
  const pos = prim.filter((p) => p.path[1] === 'positive')
  const negs = prim.filter((p) => p.path[1] === 'negative')
  return (
    <>
      <Section title="space / positive" desc="Gaps, paddings e margens.">
        {pos.map((p) => (
          <div key={p.name} className="flex items-center gap-4 py-1">
            <span className="w-28 shrink-0"><Name>{p.name}</Name></span>
            <span className="h-4 rounded-[4px] bg-gm-primary" style={{ width: p.token.value }} />
            <Val>{show(p.token)}</Val>
          </div>
        ))}
      </Section>
      <Section title="space / negative" desc="Gaps negativos: sobreposição (cartão sobe, item ativo do dock sobressai, lista sangra até a borda).">
        {negs.map((p) => (
          <div key={p.name} className="flex items-center gap-4 py-1">
            <span className="w-32 shrink-0"><Name>{p.name}</Name></span>
            <span className="relative h-6 w-24 rounded-[6px] bg-gm-row">
              <span className="absolute left-0 top-0 h-6 w-24 rounded-[6px] bg-gm-lilac/80" style={{ transform: `translateX(${p.token.value}px)` }} />
            </span>
            <Val>{show(p.token)}</Val>
          </div>
        ))}
      </Section>
    </>
  )
}

export function PrimitiveShape() {
  return (
    <>
      <Section title="radius">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
          {prim.filter((p) => p.path[0] === 'radius').map((p) => (
            <div key={p.name} className="text-center">
              <div className="mx-auto size-20 border-2 border-gm-primary bg-gm-row" style={{ borderRadius: Math.min(p.token.value, 40) }} />
              <Name>{p.name}</Name><br /><Val>{show(p.token)}</Val>
            </div>
          ))}
        </div>
      </Section>
      <Section title="stroke">
        {prim.filter((p) => p.path[0] === 'stroke').map((p) => (
          <div key={p.name} className="flex items-center gap-4 py-1.5">
            <span className="w-36 shrink-0"><Name>{p.name}</Name></span>
            <span className="w-40 bg-gm-text" style={{ height: Math.max(p.token.value, 0.0001) }} />
            <Val>{show(p.token)}</Val>
          </div>
        ))}
      </Section>
      <Section title="size">
        <div className="flex flex-wrap items-end gap-3">
          {prim.filter((p) => p.path[0] === 'size').map((p) => (
            <div key={p.name} className="text-center">
              <div className="mx-auto rounded-[6px] bg-gm-lilac" style={{ width: p.token.value, height: p.token.value }} />
              <Val>{p.token.value}</Val>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

export function PrimitiveEffects() {
  return (
    <>
      <Section title="shadow" desc="No Figma viram Effect styles (shadow/*).">
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {prim.filter((p) => p.path[0] === 'shadow').map((p) => (
            <div key={p.name}><div className="h-24 rounded-[22px] bg-gm-surface" style={{ boxShadow: shadowCss(p.token) }} /><p className="mt-3"><Name>{p.name}</Name></p><Val>{show(p.token)}</Val></div>
          ))}
        </div>
      </Section>
      <Section title="opacity">
        <div className="flex flex-wrap gap-2">
          {prim.filter((p) => p.path[0] === 'opacity').map((p) => (
            <div key={p.name} className="text-center"><div className="size-12 rounded-[12px] bg-gm-primary" style={{ opacity: p.token.value / 100 }} /><Val>{p.token.value}</Val></div>
          ))}
        </div>
      </Section>
      <Section title="blur">
        <div className="flex flex-wrap gap-4">
          {prim.filter((p) => p.path[0] === 'blur').map((p) => (
            <div key={p.name} className="relative size-24 overflow-hidden rounded-[18px] bg-band-solid">
              <span className="absolute left-3 top-3 size-10 rounded-full bg-gm-lilac" />
              <span className="absolute inset-x-0 bottom-0 top-8 bg-white/15" style={{ backdropFilter: `blur(${p.token.value}px)` }} />
              <span className="absolute bottom-1 left-2 font-mono text-[11px] text-white">{p.name}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="duration · easing · z-index · breakpoint">
        <div className="grid gap-x-8 sm:grid-cols-2">
          {prim.filter((p) => ['duration', 'easing', 'z-index', 'breakpoint'].includes(p.path[0])).map((p) => (
            <div key={p.name} className="flex justify-between border-b border-gm-border py-1.5"><Name>{p.name}</Name><Val>{show(p.token)}</Val></div>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ---------- Semânticos ---------- */
function Swatch({ t }: { t: Tok }) {
  const c = cssColor(t)
  return <span className="inline-block size-7 shrink-0 rounded-[8px] border border-gm-border" style={{ background: t.alpha != null ? `linear-gradient(${c}, ${c}), ${checker}` : c }} />
}

export function SemanticTable({ group }: { group: string }) {
  const rows = sem.filter((s) => s.path[0] === group)
  const sub = [...new Set(rows.map((r) => r.path.slice(1, -1).join(' / ')))]
  return (
    <>
      {sub.map((g) => (
        <Section key={g || group} title={g ? `${group} / ${g}` : group}>
          <div className="overflow-x-auto rounded-[22px] bg-gm-surface shadow-soft">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead className="text-gm-muted"><tr className="border-b border-gm-border">
                <th className="px-4 py-3 font-medium">Token</th><th className="px-4 py-3 font-medium">Light</th><th className="px-4 py-3 font-medium">Dark</th><th className="px-4 py-3 font-medium">Uso</th>
              </tr></thead>
              <tbody>
                {rows.filter((r) => r.path.slice(1, -1).join(' / ') === g).map((r) => {
                  const L = resolve(r.token.ref.light), D = resolve(r.token.ref.dark)
                  return (
                    <tr key={r.name} className="border-b border-gm-border last:border-0">
                      <td className="px-4 py-3 align-top"><Name>{r.name}</Name>{r.token.css && <div><Val>{r.token.css}</Val></div>}</td>
                      {[L, D].map((p, i) => (
                        <td key={i} className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            {p.token.type === 'color' && <Swatch t={p.token} />}
                            <span><Name>{p.name}</Name><br /><Val>{show(p.token)}</Val></span>
                          </div>
                        </td>
                      ))}
                      <td className="px-4 py-3 align-top text-gm-secondary">{r.token.usage}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>
      ))}
    </>
  )
}
