import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { NavCtx, type Nav, type SheetState, type View } from '@/app/navigation'
import { StoreProvider } from '@/store'
import { seed, emptyState } from '@/data/mocks'
import { Toast } from '@/components/ui'
import type { State } from '@/types/finance'

/** Estado de exemplo (dados do briefing) para os stories. */
export function demoState(patch: Partial<State> = {}): State {
  return { ...seed(), ...patch }
}
export const emptyDemo = (): State => emptyState({ name: 'Ana', email: 'ana@gamora.app' }, 2500)

/** Navegação falsa: registra as ações no painel Actions e mostra o toast. */
export function MockNav({ children, view = 'home', onSheet }: { children: ReactNode; view?: View; onSheet?: (s: SheetState | null) => void }) {
  const [current, setCurrent] = useState<View>(view)
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => setCurrent(view), [view])
  const nav = useMemo<Nav>(() => ({
    view: current,
    go: (v) => { console.info('[nav] go', v); setCurrent(v) },
    push: (v) => { console.info('[nav] push', v); setCurrent(v) },
    back: () => console.info('[nav] back'),
    open: (s) => { console.info('[nav] open', s); onSheet?.(s) },
    close: () => { console.info('[nav] close'); onSheet?.(null) },
    toast: (m) => { setToast(m); setTimeout(() => setToast(null), 2200) },
  }), [current, onSheet])
  return (
    <NavCtx.Provider value={nav}>
      {children}
      {toast && <Toast msg={toast} />}
    </NavCtx.Provider>
  )
}

export function AppProviders({ children, state, view }: { children: ReactNode; state?: State; view?: View }) {
  return (
    <StoreProvider initialState={state ?? demoState()} persist={false}>
      <MockNav view={view}>{children}</MockNav>
    </StoreProvider>
  )
}
