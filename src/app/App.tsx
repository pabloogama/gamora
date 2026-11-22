import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavCtx, type Nav, type SheetState, type View } from '@/app/navigation'
import { useStore } from '@/store'
import { env } from '@/config/env'
import { Dock, TopBand, TopBar } from '@/components/layout/AppChrome'
import { Toast } from '@/components/ui'
import HomeScreen from '@/features/home/HomeScreen'
import AuthScreen from '@/features/auth/AuthScreen'

const CardsScreen = lazy(() => import('@/features/cards/CardsScreen'))
const GoalsScreen = lazy(() => import('@/features/goals/GoalsScreen'))
const InvoiceScreen = lazy(() => import('@/features/invoice/InvoiceScreen'))
const AssistantScreen = lazy(() => import('@/features/assistant/AssistantScreen'))
const SheetHost = lazy(() => import('@/features/sheets/Sheets').then((m) => ({ default: m.SheetHost })))

const STAGE2: View[] = ['invoice', 'assistant']

/** Navegação: pilha de telas + uma folha por cima. Integra com o botão voltar do navegador. */
export default function App() {
  const { state } = useStore()
  const [stack, setStack] = useState<View[]>(['home'])
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [toastMsg, setToastMsg] = useState<{ msg: string; id: number } | null>(null)
  const toastTimer = useRef<number>(undefined)
  const view = stack[stack.length - 1]

  useEffect(() => {
    const onPop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => { window.scrollTo({ top: 0 }) }, [view])

  // ao sair da conta, volta para a home na próxima entrada
  useEffect(() => { if (!state.user) { setStack(['home']); setSheet(null) } }, [state.user])

  const allowed = (v: View) => env.stage === 2 || !STAGE2.includes(v)

  const go = useCallback((v: View) => {
    if (!allowed(v)) return
    setSheet(null)
    setStack((s) => {
      if (s[s.length - 1] === v) return s
      if (v === 'home') return ['home']
      history.pushState({ v }, '')
      return ['home', v]
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const push = useCallback((v: View) => {
    if (!allowed(v)) return
    setSheet(null)
    setStack((s) => {
      if (s[s.length - 1] === v) return s
      history.pushState({ v }, '')
      return [...s, v]
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const nav = useMemo<Nav>(() => ({
    view,
    go,
    push,
    back: () => (stack.length > 1 ? history.back() : undefined),
    open: (s) => setSheet(s),
    close: () => setSheet(null),
    toast: (msg) => {
      setToastMsg({ msg, id: Date.now() })
      window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => setToastMsg(null), 2600)
    },
  }), [view, go, push, stack.length])

  if (!state.user) return <AuthScreen />

  return (
    <NavCtx.Provider value={nav}>
      <div className="relative isolate">
      <TopBand />
      <TopBar />
      <main className="mx-auto max-w-[1240px] px-5 pb-36 pt-2 md:px-8 lg:pb-16 lg:pt-8">
        <Suspense fallback={null}>
          <div key={view} className="animate-pop">
            {view === 'home' && <HomeScreen />}
            {view === 'cards' && <CardsScreen />}
            {view === 'goals' && <GoalsScreen />}
            {view === 'invoice' && <InvoiceScreen />}
            {view === 'assistant' && <AssistantScreen />}
          </div>
        </Suspense>
      </main>
      </div>
      <Dock />
      <Suspense fallback={null}>{sheet && <SheetHost key={JSON.stringify(sheet).slice(0, 60)} sheet={sheet} />}</Suspense>
      {toastMsg && <Toast key={toastMsg.id} msg={toastMsg.msg} />}
    </NavCtx.Provider>
  )
}
