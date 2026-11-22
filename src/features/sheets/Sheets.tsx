import { useState } from 'react'
import { Camera, ChevronRight, FileText, KeyRound, LogOut, Moon, Pencil, Plus, RotateCcw, Sun, Trash2, UserPen, UserX, Wallet } from 'lucide-react'
import { firstName, squareImage } from '@/lib/image'
import { AuthError } from '@/services/auth'
import { repository } from '@/store'
import { useTheme } from '@/hooks/useTheme'
import { CATEGORIES, type Card, type CategoryId, type Goal, type GoalDeposit, type Transaction } from '@/types/finance'
import { maskMoney, parseMoney, pct, relativeDay, toISODate, uid } from '@/lib/format'
import { useNav, type SheetState } from '@/app/navigation'
import { useStore } from '@/store'
import { auth } from '@/services/auth'
import { Avatar, Bar, Button, Chips, CategoryIcon, Field, inputCls, MethodIcon, MoneyInput, Ring, Sheet, cx } from '@/components/ui'
import { useMethodLabel } from '@/components/finance'
import { DEMO_ACCOUNT } from '@/data/mocks'
import { formatGoalDate, toMonthInput } from '@/lib/goals'
import { dueLabel } from '@/lib/cards'
import { useMoney } from '@/hooks/useMoney'

const toMask = (n: number) => (n ? maskMoney(Math.round(n * 100).toString()) : '')
const CAT_OPTS = (Object.keys(CATEGORIES) as CategoryId[]).map((id) => ({ id, label: CATEGORIES[id].label }))

export function SheetHost({ sheet }: { sheet: SheetState }) {
  switch (sheet.kind) {
    case 'add': return <AddExpense tx={sheet.tx} />
    case 'tx': return <TxDetail id={sheet.id} />
    case 'card': return <CardForm card={sheet.card} />
    case 'deposit': return <Deposit goalId={sheet.goalId} preset={sheet.amount} deposit={sheet.deposit} />
    case 'goal': return <GoalForm goal={sheet.goal} />
    case 'goalDetail': return <GoalDetail goalId={sheet.goalId} />
    case 'import': return <ImportDetail id={sheet.id} />
    case 'budget': return <BudgetForm category={sheet.category} />
    case 'account': return <Account />
    case 'profile': return <ProfileForm />
    case 'balance': return <BalanceForm />
    case 'password': return <PasswordForm />
    case 'deleteAccount': return <DeleteAccount />
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
          <input type="date" className={inputCls} value={date} max={toISODate(new Date())} onChange={(e) => setDate(e.target.value)} />
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
  const imp = tx.importId ? state.imports.find((i) => i.id === tx.importId) : undefined
  const rows: [string, string][] = [
    ['Categoria', CATEGORIES[tx.category].label],
    ['Pagamento', methodLabel(tx.method)],
    ['Data', `${relativeDay(tx.date)} · ${tx.date.split('-').reverse().join('/')}`],
    ['Origem', tx.source === 'invoice' ? `Fatura${imp ? ` · ${imp.fileName}` : ''}` : 'Digitado por você'],
    ...(tx.isSubscription ? [['Tipo', 'Assinatura'] as [string, string]] : []),
  ]
  return (
    <Sheet title={tx.name} kicker="Detalhe da compra" onClose={nav.close}>
      <div className="flex items-center gap-4">
        <CategoryIcon category={tx.category} className="size-14" />
        <p className="text-[40px] font-bold leading-none num">−{fmt(tx.amount)}</p>
      </div>
      <dl className="mt-6 divide-y divide-gm-border rounded-tile bg-gm-surface shadow-soft px-5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-4 text-[15px]"><dt className="shrink-0 text-gm-secondary">{k}</dt><dd className="min-w-0 truncate text-right font-bold">{v}</dd></div>
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
  const [due, setDue] = useState(String(card?.dueDay ?? 10))
  const [color, setColor] = useState<Card['color']>(card?.color ?? 'lilac')
  const [tried, setTried] = useState(false)
  const errs = {
    nickname: !nickname.trim() ? 'Dê um apelido ao cartão.' : '',
    last4: !/^\d{4}$/.test(last4) ? 'Os 4 últimos números.' : '',
    limit: !(parseMoney(limit) > 0) ? 'Digite o limite.' : '',
    due: !(Number(due) >= 1 && Number(due) <= 31) ? 'Um dia de 1 a 31.' : '',
  }
  const ok = !errs.nickname && !errs.last4 && !errs.limit && !errs.due
  const save = (e: React.FormEvent) => {
    e.preventDefault(); setTried(true)
    if (!ok) return
    dispatch({ type: 'saveCard', card: { id: card?.id ?? uid(), nickname: nickname.trim(), last4, limit: parseMoney(limit), invoice: parseMoney(invoice) || 0, dueDay: Number(due), color } })
    nav.close(); nav.toast(card ? 'Cartão atualizado' : 'Cartão adicionado')
  }
  return (
    <Sheet title={card ? 'Editar cartão' : 'Novo cartão'} kicker="Carteira" onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        <Field label="Apelido" error={tried ? errs.nickname : undefined}><input className={inputCls} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Principal, Viagem…" maxLength={20} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Final" error={tried ? errs.last4 : undefined}><input className={cx(inputCls, 'font-mono')} inputMode="numeric" value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="0000" /></Field>
          <Field label="Dia do vencimento" error={tried ? errs.due : undefined} hint={!errs.due ? `Vence ${dueLabel({ dueDay: Number(due) })}` : undefined}><input id="card-due" className={inputCls} inputMode="numeric" value={due} onChange={(e) => setDue(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="10" /></Field>
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

/* ---------- Guardar valor na meta (criar ou editar um depósito) ---------- */
function Deposit({ goalId, preset, deposit }: { goalId: string; preset?: number; deposit?: GoalDeposit }) {
  const fmt = useMoney()
  const { state, dispatch, d } = useStore()
  const nav = useNav()
  const goal = state.goals.find((g) => g.id === goalId)
  const [value, setValue] = useState(toMask(deposit?.amount ?? preset ?? 0))
  const [date, setDate] = useState(deposit?.date ?? toISODate(new Date()))
  const [note, setNote] = useState(deposit?.note ?? '')
  const [tried, setTried] = useState(false)
  if (!goal) return null
  const amount = parseMoney(value)
  // ao editar, o valor antigo volta para o saldo antes de conferir
  const available = d.balance + (deposit?.amount ?? 0)
  const err = !(amount > 0) ? 'Digite quanto quer guardar.' : amount > available ? 'Maior que o seu saldo.' : ''
  const after = goal.saved - (deposit?.amount ?? 0) + (amount > 0 ? amount : 0)
  const back = () => nav.open({ kind: 'goalDetail', goalId })
  const save = (e: React.FormEvent) => {
    e.preventDefault(); setTried(true)
    if (err || !date) return
    dispatch({ type: 'saveDeposit', deposit: { id: deposit?.id ?? uid(), goalId, amount, date, note: note.trim() || undefined } })
    if (deposit) { back(); nav.toast('Depósito atualizado') } else { nav.close(); nav.toast(`${fmt(amount, true)} guardados em ${goal.name}`) }
  }
  return (
    <Sheet title={goal.name} kicker={deposit ? 'Editar depósito' : 'Guardar valor'} onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        <Field label="Quanto você guardou?" error={tried ? err : undefined}>
          <MoneyInput big autoFocus value={value} onChange={(v) => setValue(maskMoney(v))} invalid={tried && !!err} label="Quanto você guardou" />
        </Field>
        {!deposit && <Chips label="Valores rápidos" value={String(amount)} onChange={(v) => setValue(toMask(Number(v)))} options={[100, 250, 500, 1000].map((n) => ({ id: String(n), label: fmt(n, true) }))} />}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data" error={tried && !date ? 'Escolha a data.' : undefined}>
            <input id="deposit-date" type="date" className={inputCls} value={date} max={toISODate(new Date())} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Observação"><input id="deposit-note" className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional" maxLength={40} /></Field>
        </div>
        <div className="rounded-tile bg-gm-surface shadow-soft p-5">
          <div className="flex justify-between text-[14px]"><span className="text-gm-secondary">Depois de guardar</span><span className="font-bold num">{pct(after, goal.target)}%</span></div>
          <Bar value={pct(after, goal.target)} height={6} className="mt-3" />
          <p className="mt-2 text-[12px] text-gm-muted num">{fmt(after, true)} de {fmt(goal.target, true)} · sai do seu saldo</p>
        </div>
        <Button type="submit" className="w-full">{deposit ? 'Salvar depósito' : `Guardar${amount > 0 ? ` ${fmt(amount, true)}` : ''}`}</Button>
      </form>
      {deposit && <DangerZone
        label="Apagar depósito" question={`Apagar o depósito de ${fmt(deposit.amount, true)}?`}
        detail="O valor sai da meta e volta para o seu saldo."
        onConfirm={() => { dispatch({ type: 'deleteDeposit', id: deposit.id }); back(); nav.toast('Depósito apagado') }}
      />}
    </Sheet>
  )
}

/* ---------- Detalhe da meta: progresso + histórico de depósitos ---------- */
function GoalDetail({ goalId }: { goalId: string }) {
  const fmt = useMoney()
  const { state } = useStore()
  const nav = useNav()
  const goal = state.goals.find((g) => g.id === goalId)
  if (!goal) return null
  const p = pct(goal.saved, goal.target)
  const left = Math.max(0, goal.target - goal.saved)
  const deposits = state.deposits.filter((x) => x.goalId === goalId).sort((a, b) => b.date.localeCompare(a.date))
  const viaApp = deposits.reduce((a, x) => a + x.amount, 0)
  return (
    <Sheet title={goal.name} kicker={goal.date ? `Meta · ${formatGoalDate(goal.date)}` : 'Meta'} onClose={nav.close}>
      <div className="flex items-center gap-5">
        <Ring value={p} size={96}><span className="text-[22px] font-bold num">{p}%</span></Ring>
        <div className="min-w-0">
          <p className="text-[32px] font-bold leading-none num">{fmt(goal.saved, true)}</p>
          <p className="mt-1 text-[14px] text-gm-secondary num">de {fmt(goal.target, true)}{left > 0 ? ` · faltam ${fmt(left, true)}` : ' · meta batida'}</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-tile bg-gm-surface p-4 shadow-soft"><dt className="text-[12px] text-gm-secondary">Já tinha guardado</dt><dd className="mt-1 text-[18px] font-bold num">{fmt(goal.initialSaved, true)}</dd></div>
        <div className="rounded-tile bg-gm-surface p-4 shadow-soft"><dt className="text-[12px] text-gm-secondary">Guardado pelo app</dt><dd className="mt-1 text-[18px] font-bold num">{fmt(viaApp, true)}</dd></div>
      </dl>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="md" onClick={() => nav.open({ kind: 'goal', goal })}><Pencil size={17} /> Editar meta</Button>
        <Button size="md" onClick={() => nav.open({ kind: 'deposit', goalId })}><Plus size={17} /> Guardar</Button>
      </div>

      <h3 className="mt-7 text-[16px] font-bold">Depósitos <span className="font-normal text-gm-muted">· {deposits.length}</span></h3>
      {deposits.length ? (
        <ul className="mt-3 overflow-hidden rounded-tile bg-gm-surface shadow-soft" aria-label="Depósitos da meta">
          {deposits.map((x, i) => (
            <li key={x.id} className={cx(i > 0 && 'border-t border-gm-border')}>
              <button onClick={() => nav.open({ kind: 'deposit', goalId, deposit: x })} className="flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 text-left transition hover:bg-gm-elevated" aria-label={`Editar depósito de ${fmt(x.amount, true)}`}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold num">+{fmt(x.amount, true)}</span>
                  <span className="block truncate text-[12px] text-gm-secondary">{relativeDay(x.date)}{x.note ? ` · ${x.note}` : ''}</span>
                </span>
                <ChevronRight size={18} className="text-gm-muted" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-tile border border-dashed border-gm-track px-5 py-5 text-center text-[14px] text-gm-secondary">Nenhum depósito ainda. Toque em Guardar.</p>
      )}
    </Sheet>
  )
}

/* ---------- Nova / editar meta ---------- */
function GoalForm({ goal }: { goal?: Goal }) {
  const fmt = useMoney()
  const { state, dispatch } = useStore()
  const nav = useNav()
  const [name, setName] = useState(goal?.name ?? '')
  const [target, setTarget] = useState(toMask(goal?.target ?? 0))
  const [initial, setInitial] = useState(toMask(goal?.initialSaved ?? 0))
  const [date, setDate] = useState(toMonthInput(goal?.date))
  const [tried, setTried] = useState(false)
  const viaApp = goal ? state.deposits.filter((x) => x.goalId === goal.id).reduce((a, x) => a + x.amount, 0) : 0
  const errs = { name: !name.trim() ? 'Dê um nome à meta.' : '', target: !(parseMoney(target) > 0) ? 'Digite o valor alvo.' : '' }
  const save = (e: React.FormEvent) => {
    e.preventDefault(); setTried(true)
    if (errs.name || errs.target) return
    const initialSaved = parseMoney(initial) || 0
    const id = goal?.id ?? uid()
    dispatch({ type: 'saveGoal', goal: { id, name: name.trim(), target: parseMoney(target), initialSaved, saved: initialSaved + viaApp, date: date.trim() || undefined } })
    if (goal) { nav.open({ kind: 'goalDetail', goalId: id }); nav.toast('Meta atualizada') } else { nav.close(); nav.toast('Meta criada') }
  }
  return (
    <Sheet title={goal ? 'Editar meta' : 'Nova meta'} kicker="Guardando" onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        <Field label="Nome" error={tried ? errs.name : undefined}><input id="goal-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Viagem, Reserva, Curso…" maxLength={30} /></Field>
        <Field label="Valor alvo" error={tried ? errs.target : undefined}><MoneyInput value={target} onChange={(v) => setTarget(maskMoney(v))} label="Valor alvo" invalid={tried && !!errs.target} /></Field>
        <Field label="Já tinha guardado" hint={goal && viaApp > 0 ? `Fora do app. Os depósitos daqui (${fmt(viaApp, true)}) somam por cima.` : 'Fora do app. Não sai do seu saldo.'}>
          <MoneyInput value={initial} onChange={(v) => setInitial(maskMoney(v))} label="Já tinha guardado" />
        </Field>
        <Field label="Quando?" hint="Opcional. Mês e ano em que você quer chegar lá."><input type="month" className={inputCls} value={date} min={toISODate(new Date()).slice(0, 7)} onChange={(e) => setDate(e.target.value)} /></Field>
        <Button type="submit" className="w-full">Salvar meta</Button>
      </form>
      {goal && <DangerZone
        label="Apagar meta" question={`Apagar ${goal.name}?`}
        detail={viaApp > 0 ? `Os depósitos feitos aqui (${fmt(viaApp, true)}) voltam para o seu saldo.` : 'O saldo não muda. Só a meta sai da lista.'}
        onConfirm={() => { dispatch({ type: 'deleteGoal', id: goal.id }); nav.close(); nav.toast('Meta apagada') }}
      />}
    </Sheet>
  )
}

/* ---------- Teto: criar, ajustar ou remover (categoria ou mês inteiro) ---------- */
function BudgetForm({ category }: { category: CategoryId | 'cap' | 'new' }) {
  const fmt = useMoney()
  const { state, dispatch, d } = useStore()
  const nav = useNav()
  const free = CAT_OPTS.filter((o) => !state.budgets.some((b) => b.category === o.id))
  const [cat, setCat] = useState<CategoryId>(category === 'new' ? (free[0]?.id ?? 'outros') : category === 'cap' ? 'outros' : category)
  const isCap = category === 'cap'
  const isNew = category === 'new'
  const current = isCap ? state.monthCap : state.budgets.find((b) => b.category === cat)?.limit ?? 0
  const exists = isCap ? state.monthCap > 0 : !isNew && current > 0
  const spent = isCap ? d.monthTotal : d.spentIn(cat)
  const [value, setValue] = useState(toMask(current))
  const [tried, setTried] = useState(false)
  const amount = parseMoney(value)
  const err = !(amount > 0) ? 'Digite o teto.' : ''
  const save = (e: React.FormEvent) => {
    e.preventDefault(); setTried(true)
    if (err) return
    dispatch(isCap ? { type: 'setCap', amount } : { type: 'setBudget', budget: { category: cat, limit: amount } })
    nav.close(); nav.toast(exists ? 'Teto atualizado' : 'Teto criado')
  }
  return (
    <Sheet title={isCap ? 'Teto do mês' : isNew ? 'Novo teto' : CATEGORIES[cat].label} kicker={isNew ? 'Teto por categoria' : exists ? 'Ajustar teto' : 'Definir teto'} onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        {isNew && <Field label="Categoria"><Chips label="Categoria" value={cat} onChange={setCat} options={free} /></Field>}
        <p className="text-[15px] text-gm-secondary">Você já gastou <b className="text-gm-text num">{fmt(spent)}</b> {isCap ? 'este mês' : 'nesta categoria este mês'}.</p>
        <Field label="Teto" error={tried ? err : undefined}><MoneyInput big autoFocus value={value} onChange={(v) => setValue(maskMoney(v))} invalid={tried && !!err} label="Teto" /></Field>
        {amount > 0 && <><Bar value={pct(spent, amount)} height={6} /><p className="text-[13px] text-gm-muted">{pct(spent, amount)}% usado com esse teto</p></>}
        <Button type="submit" className="w-full">Salvar teto</Button>
      </form>
      {exists && <DangerZone
        label={isCap ? 'Remover teto do mês' : 'Remover teto'}
        question={isCap ? 'Remover o teto do mês?' : `Remover o teto de ${CATEGORIES[cat].label}?`}
        detail="Os gastos continuam. Só deixa de existir o limite."
        confirmLabel="Remover"
        onConfirm={() => { dispatch(isCap ? { type: 'setCap', amount: 0 } : { type: 'deleteBudget', category: cat }); nav.close(); nav.toast('Teto removido') }}
      />}
    </Sheet>
  )
}

/* ---------- Conta ---------- */
function Account() {
  const fmt = useMoney()
  const { state, dispatch, d } = useStore()
  const { theme, setTheme } = useTheme()
  const nav = useNav()
  const [confirm, setConfirm] = useState(false)
  const [askReset, setAskReset] = useState(false)
  if (!state.user) return null
  const isDemo = state.user.email === DEMO_ACCOUNT.email
  const reset = () => { dispatch({ type: 'reset' }); nav.close(); nav.toast(isDemo ? 'Dados de exemplo restaurados' : 'Pronto: você começou do zero') }
  const row = 'flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left text-[15px] font-medium hover:bg-gm-elevated'
  return (
    <Sheet title="Conta" kicker="Gamora" onClose={nav.close}>
      <div className="flex items-center gap-4">
        <Avatar name={state.user.name} src={state.user.avatar} size={64} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[20px] font-bold">
            <span className="truncate">{state.user.name}</span>
            {state.user.isAdmin && <span className="shrink-0 rounded-full bg-gm-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gm-on-primary">Administrador</span>}
          </p>
          <p className="truncate text-[14px] text-gm-secondary">{state.user.email}</p>
        </div>
      </div>
      <Button variant="secondary" size="md" className="mt-5 w-full" onClick={() => nav.open({ kind: 'profile' })}>
        <UserPen size={18} /> Editar perfil
      </Button>
      <div className="mt-6 divide-y divide-gm-border rounded-tile bg-gm-surface shadow-soft">
        <button onClick={() => nav.open({ kind: 'balance' })} className={row}>
          <Wallet size={18} className="text-gm-secondary" /> <span className="flex-1">Ajustar saldo</span>
          <span className="text-[14px] font-bold num">{fmt(d.balance, true)}</span><ChevronRight size={18} className="text-gm-muted" />
        </button>
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
        <button onClick={() => nav.open({ kind: 'password' })} className={row}>
          <KeyRound size={18} className="text-gm-secondary" /> <span className="flex-1">Alterar senha</span><ChevronRight size={18} className="text-gm-muted" />
        </button>
        <button onClick={() => (isDemo ? reset() : setAskReset(true))} className={row}>
          <RotateCcw size={18} className="text-gm-secondary" /> {isDemo ? 'Restaurar dados de exemplo' : 'Começar do zero'}
        </button>
      </div>
      {askReset && (
        <div className="mt-4 rounded-tile border border-gm-track p-5">
          <p className="text-[16px] font-bold">Apagar todos os seus lançamentos?</p>
          <p className="mt-1 text-[14px] text-gm-secondary">Gastos, cartões, metas, depósitos, tetos e faturas importadas saem. Seu perfil e o saldo inicial ficam. Não dá para desfazer.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="secondary" size="md" onClick={() => setAskReset(false)}>Cancelar</Button>
            <Button variant="primary" size="md" onClick={reset}>Apagar tudo</Button>
          </div>
        </div>
      )}
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
      <button onClick={() => nav.open({ kind: 'deleteAccount' })} className="mx-auto mt-4 flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium text-gm-secondary transition hover:bg-gm-row hover:text-gm-text">
        <UserX size={16} /> Excluir conta
      </button>
    </Sheet>
  )
}

/* ---------- Ajustar saldo ---------- */
function BalanceForm() {
  const fmt = useMoney()
  const { dispatch, d } = useStore()
  const nav = useNav()
  const [value, setValue] = useState(toMask(Math.max(0, d.balance)))
  const [tried, setTried] = useState(false)
  const amount = parseMoney(value)
  const err = !(amount >= 0) || value === '' ? 'Digite o saldo.' : ''
  const save = (e: React.FormEvent) => {
    e.preventDefault(); setTried(true)
    if (err) return
    dispatch({ type: 'setBalance', balance: amount })
    nav.open({ kind: 'account' }); nav.toast('Saldo ajustado')
  }
  return (
    <Sheet title="Ajustar saldo" kicker="Conta" onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        <p className="text-[15px] text-gm-secondary">Hoje o app mostra <b className="text-gm-text num">{fmt(d.balance)}</b>. Digite quanto você tem de verdade: gastos e metas continuam como estão.</p>
        <Field label="Saldo atual" error={tried ? err : undefined}><MoneyInput big autoFocus value={value} onChange={(v) => setValue(maskMoney(v))} invalid={tried && !!err} label="Saldo atual" /></Field>
        <Button type="submit" className="w-full">Salvar saldo</Button>
      </form>
    </Sheet>
  )
}

/* ---------- Alterar senha ---------- */
function PasswordForm() {
  const { state } = useStore()
  const nav = useNav()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [tried, setTried] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  if (!state.user) return null
  const errs = {
    current: !current ? 'Digite a senha atual.' : '',
    next: next.length < 6 ? 'Pelo menos 6 caracteres.' : next === current ? 'Use uma senha diferente da atual.' : '',
    again: again !== next ? 'As senhas não são iguais.' : '',
  }
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setTried(true); setError('')
    if (errs.current || errs.next || errs.again) return
    setSaving(true)
    try {
      await auth.changePassword(state.user!.email, current, next)
      nav.open({ kind: 'account' }); nav.toast('Senha alterada')
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Não foi possível alterar agora.'); setSaving(false)
    }
  }
  return (
    <Sheet title="Alterar senha" kicker="Conta" onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        {error && <p role="alert" className="rounded-control border border-gm-lilac/50 bg-gm-lilac/15 px-4 py-3 text-[14px] text-gm-text">{error}</p>}
        <Field label="Senha atual" error={tried ? errs.current : undefined}><input id="pw-current" type="password" autoComplete="current-password" className={inputCls} value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
        <Field label="Nova senha" error={tried ? errs.next : undefined} hint="Pelo menos 6 caracteres."><input id="pw-next" type="password" autoComplete="new-password" className={inputCls} value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <Field label="Repita a nova senha" error={tried ? errs.again : undefined}><input id="pw-again" type="password" autoComplete="new-password" className={inputCls} value={again} onChange={(e) => setAgain(e.target.value)} /></Field>
        <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Salvando…' : 'Alterar senha'}</Button>
      </form>
    </Sheet>
  )
}

/* ---------- Excluir conta ---------- */
function DeleteAccount() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!state.user) return null
  const counts = [
    [state.transactions.length, 'lançamentos'], [state.cards.length, 'cartões'], [state.goals.length, 'metas'],
    [state.deposits.length, 'depósitos'], [state.budgets.length, 'tetos'],
  ].filter(([n]) => (n as number) > 0).map(([n, l]) => `${n} ${l}`).join(' · ')
  const remove = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!password) return setError('Digite sua senha para confirmar.')
    setBusy(true)
    try {
      const email = state.user!.email
      await auth.deleteAccount(email, password)
      repository.remove(email)
      nav.close(); dispatch({ type: 'logout' })
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Não foi possível excluir agora.'); setBusy(false)
    }
  }
  return (
    <Sheet title="Excluir conta" kicker="Conta" onClose={nav.close}>
      <form onSubmit={remove} className="space-y-5" noValidate>
        <div className="rounded-tile border border-gm-track p-5">
          <p className="text-[16px] font-bold">Isso apaga a conta e tudo que está nela.</p>
          <p className="mt-1 text-[14px] text-gm-secondary">{counts || 'Nenhum dado lançado ainda.'}. Não dá para desfazer.</p>
        </div>
        {error && <p role="alert" className="rounded-control border border-gm-lilac/50 bg-gm-lilac/15 px-4 py-3 text-[14px] text-gm-text">{error}</p>}
        <Field label="Senha" hint={`Confirme com a senha de ${state.user.email}.`}><input id="delete-password" type="password" autoComplete="current-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" onClick={() => nav.open({ kind: 'account' })}>Cancelar</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Excluindo…' : 'Excluir conta'}</Button>
        </div>
      </form>
    </Sheet>
  )
}

/* ---------- Fatura importada (estágio 2): ver e desfazer ---------- */
function ImportDetail({ id }: { id: string }) {
  const fmt = useMoney()
  const { state, dispatch } = useStore()
  const nav = useNav()
  const imp = state.imports.find((i) => i.id === id)
  if (!imp) return null
  const card = state.cards.find((c) => c.id === imp.cardId)
  const txs = state.transactions.filter((t) => t.importId === id)
  return (
    <Sheet title={imp.fileName} kicker="Fatura importada" onClose={nav.close}>
      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-control bg-gm-row text-gm-primary"><FileText size={24} /></span>
        <div>
          <p className="text-[32px] font-bold leading-none num">{fmt(imp.total)}</p>
          <p className="mt-1 text-[14px] text-gm-secondary">{card?.nickname ?? 'Cartão removido'} · {relativeDay(imp.date)} · {txs.length} de {imp.itemCount} lançamentos</p>
        </div>
      </div>
      <ul className="mt-6 overflow-hidden rounded-tile bg-gm-surface shadow-soft">
        {txs.map((t, i) => (
          <li key={t.id} className={cx(i > 0 && 'border-t border-gm-border')}>
            <button onClick={() => nav.open({ kind: 'tx', id: t.id })} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition hover:bg-gm-elevated">
              <CategoryIcon category={t.category} className="size-9" />
              <span className="min-w-0 flex-1 truncate text-[14px] font-bold">{t.name}</span>
              <span className="text-[14px] font-bold num">−{fmt(t.amount)}</span>
            </button>
          </li>
        ))}
        {!txs.length && <li className="px-5 py-5 text-center text-[14px] text-gm-secondary">Os lançamentos desta fatura já foram apagados.</li>}
      </ul>
      <DangerZone
        label="Desfazer importação" question="Desfazer esta importação?"
        detail={`Apaga os ${txs.length} lançamentos dela${card ? ` e a fatura do ${card.nickname} volta para ${fmt(imp.previousInvoice)}` : ''}.`}
        confirmLabel="Desfazer"
        onConfirm={() => { dispatch({ type: 'deleteImport', id }); nav.close(); nav.toast('Importação desfeita') }}
      />
    </Sheet>
  )
}

/** Ação destrutiva com confirmação dentro da folha (o viewer/app não usa confirm()). */
function DangerZone({ label, question, detail, onConfirm, confirmLabel = 'Apagar' }: { label: string; question: string; detail: string; onConfirm: () => void; confirmLabel?: string }) {
  const [open, setOpen] = useState(false)
  return open ? (
    <div className="mt-4 rounded-tile border border-gm-track p-5">
      <p className="text-[16px] font-bold">{question}</p>
      <p className="mt-1 text-[14px] text-gm-secondary">{detail}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="md" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button variant="primary" size="md" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  ) : (
    <Button variant="outline" className="mt-3 w-full" onClick={() => setOpen(true)}><Trash2 size={18} /> {label}</Button>
  )
}

/* ---------- Editar perfil ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function ProfileForm() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const user = state.user
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar)
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [photoError, setPhotoError] = useState('')
  if (!user) return null

  const errs = {
    name: name.trim().split(/\s+/).filter(Boolean).length < 1 || name.trim().length < 2 ? 'Digite seu nome.' : '',
    email: !EMAIL_RE.test(email.trim()) ? 'Digite um e-mail válido.' : '',
  }
  const changed = name.trim() !== user.name || email.trim().toLowerCase() !== user.email || avatar !== user.avatar

  const pickPhoto = async (file?: File) => {
    setPhotoError('')
    if (!file) return
    if (!file.type.startsWith('image/')) return setPhotoError('Escolha uma imagem (JPG, PNG, WEBP ou HEIC).')
    if (file.size > 8 * 1024 * 1024) return setPhotoError('A imagem passa de 8 MB. Escolha uma menor.')
    try { setAvatar(await squareImage(file, 256)) } catch (e) { setPhotoError((e as Error).message) }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setTried(true); setError('')
    if (errs.name || errs.email) return
    setSaving(true)
    try {
      const { pendingEmail, ...updated } = await auth.updateProfile(user.email, { name, email, avatar, isAdmin: user.isAdmin })
      if (updated.email !== user.email) repository.remove(user.email)
      dispatch({ type: 'updateUser', user: updated })
      nav.close(); nav.toast(pendingEmail ? `Perfil salvo · confirme o novo e-mail em ${pendingEmail}` : 'Perfil atualizado')
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Não foi possível salvar agora. Tente de novo.')
      setSaving(false)
    }
  }

  return (
    <Sheet title="Editar perfil" kicker="Conta" onClose={nav.close}>
      <form onSubmit={save} className="space-y-5" noValidate>
        {error && <p role="alert" className="rounded-control border border-gm-lilac/50 bg-gm-lilac/15 px-4 py-3 text-[14px] text-gm-text">{error}</p>}

        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={name || user.name} src={avatar} size={88} />
            <label className="absolute -bottom-1 -right-1 grid size-9 cursor-pointer place-items-center rounded-full border-4 border-gm-sheet bg-gm-primary text-gm-on-primary transition hover:brightness-110" title="Trocar foto">
              <Camera size={16} />
              <input id="profile-photo" type="file" accept="image/*" className="sr-only" aria-label="Trocar foto de perfil" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = '' }} />
            </label>
          </div>
          <div className="space-y-2">
            <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-gm-row px-4 text-[14px] font-bold text-gm-text transition hover:bg-gm-track">
              {avatar ? 'Trocar foto' : 'Adicionar foto'}
              <input type="file" accept="image/*" className="sr-only" aria-label="Escolher foto de perfil" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = '' }} />
            </label>
            {avatar && (
              <button type="button" onClick={() => setAvatar(undefined)} className="block cursor-pointer text-[13px] font-medium text-gm-secondary underline-offset-4 hover:underline">
                Remover foto
              </button>
            )}
          </div>
        </div>
        {photoError && <p role="alert" className="text-[13px] text-gm-accent">{photoError}</p>}

        <Field label="Nome completo" error={tried ? errs.name : undefined} hint={`Na tela inicial aparece "Olá, ${firstName(name) || '…'}".`}>
          <input id="profile-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={40} />
        </Field>
        <Field label="E-mail" error={tried ? errs.email : undefined} hint="É o e-mail que você usa para entrar.">
          <input id="profile-email" className={inputCls} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <Button type="submit" className="w-full" disabled={saving || !changed}>{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
      </form>
    </Sheet>
  )
}
