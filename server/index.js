// Production server: serves the built site (dist/) together with the content API.
//   npm run build && npm start
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyTrustProxy, createApi } from './api.js'
import { forceHttps, securityHeaders } from './security.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT) || 3000

const app = express()
app.disable('x-powered-by')
applyTrustProxy(app)
app.use(forceHttps)
app.use(securityHeaders)
app.use(createApi())
app.use(express.static(DIST, { index: false, maxAge: '1h' }))
// Single page app: every other route gets index.html.
app.use((req, res) => res.sendFile(path.join(DIST, 'index.html')))

app.listen(PORT, () => console.log(`Site running on http://localhost:${PORT}`))
