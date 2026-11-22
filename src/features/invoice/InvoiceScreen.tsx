import { useEffect, useRef, useState } from 'react'
import { Camera, Check, FileText, Repeat, Sparkles, TriangleAlert, Upload, X } from 'lucide-react'
import { CATEGORIES, type InvoiceResult } from '@/types/finance'
import { relativeDay } from '@/lib/format'
import { readInvoice, validateInvoiceFile, INVOICE_LIMIT_MB } from '@/services/ai/client'
import { useNav } from '@/app/navigation'
import { useStore } from '@/store'
import { Bar, Button, Chips, CategoryIcon, cx, Empty, Kicker, MethodIcon } from '@/components/ui'
import { ScreenHeader } from '@/components/layout/AppChrome'
import { useMoney } from '@/hooks/useMoney'

type Phase =
  | { name: 'pick'; error?: string }
  | { name: 'reading'; file: File; step: number }
  | { name: 'review'; result: InvoiceResult; file: File }

const STEPS = ['Enviando o arquivo', 'Lendo as compras', 'Achando assinaturas', 'Somando por categoria']

/** Fatura (estágio 2): uma tela, três estados — escolher → lendo → encontramos. */
export default function InvoiceScreen() {
  const { state } = useStore()
  const nav = useNav()
  const [phase, setPhase] = useState<Phase>({ name: 'pick' })
  const [cardId, setCardId] = useState(state.cards[0]?.id ?? '')
  const abort = useRef<AbortController | null>(null)
  useEffect(() => () => abort.current?.abort(), [])

  const start = async (file: File) => {
    const err = validateInvoiceFile(file)
    if (err) return setPhase({ name: 'pick', error: err })
    abort.current = new AbortController()
    setPhase({ name: 'reading', file, step: 0 })
    try {
      const result = await readInvoice(file, (step) => setPhase({ name: 'reading', file, step }), abort.current.signal)
      setPhase({ name: 'review', result, file })
    } catch (e) {
      if ((e as Error).name === 'AbortError') return setPhase({ name: 'pick' })
      setPhase({ name: 'pick', error: 'Não conseguimos ler essa fatura. Confira se o arquivo está legível e tente de novo.' })
    }
  }

  if (!state.cards.length) {
    return (
      <>
        <ScreenHeader kicker="Estágio 2 · IA" title="Fatura" />
        <Empty title="Cadastre um cartão antes" text="A fatura lida entra num cartão. Cadastre o cartão e volte aqui." action={<Button size="md" onClick={() => nav.go('cards')}>Ir para Cartões</Button>} />
      </>
    )
  }

  return (
    <>
      <ScreenHeader kicker="Estágio 2 · IA" title="Fatura" />
      {phase.name === 'pick' && <Pick cardId={cardId} setCardId={setCardId} error={phase.error} onFile={start} />}
      {phase.name === 'reading' && <Reading file={phase.file} step={phase.step} onCancel={() => abort.current?.abort()} />}
      {phase.name === 'review' && <Review result={phase.result} file={phase.file} cardId={cardId} onRestart={() => setPhase({ name: 'pick' })} />}
    </>
  )
}

/* ---------------- 1. Escolher PDF ou foto ---------------- */
function Pick({ cardId, setCardId, error, onFile }: { cardId: string; setCardId: (v: string) => void; error?: string; onFile: (f: File) => void }) {
  const { state } = useStore()
  const pdfRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const pick = (files: FileList | null) => { const f = files?.[0]; if (f) onFile(f) }
  const sample = () => onFile(new File(['%PDF-1.4 exemplo'], 'fatura-novembro.pdf', { type: 'application/pdf' }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
      <div className="space-y-5 lg:col-span-7">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files) }}
          className={cx('relative overflow-hidden rounded-hero border-2 border-dashed p-7 text-center transition md:p-10', drag ? 'border-gm-accent bg-gm-primary/5' : 'border-gm-track bg-gm-surface')}
        >
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-gm-lilac text-gm-on"><Sparkles size={26} /></span>
          <h2 className="mt-5 text-[24px] font-bold tracking-[-0.03em]">Envie a fatura do cartão</h2>
          <p className="mx-auto mt-2 max-w-[360px] text-[15px] text-gm-secondary">PDF ou foto. A IA lê as compras, acha as assinaturas e devolve o total. Você confirma antes de entrar no app.</p>
          <div className="mx-auto mt-7 grid max-w-[420px] gap-3 sm:grid-cols-2">
            <Button onClick={() => pdfRef.current?.click()}><Upload size={18} /> Escolher PDF</Button>
            <Button variant="secondary" onClick={() => photoRef.current?.click()}><Camera size={18} /> Foto da fatura</Button>
          </div>
          <p className="mt-4 hidden text-[13px] text-gm-muted md:block">ou arraste o arquivo para cá · até {INVOICE_LIMIT_MB} MB</p>
          <input ref={pdfRef} id="invoice-pdf" type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => { pick(e.target.files); e.target.value = '' }} />
          <input ref={photoRef} id="invoice-photo" type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { pick(e.target.files); e.target.value = '' }} />
        </div>

        {error && (
          <p role="alert" className="flex items-start gap-3 rounded-tile border border-gm-lilac/40 bg-gm-lilac/10 p-4 text-[14px] text-gm-lilac">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" />{error}
          </p>
        )}
      </div>

      <div className="space-y-5 lg:col-span-5">
        <section className="rounded-hero bg-gm-surface shadow-soft p-6">
          <Kicker>De qual cartão é a fatura?</Kicker>
          <div className="mt-4">
            <Chips label="Cartão da fatura" value={cardId} onChange={setCardId} options={state.cards.map((c) => ({ id: c.id, label: `${c.nickname} •• ${c.last4}`, icon: <MethodIcon method={c.id} /> }))} />
          </div>
        </section>
        <button onClick={sample} className="flex w-full cursor-pointer items-center gap-4 rounded-tile border border-gm-track p-4 text-left transition hover:border-gm-accent">
          <span className="grid size-11 place-items-center rounded-control bg-gm-row"><FileText size={20} /></span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold">Testar com um exemplo</span>
            <span className="block font-mono text-[12px] text-gm-muted">fatura-novembro.pdf</span>
          </span>
          <span className="text-[13px] font-bold text-gm-accent">Usar</span>
        </button>
        <p className="px-1 text-[12px] text-gm-muted">O arquivo vai para o nosso servidor e é lido pela OpenAI. Nada entra no app sem a sua confirmação.</p>
      </div>
    </div>
  )
}

/* ---------------- 2. Lendo sua fatura ---------------- */
function Reading({ file, step, onCancel }: { file: File; step: number; onCancel: () => void }) {
  const progress = Math.min(100, ((step + 1) / STEPS.length) * 100 - 8)
  return (
    <section className="mx-auto max-w-[560px] rounded-hero bg-gm-surface shadow-soft p-7 md:p-9" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-4">
        <span className="relative grid size-14 place-items-center rounded-control bg-gm-lilac text-gm-on-primary">
          <FileText size={24} />
          <span className="absolute -right-1 -top-1 size-3.5 animate-ping rounded-full bg-gm-primary" />
        </span>
        <div className="min-w-0">
          <p className="kicker text-gm-lilac">Lendo sua fatura</p>
          <p className="truncate font-mono text-[14px] text-gm-secondary">{file.name}</p>
        </div>
      </div>
      <Bar value={progress} height={8} className="mt-7" />
      <ol className="mt-6 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s} className={cx('flex items-center gap-3 text-[15px] transition', i <= step ? 'text-gm-text' : 'text-gm-muted')}>
            <span className={cx('grid size-6 place-items-center rounded-full', i < step ? 'bg-gm-primary text-gm-on-primary' : i === step ? 'border-2 border-gm-accent' : 'border border-gm-track')}>
              {i < step && <Check size={14} strokeWidth={3} />}
              {i === step && <span className="size-2 animate-pulse rounded-full bg-gm-primary" />}
            </span>
            {s}
          </li>
        ))}
      </ol>
      <Button variant="outline" size="md" className="mt-8 w-full" onClick={onCancel}><X size={16} /> Cancelar</Button>
    </section>
  )
}

/* ---------------- 3. Encontramos → confirmar ---------------- */
function Review({ result, file, cardId, onRestart }: { result: InvoiceResult; file?: File; cardId: string; onRestart: () => void }) {
  const fmt = useMoney()
  const { state, dispatch } = useStore()
  const nav = useNav()
  const [off, setOff] = useState<Set<string>>(new Set())
  const card = state.cards.find((c) => c.id === cardId)
  const subs = result.items.filter((i) => i.isSubscription)
  const buys = result.items.filter((i) => !i.isSubscription)
  const chosen = result.items.filter((i) => !off.has(i.id))
  const chosenTotal = chosen.reduce((a, i) => a + i.amount, 0)
  const toggle = (id: string) => setOff((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const byCat = new Map<string, number>()
  result.items.forEach((i) => byCat.set(i.category, (byCat.get(i.category) ?? 0) + i.amount))
  const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1])

  const confirm = () => {
    dispatch({ type: 'importInvoice', items: chosen, cardId, total: chosenTotal, fileName: result.fileName, file })
    nav.toast(`${chosen.length} lançamentos adicionados · desfaça em Cartões`)
    nav.go('home')
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
      <div className="space-y-5 lg:col-span-5">
        <section className="rounded-hero bg-hero p-6 text-gm-on md:p-7">
          <p className="kicker opacity-60">Encontramos · {card?.nickname}</p>
          <p className="mt-3 text-[46px] font-bold leading-none num">{fmt(result.total)}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[18px] bg-gm-on/10 p-4"><p className="text-[28px] font-bold leading-none num">{result.items.length}</p><p className="mt-1 text-[13px] font-medium opacity-70">compras</p></div>
            <div className="rounded-[18px] bg-gm-on/10 p-4"><p className="text-[28px] font-bold leading-none num">{subs.length}</p><p className="mt-1 text-[13px] font-medium opacity-70">assinaturas</p></div>
          </div>
          <p className="mt-4 truncate font-mono text-[12px] opacity-60">{result.fileName}</p>
        </section>

        <section className="rounded-hero bg-gm-surface shadow-soft p-6">
          <Kicker>Por categoria</Kicker>
          <ul className="mt-4 space-y-3">
            {cats.map(([c, v]) => (
              <li key={c}>
                <div className="flex justify-between text-[14px]"><span className="text-gm-secondary">{CATEGORIES[c as keyof typeof CATEGORIES].label}</span><span className="font-bold num">{fmt(v)}</span></div>
                <Bar value={(v / result.total) * 100} height={4} tone={c === 'assinaturas' ? 'lilac' : 'primary'} className="mt-1.5" />
              </li>
            ))}
          </ul>
        </section>

        <div className="hidden space-y-3 lg:block">
          <Button className="w-full" disabled={!chosen.length} onClick={confirm}>Confirmar {chosen.length} lançamentos</Button>
          <Button variant="secondary" className="w-full" onClick={onRestart}>Enviar outra fatura</Button>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-7">
        <section>
          <div className="mb-3 flex items-center gap-2"><Repeat size={16} className="text-gm-lilac" /><h2 className="text-[18px] font-bold">Assinaturas</h2><span className="text-[14px] text-gm-muted">· {fmt(subs.reduce((a, i) => a + i.amount, 0))}/mês</span></div>
          <ItemList items={subs} off={off} toggle={toggle} />
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-bold">Compras <span className="text-[14px] font-normal text-gm-muted">· {buys.length}</span></h2>
            <button className="cursor-pointer text-[14px] font-medium text-gm-accent hover:underline" onClick={() => setOff(off.size ? new Set() : new Set(result.items.map((i) => i.id)))}>
              {off.size ? 'Marcar todas' : 'Desmarcar todas'}
            </button>
          </div>
          <ItemList items={buys} off={off} toggle={toggle} />
        </section>
      </div>

      {/* barra fixa de confirmação no mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gm-border bg-gm-bg/95 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-[720px] items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-gm-secondary">{chosen.length} de {result.items.length} selecionados</p>
            <p className="text-[18px] font-bold num">{fmt(chosenTotal)}</p>
          </div>
          <Button disabled={!chosen.length} onClick={confirm}>Confirmar</Button>
        </div>
      </div>
    </div>
  )
}

function ItemList({ items, off, toggle }: { items: InvoiceResult['items']; off: Set<string>; toggle: (id: string) => void }) {
  const fmt = useMoney()
  return (
    <ul className="overflow-hidden rounded-hero bg-gm-surface shadow-soft">
      {items.map((i, n) => {
        const on = !off.has(i.id)
        return (
          <li key={i.id} className={cx(n > 0 && 'border-t border-gm-border')}>
            <label className={cx('flex cursor-pointer items-center gap-3.5 px-4 py-3 transition hover:bg-gm-elevated', !on && 'opacity-45')}>
              <input type="checkbox" checked={on} onChange={() => toggle(i.id)} className="peer sr-only" />
              <span aria-hidden className={cx('grid size-6 shrink-0 place-items-center rounded-[8px] border transition peer-focus-visible:outline-2 peer-focus-visible:outline-gm-accent', on ? 'border-gm-accent bg-gm-primary text-gm-on-primary' : 'border-gm-track')}>
                {on && <Check size={14} strokeWidth={3} />}
              </span>
              <CategoryIcon category={i.category} className="size-10" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold">{i.name}</span>
                <span className="block text-[12px] text-gm-secondary">{CATEGORIES[i.category].label} · {relativeDay(i.date)}</span>
              </span>
              <span className="text-[15px] font-bold num">−{fmt(i.amount)}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
