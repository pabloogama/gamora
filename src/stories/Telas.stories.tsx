import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import { Dock, TopBand, TopBar } from '@/components/layout/AppChrome'
import HomeScreen from '@/features/home/HomeScreen'
import CardsScreen from '@/features/cards/CardsScreen'
import GoalsScreen from '@/features/goals/GoalsScreen'
import InvoiceScreen from '@/features/invoice/InvoiceScreen'
import AssistantScreen from '@/features/assistant/AssistantScreen'
import AuthScreen from '@/features/auth/AuthScreen'
import { emptyState } from '@/data/mocks'
import { emptyDemo } from '../../.storybook/decorators'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen">
      <TopBand />
      <TopBar />
      <main className="mx-auto max-w-[1240px] px-5 pb-36 pt-2 md:px-8 lg:pb-16 lg:pt-8">{children}</main>
      <Dock />
    </div>
  )
}

const meta: Meta = {
  title: 'Telas',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile' },
    docs: { description: { component: 'Telas cheias com os dados de referência. Use a barra de cima para trocar viewport (mobile/desktop) e tema.' } },
  },
  globals: { viewport: { value: 'mobile', isRotated: false } },
}
export default meta
type S = StoryObj

export const Home: S = { parameters: { view: 'home' }, render: () => <Shell><HomeScreen /></Shell> }
export const HomeContaNova: S = { name: 'Home · conta nova (vazia)', parameters: { view: 'home', state: emptyDemo() }, render: () => <Shell><HomeScreen /></Shell> }
export const Cartoes: S = { name: 'Cartões', parameters: { view: 'cards' }, render: () => <Shell><CardsScreen /></Shell> }
export const Metas: S = { parameters: { view: 'goals' }, render: () => <Shell><GoalsScreen /></Shell> }
export const Fatura: S = { name: 'Fatura · enviar', parameters: { view: 'invoice' }, render: () => <Shell><InvoiceScreen /></Shell> }
export const FaturaLida: S = {
  name: 'Fatura · encontramos',
  parameters: { view: 'invoice' },
  render: () => <Shell><InvoiceScreen /></Shell>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await userEvent.click(await c.findByRole('button', { name: /Testar com um exemplo/ }))
    await c.findByText('Encontramos · Principal', {}, { timeout: 6000 }).catch(() => c.findByText(/Encontramos/i, {}, { timeout: 6000 }))
  },
}
export const Assistente: S = {
  parameters: { view: 'assistant' },
  render: () => <Shell><AssistantScreen /></Shell>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await userEvent.click(await c.findByRole('button', { name: 'Quanto gastei com delivery?' }))
  },
}
export const Login: S = { name: 'Login e cadastro', parameters: { state: emptyState(null) }, render: () => <AuthScreen /> }
