import type { Card, Transaction } from '@/types/finance'
import { CATEGORIES } from '@/types/finance'
import { relativeDay } from '@/lib/format'
import { useStore } from '@/store'
import { useLayoutEffect, useRef, useState } from 'react'
import { CategoryIcon, cx, LogoMark } from '@/components/ui'
import { Nfc } from 'lucide-react'
import { useMoney } from '@/hooks/useMoney'
import { dueIn } from '@/lib/cards'

export function useMethodLabel() {
  const { state } = useStore()
  return (m: string) => m === 'dinheiro' ? 'Dinheiro' : m === 'pix' ? 'Pix' : (state.cards.find((c) => c.id === m)?.nickname ?? 'Cartão removido')
}

export function TransactionRow({ tx, onClick }: { tx: Transaction; onClick: () => void }) {
  const fmt = useMoney()
  const methodLabel = useMethodLabel()
  return (
    <button onClick={onClick} className="flex w-full cursor-pointer items-center gap-3.5 rounded-[22px] bg-gm-surface px-4 py-3.5 text-left shadow-soft transition hover:bg-gm-elevated">
      <CategoryIcon category={tx.category} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[16px] font-bold tracking-[-0.01em]">{tx.name}</span>
          {tx.source === 'invoice' && <span className="shrink-0 rounded-full bg-gm-lilac px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gm-on">Fatura</span>}
        </span>
        <span className="block truncate text-[13px] text-gm-secondary">{CATEGORIES[tx.category].label} · {methodLabel(tx.method)}</span>
      </span>
      <span className="text-right">
        <span className="block text-[16px] font-bold num">−{fmt(tx.amount)}</span>
        <span className="block text-[12px] text-gm-muted">{relativeDay(tx.date)}</span>
      </span>
    </button>
  )
}

const CARD_BG: Record<Card['color'], string> = {
  gradient: 'bg-wallet text-white',      // violeta Gamora (cartão da marca)
  lilac: 'bg-periwinkle text-gm-on',     // verde-água
  offwhite: 'bg-silver text-gm-on',      // lavanda
}

/** Chip do cartão (desenho simples, sem imagem). */
function Chip() {
  return (
    <svg viewBox="0 0 40 30" className="h-7 w-9 shrink-0" aria-hidden>
      <rect x="0.5" y="0.5" width="39" height="29" rx="6" fill="#E9E4F7" stroke="#B8AEDB" />
      <path d="M0.5 10H13M0.5 20H13M27 10H39.5M27 20H39.5M13 0.5V29.5M27 0.5V29.5M13 15H27" stroke="#B8AEDB" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

/** Cartão da carteira no estilo da marca: logo Gamora, chip e aproximação.
 *  A faixa de cima (logo, apelido, aproximação) é o que aparece quando o cartão está dentro do bolso. */
export function WalletCard({ card, className }: { card: Card; className?: string }) {
  const fmt = useMoney()
  const light = card.color !== 'gradient'
  return (
    <div className={cx('relative flex aspect-[1.586] w-full flex-col overflow-hidden rounded-wallet px-6 pb-5 pt-5 shadow-[0_-6px_24px_rgba(11,18,48,.22)]', CARD_BG[card.color], className)}>
      {/* brilho diagonal */}
      <span className={cx('pointer-events-none absolute -left-1/4 -top-1/2 h-[180%] w-1/2 rotate-[25deg] blur-2xl', light ? 'bg-white/35' : 'bg-white/12')} aria-hidden />
      <div className="relative flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <LogoMark size={26} />
          <span className="truncate text-[17px] font-extrabold tracking-[-0.02em]">{card.nickname}</span>
        </span>
        <Nfc size={24} className="shrink-0 opacity-80" aria-hidden />
      </div>
      <div className="relative mt-4"><Chip /></div>
      <p className="relative mt-auto font-mono text-[16px] tracking-[0.12em] opacity-85">•••• •••• •••• {card.last4}</p>
      <div className="relative mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-70">Fatura atual</p>
          <p className="text-[20px] font-bold leading-tight num">{fmt(card.invoice)}</p>
        </div>
        <div className="text-right">
          <p className="text-[17px] font-extrabold leading-none tracking-[-0.03em]">Gamora</p>
          <p className="mt-1 text-[11px] font-semibold opacity-75">Vence em {dueIn(card)}d</p>
        </div>
      </div>
    </div>
  )
}

/** Contorno do bolso em px: lado esquerdo mais alto, curva em S, lado direito mais baixo. */
function pocketPath(w: number, h: number, r: number, dip: number, inset = 0) {
  const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset
  const rr = Math.max(4, r - inset)
  const cs = x0 + (x1 - x0) * 0.4, ce = x0 + (x1 - x0) * 0.62, mid = (cs + ce) / 2
  return [
    `M ${x0} ${y0 + rr}`, `Q ${x0} ${y0} ${x0 + rr} ${y0}`,
    `L ${cs} ${y0}`, `C ${mid} ${y0} ${mid} ${y0 + dip} ${ce} ${y0 + dip}`,
    `L ${x1 - rr} ${y0 + dip}`, `Q ${x1} ${y0 + dip} ${x1} ${y0 + dip + rr}`,
    `L ${x1} ${y1 - rr}`, `Q ${x1} ${y1} ${x1 - rr} ${y1}`,
    `L ${x0 + rr} ${y1}`, `Q ${x0} ${y1} ${x0} ${y1 - rr}`, 'Z',
  ].join(' ')
}

/** Bolso da carteira (modelo da referência): escuro, borda de cima em onda e costura tracejada
 *  que acompanha a curva. Os cartões ficam atrás dele. */
export function WavyPocket({ children, className, dip = 22 }: { children: React.ReactNode; className?: string; dip?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const outer = size ? pocketPath(size.w, size.h, 30, dip) : ''
  const stitch = size ? pocketPath(size.w, size.h, 30, dip, 8) : ''
  return (
    <div ref={ref} className={cx('relative text-white', className)}>
      <div
        className={cx('absolute inset-0 bg-pocket backdrop-blur-xl', !size && 'rounded-[30px]')}
        style={size ? { clipPath: `path('${outer}')` } : undefined}
        aria-hidden
      >
        {/* luz suave vinda de cima */}
        <span className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(120%_80%_at_30%_0%,rgba(255,255,255,.14),transparent_70%)]" />
      </div>
      {size && (
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width={size.w} height={size.h} aria-hidden>
          <path d={outer} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1" />
          <path d={stitch} fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="1.25" strokeDasharray="5 4" strokeLinecap="round" />
        </svg>
      )}
      <div className="relative px-6 pb-6 md:px-7 md:pb-7" style={{ paddingTop: dip + 22 }}>{children}</div>
    </div>
  )
}

/** Bolso da carteira: vidro com costura tracejada. `glass` sobre a faixa marinho; `pocket` em qualquer fundo. */
export function Pocket({ children, variant = 'glass', className }: { children: React.ReactNode; variant?: 'glass' | 'solid'; className?: string }) {
  return (
    <div className={cx('relative overflow-hidden rounded-[30px] p-6 text-white md:p-7', variant === 'glass' ? 'glass' : 'pocket', className)}>
      <span className="pointer-events-none absolute inset-[7px] rounded-[24px] border border-dashed border-white/35" aria-hidden />
      {/* reflexo na borda de cima do bolso */}
      <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  )
}
