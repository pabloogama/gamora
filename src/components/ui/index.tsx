import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import {
  Car, CircleEllipsis, Clapperboard, HeartPulse, House, Repeat, ShoppingBasket, X, Check,
  CreditCard, Banknote, QrCode, Moon, Sun, Eye, EyeOff,
} from 'lucide-react'
import { useStore } from '@/store'
import { useTheme } from '@/hooks/useTheme'
import { useMoney } from '@/hooks/useMoney'
import type { CategoryId } from '@/types/finance'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/* ---------- Botões ---------- */
/** primary: ação principal (uma por tela) · secondary: ação de apoio · outline: ação destrutiva/neutra */
export type ButtonVariant = 'primary' | 'secondary' | 'outline'
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'md' | 'lg' }
export function Button({ variant = 'primary', size = 'lg', className, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-tile font-bold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed',
        size === 'lg' ? 'h-14 px-6 text-[16px]' : 'h-11 px-4 text-[14px]',
        variant === 'primary' && 'bg-gm-primary text-gm-on-primary hover:brightness-95',
        variant === 'secondary' && 'bg-gm-row text-gm-text hover:bg-gm-track',
        variant === 'outline' && 'bg-transparent text-gm-text border border-gm-track hover:bg-gm-row',
        className,
      )}
    />
  )
}

export function IconButton({ label, className, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      {...p}
      className={cx('grid size-11 shrink-0 place-items-center rounded-full bg-gm-row text-gm-text transition hover:bg-gm-track active:scale-95 cursor-pointer', className)}
    >
      {children}
    </button>
  )
}

/* ---------- Textos ---------- */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('kicker text-gm-muted', className)}>{children}</p>
}

export function Money({ value, compact, className }: { value: number; compact?: boolean; className?: string }) {
  const fmt = useMoney()
  return <span className={cx('num', className)}>{fmt(value, compact)}</span>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[18px] font-bold tracking-[-0.01em]">{children}</h2>
      {action}
    </div>
  )
}

export function LinkButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="cursor-pointer text-[14px] font-medium text-gm-accent hover:underline underline-offset-4">
      {children}
    </button>
  )
}

/* ---------- Progresso ---------- */
export function Bar({ value, tone = 'primary', height = 4, className }: { value: number; tone?: 'primary' | 'lilac' | 'on' | 'white'; height?: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={cx('w-full overflow-hidden', tone === 'on' ? 'bg-gm-on/15' : tone === 'white' ? 'bg-white/20' : 'bg-gm-track', className)} style={{ height, borderRadius: height }}>
      <div
        className={cx('h-full transition-[width] duration-700 ease-out', tone === 'primary' && 'bg-gm-teal', tone === 'lilac' && 'bg-gm-lilac-strong', tone === 'on' && 'bg-gm-on', tone === 'white' && 'bg-white')}
        style={{ width: `${v}%`, borderRadius: height }}
      />
    </div>
  )
}

export function Ring({ value, size = 112, stroke = 10, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gm-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gm-teal)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * v) / 100}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.9,.25,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

/* ---------- Ícones ---------- */
const CAT_ICON: Record<CategoryId, typeof House> = {
  moradia: House, alimentacao: ShoppingBasket, transporte: Car, lazer: Clapperboard,
  assinaturas: Repeat, saude: HeartPulse, outros: CircleEllipsis,
}
export function CategoryIcon({ category, className }: { category: CategoryId; className?: string }) {
  const I = CAT_ICON[category]
  return (
    <span className={cx('grid size-11 shrink-0 place-items-center rounded-control bg-gm-row text-gm-text-2', className)}>
      <I size={20} strokeWidth={1.75} />
    </span>
  )
}
export function MethodIcon({ method, size = 16 }: { method: string; size?: number }) {
  const I = method === 'dinheiro' ? Banknote : method === 'pix' ? QrCode : CreditCard
  return <I size={size} strokeWidth={1.75} />
}

/** Avatar: foto (se houver) ou a inicial sobre o gradiente da marca. */
export function Avatar({ name, src, size = 44, className }: { name: string; src?: string; size?: number; className?: string }) {
  const [broken, setBroken] = useState(false)
  const initials = name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  if (src && !broken) {
    return (
      <img
        src={src} alt="" width={size} height={size} onError={() => setBroken(true)}
        className={cx('shrink-0 rounded-full object-cover ring-2 ring-white/70', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className={cx('grid shrink-0 place-items-center rounded-full bg-hero font-bold text-gm-on', className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials || '?'}
    </span>
  )
}

/** Símbolo da marca: "G" em gradiente violeta → verde-água. */
export function LogoMark({ size = 28, tile = false, className }: { size?: number; tile?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '')
  const g = (
    <svg viewBox="0 0 48 48" width={tile ? size * 0.68 : size} height={tile ? size * 0.68 : size} aria-hidden className={tile ? undefined : className}>
      <defs>
        <linearGradient id={`g${id}`} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7B5CFF" />
          <stop offset=".55" stopColor="#5B8BFF" />
          <stop offset="1" stopColor="#00C2A8" />
        </linearGradient>
      </defs>
      <path
        d="M37.5 14.5A17 17 0 1 0 41 27.5H25"
        fill="none" stroke={`url(#g${id})`} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
  if (!tile) return g
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-[28%] bg-[#0b1230]', className)} style={{ width: size, height: size }}>
      {g}
    </span>
  )
}

export function Logo({ className, tile = true }: { className?: string; tile?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-2 font-extrabold tracking-[-0.03em]', className)}>
      <LogoMark tile={tile} size={30} />
      Gamora
    </span>
  )
}

/* ---------- Folha (sheet) ---------- */
export function Sheet({ title, kicker, onClose, children }: { title: string; kicker?: string; onClose: () => void; children: ReactNode }) {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLElement>('input, button:not([data-close])')?.focus({ preventScroll: true })
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div className="absolute inset-0 animate-fade-in bg-[#0b1230]/55 backdrop-blur-[3px]" onClick={onClose} />
      <div
        ref={ref}
        role="dialog" aria-modal="true" aria-labelledby={id}
        className="relative max-h-[92dvh] w-full overflow-y-auto no-scrollbar rounded-t-sheet border-t border-gm-border bg-gm-sheet px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 animate-sheet-up md:max-w-[480px] md:rounded-sheet md:border md:px-7 md:pb-7 md:pt-6 md:animate-pop"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gm-track md:hidden" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {kicker && <Kicker className="mb-1">{kicker}</Kicker>}
            <h2 id={id} className="text-[24px] font-bold tracking-[-0.03em]">{title}</h2>
          </div>
          <IconButton label="Fechar" onClick={onClose} data-close className="size-10">
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ---------- Formulário ---------- */
export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-gm-secondary">{label}</span>
      {children}
      {error ? <span role="alert" className="mt-1.5 block text-[13px] text-gm-lilac">{error}</span>
        : hint ? <span className="mt-1.5 block text-[12px] text-gm-muted">{hint}</span> : null}
    </label>
  )
}

export const inputCls =
  'h-13 w-full rounded-control border border-gm-track bg-gm-surface px-4 text-[16px] text-gm-text placeholder:text-gm-muted outline-none transition focus:border-gm-accent'

export function MoneyInput({ value, onChange, big, invalid, autoFocus, label }: { value: string; onChange: (v: string) => void; big?: boolean; invalid?: boolean; autoFocus?: boolean; label?: string }) {
  return (
    <div className={cx('flex items-baseline gap-2 rounded-tile border bg-gm-surface px-5 transition focus-within:border-gm-accent', invalid ? 'border-gm-lilac' : 'border-gm-track', big ? 'py-5' : 'py-3')}>
      <span className={cx('font-bold text-gm-muted num', big ? 'text-[24px]' : 'text-[16px]')}>R$</span>
      <input
        inputMode="numeric" autoFocus={autoFocus} aria-label={label ?? 'Valor'}
        className={cx('w-full min-w-0 bg-transparent font-bold text-gm-text outline-none placeholder:text-gm-track num', big ? 'text-[44px] leading-none' : 'text-[20px]')}
        placeholder="0,00" value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function Chips<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string; icon?: ReactNode }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            type="button" role="radio" aria-checked={on} key={o.id} onClick={() => onChange(o.id)}
            className={cx('inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[14px] font-medium transition',
              on ? 'bg-gm-primary text-gm-on-primary' : 'bg-gm-row text-gm-text-2 hover:bg-gm-track')}
          >
            {o.icon}{o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Toast ---------- */
export function Toast({ msg }: { msg: string }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-5 md:bottom-8">
      <div className="pointer-events-auto flex animate-pop items-center gap-2.5 rounded-full bg-gm-primary py-3 pl-3 pr-5 text-[14px] font-bold text-gm-on-primary shadow-[0_12px_40px_rgba(11,18,48,.3)]">
        <span className="grid size-6 place-items-center rounded-full bg-gm-on-primary text-gm-primary"><Check size={14} strokeWidth={3} /></span>
        {msg}
      </div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-shimmer rounded-tile bg-[linear-gradient(90deg,var(--gm-row)_0%,var(--gm-track)_50%,var(--gm-row)_100%)] bg-[length:200%_100%]', className)} />
}

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-tile border border-dashed border-gm-track px-6 py-10 text-center">
      <p className="text-[16px] font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-[280px] text-[14px] text-gm-secondary">{text}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}


/* ---------- Tema ---------- */
export function ThemeToggle({ className, onBand }: { className?: string; onBand?: boolean }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={dark ? 'Tema claro' : 'Tema escuro'}
      className={cx(
        'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full transition active:scale-95',
        onBand ? 'glass text-white hover:bg-white/25' : 'bg-gm-row text-gm-text hover:bg-gm-track',
        className,
      )}
    >
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  )
}

/* ---------- Ocultar valores (vale para o app inteiro) ---------- */
export function BalanceToggle({ className, onBand }: { className?: string; onBand?: boolean }) {
  const { state, dispatch } = useStore()
  const hidden = state.hideBalance
  return (
    <button
      onClick={() => dispatch({ type: 'toggleBalance' })}
      aria-pressed={hidden}
      aria-label={hidden ? 'Mostrar valores' : 'Ocultar valores'}
      title={hidden ? 'Mostrar valores' : 'Ocultar valores'}
      className={cx(
        'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full transition active:scale-95',
        onBand ? 'glass text-white hover:bg-white/25' : 'bg-gm-row text-gm-text hover:bg-gm-track',
        className,
      )}
    >
      {hidden ? <EyeOff size={19} /> : <Eye size={19} />}
    </button>
  )
}
