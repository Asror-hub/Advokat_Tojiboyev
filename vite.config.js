import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The Cloudflare plugin runs the Worker (worker/index.js: content API, admin, uploads)
// next to the site, so `npm run dev` and `npm run preview` behave like the live site.
// Local articles and pictures are kept in .wrangler/state; secrets come from .dev.vars.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  // Listen on the local network too, so a phone on the same Wi-Fi / hotspot can open the dev site.
  server: { host: true },
})
