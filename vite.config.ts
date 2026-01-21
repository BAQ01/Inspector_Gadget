import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Zorgt dat de PDF generator de weg niet kwijtraakt
    global: 'window',
  },
  resolve: {
    alias: {
      // Dit lost die gele "Buffer is not defined" balken op
      buffer: 'buffer/',
    },
  },
})