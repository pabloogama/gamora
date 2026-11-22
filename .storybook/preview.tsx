import type { Preview } from '@storybook/react-vite'
import { useEffect } from 'react'
import '../src/styles/index.css'
import { AppProviders } from './decorators'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: {
        title: 'Tema',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Claro', icon: 'sun' },
          { value: 'dark', title: 'Escuro', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' }, // tema padrão do app: claro
  parameters: {
    layout: 'padded',
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Introdução', 'Tokens', ['Primitivos', 'Semânticos'], 'Componentes', ['Base', 'Formulário', 'Feedback', 'Finanças', 'Layout'], 'Folhas', 'Telas'],
      },
    },
    viewport: {
      options: {
        mobile: { name: 'Mobile (390)', styles: { width: '390px', height: '844px' } },
        mobileSm: { name: 'Mobile pequeno (375)', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet (820)', styles: { width: '820px', height: '1180px' } },
        desktop: { name: 'Desktop (1440)', styles: { width: '1440px', height: '900px' } },
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      const theme = (ctx.globals.theme as string) ?? 'light'
      useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
      document.documentElement.dataset.theme = theme
      if (ctx.parameters.noProviders) return <Story />
      return (
        <AppProviders state={ctx.parameters.state} view={ctx.parameters.view}>
          <div style={{ background: 'var(--gm-bg)', color: 'var(--gm-text)', minHeight: ctx.parameters.layout === 'fullscreen' ? '100vh' : undefined, padding: ctx.parameters.layout === 'fullscreen' ? 0 : 24, borderRadius: 12 }}>
            <Story />
          </div>
        </AppProviders>
      )
    },
  ],
}
export default preview
