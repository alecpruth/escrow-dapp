import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {                     // Add this section
    environment: 'jsdom',
    setupFiles: ['./app/__tests__/setupTests.ts'],
    globals: true
  }
})