import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useStore, loadFor } from '@/store'
import { auth, AuthError } from '@/services/auth'
import { DEMO_ACCOUNT } from '@/data/mocks'
import { maskMoney, parseMoney } from '@/lib/format'
import { Button, cx, Field, inputCls, Logo, MoneyInput, ThemeToggle } from '@/components/ui'

type Mode = 'login' | 'signup'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Login e cadastro por e-mail e senha (conexão direta, sem Google). */
export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login')
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-band-solid p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span className="text-[28px] font-black tracking-[-0.04em]">gamora</span>
        <div>
          <p className="kicker opacity-60">Finanças</p>
          <h1 className="mt-3 max-w-[520px] text-[56px] font-bold leading-[1] tracking-[-0.045em]">Seu assistente financeiro para grandes conquistas.</h1>
          <ul className="mt-8 space-y-2 text-[16px] font-medium opacity-80">
            <li>Registre cada compra em segundos.</li>
            <li>Veja o mês, os cartões e as metas numa tela.</li>
            <li>Guarde para o que importa.</li>
          </ul>
        </div>
        <svg className="pointer-events-none absolute -right-24 top-24 size-[420px] opacity-[.12]" viewBox="0 0 100 100" aria-hidden>
          {[48, 38, 28, 18].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#FFFFFF" strokeWidth=".8" />)}
        </svg>
      </section>

      <section className="relative flex flex-col justify-center px-5 py-10 md:px-16">
        <ThemeToggle className="absolute right-5 top-5" />
        <div className="mx-auto w-full max-w-[420px]">
          <Logo className="text-[26px] lg:hidden" />
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
          {mode === 'login' ? <LoginForm onSwitch={() => setMode('signup')} /> : <SignupForm onSwitch={() => setMode('login')} />}
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
  return msg ? <p role="alert" className="rounded-control border border-gm-lilac/40 bg-gm-lilac/10 px-4 py-3 text-[14px] text-gm-lilac">{msg}</p> : null
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
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
      dispatch({ type: 'hydrate', state: loadFor(user) })
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

function SignupForm({ onSwitch }: { onSwitch: () => void }) {
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
      const user = await auth.signUp(name, email, password)
      dispatch({ type: 'hydrate', state: loadFor(user, parseMoney(balance) || 0) })
    } catch (err) {
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
