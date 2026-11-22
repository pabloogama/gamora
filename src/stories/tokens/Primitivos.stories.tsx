import type { Meta, StoryObj } from '@storybook/react-vite'
import { PrimitiveColors, PrimitiveEffects, PrimitiveShape, PrimitiveSpace, PrimitiveTypography } from './TokenViews'

const meta: Meta = {
  title: 'Tokens/Primitivos',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Valores crus, sem significado. Componentes não usam primitivos direto: usam os semânticos, que apontam para cá. Fonte: `tokens/source.mjs`.' } } },
}
export default meta
type S = StoryObj

export const Cores: S = { render: () => <PrimitiveColors /> }
export const Tipografia: S = { render: () => <PrimitiveTypography /> }
export const Espaco: S = { name: 'Espaço e gaps negativos', render: () => <PrimitiveSpace /> }
export const Forma: S = { name: 'Raio, stroke e tamanho', render: () => <PrimitiveShape /> }
export const Efeitos: S = { name: 'Sombra, opacidade, blur e movimento', render: () => <PrimitiveEffects /> }
