import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const BASE = '/ntr-walk/';

// Content Security Policy, added to the built page only (Vite dev needs inline scripts).
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://tile.openstreetmap.org",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self'",
].join('; ');

const cspPlugin = {
  name: 'ntr-csp',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}">`),
};

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    cspPlugin,
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/favicon-32.png', 'icons/apple-touch-icon.png'],
      manifest: {
        id: `${BASE}app`,
        name: 'Narrow the Road · Walk',
        short_name: 'NTR Walk',
        description: 'Record a street walk: video and GPS, in sync.',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#1E2227',
        background_color: '#1E2227',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cacheId: 'ntr-walk',
        globPatterns: ['**/*.{js,css,html,png,woff2,mp4}'],
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  worker: { format: 'es' },
});
