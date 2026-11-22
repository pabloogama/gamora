import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'gamora:theme'
const listeners = new Set<() => void>()

const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

function apply(t: Theme) {
  document.documentElement.dataset.theme = t
  try { localStorage.setItem(KEY, t) } catch { /* ok */ }
  listeners.forEach((l) => l())
}

/** Tema claro/escuro. Padrão: claro (definido no index.html antes do React). A escolha fica salva. */
export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    current,
    () => 'light' as Theme,
  )
  const setTheme = useCallback((t: Theme) => apply(t), [])
  const toggle = useCallback(() => apply(current() === 'dark' ? 'light' : 'dark'), [])
  return { theme, setTheme, toggle }
}
