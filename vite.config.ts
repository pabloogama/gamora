import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Só variáveis VITE_* chegam ao navegador. Segredos ficam no servidor (/api).
  envPrefix: 'VITE_',
  server: { port: 5173, host: true },
})
