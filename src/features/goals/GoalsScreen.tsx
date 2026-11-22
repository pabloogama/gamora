import { ArrowRight, Check, Plane, Plus, Sparkles } from 'lucide-react'
import { CATEGORIES } from '@/types/finance'
import { daysLeftInMonth, monthName, pct } from '@/lib/format'
import { formatGoalDate, monthsUntil } from '@/lib/goals'
import { topInsight } from '@/services/ai/mock'
import { env } from '@/config/env'
import { useNav } from '@/app/navigation'
import { useStore } from '@/store'
import { Bar, Button, cx, Empty, IconButton, Kicker, Ring, SectionTitle } from '@/components/ui'
import { HeaderAction, ScreenHeader } from '@/components/layout/AppChrome'
import { maskMoneyText, useMoney } from '@/hooks/useMoney'

/** Metas: uma tela só — em cima o mês (tetos), embaixo o que a pessoa está guardando. */
export default function GoalsScreen() {
  const fmt = useMoney()
  const { state, d } = useStore()
  const nav = useNav()
  const left = state.monthCap - d.monthTotal
  const usedPct = pct(d.monthTotal, state.monthCap)
  const [featured, ...rest] = state.goals
  const insight = env.stage === 2 ? topInsight(state) : null
  const freeCats = (Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]).filter((c) => !state.budgets.some((b) => b.category === c))

  return (
    <>
      <ScreenHeader
        kicker="Este mês · guardando"
        title="Metas"
        action={
          <HeaderAction label="Nova meta" onClick={() => nav.open({ kind: 'goal' })}>
            <Plus size={22} strokeWidth={2.5} />
          </HeaderAction>
        }
      />
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* -------- Em cima: este mês -------- */}
        <section className="space-y-4 lg:col-span-6" aria-label="Este mês">
          {state.monthCap > 0 ? (
            <button onClick={() => nav.open({ kind: 'budget', category: 'cap' })} className="block w-full cursor-pointer rounded-hero bg-gm-card p-6 text-left text-gm-on-card transition hover:brightness-[.98] md:p-7">
              <p className="kicker opacity-60">Este mês · {monthName(new Date())}</p>
              <p className="mt-3 text-[15px] font-medium opacity-70">{left >= 0 ? 'Ainda pode gastar' : 'Passou do teto em'}</p>
              <p className="text-[46px] font-bold leading-[1.05] num md:text-[56px]">{fmt(Math.abs(left), true)}</p>
              <p className="mt-1 text-[14px] font-medium opacity-70">de {fmt(state.monthCap, true)} · faltam {daysLeftInMonth()} dias</p>
              <Bar value={usedPct} height={8} className="mt-5" />
            </button>
          ) : (
            <button onClick={() => nav.open({ kind: 'budget', category: 'cap' })} className="block w-full cursor-pointer rounded-hero bg-gm-card p-6 text-left text-gm-on-card md:p-7">
              <p className="kicker opacity-60">Este mês · {monthName(new Date())}</p>
              <p className="mt-3 text-[24px] font-bold leading-tight tracking-[-0.02em]">Quanto você quer gastar por mês?</p>
              <span className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-gm-primary px-5 text-[14px] font-bold text-gm-on-primary"><Plus size={16} /> Definir teto do mês</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            {state.budgets.map((b) => {
              const spent = d.spentIn(b.category)
              const p = pct(spent, b.limit)
              return (
                <button key={b.category} onClick={() => nav.open({ kind: 'budget', category: b.category })} className="cursor-pointer rounded-tile bg-gm-surface shadow-soft p-5 text-left transition hover:bg-gm-elevated">
                  <p className="text-[14px] text-gm-secondary">{CATEGORIES[b.category].label}</p>
                  <p className={cx('mt-1 text-[30px] font-bold leading-none num', p >= 100 && 'text-gm-lilac-strong')}>{p}%</p>
                  <Bar value={p} tone={p >= 100 ? 'lilac' : 'primary'} height={4} className="mt-4" />
                  <p className="mt-2 text-[12px] text-gm-muted num">{fmt(spent, true)} de {fmt(b.limit, true)}</p>
                </button>
              )
            })}
            {freeCats.length > 0 && (
              <button onClick={() => nav.open({ kind: 'budget', category: 'new' })} className={cx('flex cursor-pointer flex-col items-start justify-center gap-2 rounded-tile border border-dashed border-gm-track p-5 text-left text-gm-secondary transition hover:border-gm-accent hover:text-gm-accent', state.budgets.length % 2 === 0 && 'col-span-2')}>
                <Plus size={20} />
                <span className="text-[14px] font-bold">Teto por categoria</span>
              </button>
            )}
          </div>
        </section>

        {/* -------- Embaixo: guardando -------- */}
        <section className="space-y-4 lg:col-span-6" aria-label="Guardando">
          <SectionTitle>Guardando</SectionTitle>
          {!featured ? (
            <Empty title="Nenhuma meta ainda" text="Viagem, reserva, curso: crie uma meta e guarde um valor de cada vez." action={<Button size="md" onClick={() => nav.open({ kind: 'goal' })}><Plus size={18} /> Nova meta</Button>} />
          ) : (
            <>
              <FeaturedGoal />
              <ul className="space-y-2">
                {rest.map((g) => {
                  const p = pct(g.saved, g.target)
                  const done = p >= 100
                  return (
                    <li key={g.id} className="flex items-center gap-4 rounded-tile bg-gm-surface shadow-soft p-4 pl-5">
                      <button onClick={() => nav.open({ kind: 'goal', goal: g })} className="min-w-0 flex-1 cursor-pointer text-left">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-[16px] font-bold">{g.name}</span>
                            {done && <span className="shrink-0 rounded-full bg-gm-primary px-2 py-0.5 text-[10px] font-bold uppercase text-gm-on-primary">Concluída</span>}
                          </span>
                          <span className="text-[15px] font-bold num">{p}%</span>
                        </span>
                        <Bar value={p} height={3} className="mt-2.5" />
                        <span className="mt-2 block text-[12px] text-gm-muted num">{fmt(g.saved, true)} de {fmt(g.target, true)}{g.date ? ` · ${formatGoalDate(g.date)}` : ''}</span>
                      </button>
                      <IconButton label={`Guardar em ${g.name}`} onClick={() => nav.open({ kind: 'deposit', goalId: g.id })} className="size-10">
                        <Plus size={18} />
                      </IconButton>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {/* Estágio 2: card lilás do assistente, no rodapé desta mesma tela */}
          {env.stage === 2 && (
            <button onClick={() => nav.push('assistant')} className="group block w-full cursor-pointer rounded-hero bg-gm-lilac p-6 text-left text-gm-on transition hover:brightness-[.98]">
              <div className="flex items-center justify-between">
                <p className="kicker inline-flex items-center gap-2 opacity-70"><Sparkles size={14} /> Assistente Gamora</p>
                <ArrowRight size={20} className="transition group-hover:translate-x-1" />
              </div>
              {insight ? (
                <>
                  <p className="mt-3 text-[30px] font-bold leading-none num">{maskMoneyText(insight.number, state.hideBalance)}</p>
                  <p className="mt-2 text-[15px] font-medium opacity-80">{maskMoneyText(insight.consequence, state.hideBalance)}</p>
                </>
              ) : (
                <p className="mt-3 text-[20px] font-bold">Pergunte sobre seu dinheiro.</p>
              )}
            </button>
          )}
        </section>
      </div>
    </>
  )
}

function FeaturedGoal() {
  const fmt = useMoney()
  const { state } = useStore()
  const nav = useNav()
  const g = state.goals[0]
  const p = pct(g.saved, g.target)
  const leftToSave = Math.max(0, g.target - g.saved)
  const months = monthsUntil(g.date)
  const perMonth = months > 0 ? Math.ceil(leftToSave / months) : 0
  const done = leftToSave === 0
  return (
    <article className="rounded-hero bg-gm-surface shadow-soft p-6 md:p-7">
      <div className="flex items-center gap-5">
        <Ring value={p} size={116}>
          {done ? <Check size={36} className="text-gm-accent" strokeWidth={3} /> : <span className="text-[26px] font-bold num">{p}%</span>}
        </Ring>
        <div className="min-w-0">
          <span className="mb-2 inline-grid size-9 place-items-center rounded-full bg-gm-lilac text-gm-on"><Plane size={17} /></span>
          <button onClick={() => nav.open({ kind: 'goal', goal: g })} className="block cursor-pointer text-left text-[20px] font-bold leading-tight tracking-[-0.02em] underline-offset-4 hover:underline">{g.name}</button>
          {g.date && <p className="text-[13px] text-gm-secondary">{formatGoalDate(g.date)}</p>}
        </div>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <Kicker>Já guardado</Kicker>
          <p className="mt-1 text-[32px] font-bold leading-none num">{fmt(g.saved, true)}</p>
        </div>
        <p className="text-[14px] text-gm-secondary num">de {fmt(g.target, true)}</p>
      </div>
      {done ? (
        <p className="mt-5 rounded-tile bg-gm-primary px-4 py-3 text-[14px] font-bold text-gm-on-primary">Meta batida. Hora de planejar a próxima.</p>
      ) : (
        <p className="mt-4 text-[14px] text-gm-secondary">
          Faltam <b className="text-gm-text num">{fmt(leftToSave, true)}</b>
          {perMonth > 0 && <> · <b className="text-gm-text num">{fmt(perMonth, true)}/mês</b> por {months} {months === 1 ? 'mês' : 'meses'}</>}
        </p>
      )}
      {!done && <Button className="mt-6 w-full" onClick={() => nav.open({ kind: 'deposit', goalId: g.id, amount: 500 })}>Guardar R$ 500</Button>}
    </article>
  )
}
