/// <reference types="vite/client" />

/**
 * Variáveis expostas ao navegador. SÓ entram aqui as que começam com VITE_
 * e que podem ser públicas. Chaves secretas (OpenAI, service role) NUNCA
 * recebem o prefixo VITE_: elas vivem só no servidor (pasta /api).
 */
interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_URL?: string
  readonly VITE_DATA_SOURCE?: 'local' | 'supabase'
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_APP_STAGE?: '1' | '2'
  readonly VITE_FEATURE_AI?: 'true' | 'false'
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Fonte dos design tokens (JS puro, usado pelo Storybook e pelo script de build). */
declare module '*/tokens/source.mjs' {
  type Tree = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  export const primitives: Tree
  export const semantic: Tree
}
