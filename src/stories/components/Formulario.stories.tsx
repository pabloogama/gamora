import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Chips, Field, inputCls, MethodIcon, MoneyInput } from '@/components/ui'
import { maskMoney } from '@/lib/format'
import { CATEGORIES, type CategoryId } from '@/types/finance'

const meta: Meta = {
  title: 'Componentes/Formulário',
  parameters: { docs: { description: { component: 'Campos das folhas. Validação mostra a mensagem abaixo do campo (`Field.error`) e a borda muda para `color-brand-lilac`.' } } },
}
export default meta
type S = StoryObj

export const CampoDeValor: S = {
  name: 'MoneyInput',
  render: () => {
    const [v, setV] = useState('412,80')
    const [big, setBig] = useState(true)
    return (
      <div className="max-w-[440px] space-y-4">
        <Field label="Valor da compra"><MoneyInput big={big} value={v} onChange={(x) => setV(maskMoney(x))} /></Field>
        <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={big} onChange={() => setBig(!big)} /> grande</label>
        <Field label="Limite" error="Digite o limite."><MoneyInput value="" onChange={() => {}} invalid /></Field>
      </div>
    )
  },
}

export const CampoDeTexto: S = {
  name: 'Field + input',
  render: () => (
    <div className="max-w-[440px] space-y-5">
      <Field label="Descrição" hint="Opcional. Ex.: Mercado, Uber, Netflix"><input className={inputCls} placeholder="Alimentação" /></Field>
      <Field label="E-mail" error="Digite um e-mail válido."><input className={inputCls} defaultValue="lucas@" /></Field>
      <Field label="Data"><input type="date" className={inputCls} defaultValue="2026-11-21" /></Field>
    </div>
  ),
}

export const Selecao: S = {
  name: 'Chips',
  render: () => {
    const [cat, setCat] = useState<CategoryId>('alimentacao')
    const [m, setM] = useState('principal')
    return (
      <div className="max-w-[520px] space-y-5">
        <Field label="Categoria"><Chips label="Categoria" value={cat} onChange={setCat} options={(Object.keys(CATEGORIES) as CategoryId[]).map((id) => ({ id, label: CATEGORIES[id].label }))} /></Field>
        <Field label="Pagamento"><Chips label="Pagamento" value={m} onChange={setM} options={['principal', 'salario', 'pix', 'dinheiro'].map((id) => ({ id, label: id[0].toUpperCase() + id.slice(1), icon: <MethodIcon method={id} /> }))} /></Field>
      </div>
    )
  },
}
