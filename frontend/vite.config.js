import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // No se cachean llamadas a /api — el service worker solo
      // precachea el "app shell" (HTML/JS/CSS/fuentes/logo), así que
      // los datos de LectoSmart siempre salen frescos del servidor
      // (evita mostrar progreso/sesión desactualizados).
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,woff,woff2,jpg,png,svg,ico}'],
      },
      manifest: {
        name: 'LectoSmart',
        short_name: 'LectoSmart',
        description: 'Plataforma de lectura — I.E. Técnica Valle de Tenza',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        background_color: '#F2F6FC',
        theme_color: '#1E2A4A',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  // Mismo proxy en "vite preview" (sirve el build de producción) — se
  // usa para probar el PWA/service worker localmente antes de desplegar.
  preview: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
