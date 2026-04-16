import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Pagina-React/', // Necesario para GitHub Pages si el repo se llama Pagina-React
})
