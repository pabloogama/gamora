import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  staticDirs: ['../public'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { defaultName: 'Documentação' },
  core: { disableTelemetry: true },
}
export default config
