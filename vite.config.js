import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createApi } from './server/api.js'

// Mounts the content API (articles, cases, admin, uploads) on the Vite servers,
// so `npm run dev` and `npm run preview` work with a single command.
const contentApi = () => ({
  name: 'content-api',
  configureServer(server) {
    server.middlewares.use(createApi())
  },
  configurePreviewServer(server) {
    server.middlewares.use(createApi())
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contentApi()],
  // Listen on the local network too, so a phone on the same Wi-Fi / hotspot can open the dev site.
  server: {
    host: true,
    // Content and uploads are written at runtime; they must not trigger reloads.
    watch: { ignored: ['**/server/data/**', '**/server/uploads/**'] },
  },
})
