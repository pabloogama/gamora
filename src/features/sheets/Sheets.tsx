import { useState } from 'react'
import { LogOut, Moon, Pencil, RotateCcw, Sun, Trash2 } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { CATEGORIES, type Card, type CategoryId, type Goal, type Transaction } from '@/types/finance'
import { maskMoney, parseMoney, pct, relativeDay, toISODate, uid } from '@/lib/format'
import { useNav, type SheetState } from '@/app/navigation'
import { useStore } from '@/store'
import { auth } from '@/services/auth'
import { Avatar, Bar, Button, Chips, CategoryIcon, Field, inputCls, MethodIcon, MoneyInput, Sheet, cx } from '@/components/ui'
import { useMethodLabel } from '@/components/finance'
import { toMonthInput } from '@/lib/goals'
import { useMoney } from '@/hooks/useMoney'

const toMask = (n: number) => (n ? maskMoney(Math.round(n * 100).toString()) : '')
const CAT_OPTS = (Object.keys(CATEGORIES) as CategoryId[]).map((id) => ({ id, label: CATEGORIES[id].label }))

export function SheetHost({ sheet }: { sheet: SheetState }) {
  switch (sheet.kind) {
    case 'add': return <AddExpense tx={sheet.tx} />
    case 'tx': return <TxDetail id={sheet.id} />
    case 'card': return <CardForm card={sheet.card} />
    case 'deposit': return <Deposit goalId={sheet.goalId} preset={sheet.amount} />
    case 'goal': return <GoalForm goal={sheet.goal} />
    case 'budget': return <BudgetForm category={sheet.category} />
    case 'account': return <Account />
  }
}

/* ---------- Adicionar / editar gasto — núcleo do estágio 1 ---------- */
function AddExpense({ tx }: { tx?: Transaction }) {
  const fmt = useMoney()
  const { state, dispatch } = useStore()
  const nav = useNav()
  const [value, setValue] = useState(toMask(tx?.amount ?? 0))
  const [name, setName] = useState(tx?.name ?? '')
  const [category, setCategory] = useState<CategoryId>(tx?.category ?? 'alimentacao')
  const [method, setMethod] = useState(tx?.method ?? state.cards[0]?.id ?? 'pix')
  const [date, setDate] = useState(tx?.date ?? toISODate(new Date()))
  const [tried, setTried] = useState(false)
  const amount = parseMoney(value)
  const invalid = !(amount > 0)

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (invalid || !date) return
    dispatch({ type: 'saveTx', tx: { id: tx?.id ?? uid(), name: name.trim() || CATEGORIES[category].label, category, method, date, amount } })
    nav.close()
    nav.toast(tx ? 'Gasto atualizado' : `Gasto de ${fmt(amount)} salvo`)
  }

  const methods = [
    ...state.cards.map((c) => ({ id: c.id, label: c.nickname, icon: <MethodIcon method={c.id} /> })),
    { id: 'pix', label: 'Pix', icon: <MethodIcon method="pix" /> },
    { id: 'dinheiro', label: 'Dinheiro', icon: <MethodIcon method="dinheiro" /> },
  ]

  return (
    <Sheet title={tx ? 'Editar gasto' : 'Adicionar gasto'} kicker="Novo lançamento" onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        <Field label="Valor da compra" error={tried && invalid ? 'Digite um valor maior que zero.' : undefined}>
          <MoneyInput big value={value} onChange={(v) => setValue(maskMoney(v))} invalid={tried && invalid} autoFocus label="Valor da compra" />
        </Field>
        <Field label="Descrição" hint="Opcional. Ex.: Mercado, Uber, Netflix">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={CATEGORIES[category].label} maxLength={40} />
        </Field>
        <Field label="Categoria"><Chips label="Categoria" value={category} onChange={setCategory} options={CAT_OPTS} /></Field>
        <Field label="Pagamento"><Chips label="Pagamento" value={method} onChange={setMethod} options={methods} /></Field>
        <Field label="Data" error={tried && !date ? 'Escolha a data.' : undefined}>
          <input type="date" className={cx(inputCls, '[color-scheme:dark]')} value={date} max={toISODate(new Date())} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Button type="submit" className="w-full">Salvar</Button>
      </form>
    </Sheet>
  )
}

/* ---------- Detalhe da compra ---------- */
function TxDetail({ id }: { id: string }) {
  const fmt = useMoney()
  const { state, dispatch } = useStore()
  const nav = useNav()
  const methodLabel = useMethodLabel()
  const [confirm, setConfirm] = useState(false)
  const tx = state.transactions.find((t) => t.id === id)
  if (!tx) return null
  const rows: [string, string][] = [
    ['Categoria', CATEGORIES[tx.category].label],
    ['Pagamento', methodLabel(tx.method)],
    ['Data', `${relativeDay(tx.date)} · ${tx.date.split('-').reverse().join('/')}`],
  ]
  return (
    <Sheet title={tx.name} kicker="Detalhe da compra" onClose={nav.close}>
      <div className="flex items-center gap-4">
        <CategoryIcon category={tx.category} className="size-14" />
        <p className="text-[40px] font-bold leading-none num">−{fmt(tx.amount)}</p>
      </div>
      <dl className="mt-6 divide-y divide-gm-border rounded-tile bg-gm-surface shadow-soft px-5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-4 text-[15px]"><dt className="text-gm-secondary">{k}</dt><dd className="font-bold">{v}</dd></div>
        ))}
      </dl>
      {confirm ? (
        <div className="mt-6 rounded-tile border border-gm-track p-5">
          <p className="text-[16px] font-bold">Apagar este gasto?</p>
          <p className="mt-1 text-[14px] text-gm-secondary">O saldo e o mês voltam a como estavam antes dele.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="secondary" size="md" onClick={() => setConfirm(false)}>Cancelar</Button>
            <Button variant="primary" size="md" onClick={() => { dispatch({ type: 'deleteTx', id: tx.id }); nav.close(); nav.toast('Gasto apagado') }}>Apagar</Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => setConfirm(true)}><Trash2 size={18} /> Apagar</Button>
          <Button onClick={() => nav.open({ kind: 'add', tx })}><Pencil size={18} /> Editar</Button>
        </div>
      )}
    </Sheet>
  )
}

/* ---------- Novo / editar cartão ---------- */
function CardForm({ card }: { card?: Card }) {
  const { dispatch } = useStore()
  const nav = useNav()
  const [nickname, setNickname] = useState(card?.nickname ?? '')
  const [last4, setLast4] = useState(card?.last4 ?? '')
  const [limit, setLimit] = useState(toMask(card?.limit ?? 0))
  const [invoice, setInvoice] = useState(toMask(card?.invoice ?? 0))
  const [due, setDue] = useState(String(card?.dueInDays ?? 10))
  const [color, setColor] = useState<Card['color']>(card?.color ?? 'lilac')
  const [tried, setTried] = useState(false)
  const errs = {
    nickname: !nickname.trim() ? 'Dê um apelido ao cartão.' : '',
    last4: !/^\d{4}$/.test(last4) ? 'Os 4 últimos números.' : '',
    limit: !(parseMoney(limit) > 0) ? 'Digite o limite.' : '',
  }
  const ok = !errs.nickname && !errs.last4 && !errs.limit
  const save = (e: React.FormEvent) => {
    e.preventDefault(); setTried(true)
    if (!ok) return
    dispatch({ type: 'saveCard', card: { id: card?.id ?? uid(), nickname: nickname.trim(), last4, limit: parseMoney(limit), invoice: parseMoney(invoice) || 0, dueInDays: Math.max(0, Number(due) || 0), color } })
    nav.close(); nav.toast(card ? 'Cartão atualizado' : 'Cartão adicionado')
  }
  return (
    <Sheet title={card ? 'Editar cartão' : 'Novo cartão'} kicker="Carteira" onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        <Field label="Apelido" error={tried ? errs.nickname : undefined}><input className={inputCls} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Principal, Viagem…" maxLength={20} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Final" error={tried ? errs.last4 : undefined}><input className={cx(inputCls, 'font-mono')} inputMode="numeric" value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="0000" /></Field>
          <Field label="Vence em (dias)"><input className={inputCls} inputMode="numeric" value={due} onChange={(e) => setDue(e.target.value.replace(/\D/g, '').slice(0, 2))} /></Field>
        </div>
        <Field label="Limite" error={tried ? errs.limit : undefined}><MoneyInput value={limit} onChange={(v) => setLimit(maskMoney(v))} label="Limite" invalid={tried && !!errs.limit} /></Field>
        <Field label="Fatura atual" hint="Digite o valor da fatura que já está aberta."><MoneyInput value={invoice} onChange={(v) => setInvoice(maskMoney(v))} label="Fatura atual" /></Field>
        <Field label="Cor">
          <Chips label="Cor" value={color} onChange={setColor} options={[{ id: 'lilac', label: 'Lilás' }, { id: 'gradient', label: 'Gradiente' }, { id: 'offwhite', label: 'Off-white' }]} />
        </Field>
        <Button type="submit" className="w-full">Salvar cartão</Button>
      </form>
      {card && <DangerZone
        label="Apagar cartão" question={`Apagar o cartão ${card.nickname}?`}
        detail="As compras feitas nele continuam no histórico."
        onConfirm={() => { dispatch({ type: 'deleteCard', id: card.id }); nav.close(); nav.toast('Cartão apagado') }}
      />}
    </Sheet>
  )
}

/* ---------- Guardar valor na meta ---------- */
function Deposit({ goalId, preset }: { goalId: string; preset?: number }) {
  const fmt = useMoney()
  const { state, dispatch, d } = useStore()
  const nav = useNav()
  const goal = state.goals.find((g) => g.id === goalId)
  const [value, setValue] = useState(toMask(preset ?? 0))
  const [tried, setTried] = useState(false)
  if (!goal) return null
  const amount = parseMoney(value)
  const err = !(amount > 0) ? 'Digite quanto quer guardar.' : amount > d.balance ? 'Maior que o seu saldo.' : ''
  const after = goal.saved + (amount > 0 ? amount : 0)
  const save = (e: React.FormEvent) => {
    e.preventDefault(); setTried(true)
    if (err) return
    dispatch({ type: 'deposit', goalId, amount })
    nav.close(); nav.toast(`${fmt(amount, true)} guardados em ${goal.name}`)
  }
  return (
    <Sheet title={goal.name} kicker="Guardar valor" onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        <Field label="Quanto você guardou?" error={tried ? err : undefined}>
          <MoneyInput big autoFocus value={value} onChange={(v) => setValue(maskMoney(v))} invalid={tried && !!err} label="Quanto você guardou" />
        </Field>
        <Chips label="Valores rápidos" value={String(amount)} onChange={(v) => setValue(toMask(Number(v)))} options={[100, 250, 500, 1000].map((n) => ({ id: String(n), label: fmt(n, true) }))} />
        <div className="rounded-tile bg-gm-surface shadow-soft p-5">
          <div className="flex justify-between text-[14px]"><span className="text-gm-secondary">Depois de guardar</span><span className="font-bold num">{pct(after, goal.target)}%</span></div>
          <Bar value={pct(after, goal.target)} height={6} className="mt-3" />
          <p className="mt-2 text-[12px] text-gm-muted num">{fmt(after, true)} de {fmt(goal.target, true)} · sai do seu saldo</p>
        </div>
        <Button type="submit" className="w-full">Guardar{amount > 0 ? ` ${fmt(amount, true)}` : ''}</Button>
      </form>
    </Sheet>
  )
}

/* ---------- Nova / editar meta ---------- */
function GoalForm({ goal }: { goal?: Goal }) {
  const { dispatch } = useStore()
  const nav = useNav()
  const [name, setName] = useState(goal?.name ?? '')
  const [target, setTarget] = useState(toMask(goal?.target ?? 0))
  const [saved, setSaved] = useState(toMask(goal?.saved ?? 0))
  const [date, setDate] = useState(toMonthInput(goal?.date))
  const [tried, setTried] = useState(false)
  const errs = { name: !name.trim() ? 'Dê um nome à meta.' : '', target: !(parseMoney(target) > 0) ? 'Digite o valor alvo.' : '' }
  const save = (e: React.FormEvent) => {
    e.preventDefault(); setTried(true)
    if (errs.name || errs.target) return
    dispatch({ type: 'saveGoal', goal: { id: goal?.id ?? uid(), name: name.trim(), target: parseMoney(target), saved: parseMoney(saved) || 0, date: date.trim() || undefined } })
    nav.close(); nav.toast(goal ? 'Meta atualizada' : 'Meta criada')
  }
  return (
    <Sheet title={goal ? 'Editar meta' : 'Nova meta'} kicker="Guardando" onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        <Field label="Nome" error={tried ? errs.name : undefined}><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Viagem, Reserva, Curso…" maxLength={30} /></Field>
        <Field label="Valor alvo" error={tried ? errs.target : undefined}><MoneyInput value={target} onChange={(v) => setTarget(maskMoney(v))} label="Valor alvo" invalid={tried && !!errs.target} /></Field>
        <Field label="Já guardado"><MoneyInput value={saved} onChange={(v) => setSaved(maskMoney(v))} label="Já guardado" /></Field>
        <Field label="Quando?" hint="Opcional. Mês e ano em que você quer chegar lá."><input type="month" className={cx(inputCls, '[color-scheme:dark]')} value={date} min={toISODate(new Date()).slice(0, 7)} onChange={(e) => setDate(e.target.value)} /></Field>
        <Button type="submit" className="w-full">Salvar meta</Button>
      </form>
      {goal && <DangerZone
        label="Apagar meta" question={`Apagar ${goal.name}?`}
        detail="O saldo não muda. Só a meta sai da lista."
        onConfirm={() => { dispatch({ type: 'deleteGoal', id: goal.id }); nav.close(); nav.toast('Meta apagada') }}
      />}
    </Sheet>
  )
}

/* ---------- Ajustar teto (categoria ou mês inteiro) ---------- */
function BudgetForm({ category }: { category: CategoryId | 'cap' | 'new' }) {
  const fmt = useMoney()
  const { state, dispatch, d } = useStore()
  const nav = useNav()
  const free = CAT_OPTS.filter((o) => !state.budgets.some((b) => b.category === o.id))
  const [cat, setCat] = useState<CategoryId>(category === 'new' ? (free[0]?.id ?? 'outros') : category === 'cap' ? 'outros' : category)
  const isCap = category === 'cap'
  const isNew = category === 'new'
  const current = isCap ? state.monthCap : state.budgets.find((b) => b.category === cat)?.limit ?? 0
  const spent = isCap ? d.monthTotal : d.spentIn(cat)
  const [value, setValue] = useState(toMask(current))
  const [tried, setTried] = useState(false)
  const amount = parseMoney(value)
  const err = !(amount > 0) ? 'Digite o teto.' : ''
  const save = (e: React.FormEvent) => {
    e.preventDefault(); setTried(true)
    if (err) return
    dispatch(isCap ? { type: 'setCap', amount } : { type: 'setBudget', budget: { category: cat, limit: amount } })
    nav.close(); nav.toast(isNew ? 'Teto criado' : 'Teto atualizado')
  }
  return (
    <Sheet title={isCap ? 'Teto do mês' : isNew ? 'Novo teto' : CATEGORIES[cat].label} kicker={isNew ? 'Teto por categoria' : 'Ajustar teto'} onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        {isNew && <Field label="Categoria"><Chips label="Categoria" value={cat} onChange={setCat} options={free} /></Field>}
        <p className="text-[15px] text-gm-secondary">Você já gastou <b className="text-gm-text num">{fmt(spent)}</b> {isCap ? 'este mês' : 'nesta categoria este mês'}.</p>
        <Field label="Teto" error={tried ? err : undefined}><MoneyInput big autoFocus value={value} onChange={(v) => setValue(maskMoney(v))} invalid={tried && !!err} label="Teto" /></Field>
        {amount > 0 && <><Bar value={pct(spent, amount)} height={6} /><p className="text-[13px] text-gm-muted">{pct(spent, amount)}% usado com esse teto</p></>}
        <Button type="submit" className="w-full">Salvar teto</Button>
      </form>
    </Sheet>
  )
}

/* ---------- Conta ---------- */
function Account() {
  const { state, dispatch } = useStore()
  const { theme, setTheme } = useTheme()
  const nav = useNav()
  const [confirm, setConfirm] = useState(false)
  if (!state.user) return null
  return (
    <Sheet title="Conta" kicker="Gamora" onClose={nav.close}>
      <div className="flex items-center gap-4">
        <Avatar name={state.user.name} size={60} />
        <div>
          <p className="text-[20px] font-bold">{state.user.name}</p>
          <p className="text-[14px] text-gm-secondary">{state.user.email}</p>
        </div>
      </div>
      <div className="mt-6 divide-y divide-gm-border rounded-tile bg-gm-surface shadow-soft">
        <label className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
          <span className="text-[15px] font-medium">Ocultar valores</span>
          <input type="checkbox" role="switch" checked={state.hideBalance} onChange={() => dispatch({ type: 'toggleBalance' })} className="peer sr-only" />
          <span aria-hidden className={cx('relative h-7 w-12 rounded-full transition peer-focus-visible:outline-2 peer-focus-visible:outline-gm-accent', state.hideBalance ? 'bg-gm-primary' : 'bg-gm-track')}>
            <span className={cx('absolute top-1 size-5 rounded-full transition-all', state.hideBalance ? 'left-6 bg-gm-on-primary' : 'left-1 bg-gm-surface')} />
          </span>
        </label>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <span className="text-[15px] font-medium">Tema</span>
          <Chips label="Tema" value={theme} onChange={setTheme} options={[{ id: 'light', label: 'Claro', icon: <Sun size={15} /> }, { id: 'dark', label: 'Escuro', icon: <Moon size={15} /> }]} />
        </div>
        <button onClick={() => { dispatch({ type: 'reset' }); nav.close(); nav.toast('Dados de exemplo restaurados') }} className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left text-[15px] font-medium hover:bg-gm-elevated">
          <RotateCcw size={18} className="text-gm-secondary" /> Restaurar dados de exemplo
        </button>
      </div>
      {confirm ? (
        <div className="mt-6 rounded-tile border border-gm-track p-5">
          <p className="text-[16px] font-bold">Deseja sair?</p>
          <p className="mt-1 text-[14px] text-gm-secondary">Seus lançamentos continuam salvos neste aparelho.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="secondary" size="md" onClick={() => setConfirm(false)}>Cancelar</Button>
            <Button variant="primary" size="md" onClick={async () => { nav.close(); await auth.signOut(); dispatch({ type: 'logout' }) }}>Sair</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="mt-6 w-full" onClick={() => setConfirm(true)}><LogOut size={18} /> Sair</Button>
      )}
    </Sheet>
  )
}

/** Ação destrutiva com confirmação dentro da folha (o viewer/app não usa confirm()). */
function DangerZone({ label, question, detail, onConfirm }: { label: string; question: string; detail: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false)
  return open ? (
    <div className="mt-4 rounded-tile border border-gm-track p-5">
      <p className="text-[16px] font-bold">{question}</p>
      <p className="mt-1 text-[14px] text-gm-secondary">{detail}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="md" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={onConfirm}>Apagar</Button>
      </div>
    </div>
  ) : (
    <Button variant="outline" className="mt-3 w-full" onClick={() => setOpen(true)}><Trash2 size={18} /> {label}</Button>
  )
}
