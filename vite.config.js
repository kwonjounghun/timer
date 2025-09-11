import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/timer/', // GitHub Pages 서브 디렉토리 설정
  server: {
    port: 3000,
    open: true
  }
})
