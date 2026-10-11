import { fileURLToPath } from 'node:url';

import { tanstackRouter } from '@tanstack/router-plugin/vite';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA as vitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tanstackRouter({
        autoCodeSplitting: true,
      }),
      tsconfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
      react(),
      vitePWA({
        // 기존 브라우저 레이어에서 /sw.js를 등록한다.
        injectRegister: false,
        registerType: 'autoUpdate',
        manifest: false,
        includeAssets: [
          'favicon.svg',
          '*.png',
          'icons/*.png',
          'manifest.json',
          'locales/**/*.json',
        ],
        workbox: {
          importScripts: ['/push-sw.js'],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallbackDenylist: [/^\/api(?:\/|$)/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/orioncactus\/pretendard@/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdn-immutable',
                matchOptions: { ignoreVary: true },
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 * 12 * 3,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
            proxy.on('proxyRes', (proxyRes) => {
              const cookies = proxyRes.headers['set-cookie'];
              if (cookies) {
                proxyRes.headers['set-cookie'] = cookies.map((cookie) => {
                  return cookie
                    .replace(/Secure(; )?/, '')
                    .replace(/HttpOnly(; )?/, '')
                    .replace('Path=', 'Path=/api');
                });
              }
            });
          },
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }
          },
        },
      },
    },
  };
});
