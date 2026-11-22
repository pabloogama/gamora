/**
 * Ponto único de leitura das variáveis de ambiente do front-end.
 * Componentes nunca leem import.meta.env direto: leem `env` daqui.
 */
const raw = import.meta.env

export const env = {
  appName: raw.VITE_APP_NAME || 'Gamora',
  appUrl: raw.VITE_APP_URL || 'http://localhost:5173',

  /** 'supabase' = banco real (login, dados e Storage). 'local' = protótipo offline (mocks + localStorage), usado no Storybook e nos testes de interface. */
  dataSource: raw.VITE_DATA_SOURCE === 'supabase' ? 'supabase' : 'local',

  supabase: {
    url: raw.VITE_SUPABASE_URL || '',
    anonKey: raw.VITE_SUPABASE_ANON_KEY || '',
  },

  /** Qual estágio do produto aparece na interface.
   *  1 = app nativo (Adicionar · Cartões · Metas)
   *  2 = + Fatura e Assistente (Adicionar · Fatura · Cartões · Metas) */
  stage: raw.VITE_APP_STAGE === '1' ? 1 : 2,

  /** true = Fatura e Assistente chamam a OpenAI via /api.
   *  false = respostas simuladas no próprio front (validação de interface). */
  featureAI: raw.VITE_FEATURE_AI === 'true',

  /** Base das rotas de servidor (Vercel Functions). Mesmo domínio por padrão. */
  apiBaseUrl: raw.VITE_API_BASE_URL || '/api',
} as const

export const isSupabaseConfigured = Boolean(env.supabase.url && env.supabase.anonKey)

// Guarda de segurança: se alguém criar uma VITE_ com cara de segredo, avisa no console em dev.
if (import.meta.env.DEV) {
  const leaked = Object.keys(raw).filter((k) => k.startsWith('VITE_') && /OPENAI|SERVICE_ROLE|SECRET/i.test(k))
  if (leaked.length) console.error(`[env] Segredo exposto ao navegador: ${leaked.join(', ')}. Remova o prefixo VITE_.`)
}
