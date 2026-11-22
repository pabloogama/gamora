import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { Dock, HeaderAction, ScreenHeader, TopBand, TopBar } from '@/components/layout/AppChrome'

const meta: Meta = {
  title: 'Componentes/Layout',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Moldura do app. Mobile: faixa marinho + cabeçalho transparente + dock flutuante. Desktop (≥1100px): barra marinho com navegação, sem sidebar.' } } },
}
export default meta
type S = StoryObj

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative isolate min-h-[420px] overflow-hidden">
    <TopBand />
    <TopBar />
    <div className="mx-auto max-w-[1240px] px-5 pt-2 md:px-8 lg:pt-8">{children}</div>
  </div>
)

export const Cabecalho: S = {
  name: 'TopBar + TopBand',
  render: () => <Frame><p className="text-[14px] text-white lg:text-gm-secondary">Mude o viewport (barra de cima) para ver mobile e desktop.</p></Frame>,
}

export const CabecalhoDeTela: S = {
  name: 'ScreenHeader + HeaderAction',
  parameters: { view: 'cards' },
  render: () => <Frame><ScreenHeader kicker="Carteira" title="Cartões" action={<HeaderAction label="Novo cartão" onClick={() => {}}><Plus size={22} strokeWidth={2.5} /></HeaderAction>} /></Frame>,
}

export const DockFlutuante: S = {
  name: 'Dock',
  parameters: { viewport: { defaultViewport: 'mobile' } },
  globals: { viewport: { value: 'mobile' } },
  render: () => <div className="min-h-[300px]"><p className="p-6 text-[14px] text-gm-secondary">O dock só aparece abaixo de 1100px. Item ativo: círculo branco.</p><Dock /></div>,
}
