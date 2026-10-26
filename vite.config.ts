import { defineConfig } from 'vite'
// @ts-expect-error negeer eventuele import foutmeldingen in de editor
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/inspector/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Inspector Gadget · B2Inspect',
        short_name: 'Inspector',
        description: 'B2Inspect werkruimte voor SCIOS Scope 8- en Scope 10-inspecties.',
        theme_color: '#3f3f46',
        background_color: '#f5f5f4',
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
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  // --- FIX: Onderdruk waarschuwing over bestandsgrootte ---
  build: {
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 5000,
  }
})
