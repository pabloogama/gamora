import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Pencil, Plus, Sparkles } from 'lucide-react'
import { Pocket, TransactionRow, WalletCard, WavyPocket } from '@/components/finance'
import { Bar } from '@/components/ui'
import type { Card, Transaction } from '@/types/finance'
import { seed } from '@/data/mocks'

const cards = seed().cards
const txs = seed().transactions

const meta: Meta = {
  title: 'Componentes/Finanças',
  parameters: { docs: { description: { component: 'A carteira é a assinatura visual do Gamora: cartões (`radius-wallet-card`) saindo de um bolso de vidro (`radius-pocket`) com costura tracejada (`space-inset-stitch`, `color-border-stitch`).' } } },
}
export default meta

export const Cartao: StoryObj<{ nickname: string; last4: string; invoice: number; limit: number; dueInDays: number; color: Card['color'] }> = {
  name: 'WalletCard',
  args: { nickname: 'Principal', last4: '4552', invoice: 1284, limit: 3000, dueInDays: 8, color: 'gradient' },
  argTypes: { color: { control: 'inline-radio', options: ['gradient', 'lilac', 'offwhite'], description: 'gradient = violeta Gamora (texto branco) · lilac = verde-água · offwhite = lavanda' } },
  render: (a) => <div className="max-w-[360px]"><WalletCard card={{ id: 'x', ...a }} /></div>,
}

export const TodosOsCartoes: StoryObj = {
  name: 'WalletCard · três cores',
  render: () => <div className="grid max-w-[1100px] gap-4 md:grid-cols-3">{cards.map((c) => <WalletCard key={c.id} card={c} />)}</div>,
}

export const Bolso: StoryObj = {
  name: 'Pocket (vidro e sólido)',
  render: () => (
    <div className="grid max-w-[900px] gap-6 md:grid-cols-2">
      <div className="rounded-[34px] bg-band-solid p-6">
        <Pocket>
          <p className="text-[14px] text-white/85">Seu saldo</p>
          <p className="text-[40px] font-bold leading-none num">R$ 14.500</p>
          <div className="mt-6 flex gap-2.5">
            <span className="inline-flex h-11 items-center gap-2 rounded-full bg-gm-lilac pl-2 pr-5 text-[14px] font-bold text-gm-on"><span className="grid size-7 place-items-center rounded-full bg-gm-on text-gm-lilac"><Sparkles size={15} /></span>Pergunte ao Gamora</span>
            <span className="glass grid size-11 place-items-center rounded-full"><Plus size={19} /></span>
          </div>
        </Pocket>
        <p className="mt-3 text-[12px] text-white/70">variant="glass" — sobre a faixa marinho</p>
      </div>
      <div>
        <Pocket variant="solid">
          <div className="flex justify-between"><p className="kicker text-white/65">Fatura atual · Principal</p><span className="glass grid size-11 place-items-center rounded-full"><Pencil size={17} /></span></div>
          <p className="text-[40px] font-bold leading-none num">R$ 1.284,00</p>
          <Bar value={43} tone="white" height={8} className="mt-6" />
        </Pocket>
        <p className="mt-3 text-[12px] text-gm-muted">variant="solid" — em qualquer fundo</p>
      </div>
    </div>
  ),
}

export const BolsoEmOnda: StoryObj = {
  name: 'WavyPocket (bolso com borda em onda)',
  render: () => (
    <div className="max-w-[420px] space-y-4">
      <WavyPocket>
        <p className="text-[13px] text-white/70">Seu saldo</p>
        <p className="text-[40px] font-bold leading-none num">R$ 14.500</p>
        <div className="mt-6 flex justify-between"><span className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/10 px-5 text-[14px] font-bold">Detalhes do cartão</span></div>
      </WavyPocket>
      <p className="text-[12px] text-gm-muted">Contorno desenhado em px a partir do tamanho real (cantos não deformam). Lado esquerdo mais alto, curva em S, costura tracejada recuada 8px.</p>
    </div>
  ),
}

export const Carteira: StoryObj = {
  name: 'Carteira montada (cartões + bolso)',
  render: () => {
    const [front, setFront] = useState(cards[0].id)
    const main = cards.find((c) => c.id === front)!
    const other = cards.find((c) => c.id !== front)!
    return (
      <div className="max-w-[420px] rounded-[34px] bg-band-solid p-5">
        <div className="relative pt-[112px]">
          <div className="absolute inset-x-0 top-0 h-[200px] [mask-image:linear-gradient(to_bottom,#000_calc(100%-64px),transparent)]">
            {[other, main].map((c, i) => (
              <button key={c.id} onClick={() => setFront(c.id)} className={`absolute cursor-pointer text-left transition-all duration-500 ${i ? 'inset-x-4 top-[44px]' : 'inset-x-8 top-0'}`} style={{ zIndex: i }}>
                <WalletCard card={c} />
              </button>
            ))}
          </div>
          <Pocket className="z-10 !bg-[linear-gradient(165deg,rgba(255,255,255,.22)_0%,rgba(91,63,224,.42)_38%,rgba(26,17,80,.62)_100%)]">
            <p className="text-[14px] text-white/85">Seu saldo</p>
            <p className="text-[40px] font-bold leading-none num">R$ 14.500</p>
            <p className="mt-4 text-[12px] text-white/70">Toque no cartão de trás para trazer à frente.</p>
          </Pocket>
        </div>
      </div>
    )
  },
}

export const Transacao: StoryObj<{ name: string; amount: number; source: Transaction['source'] }> = {
  name: 'TransactionRow',
  args: { name: 'Mercado', amount: 412.8, source: 'manual' },
  argTypes: { source: { control: 'inline-radio', options: ['manual', 'invoice'], description: 'invoice mostra o selo "Fatura"' } },
  render: (a) => <div className="max-w-[480px]"><TransactionRow tx={{ ...txs[0], ...a }} onClick={() => console.info('abrir detalhe')} /></div>,
}

export const ListaDeTransacoes: StoryObj = {
  name: 'TransactionRow · lista',
  render: () => <div className="max-w-[480px] space-y-2">{txs.slice(0, 5).map((t) => <TransactionRow key={t.id} tx={t} onClick={() => {}} />)}</div>,
}
