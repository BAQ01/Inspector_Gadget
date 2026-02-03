import { defineConfig } from 'vite'
// @ts-expect-error negeer eventuele import foutmeldingen in de editor
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SCIOS Inspector App',
        short_name: 'SCIOS App',
        description: 'Professionele inspectie tool voor Scope 10',
        theme_color: '#047857', // Emerald groen
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      // --- FIX: Verhoog cache limiet voor PDF bibliotheken ---
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000, // Limiet op 4MB gezet (standaard is 2MB)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  // --- FIX: Onderdruk waarschuwing over bestandsgrootte ---
  build: {
    chunkSizeWarningLimit: 4000, // Waarschuwing pas bij 4MB (4000kB)
  }
})