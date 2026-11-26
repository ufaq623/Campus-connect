import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, forward API + upload requests to the Express server.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:4000', '/uploads': 'http://localhost:4000' } }
})
