import { useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { CATEGORIES, type CategoryId } from '@/types/finance'
import { toISODate } from '@/lib/format'
import { useNav } from '@/app/navigation'
import { useStore } from '@/store'
import { Button, Chips, cx, Empty, inputCls } from '@/components/ui'
import { HeaderAction, ScreenHeader } from '@/components/layout/AppChrome'
import { TransactionRow, useMethodLabel } from '@/components/finance'
import { useMoney } from '@/hooks/useMoney'

const ALL = 'all'
const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  const s = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const dayLabel = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  const today = toISODate(new Date())
  const yest = new Date(); yest.setDate(yest.getDate() - 1)
  if (iso === today) return 'Hoje'
  if (iso === toISODate(yest)) return 'Ontem'
  const s = new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Extrato: todos os lançamentos (ver), com busca e filtros. Tocar abre o detalhe (editar/apagar). */
export default function TransactionsScreen() {
  const fmt = useMoney()
  const { state } = useStore()
  const nav = useNav()
  const methodLabel = useMethodLabel()
  const current = toISODate(new Date()).slice(0, 7)
  const months = useMemo(() => [...new Set([current, ...state.transactions.map((t) => t.date.slice(0, 7))])].sort().reverse(), [state.transactions, current])
  const [month, setMonth] = useState<string>(current)
  const [cat, setCat] = useState<CategoryId | typeof ALL>(ALL)
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return state.transactions
      .filter((t) => month === ALL || t.date.startsWith(month))
      .filter((t) => cat === ALL || t.category === cat)
      .filter((t) => !term || t.name.toLowerCase().includes(term) || methodLabel(t.method).toLowerCase().includes(term) || (t.note ?? '').toLowerCase().includes(term))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [state.transactions, month, cat, q, methodLabel])
  const total = list.reduce((a, t) => a + t.amount, 0)
  const groups = useMemo(() => {
    const m = new Map<string, typeof list>()
    list.forEach((t) => m.set(t.date, [...(m.get(t.date) ?? []), t]))
    return [...m.entries()]
  }, [list])
  const filtered = cat !== ALL || q.trim() !== ''

  return (
    <>
      <ScreenHeader
        kicker="Todos os lançamentos"
        title="Extrato"
        action={<HeaderAction label="Adicionar gasto" onClick={() => nav.open({ kind: 'add' })}><Plus size={22} strokeWidth={2.5} /></HeaderAction>}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        <aside className="space-y-4 lg:col-span-4">
          <section className="rounded-hero bg-gm-surface p-5 shadow-soft md:p-6">
            <label className="relative block">
              <span className="sr-only">Buscar lançamento</span>
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gm-muted" />
              <input id="tx-search" className={cx(inputCls, 'pl-11 pr-11')} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar gasto" />
              {q && <button type="button" onClick={() => setQ('')} aria-label="Limpar busca" className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-gm-secondary hover:bg-gm-row"><X size={16} /></button>}
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-[13px] font-medium text-gm-secondary">Mês</span>
              <select id="tx-month" className={inputCls} value={month} onChange={(e) => setMonth(e.target.value)}>
                {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
                <option value={ALL}>Todos os meses</option>
              </select>
            </label>
            <div className="mt-4">
              <span className="mb-2 block text-[13px] font-medium text-gm-secondary">Categoria</span>
              {/* mobile: uma linha que rola de lado; desktop: quebra em linhas */}
              <div className="no-scrollbar -mx-5 overflow-x-auto px-5 md:-mx-6 md:px-6 lg:mx-0 lg:overflow-visible lg:px-0 [&>div]:flex-nowrap [&_button]:shrink-0 lg:[&>div]:flex-wrap">
              <Chips label="Filtrar por categoria" value={cat} onChange={setCat} options={[{ id: ALL, label: 'Todas' }, ...(Object.keys(CATEGORIES) as CategoryId[]).map((id) => ({ id, label: CATEGORIES[id].label }))]} />
              </div>
            </div>
          </section>
          <section className="rounded-hero bg-gm-card p-5 text-gm-on-card shadow-soft md:p-6" aria-live="polite">
            <p className="kicker opacity-60">{month === ALL ? 'Todos os meses' : monthLabel(month)}</p>
            <p className="mt-2 text-[34px] font-bold leading-none num">−{fmt(total)}</p>
            <p className="mt-1 text-[14px] opacity-70">{list.length} {list.length === 1 ? 'lançamento' : 'lançamentos'}{filtered ? ' com esse filtro' : ''}</p>
          </section>
        </aside>

        <section className="lg:col-span-8" aria-label="Lançamentos">
          {list.length === 0 ? (
            <Empty
              title={filtered ? 'Nada encontrado' : 'Nenhum gasto neste mês'}
              text={filtered ? 'Tente outra busca ou outra categoria.' : 'Os gastos que você lançar aparecem aqui, agrupados por dia.'}
              action={filtered
                ? <Button size="md" variant="secondary" onClick={() => { setQ(''); setCat(ALL) }}>Limpar filtros</Button>
                : <Button size="md" onClick={() => nav.open({ kind: 'add' })}><Plus size={18} /> Adicionar gasto</Button>}
            />
          ) : (
            <div className="space-y-6">
              {groups.map(([date, txs]) => (
                <div key={date}>
                  <div className="mb-2 flex items-baseline justify-between px-1">
                    <h2 className="text-[14px] font-bold text-gm-secondary">{dayLabel(date)}</h2>
                    <span className="text-[13px] text-gm-muted num">−{fmt(txs.reduce((a, t) => a + t.amount, 0))}</span>
                  </div>
                  <div className="space-y-2">
                    {txs.map((t) => <TransactionRow key={t.id} tx={t} onClick={() => nav.open({ kind: 'tx', id: t.id })} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
