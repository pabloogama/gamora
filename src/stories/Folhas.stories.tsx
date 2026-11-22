import type { Meta, StoryObj } from '@storybook/react-vite'
import { SheetHost } from '@/features/sheets/Sheets'
import type { SheetState } from '@/app/navigation'
import { seed } from '@/data/mocks'
import type { State } from '@/types/finance'

const s = seed()

/** Estado com uma fatura importada, para a folha "Fatura importada". */
const withImport: State = (() => {
  const base = seed()
  const id = 'imp-exemplo'
  const items = [
    { name: 'Netflix', category: 'assinaturas', amount: 55.9, isSubscription: true },
    { name: 'Spotify', category: 'assinaturas', amount: 21.9, isSubscription: true },
    { name: 'Riachuelo', category: 'outros', amount: 95.3 },
    { name: 'Padaria', category: 'alimentacao', amount: 32.4 },
  ] as const
  const date = base.transactions[0].date
  return {
    ...base,
    transactions: [...items.map((i, n) => ({ id: `imp-tx-${n}`, ...i, method: 'principal', date, source: 'invoice' as const, importId: id })), ...base.transactions],
    imports: [{ id, cardId: 'principal', fileName: 'fatura-novembro.pdf', total: 205.5, itemCount: items.length, date, previousInvoice: 1284 }],
  }
})()
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
export const DetalheMeta = story({ kind: 'goalDetail', goalId: 'japao' }, 'Detalhe da meta (depósitos)')
export const EditarMeta = story({ kind: 'goal', goal: s.goals[0] }, 'Editar meta')
export const EditarDeposito = story({ kind: 'deposit', goalId: 'japao', deposit: s.deposits[0] }, 'Editar depósito')
export const NovoTeto = story({ kind: 'budget', category: 'new' }, 'Novo teto por categoria')
export const FaturaImportada = story({ kind: 'import', id: 'imp-exemplo' }, 'Fatura importada (desfazer)')
export const AjustarSaldo = story({ kind: 'balance' }, 'Ajustar saldo')
export const AlterarSenha = story({ kind: 'password' }, 'Alterar senha')
export const ExcluirConta = story({ kind: 'deleteAccount' }, 'Excluir conta')
export const Conta = story({ kind: 'account' }, 'Conta')
export const EditarPerfil = story({ kind: 'profile' }, 'Editar perfil')

// Detalhe usa o id do estado; os stories rodam com o mesmo seed.
Detalhe.parameters = { state: s }
Editar.parameters = { state: s }
Guardar.parameters = { state: s }
DetalheMeta.parameters = { state: s }
EditarMeta.parameters = { state: s }
EditarDeposito.parameters = { state: s }
FaturaImportada.parameters = { state: withImport }
