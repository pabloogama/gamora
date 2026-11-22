import { ChevronLeft, CreditCard, FileText, House, Plus, Target } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useNav, type View } from '@/app/navigation'
import { useStore } from '@/store'
import { Avatar, BalanceToggle, cx, IconButton, Logo, ThemeToggle } from '@/components/ui'
import { env } from '@/config/env'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

const NAV: { id: View; label: string; icon: typeof House }[] = [
  { id: 'home', label: 'Início', icon: House },
  ...(env.stage === 2 ? [{ id: 'invoice' as View, label: 'Fatura', icon: FileText }] : []),
  { id: 'cards', label: 'Cartões', icon: CreditCard },
  { id: 'goals', label: 'Metas', icon: Target },
]

/** Faixa marinho do topo (mobile), atrás do cabeçalho — como na referência. */
export function TopBand() {
  const { view } = useNav()
  return (
    <div
      aria-hidden
      className={cx('pointer-events-none absolute inset-x-0 top-0 -z-10 bg-band lg:hidden', view === 'home' ? 'h-[540px]' : 'h-[260px]')}
    />
  )
}

/** Barra superior. Mobile: sobre a faixa marinho, avatar + "Olá, Lucas" + tema.
 *  Desktop (≥1100px): barra marinho com logo, navegação, Adicionar, tema e conta. Sem sidebar. */
export function TopBar() {
  const { state } = useStore()
  const nav = useNav()
  const name = state.user?.name ?? ''
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className={cx('sticky top-0 z-30 text-white transition-colors lg:bg-band-solid', scrolled ? 'bg-gm-band/92 backdrop-blur-xl' : 'bg-transparent')}>
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between gap-4 px-5 md:px-8 lg:h-20">
        <span className="hidden lg:block"><Logo className="text-[22px] text-white" /></span>

        <button onClick={() => nav.open({ kind: 'account' })} className="flex cursor-pointer items-center gap-3 text-left lg:hidden" aria-label="Abrir conta">
          <Avatar name={name} />
          <span>
            <span className="block text-[13px] text-white/70">{greeting()},</span>
            <span className="block text-[18px] font-bold leading-tight tracking-[-0.02em]">Olá, {name}</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full bg-white/10 p-1.5 lg:flex" aria-label="Principal">
          {NAV.map((n) => (
            <button
              key={n.id} onClick={() => nav.go(n.id)} aria-current={nav.view === n.id ? 'page' : undefined}
              className={cx('inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-5 text-[14px] font-medium transition',
                nav.view === n.id ? 'bg-white text-[#1f3b70]' : 'text-white/75 hover:text-white')}
            >
              <n.icon size={16} strokeWidth={2} />{n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => nav.open({ kind: 'add' })}
            className="hidden h-11 cursor-pointer items-center gap-2 rounded-full bg-gm-lilac px-5 text-[14px] font-bold text-gm-on transition hover:brightness-105 lg:inline-flex"
          >
            <Plus size={18} strokeWidth={2.5} /> Adicionar
          </button>
          <div className="flex items-center gap-2">
            <BalanceToggle onBand />
            <ThemeToggle onBand />
          </div>
          <button onClick={() => nav.open({ kind: 'account' })} className="hidden cursor-pointer items-center gap-3 lg:flex" aria-label="Abrir conta">
            <span className="text-right">
              <span className="block text-[12px] text-white/70">{greeting()},</span>
              <span className="block text-[15px] font-bold leading-tight">Olá, {name}</span>
            </span>
            <Avatar name={name} size={42} />
          </button>
        </div>
      </div>
    </header>
  )
}

/** Cabeçalho de tela interna. Mobile: branco sobre a faixa marinho. Desktop: texto normal. */
export function ScreenHeader({ title, kicker, action }: { title: string; kicker: string; action?: ReactNode }) {
  const nav = useNav()
  // Assistente não está na navegação do topo: no desktop também precisa do voltar
  const backOnDesktop = nav.view === 'assistant'
  return (
    <div className="mb-6 flex items-end justify-between gap-4 lg:mb-8">
      <div className="flex items-center gap-3">
        <IconButton label="Voltar" onClick={nav.back} className={cx('glass !bg-transparent text-white hover:!bg-white/20 lg:!bg-gm-row lg:text-gm-text lg:[backdrop-filter:none] lg:border-transparent', !backOnDesktop && 'lg:hidden')}>
          <ChevronLeft size={22} />
        </IconButton>
        <div>
          <p className="kicker text-white/65 lg:text-gm-muted">{kicker}</p>
          <h1 className="text-[29px] font-bold leading-[1.1] tracking-[-0.035em] text-white lg:text-[36px] lg:text-gm-text">{title}</h1>
        </div>
      </div>
      {action}
    </div>
  )
}

/** Botão de ação do cabeçalho (+), lilás nos dois temas. */
export function HeaderAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <IconButton label={label} onClick={onClick} className="!bg-gm-lilac !text-gm-on hover:brightness-105">
      {children}
    </IconButton>
  )
}

/** Dock flutuante marinho (referência), só no mobile. */
export function Dock() {
  const nav = useNav()
  // Fatura e Assistente têm a própria barra fixa embaixo (confirmar / campo de chat)
  if (nav.view === 'invoice' || nav.view === 'assistant') return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-[max(16px,env(safe-area-inset-bottom))] lg:hidden">
      <nav aria-label="Navegação" className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-gm-dock/95 p-2 shadow-[0_18px_44px_rgba(14,26,51,.45)] backdrop-blur-xl">
        {NAV.map((n) => {
          const on = nav.view === n.id
          return (
            <button
              key={n.id} onClick={() => nav.go(n.id)} aria-label={n.label} aria-current={on ? 'page' : undefined}
              className={cx('grid cursor-pointer place-items-center rounded-full transition',
                on ? 'size-14 -my-1.5 border-4 border-gm-dock bg-white text-[#1f3b70] shadow-[0_6px_18px_rgba(0,0,0,.25)]' : 'size-12 text-white/70 hover:text-white')}
            >
              <n.icon size={21} strokeWidth={1.9} />
            </button>
          )
        })}
        <span className="mx-1 h-7 w-px bg-white/15" />
        <button
          onClick={() => nav.open({ kind: 'add' })} aria-label="Adicionar gasto"
          className="grid size-12 cursor-pointer place-items-center rounded-full bg-gm-lilac text-gm-on transition active:scale-95"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </nav>
    </div>
  )
}
