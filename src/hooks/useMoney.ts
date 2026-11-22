import { useCallback } from 'react'
import { useStore } from '@/store'
import { money } from '@/lib/format'

export const HIDDEN_MONEY = 'R$ ••••'

/** Formata dinheiro respeitando "ocultar valores" (vale para o app inteiro). */
export function useMoney() {
  const { state } = useStore()
  const hidden = state.hideBalance
  return useCallback((v: number, compact = false) => (hidden ? HIDDEN_MONEY : money(v, compact)), [hidden])
}

/** Mascara valores em reais dentro de um texto pronto (ex.: insight do assistente). */
export function maskMoneyText(text: string, hidden: boolean) {
  return hidden ? text.replace(/R\$\s?[\d.]+(,\d{2})?/g, HIDDEN_MONEY) : text
}
