import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Bar, Button, Empty, Ring, Sheet, Skeleton, Toast } from '@/components/ui'

const meta: Meta = { title: 'Componentes/Feedback', parameters: { docs: { description: { component: 'Progresso, estados vazio e carregando, toast e folha.' } } } }
export default meta
type S = StoryObj

export const Progresso: StoryObj<{ value: number }> = {
  name: 'Bar e Ring',
  args: { value: 68 },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100 } } },
  render: ({ value }) => (
    <div className="flex flex-wrap items-center gap-10">
      <div className="w-[320px] space-y-4">
        <Bar value={value} />
        <Bar value={value} height={8} />
        <Bar value={100} tone="lilac" height={4} />
        <div className="rounded-[22px] bg-band-solid p-4"><Bar value={value} tone="white" height={8} /></div>
      </div>
      <Ring value={value} size={116}><span className="text-[26px] font-bold num">{value}%</span></Ring>
    </div>
  ),
}

export const Vazio: S = {
  name: 'Empty',
  render: () => <div className="max-w-[440px]"><Empty title="Nenhum gasto por aqui" text="Fez uma compra? Digite o valor e o mês começa a se mexer." action={<Button size="md"><Plus size={18} /> Adicionar gasto</Button>} /></div>,
}

export const Carregando: S = {
  name: 'Skeleton',
  render: () => (
    <div className="max-w-[440px] space-y-3">
      <Skeleton className="h-[190px] rounded-[30px]" />
      <div className="grid grid-cols-4 gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[92px]" />)}</div>
    </div>
  ),
}

export const Aviso: S = {
  name: 'Toast',
  render: () => <div className="h-40"><Toast msg="Gasto de R$ 45,90 salvo" /></div>,
}

export const Folha: S = {
  name: 'Sheet',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div className="min-h-[600px] p-6">
        <Button onClick={() => setOpen(true)}>Abrir folha</Button>
        {open && (
          <Sheet title="Adicionar gasto" kicker="Novo lançamento" onClose={() => setOpen(false)}>
            <p className="text-[15px] text-gm-secondary">No mobile a folha sobe de baixo (topo com <code>radius-section</code>); no desktop vira uma janela centralizada.</p>
            <Button className="mt-6 w-full" onClick={() => setOpen(false)}>Salvar</Button>
          </Sheet>
        )}
      </div>
    )
  },
}
