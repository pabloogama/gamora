import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Avatar, BalanceToggle, Button, CategoryIcon, IconButton, Kicker, LinkButton, Logo, LogoMark, MethodIcon, Money, SectionTitle, ThemeToggle,
} from '@/components/ui'
import { CATEGORIES, type CategoryId } from '@/types/finance'

const meta: Meta<typeof Button> = {
  title: 'Componentes/Base',
  component: Button,
  parameters: { docs: { description: { component: 'Peças de base usadas em todas as telas. Cores e raios vêm dos tokens semânticos (`color-action-primary`, `radius-tile`…).' } } },
}
export default meta
type S = StoryObj<typeof Button>

export const Botao: S = {
  name: 'Button',
  args: { children: 'Salvar', variant: 'primary', size: 'lg', disabled: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'outline'], description: 'primary: uma por tela · secondary: apoio · outline: destrutiva/neutra' },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
  },
}

export const VariantesDeBotao: S = {
  name: 'Button · todas as variantes',
  render: () => (
    <div className="grid max-w-[520px] gap-3">
      <Button>Confirmar 34 lançamentos</Button>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" size="md">Cancelar</Button>
        <Button variant="primary" size="md">Apagar</Button>
      </div>
      <Button variant="outline"><Trash2 size={18} /> Apagar meta</Button>
      <Button disabled>Salvar (desabilitado)</Button>
    </div>
  ),
}

export const BotaoDeIcone: StoryObj = {
  name: 'IconButton',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton label="Voltar"><ArrowRight size={20} className="rotate-180" /></IconButton>
      <IconButton label="Editar"><Pencil size={18} /></IconButton>
      <IconButton label="Novo" className="!bg-gm-lilac !text-gm-on"><Plus size={22} strokeWidth={2.5} /></IconButton>
      <div className="flex gap-2 rounded-full bg-band-solid p-3">
        <BalanceToggle onBand />
        <ThemeToggle onBand />
      </div>
      <BalanceToggle />
      <ThemeToggle />
    </div>
  ),
}

export const Textos: StoryObj = {
  name: 'Kicker, SectionTitle, LinkButton, Money',
  render: () => (
    <div className="max-w-[520px] space-y-6">
      <Kicker>Este mês · novembro</Kicker>
      <SectionTitle action={<LinkButton>Ver todas</LinkButton>}>Transações</SectionTitle>
      <div className="space-y-1">
        <Money value={14500} compact className="block text-[52px] font-bold leading-none" />
        <Money value={1284} className="block text-[28px] font-bold" />
        <p className="text-[13px] text-gm-secondary">O olho no topo oculta todos os valores do app (estado global <code>hideBalance</code>).</p>
      </div>
    </div>
  ),
}

export const IconesDeCategoria: StoryObj = {
  name: 'CategoryIcon e MethodIcon',
  render: () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => (
          <div key={c} className="text-center"><CategoryIcon category={c} /><p className="mt-1 text-[12px] text-gm-secondary">{CATEGORIES[c].label}</p></div>
        ))}
      </div>
      <div className="flex gap-6 text-gm-text">
        {['principal', 'pix', 'dinheiro'].map((m) => <span key={m} className="inline-flex items-center gap-2 text-[14px]"><MethodIcon method={m} /> {m}</span>)}
      </div>
    </div>
  ),
}

export const Marca: StoryObj = {
  name: 'Avatar, LogoMark e Logo',
  render: () => {
    const [size, setSize] = useState(44)
    return (
      <div className="flex flex-wrap items-center gap-6">
        <Avatar name="Pablo Gama" src={`${import.meta.env.BASE_URL}avatars/pablo.webp`} size={size} />
        <Avatar name="Pablo Gama" size={size} />
        <LogoMark size={size} tile />
        <input type="range" min={28} max={72} value={size} onChange={(e) => setSize(+e.target.value)} aria-label="Tamanho do avatar" />
        <Logo className="text-[24px] text-gm-text" />
        <div className="rounded-[18px] bg-band-solid px-5 py-3"><Logo className="text-[24px] text-white" /></div>
      </div>
    )
  },
}
