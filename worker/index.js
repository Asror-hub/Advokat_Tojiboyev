// Cloudflare Worker entry point. Only /api/* and /uploads/* reach this code (see
// "run_worker_first" in wrangler.jsonc); the website files are served by Cloudflare itself.
import { handleApi } from './api.js'
import { secure } from './security.js'

const UPLOAD = /^\/uploads\/([\w-]+\.(?:jpg|png|webp))$/

async function serveUpload(request, env, pathname) {
  const match = UPLOAD.exec(pathname)
  if (!match || (request.method !== 'GET' && request.method !== 'HEAD')) return new Response('Not found', { status: 404 })
  const obj = await env.BUCKET.get(`uploads/${match[1]}`)
  if (!obj) return new Response('Not found', { status: 404 })

  const headers = new Headers({
    'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
    'Cache-Control': 'public, max-age=604800',
    ETag: obj.httpEtag,
  })
  if (request.headers.get('If-None-Match') === obj.httpEtag) return new Response(null, { status: 304, headers })
  return new Response(request.method === 'HEAD' ? null : obj.body, { headers })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    let response
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) response = await handleApi(request, env, ctx)
    else if (url.pathname.startsWith('/uploads/')) response = await serveUpload(request, env, url.pathname)
    else response = await env.ASSETS.fetch(request)
    return secure(response, url)
  },
}
