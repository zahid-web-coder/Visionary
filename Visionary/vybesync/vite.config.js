import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '0e19-2401-4900-22e5-a0c2-a8ac-d45d-14e2-33f8.ngrok-free.app'
    ]
  }
})
