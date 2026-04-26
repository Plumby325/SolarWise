import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/SolarWise/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
