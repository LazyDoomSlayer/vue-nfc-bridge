import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [vue(), vueDevTools(), mkcert()],
  server: {
    host: '0.0.0.0',
    strictPort: true,
    port: 5173,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
