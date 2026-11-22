import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowLeftRight, ArrowUpRight, ChevronRight, CreditCard, FileText, Plus, Sparkles, Target } from 'lucide-react'
import { env } from '@/config/env'
import { CATEGORIES } from '@/types/finance'
import { daysLeftInMonth, monthName, pct } from '@/lib/format'
import { useNav } from '@/app/navigation'
import { useStore } from '@/store'
import { Button, cx, Empty, Kicker, LinkButton, Money, SectionTitle, Skeleton } from '@/components/ui'
import { TransactionRow, WalletCard, WavyPocket } from '@/components/finance'
import { useMoney } from '@/hooks/useMoney'
import { dueLabel } from '@/lib/cards'

const SEG = ['bg-gm-lilac-strong', 'bg-gm-teal', 'bg-gm-primary']

export default function Home() {
  const fmt = useMoney()
  const { state, d } = useStore()
  const nav = useNav()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t) }, [])

  const now = new Date()
  const diff = pct(d.monthTotal - state.lastMonthTotal, state.lastMonthTotal)
  const top = d.byCategory.slice(0, 3)
  const front = state.cards[0]
  // carteira da home: o cartão escolhido fica na frente; o próximo aparece atrás
  const [heroFront, setHeroFront] = useState<string | undefined>(state.cards[0]?.id)
  const [details, setDetails] = useState(false)
  const heroIdx = Math.max(0, state.cards.findIndex((c) => c.id === heroFront))
  const heroMain = state.cards[heroIdx]
  const heroBack = state.cards.length > 1 ? state.cards[(heroIdx + 1) % state.cards.length] : undefined
  const nextCard = () => { setDetails(false); if (heroBack) setHeroFront(heroBack.id) }
  const left = state.monthCap - d.monthTotal
  const list = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date))
  const shown = list.slice(0, 5)

  if (loading) return <HomeSkeleton />

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      {/* ---------- coluna principal ---------- */}
      <div className="space-y-6 lg:col-span-7">
        {/* Hero: carteira — cartões saindo de um bolso escuro com borda em onda e costura tracejada */}
        <section className="relative lg:rounded-hero lg:bg-band-solid lg:p-8" aria-label="Seu saldo">
          <div
            className="relative transition-[padding] duration-500 ease-[cubic-bezier(.2,.9,.25,1)]"
            style={{ paddingTop: heroMain ? (details ? 172 : 96) : 0 }}
          >
            {heroMain && (
              <div className="absolute inset-x-0 -top-3 bottom-0 overflow-hidden">
                {heroBack && (
                  <button
                    onClick={() => setHeroFront(heroBack.id)}
                    aria-label={`Trazer ${heroBack.nickname} para a frente`}
                    className={cx('absolute inset-x-7 top-3 cursor-pointer text-left transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1)] hover:-translate-y-1.5 md:inset-x-12', details && 'opacity-0')}
                  >
                    <WalletCard card={heroBack} />
                  </button>
                )}
                <button
                  onClick={() => setDetails((v) => !v)}
                  aria-label={details ? `Recolher ${heroMain.nickname}` : `Ver detalhes do ${heroMain.nickname}`}
                  className={cx('absolute inset-x-3 cursor-pointer text-left transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1)] md:inset-x-6', heroBack ? 'top-[38px]' : 'top-3', !details && 'hover:-translate-y-1.5')}
                  style={{ zIndex: 1 }}
                >
                  <WalletCard card={heroMain} />
                </button>
              </div>
            )}

            <WavyPocket className="z-10">
              {!details || !heroMain ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-white/70">Seu saldo</p>
                      <Money value={d.balance} compact className="mt-1 block whitespace-nowrap text-[36px] font-bold leading-none min-[400px]:text-[40px] md:text-[50px]" />
                    </div>
                    {env.stage === 2 && (
                      <button
                        onClick={() => nav.push('assistant')}
                        className="-mt-2 inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-gm-lilac pl-1.5 pr-4 text-[13px] font-bold text-gm-on shadow-[0_8px_24px_rgba(123,92,255,.45)] transition hover:brightness-105 active:scale-[0.97]"
                      >
                        <span className="grid size-7 place-items-center rounded-full bg-gm-on text-gm-lilac"><Sparkles size={14} /></span>
                        Pergunte
                      </button>
                    )}
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    {heroMain ? (
                      <button onClick={() => setDetails(true)} className="h-11 cursor-pointer rounded-full border border-white/15 bg-white/10 px-5 text-[14px] font-bold transition hover:bg-white/15">
                        Detalhes do cartão
                      </button>
                    ) : (
                      <button onClick={() => nav.open({ kind: 'card' })} className="h-11 cursor-pointer rounded-full border border-white/15 bg-white/10 px-5 text-[14px] font-bold transition hover:bg-white/15">
                        + Cadastrar cartão
                      </button>
                    )}
                    <div className="flex gap-2">
                      {state.cards.length > 1 && (
                        <button onClick={nextCard} aria-label="Trocar cartão da frente" title="Trocar cartão" className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/15">
                          <ArrowLeftRight size={18} />
                        </button>
                      )}
                      <button onClick={() => nav.open({ kind: 'add' })} aria-label="Adicionar gasto" title="Adicionar gasto" className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/15">
                        <Plus size={19} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[13px] font-medium text-white/70">{heroMain.nickname} · •••• {heroMain.last4}</p>
                  <dl className="mt-3 grid grid-cols-3 gap-3">
                    <div><dt className="text-[11px] uppercase tracking-[0.08em] text-white/55">Fatura</dt><dd className="mt-1 text-[18px] font-bold num">{fmt(heroMain.invoice, true)}</dd></div>
                    <div><dt className="text-[11px] uppercase tracking-[0.08em] text-white/55">Disponível</dt><dd className="mt-1 text-[18px] font-bold num">{fmt(Math.max(0, heroMain.limit - heroMain.invoice), true)}</dd></div>
                    <div><dt className="text-[11px] uppercase tracking-[0.08em] text-white/55">Vence</dt><dd className="mt-1 text-[18px] font-bold">{dueLabel(heroMain)}</dd></div>
                  </dl>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button onClick={() => setDetails(false)} className="h-11 cursor-pointer rounded-full border border-white/15 bg-white/10 px-6 text-[14px] font-bold transition hover:bg-white/15">Fechar</button>
                    <button onClick={() => nav.go('cards')} className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[14px] font-bold text-white/85 transition hover:text-white">
                      Ver cartões <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </WavyPocket>
          </div>
        </section>

        {/* Atalhos — estágio 1: Adicionar · Cartões · Metas */}
        <section className={cx('grid', env.stage === 2 ? 'grid-cols-4 gap-2 sm:gap-3' : 'grid-cols-3 gap-3')} aria-label="Atalhos">
          <Shortcut onClick={() => nav.open({ kind: 'add' })} label="Adicionar" primary icon={<Plus size={22} strokeWidth={2.5} />} />
          {env.stage === 2 && <Shortcut onClick={() => nav.go('invoice')} label="Fatura" icon={<FileText size={22} strokeWidth={1.9} />} />}
          <Shortcut onClick={() => nav.go('cards')} label="Cartões" icon={<CreditCard size={22} strokeWidth={1.9} />} />
          <Shortcut onClick={() => nav.go('goals')} label="Metas" icon={<Target size={22} strokeWidth={1.9} />} />
        </section>

        {/* Este mês */}
        <section className="rounded-hero bg-gm-surface p-6 shadow-soft md:p-7" aria-label="Este mês">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Kicker>Este mês · {monthName(now)}</Kicker>
              <Money value={d.monthTotal} compact className="mt-2 block text-[34px] font-bold leading-none min-[400px]:text-[40px] md:text-[48px]" />
            </div>
            {state.lastMonthTotal > 0 && (
              <span className={cx('mt-1 inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-bold', diff <= 0 ? 'bg-gm-primary text-gm-on-primary' : 'bg-gm-row text-gm-text')}>
                {diff <= 0 ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}{Math.abs(diff)}%
              </span>
            )}
          </div>
          <p className="mt-2 text-[14px] text-gm-secondary">
            {state.lastMonthTotal > 0
              ? `${Math.abs(diff)}% ${diff <= 0 ? 'menos' : 'mais'} que em ${monthName(now, -1)}`
              : d.monthTotal > 0 ? 'Seu primeiro mês no Gamora.' : 'Nenhum gasto este mês. Toque em Adicionar quando comprar algo.'}
          </p>

          {d.monthTotal > 0 && (
            <>
              <div className="mt-6 flex h-7 gap-1 overflow-hidden" role="img" aria-label="Divisão dos gastos por categoria">
                {top.map((c, i) => (
                  <div key={c.category} className={cx(SEG[i], 'rounded-[14px] transition-[flex-grow] duration-700')} style={{ flexGrow: c.total }} />
                ))}
                {d.monthTotal - top.reduce((a, c) => a + c.total, 0) > 0 && (
                  <div className="rounded-[14px] bg-gm-track" style={{ flexGrow: d.monthTotal - top.reduce((a, c) => a + c.total, 0) }} />
                )}
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                {top.map((c, i) => (
                  <li key={c.category} className="flex items-center gap-2.5">
                    <span className={cx('size-2.5 rounded-full', SEG[i])} />
                    <span className="min-w-0 flex-1 truncate text-[14px] text-gm-secondary">{CATEGORIES[c.category].label}</span>
                    <span className="text-[14px] font-bold num">{fmt(c.total, true)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {/* ---------- coluna lateral ---------- */}
      <div className="space-y-6 lg:col-span-5">
        {/* tiles claros (referência: Income / Upcoming bills) */}
        <section className="grid grid-cols-2 gap-3">
          {state.monthCap > 0 ? (
            <button onClick={() => nav.go('goals')} className="flex min-h-[168px] cursor-pointer flex-col justify-between rounded-tile bg-gm-card p-5 text-left text-gm-on-card shadow-soft transition hover:brightness-[.97]">
              <span className="text-[14px] font-medium leading-snug">{left >= 0 ? 'Ainda pode gastar' : 'Passou do teto em'} <span className="opacity-60">· faltam {daysLeftInMonth()} dias</span></span>
              <span>
                <span className="block text-[26px] font-bold leading-none num">{fmt(Math.abs(left), true)}</span>
                <span className="mt-1 block text-[12px] font-medium opacity-60">de {fmt(state.monthCap, true)}</span>
              </span>
            </button>
          ) : (
            <button onClick={() => nav.open({ kind: 'budget', category: 'cap' })} className="flex min-h-[168px] cursor-pointer flex-col justify-between rounded-tile bg-gm-card p-5 text-left text-gm-on-card shadow-soft transition hover:brightness-[.97]">
              <span className="text-[14px] font-medium leading-snug">Quanto quer gastar por mês?</span>
              <span className="inline-flex items-center gap-1.5 text-[15px] font-bold"><Plus size={16} /> Definir teto</span>
            </button>
          )}
          {!front && (
            <button onClick={() => nav.open({ kind: 'card' })} className="flex min-h-[168px] cursor-pointer flex-col justify-between rounded-tile bg-gm-card p-5 text-left text-gm-on-card shadow-soft transition hover:brightness-[.98]">
              <span className="text-[14px] font-medium leading-snug">Cadastre um cartão para acompanhar a fatura.</span>
              <span className="inline-flex items-center gap-1.5 text-[15px] font-bold"><Plus size={16} /> Novo cartão</span>
            </button>
          )}
          {front && (
            <button onClick={() => nav.go('cards')} className="flex min-h-[168px] cursor-pointer flex-col justify-between rounded-tile bg-gm-card p-5 text-left text-gm-on-card shadow-soft transition hover:brightness-[.98]">
              <span className="text-[14px] font-medium leading-snug">Sua fatura {front.nickname} vence <b className="text-gm-accent">{dueLabel(front)}</b>.</span>
              <span>
                <span className="block text-[26px] font-bold leading-none num">{fmt(front.invoice, true)}</span>
                <span className="mt-1 block text-[12px] font-medium opacity-60">{pct(front.invoice, front.limit)}% do limite</span>
              </span>
            </button>
          )}
        </section>

        <section aria-label="Transações">
          <SectionTitle action={state.transactions.length > 0 && <LinkButton onClick={() => nav.push('transactions')}>Ver extrato</LinkButton>}>
            Transações
          </SectionTitle>
          {list.length === 0 ? (
            <Empty
              title="Nenhum gasto por aqui"
              text="Fez uma compra? Digite o valor e o mês começa a se mexer."
              action={<Button size="md" onClick={() => nav.open({ kind: 'add' })}><Plus size={18} /> Adicionar gasto</Button>}
            />
          ) : (
            <div className="space-y-2">
              {shown.map((t) => <TransactionRow key={t.id} tx={t} onClick={() => nav.open({ kind: 'tx', id: t.id })} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Shortcut({ label, icon, onClick, primary }: { label: string; icon: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cx('flex h-[92px] min-w-0 cursor-pointer flex-col rounded-tile transition active:scale-[0.98] md:h-[104px]',
        env.stage === 2
          ? 'items-center justify-center gap-2.5 px-1 text-center sm:items-start sm:justify-between sm:gap-0 sm:p-4 sm:text-left'
          : 'items-start justify-between p-4 text-left',
        primary ? 'bg-gm-primary text-gm-on-primary shadow-soft hover:brightness-110' : 'bg-gm-surface text-gm-text shadow-soft hover:bg-gm-elevated')}
    >
      {icon}
      <span className="whitespace-nowrap text-[12.5px] font-bold tracking-[-0.02em] sm:text-[15px] sm:tracking-[-0.01em]">{label}</span>
    </button>
  )
}

function HomeSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8" aria-busy="true" aria-label="Carregando">
      <div className="space-y-6 lg:col-span-7">
        <Skeleton className="mt-[88px] h-[190px] rounded-[30px]" />
        <div className="grid grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[92px]" />)}</div>
        <Skeleton className="h-[240px] rounded-hero" />
      </div>
      <div className="space-y-6 lg:col-span-5">
        <div className="grid grid-cols-2 gap-3"><Skeleton className="h-[168px]" /><Skeleton className="h-[168px]" /></div>
        <Skeleton className="h-[320px]" />
      </div>
    </div>
  )
}
