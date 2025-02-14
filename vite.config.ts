import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {                     // Add this section
    environment: 'jsdom',
    setupFiles: ['./components/setupTests.ts'],
    globals: true
  }
})