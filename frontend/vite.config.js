import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,

    // 🔹 ALLOW NGROK DOMAIN
    allowedHosts: [
      'unobstruent-wrongful-mamie.ngrok-free.dev'
    ],

    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
