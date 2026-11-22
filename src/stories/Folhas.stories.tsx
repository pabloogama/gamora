import type { Meta, StoryObj } from '@storybook/react-vite'
import { SheetHost } from '@/features/sheets/Sheets'
import type { SheetState } from '@/app/navigation'
import { seed } from '@/data/mocks'

const s = seed()
const meta: Meta<typeof SheetHost> = {
  title: 'Folhas',
  component: SheetHost,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Folhas sobem por cima da tela (não são telas novas). Mobile: de baixo para cima. Desktop: janela central.' } } },
}
export default meta
type S = StoryObj<typeof SheetHost>
const story = (sheet: SheetState, name: string): S => ({ name, args: { sheet }, render: (a) => <div className="min-h-[760px]"><SheetHost {...a} /></div> })

export const Adicionar = story({ kind: 'add' }, 'Adicionar gasto')
export const Editar = story({ kind: 'add', tx: s.transactions[0] }, 'Editar gasto')
export const Detalhe = story({ kind: 'tx', id: s.transactions[0].id }, 'Detalhe da compra')
export const NovoCartao = story({ kind: 'card' }, 'Novo cartão')
export const EditarCartao = story({ kind: 'card', card: s.cards[0] }, 'Editar cartão')
export const Guardar = story({ kind: 'deposit', goalId: s.goals[0].id, amount: 500 }, 'Guardar valor')
export const NovaMeta = story({ kind: 'goal' }, 'Nova meta')
export const Teto = story({ kind: 'budget', category: 'alimentacao' }, 'Ajustar teto')
export const TetoDoMes = story({ kind: 'budget', category: 'cap' }, 'Teto do mês')
export const Conta = story({ kind: 'account' }, 'Conta')

// Detalhe usa o id do estado; os stories rodam com o mesmo seed.
Detalhe.parameters = { state: s }
Editar.parameters = { state: s }
Guardar.parameters = { state: s }
