import { useCallback, useEffect, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'gamora:theme'
const listeners = new Set<() => void>()

const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

function apply(t: Theme, persist: boolean) {
  document.documentElement.dataset.theme = t
  if (persist) { try { localStorage.setItem(KEY, t) } catch { /* ok */ } }
  listeners.forEach((l) => l())
}

function hasExplicitChoice() {
  try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' } catch { return false }
}

/** Tema claro/escuro. Sem escolha salva, segue o sistema. */
export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    current,
    () => 'light' as Theme,
  )

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => { if (!hasExplicitChoice()) apply(mq.matches ? 'dark' : 'light', false) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((t: Theme) => apply(t, true), [])
  const toggle = useCallback(() => apply(current() === 'dark' ? 'light' : 'dark', true), [])
  return { theme, setTheme, toggle }
}
