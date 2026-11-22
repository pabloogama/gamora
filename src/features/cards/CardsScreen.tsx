import { useState } from 'react'
import { CalendarClock, Pencil, Plus } from 'lucide-react'
import { pct } from '@/lib/format'
import { useNav } from '@/app/navigation'
import { useStore } from '@/store'
import { Bar, Button, cx, Empty, SectionTitle } from '@/components/ui'
import { HeaderAction, ScreenHeader } from '@/components/layout/AppChrome'
import { TransactionRow, WalletCard, WavyPocket } from '@/components/finance'
import { useMoney } from '@/hooks/useMoney'

const PEEK = 70 // quanto de cada cartão de trás aparece acima do próximo
const FRONT_STRIP = 88 // quanto do cartão da frente aparece acima do bolso

/** Cartões: carteira visual. Os cartões saem do bolso; tocar num cartão traz ele para a frente. */
export default function CardsScreen() {
  const fmt = useMoney()
  const { state } = useStore()
  const nav = useNav()
  const [frontId, setFrontId] = useState(state.cards[0]?.id)
  const cards = state.cards
  const front = cards.find((c) => c.id === frontId) ?? cards[0]

  const add = (
    <HeaderAction label="Novo cartão" onClick={() => nav.open({ kind: 'card' })}>
      <Plus size={22} strokeWidth={2.5} />
    </HeaderAction>
  )

  if (!front) {
    return (
      <>
        <ScreenHeader kicker="Carteira" title="Cartões" action={add} />
        <Empty title="Nenhum cartão" text="Cadastre o apelido, o final e o limite. A fatura você preenche à mão." action={<Button size="md" onClick={() => nav.open({ kind: 'card' })}><Plus size={18} /> Novo cartão</Button>} />
      </>
    )
  }

  // ordem visual: o da frente por último (mais perto do bolso)
  const order = [...cards.filter((c) => c.id !== front.id), front]
  const cycle = () => {
    const i = cards.findIndex((c) => c.id === front.id)
    setFrontId(cards[(i + 1) % cards.length].id)
  }
  const used = pct(front.invoice, front.limit)
  const available = Math.max(0, front.limit - front.invoice)
  const upcoming = [...cards].sort((a, b) => a.dueInDays - b.dueInDays)
  const cardTx = state.transactions.filter((t) => t.method === front.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)

  return (
    <>
      <ScreenHeader kicker="Carteira" title="Cartões" action={add} />
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <div className="relative mx-auto max-w-[460px]" style={{ paddingTop: (order.length - 1) * PEEK + FRONT_STRIP }}>
            {order.map((c, i) => {
              const isFront = c.id === front.id
              return (
                <button
                  key={c.id}
                  onClick={() => (isFront ? cycle() : setFrontId(c.id))}
                  aria-label={isFront ? `Cartão ${c.nickname} na frente. Tocar para trocar` : `Trazer ${c.nickname} para a frente`}
                  className="absolute inset-x-3 cursor-pointer text-left transition-[top] duration-500 ease-[cubic-bezier(.2,.9,.25,1)] hover:-translate-y-1"
                  style={{ top: i * PEEK, zIndex: i }}
                >
                  <WalletCard card={c} />
                </button>
              )
            })}
            {/* o bolso cobre a parte de baixo dos cartões */}
            <WavyPocket className="z-20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="kicker text-white/65">Fatura atual · {front.nickname}</p>
                  <p className="mt-2 text-[40px] font-bold leading-none num">{fmt(front.invoice)}</p>
                </div>
                <button onClick={() => nav.open({ kind: 'card', card: front })} aria-label={`Editar ${front.nickname}`} className="-mt-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/15">
                  <Pencil size={17} />
                </button>
              </div>
              <Bar value={used} tone="white" height={8} className="mt-6" />
              <div className="mt-3 flex justify-between text-[14px] text-white/75">
                <span>Limite usado <b className="text-white num">{used}%</b></span>
                <span>Vence em <b className="text-white">{front.dueInDays} dias</b></span>
              </div>
            </WavyPocket>
          </div>
          {cards.length > 1 && <p className="mt-4 text-center text-[13px] text-gm-muted">Toque num cartão para trazer ele para a frente</p>}
        </div>

        <div className="space-y-6 lg:col-span-6">
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-tile bg-gm-surface p-5 shadow-soft">
              <p className="text-[13px] text-gm-secondary">Disponível</p>
              <p className="mt-1 text-[22px] font-bold num">{fmt(available)}</p>
              <p className="mt-1 text-[12px] text-gm-muted num">de {fmt(front.limit, true)}</p>
            </div>
            <div className="rounded-tile bg-gm-surface p-5 shadow-soft">
              <p className="text-[13px] text-gm-secondary">Final</p>
              <p className="mt-1 font-mono text-[22px] font-medium">•••• {front.last4}</p>
              <p className="mt-1 text-[12px] text-gm-muted">{front.nickname}</p>
            </div>
          </section>

          <section>
            <SectionTitle>Próximas faturas</SectionTitle>
            <ul className="overflow-hidden rounded-hero bg-gm-surface shadow-soft">
              {upcoming.map((c, i) => (
                <li key={c.id} className={cx(i > 0 && 'border-t border-gm-border')}>
                  <button onClick={() => { setFrontId(c.id); nav.open({ kind: 'card', card: c }) }} className="flex w-full cursor-pointer items-center gap-3.5 px-5 py-4 text-left transition hover:bg-gm-elevated">
                    <span className="grid size-11 place-items-center rounded-control bg-gm-row text-gm-primary"><CalendarClock size={20} strokeWidth={1.75} /></span>
                    <span className="flex-1">
                      <span className="block text-[16px] font-bold">{c.nickname} <span className="font-mono text-[12px] font-normal text-gm-muted">•• {c.last4}</span></span>
                      <span className="block text-[13px] text-gm-secondary">Vence em {c.dueInDays} dias</span>
                    </span>
                    <span className="text-[16px] font-bold num">{fmt(c.invoice)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 px-1 text-[12px] text-gm-muted">Valores digitados por você. Gastos lançados no cartão somam na fatura.</p>
          </section>

          <section>
            <SectionTitle>Compras no {front.nickname}</SectionTitle>
            {cardTx.length ? (
              <div className="space-y-2">
                {cardTx.map((t) => <TransactionRow key={t.id} tx={t} onClick={() => nav.open({ kind: 'tx', id: t.id })} />)}
              </div>
            ) : (
              <p className="rounded-tile border border-dashed border-gm-track px-5 py-6 text-center text-[14px] text-gm-secondary">Nenhuma compra lançada neste cartão.</p>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
