import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Zorgt dat updates direct binnenkomen
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SCIOS Scope 10 Inspectie',
        short_name: 'Scope 10',
        description: 'Digitale inspectie tool voor Scope 10 inspecteurs',
        theme_color: '#047857', // Dit is de Emerald-700 kleur uit je header
        background_color: '#ffffff',
        display: 'standalone', // Zorgt dat de adresbalk verdwijnt op iPad
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
      }
    })
  ],
})