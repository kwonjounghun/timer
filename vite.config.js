import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/timer/', // GitHub Pages 서브 디렉토리 설정
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/business': fileURLToPath(new URL('./src/business', import.meta.url)),
      '@/adapters': fileURLToPath(new URL('./src/adapters', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/hooks': fileURLToPath(new URL('./src/hooks', import.meta.url))
    }
  }
})
