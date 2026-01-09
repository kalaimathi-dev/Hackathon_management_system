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

    // ⚠️ Proxy only works in development, not on Vercel
    // In production, your frontend/.env should have VITE_API_URL
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  
  // Ensure proper base path for Vercel
  base: '/',
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})