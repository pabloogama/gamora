import type { Meta, StoryObj } from '@storybook/react-vite'
import { SemanticTable } from './TokenViews'

const meta: Meta = {
  title: 'Tokens/Semânticos',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Aliases em kebab-case. Cada token aponta para um primitivo, com valor próprio no tema claro e no escuro.' } } },
}
export default meta
type S = StoryObj

export const Cores: S = { render: () => <SemanticTable group="color" /> }
export const Tipografia: S = { render: () => <SemanticTable group="typography" /> }
export const Espaco: S = { name: 'Espaço e gaps', render: () => <SemanticTable group="spacing" /> }
export const Raio: S = { render: () => <SemanticTable group="radius" /> }
export const Stroke: S = { render: () => <SemanticTable group="stroke" /> }
export const Tamanho: S = { render: () => <SemanticTable group="size" /> }
export const Efeitos: S = { render: () => <SemanticTable group="effect" /> }
export const Movimento: S = { render: () => <SemanticTable group="motion" /> }
export const Camadas: S = { name: 'Camadas e layout', render: () => (<><SemanticTable group="layer" /><SemanticTable group="layout" /></>) }
