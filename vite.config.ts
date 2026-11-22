import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // o pacote principal inclui o supabase-js (~150 KB gzip)
  build: { chunkSizeWarningLimit: 600 },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Só variáveis VITE_* chegam ao navegador. Segredos ficam no servidor (/api).
  envPrefix: 'VITE_',
  server: { port: 5173, host: true },
})
