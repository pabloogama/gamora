import { useState } from 'react'
import { ChartColumn, Eye, EyeOff, Target, Users, Wallet } from 'lucide-react'
import { useStore, loadUser } from '@/store'
import { auth, AuthError, AuthNotice } from '@/services/auth'
import { DEMO_ACCOUNT } from '@/data/mocks'
import { maskMoney, parseMoney } from '@/lib/format'
import { Button, cx, Field, inputCls, Logo, MoneyInput, ThemeToggle } from '@/components/ui'

type Mode = 'login' | 'signup'
const PILLARS = [
  { icon: Wallet, label: 'Controle de gastos' },
  { icon: Users, label: 'Gestão em família' },
  { icon: Target, label: 'Metas e planejamento' },
  { icon: ChartColumn, label: 'Patrimônio e evolução' },
]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Login e cadastro por e-mail e senha (conexão direta, sem Google). */
export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login')
  const [notice, setNotice] = useState('')
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-band-solid p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo className="text-[28px] text-white" />
        <div className="relative z-10">
          <h1 className="max-w-[520px] text-[56px] font-extrabold leading-[1] tracking-[-0.045em]">Suas finanças, em família.</h1>
          <p className="mt-5 max-w-[460px] text-[18px] leading-relaxed text-white/80">Organize, planeje e construa o futuro financeiro da sua família, em um só lugar.</p>
          <ul className="mt-10 grid max-w-[520px] grid-cols-4 gap-4">
            {PILLARS.map(({ icon: I, label }) => (
              <li key={label} className="text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-[20px] border border-white/10 bg-white/10 text-[#b9a8ff]"><I size={28} strokeWidth={1.8} /></span>
                <span className="mt-2 block text-[13px] leading-snug text-white/85">{label}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* forma da marca, como na peça de identidade */}
        <span className="pointer-events-none absolute -bottom-40 -right-32 size-[440px] rounded-full bg-brand opacity-25 blur-3xl" aria-hidden />
      </section>

      <section className="relative flex flex-col justify-center px-5 py-10 md:px-16">
        <ThemeToggle className="absolute right-5 top-5" />
        <div className="mx-auto w-full max-w-[420px]">
          <Logo className="text-[26px] text-gm-text lg:hidden" />
          <p className="mt-2 text-[15px] text-gm-secondary lg:hidden">Suas finanças, em família.</p>
          <div role="tablist" aria-label="Acesso" className="mt-8 grid grid-cols-2 rounded-full bg-gm-surface p-1.5 shadow-soft lg:mt-0">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
                className={cx('h-11 cursor-pointer rounded-full text-[14px] font-bold transition', mode === m ? 'bg-gm-primary text-gm-on-primary' : 'text-gm-secondary hover:text-gm-text')}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>
          {mode === 'login' ? <LoginForm notice={notice} onSwitch={() => { setNotice(''); setMode('signup') }} /> : <SignupForm onSwitch={() => setMode('login')} onCreated={(msg) => { setNotice(msg); setMode('login') }} />}
        </div>
      </section>
    </main>
  )
}

function PasswordInput({ value, onChange, autoComplete, id }: { value: string; onChange: (v: string) => void; autoComplete: string; id: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input id={id} className={cx(inputCls, 'pr-14')} type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Mínimo 6 caracteres" />
      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-gm-secondary hover:text-gm-text">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

function FormError({ msg }: { msg: string }) {
  return msg ? <p role="alert" className="rounded-control border border-gm-lilac/50 bg-gm-lilac/15 px-4 py-3 text-[14px] text-gm-text">{msg}</p> : null
}

function LoginForm({ onSwitch, notice }: { onSwitch: () => void; notice?: string }) {
  const { dispatch } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tried, setTried] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const errs = {
    email: !EMAIL_RE.test(email.trim()) ? 'Digite um e-mail válido.' : '',
    password: password.length < 6 ? 'A senha tem pelo menos 6 caracteres.' : '',
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setTried(true); setError('')
    if (errs.email || errs.password) return
    setLoading(true)
    try {
      const user = await auth.signIn(email, password)
      dispatch({ type: 'hydrate', state: await loadUser(user) })
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Não foi possível entrar agora. Tente de novo.')
      setLoading(false)
    }
  }
  const useDemo = () => { setEmail(DEMO_ACCOUNT.email); setPassword(DEMO_ACCOUNT.password); setError('') }
  return (
    <>
      <h2 className="mt-8 text-[29px] font-bold leading-[1.1] tracking-[-0.035em]">Olá de novo.</h2>
      <p className="mt-2 text-[15px] text-gm-secondary">Entre com seu e-mail e senha.</p>
      <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
        {notice && !error && <p role="status" className="rounded-control border border-gm-teal/50 bg-gm-teal/10 px-4 py-3 text-[14px] text-gm-text">{notice}</p>}
        <FormError msg={error} />
        <Field label="E-mail" error={tried ? errs.email : undefined}>
          <input id="login-email" className={inputCls} type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
        </Field>
        <Field label="Senha" error={tried ? errs.password : undefined}>
          <PasswordInput id="login-password" value={password} onChange={setPassword} autoComplete="current-password" />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</Button>
      </form>
      <button onClick={useDemo} className="mt-4 w-full cursor-pointer rounded-tile border border-dashed border-gm-track px-4 py-3 text-left text-[13px] text-gm-secondary transition hover:border-gm-accent">
        <span className="kicker block text-gm-muted">Conta de demonstração</span>
        <span className="font-mono text-gm-text">{DEMO_ACCOUNT.email}</span> · <span className="font-mono text-gm-text">{DEMO_ACCOUNT.password}</span> <span className="text-gm-accent">· preencher</span>
      </button>
      <p className="mt-6 text-center text-[14px] text-gm-secondary">Ainda não tem conta? <button onClick={onSwitch} className="cursor-pointer font-bold text-gm-accent hover:underline">Criar conta</button></p>
    </>
  )
}

function SignupForm({ onSwitch, onCreated }: { onSwitch: () => void; onCreated: (msg: string) => void }) {
  const { dispatch } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [balance, setBalance] = useState('')
  const [tried, setTried] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const errs = {
    name: name.trim().length < 2 ? 'Como podemos te chamar?' : '',
    email: !EMAIL_RE.test(email.trim()) ? 'Digite um e-mail válido.' : '',
    password: password.length < 6 ? 'Use pelo menos 6 caracteres.' : '',
    confirm: confirm !== password ? 'As senhas não são iguais.' : '',
  }
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : /\d/.test(password) && /[a-zA-Z]/.test(password) && password.length >= 8 ? 3 : 2
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setTried(true); setError('')
    if (Object.values(errs).some(Boolean)) return
    setLoading(true)
    try {
      const start = parseMoney(balance) || 0
      const user = await auth.signUp(name, email, password, start)
      dispatch({ type: 'hydrate', state: await loadUser(user, start) })
    } catch (err) {
      if (err instanceof AuthNotice) { onCreated(err.message); return }
      setError(err instanceof AuthError ? err.message : 'Não foi possível criar a conta agora. Tente de novo.')
      setLoading(false)
    }
  }
  return (
    <>
      <h2 className="mt-8 text-[29px] font-bold leading-[1.1] tracking-[-0.035em]">Crie sua conta.</h2>
      <p className="mt-2 text-[15px] text-gm-secondary">Leva um minuto. Depois é só registrar seus gastos.</p>
      <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
        <FormError msg={error} />
        <Field label="Nome" error={tried ? errs.name : undefined}>
          <input id="signup-name" className={inputCls} autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como quer ser chamado" maxLength={30} />
        </Field>
        <Field label="E-mail" error={tried ? errs.email : undefined}>
          <input id="signup-email" className={inputCls} type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
        </Field>
        <Field label="Senha" error={tried ? errs.password : undefined}>
          <PasswordInput id="signup-password" value={password} onChange={setPassword} autoComplete="new-password" />
          <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden>
            {[1, 2, 3].map((n) => <span key={n} className={cx('h-1 rounded-full', strength >= n ? 'bg-gm-primary' : 'bg-gm-track')} />)}
          </div>
        </Field>
        <Field label="Confirmar senha" error={tried ? errs.confirm : undefined}>
          <input id="signup-confirm" className={inputCls} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a senha" />
        </Field>
        <Field label="Quanto você tem hoje?" hint="Opcional. É o ponto de partida do seu saldo.">
          <MoneyInput value={balance} onChange={(v) => setBalance(maskMoney(v))} label="Saldo inicial" />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Criando conta…' : 'Criar conta'}</Button>
      </form>
      <p className="mt-6 text-center text-[14px] text-gm-secondary">Já tem conta? <button onClick={onSwitch} className="cursor-pointer font-bold text-gm-accent hover:underline">Entrar</button></p>
    </>
  )
}
