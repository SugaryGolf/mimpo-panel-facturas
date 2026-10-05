import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Falla si el puerto ya está ocupado (en vez de elegir otro)
    open: true,       // Abre el navegador automáticamente
    proxy: {
      // Reenvía /api/* al backend Flask en el puerto 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
