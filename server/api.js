// Small content API: articles + cases, protected admin endpoints, image uploads.
// Content lives in server/data/content.json (created on first run from src/data/*).
// It is mounted by Vite in development (see vite.config.js) and by server/index.js in production.
import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { linesToHtml } from '../src/data/body.js'
import { cleanHtml, hasImage, htmlToText } from './richtext.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = path.join(ROOT, 'server', 'data')
const UPLOAD_DIR = path.join(ROOT, 'server', 'uploads')
const CONTENT_FILE = path.join(DATA_DIR, 'content.json')

try {
  process.loadEnvFile(path.join(ROOT, '.env'))
} catch {
  /* no .env file - environment variables are used as they are */
}

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

/* ------------------------------------------------------------------ secrets */

// Returns the stored value, or creates it ({ created: true, value }). The exclusive
// write ("wx") guarantees that only one process/module instance ever creates the file.
function readOrCreate(name, make) {
  const file = path.join(DATA_DIR, name)
  if (!fs.existsSync(file)) {
    const value = make()
    try {
      fs.writeFileSync(file, value, { mode: 0o600, flag: 'wx' })
      return { created: true, value }
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
  }
  return fs.readFileSync(file, 'utf8').trim()
}

// Passwords are never stored in readable form: only a salted scrypt hash is kept.
const scrypt = promisify(crypto.scrypt)
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16)
  return `scrypt$${salt.toString('hex')}$${(await scrypt(password, salt, 64)).toString('hex')}`
}
async function checkPassword(password, stored) {
  const [scheme, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length)
  return crypto.timingSafeEqual(actual, expected)
}
function createExclusive(file, value) {
  try {
    fs.writeFileSync(file, value, { mode: 0o600, flag: 'wx' })
    return true
  } catch (err) {
    if (err.code === 'EEXIST') return false
    throw err
  }
}

// Admin password: ADMIN_PASSWORD from the environment/.env wins. Otherwise a random one
// is generated on the first start, shown ONCE in the console, and only its hash is saved.
let PASSWORD_HASH
let PASSWORD_ID // changes when the password changes, which signs everyone out
const envPassword = process.env.ADMIN_PASSWORD
if (envPassword) {
  if (envPassword.length < 10) console.warn('[admin] ADMIN_PASSWORD is short. Use at least 12 characters.')
  PASSWORD_HASH = await hashPassword(envPassword)
  PASSWORD_ID = crypto.createHash('sha256').update(envPassword).digest('hex')
} else {
  const hashFile = path.join(DATA_DIR, 'admin-password.hash')
  const legacyFile = path.join(DATA_DIR, 'admin-password.txt') // older versions stored it readable
  if (!fs.existsSync(hashFile)) {
    if (fs.existsSync(legacyFile)) {
      if (createExclusive(hashFile, await hashPassword(fs.readFileSync(legacyFile, 'utf8').trim()))) {
        fs.rmSync(legacyFile, { force: true })
        console.log('\n[admin] Your admin password is now stored as a hash (admin-password.txt was removed).')
        console.log('[admin] The password itself did not change. Set ADMIN_PASSWORD in .env to choose a new one.\n')
      }
    } else {
      const generated = crypto.randomBytes(9).toString('base64url')
      if (createExclusive(hashFile, await hashPassword(generated))) {
        console.log(`\n[admin] Generated admin password: ${generated}`)
        console.log('[admin] Write it down now: it is NOT saved anywhere readable.')
        console.log('[admin] Lost it? Delete server/data/admin-password.hash and restart for a new one, or set ADMIN_PASSWORD in .env.\n')
      }
    }
  }
  PASSWORD_HASH = fs.readFileSync(hashFile, 'utf8').trim()
  PASSWORD_ID = crypto.createHash('sha256').update(PASSWORD_HASH).digest('hex')
}

let SECRET = process.env.ADMIN_SECRET
if (!SECRET) {
  const res = readOrCreate('.secret', () => crypto.randomBytes(32).toString('hex'))
  SECRET = typeof res === 'object' ? res.value : res
}

const TOKEN_TTL = 12 * 60 * 60 * 1000
const sign = (payload) => crypto.createHmac('sha256', `${SECRET}:${PASSWORD_ID}`).update(payload).digest('base64url')

// Admin activity log: server/data/audit.log (time, address, action).
const AUDIT_FILE = path.join(DATA_DIR, 'audit.log')
function audit(req, action, detail = '') {
  const line = `${new Date().toISOString()} ${req.ip || '-'} ${action} ${String(detail).replace(/\s+/g, ' ').slice(0, 120)}`
  fs.appendFile(AUDIT_FILE, `${line.trim()}\n`, () => {})
}

// "trust proxy": set TRUST_PROXY=1 when the site runs behind a reverse proxy / hosting platform,
// so the real visitor address (and https) is detected instead of the proxy's.
export function applyTrustProxy(app) {
  const v = process.env.TRUST_PROXY
  if (!v) return
  app.set('trust proxy', /^\d+$/.test(v) ? Number(v) : v === 'true' ? true : v)
}

function makeToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function verifyToken(token) {
  if (typeof token !== 'string') return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = sign(payload)
  if (sig.length !== expected.length) return false
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now()
  } catch {
    return false
  }
}

// Login throttling: 8 tries per 10 minutes per address (counted before the password is
// checked, so parallel requests cannot slip through). A successful login resets it.
const attempts = new Map()
const MAX_ATTEMPTS = 8
const WINDOW = 10 * 60 * 1000
function throttled(ip) {
  const rec = attempts.get(ip)
  return Boolean(rec && rec.reset >= Date.now() && rec.count >= MAX_ATTEMPTS)
}
function hit(ip) {
  const now = Date.now()
  if (attempts.size > 2000) for (const [k, v] of attempts) if (v.reset < now) attempts.delete(k)
  const rec = attempts.get(ip)
  if (!rec || rec.reset < now) attempts.set(ip, { count: 1, reset: now + WINDOW })
  else rec.count += 1
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ------------------------------------------------------------------ storage */

async function loadDb() {
  if (fs.existsSync(CONTENT_FILE)) return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'))
  // First run: start from the content that ships with the site.
  const [{ ARTICLES }, { CASES }] = await Promise.all([
    import(pathToFileURL(path.join(ROOT, 'src', 'data', 'articles.js')).href),
    import(pathToFileURL(path.join(ROOT, 'src', 'data', 'cases.js')).href),
  ])
  const db = { articles: ARTICLES, cases: CASES }
  persist(db)
  return db
}

function persist(db) {
  const tmp = `${CONTENT_FILE}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2))
  fs.renameSync(tmp, CONTENT_FILE)
}

const db = await loadDb()

const byDate = (a, b) => String(b.date).localeCompare(String(a.date)) || String(b.createdAt || '').localeCompare(String(a.createdAt || ''))

/* --------------------------------------------------------------- validation */

const LANGS = ['uz', 'ru', 'en']
const ARTICLE_CATS = ['analysis', 'qa', 'legislation', 'news']
const STATUSES = ['successful', 'notable']
const ART_COVERS = ['court', 'books', 'scale', 'gavel', 'desk']

class Invalid extends Error {}
const bad = (msg) => {
  throw new Invalid(msg)
}

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// { uz, ru, en } of strings. Empty languages are dropped so the site falls back to Uzbek.
function tri(v, max, label, required = false) {
  const out = {}
  for (const l of LANGS) {
    const s = text(v?.[l], max)
    if (s) out[l] = s
  }
  if (required && !out.uz) bad(`${label}: Uzbek text is required`)
  return out
}

// { uz, ru, en } of string arrays (paragraphs, tags).
function triList(v, maxItems, maxLen, label, required = false) {
  const out = {}
  for (const l of LANGS) {
    const list = Array.isArray(v?.[l]) ? v[l].map((s) => text(s, maxLen)).filter(Boolean).slice(0, maxItems) : []
    if (list.length) out[l] = list
  }
  if (required && !out.uz) bad(`${label}: Uzbek text is required`)
  return out
}

// Article/case text: one cleaned HTML string per language (see server/richtext.js).
// Older paragraph lists are converted to HTML first.
const MAX_HTML = 400_000

function bodyHtml(v, label) {
  const out = {}
  for (const l of LANGS) {
    const value = v?.[l]
    const raw = Array.isArray(value)
      ? linesToHtml(value.filter((s) => typeof s === 'string'))
      : typeof value === 'string'
        ? value
        : ''
    if (raw.length > MAX_HTML) bad(`${label}: the text is too long`)
    const html = cleanHtml(raw, UPLOAD_DIR)
    if (htmlToText(html) || hasImage(html)) out[l] = html
  }
  // The Uzbek text must contain real words, not only pictures.
  if (!htmlToText(out.uz)) bad(`${label}: Uzbek text is required`)
  return out
}

// Converts bodies stored by older versions (lists of paragraphs) to HTML.
function migrateBodies(data) {
  let changed = false
  for (const item of [...data.articles, ...data.cases]) {
    for (const l of LANGS) {
      if (Array.isArray(item.body?.[l])) {
        item.body[l] = cleanHtml(linesToHtml(item.body[l]), UPLOAD_DIR)
        changed = true
      }
    }
  }
  if (changed) persist(data)
}
migrateBodies(db)

function isoDate(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) bad('Date is invalid')
  return v
}

function image(v) {
  if (typeof v === 'string') {
    if (v.startsWith('art:') && ART_COVERS.includes(v.slice(4))) return v
    if (/^\/uploads\/[\w-]+\.(jpg|png|webp)$/.test(v)) return v
  }
  return 'art:court'
}

function cleanArticle(b) {
  if (!ARTICLE_CATS.includes(b?.category)) bad('Category is invalid')
  return {
    category: b.category,
    date: isoDate(b.date),
    title: tri(b.title, 240, 'Title', true),
    excerpt: tri(b.excerpt, 600, 'Short description', true),
    image: image(b.image),
    tags: triList(b.tags, 12, 40, 'Tags'),
    body: bodyHtml(b.body, 'Text'),
  }
}

function cleanCase(b) {
  if (!STATUSES.includes(b?.status)) bad('Status is invalid')
  const amount = tri(b.amount, 60, 'Result')
  const timeline = (Array.isArray(b.timeline) ? b.timeline : [])
    .slice(0, 14)
    .map((s) => {
      const row = { date: text(s?.date, 24) }
      for (const l of LANGS) {
        const v = text(s?.[l], 160)
        if (v) row[l] = v
      }
      return row
    })
    .filter((s) => s.date && s.uz)
  return {
    status: b.status,
    date: isoDate(b.date),
    category: tri(b.category, 100, 'Category', true),
    court: tri(b.court, 200, 'Court', true),
    amount: Object.keys(amount).length ? amount : null,
    title: tri(b.title, 240, 'Title', true),
    excerpt: tri(b.excerpt, 600, 'Short description', true),
    image: image(b.image),
    timeline,
    body: bodyHtml(b.body, 'Text'),
  }
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bb\u02bc`']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item'

function uniqueSlug(list, base) {
  let slug = base
  let n = 2
  while (list.some((i) => i.slug === slug)) slug = `${base}-${n++}`
  return slug
}

const KINDS = {
  articles: { clean: cleanArticle },
  cases: { clean: cleanCase },
}

/* ------------------------------------------------------------------- routes */

// Removes uploaded images that no article/case uses any more (only files older than an
// hour, so an image that was just uploaded but not saved yet is safe).
function pruneUploads() {
  // Covers and images inside article/case text both live under /uploads/.
  const content = JSON.stringify([db.articles, db.cases])
  for (const name of fs.readdirSync(UPLOAD_DIR)) {
    const file = path.join(UPLOAD_DIR, name)
    if (content.includes(`/uploads/${name}`)) continue
    try {
      if (Date.now() - fs.statSync(file).mtimeMs > 60 * 60 * 1000) fs.rmSync(file, { force: true })
    } catch {
      /* ignore */
    }
  }
}

export function createApi() {
  const app = express()
  app.disable('x-powered-by')
  applyTrustProxy(app)

  app.use(
    '/uploads',
    express.static(UPLOAD_DIR, {
      maxAge: '7d',
      fallthrough: true,
      setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
    }),
  )

  app.use('/uploads', (req, res) => res.sendStatus(404))

  const api = express.Router()
  api.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store')
    next()
  })

  // public
  api.get('/content', (req, res) => {
    res.json({
      articles: [...db.articles].sort(byDate),
      cases: [...db.cases].sort(byDate),
    })
  })

  api.post('/admin/login', express.json({ limit: '2kb' }), async (req, res) => {
    const ip = req.ip || 'unknown'
    if (throttled(ip)) {
      audit(req, 'login-blocked')
      return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' })
    }
    hit(ip)
    const given = typeof req.body?.password === 'string' ? req.body.password.slice(0, 256) : ''
    if (!(await checkPassword(given, PASSWORD_HASH))) {
      audit(req, 'login-failed')
      await sleep(600)
      return res.status(401).json({ error: 'Wrong password' })
    }
    attempts.delete(ip)
    audit(req, 'login')
    return res.json({ token: makeToken() })
  })

  // everything below needs a valid token. The token is checked BEFORE the body is read,
  // so anonymous visitors cannot make the server buffer large requests.
  const admin = express.Router()
  admin.use((req, res, next) => {
    const header = req.headers.authorization || ''
    if (!verifyToken(header.startsWith('Bearer ') ? header.slice(7) : '')) {
      return res.status(401).json({ error: 'Not signed in' })
    }
    return next()
  })
  admin.use(express.json({ limit: '9mb' }))

  admin.get('/session', (req, res) => res.json({ ok: true }))

  admin.post('/upload', (req, res) => {
    const data = typeof req.body?.dataUrl === 'string' ? req.body.dataUrl : ''
    const comma = data.indexOf(',')
    const head = /^data:image\/(jpeg|png|webp);base64$/.exec(data.slice(0, comma))
    if (!head) return res.status(400).json({ error: 'Only JPG, PNG or WebP images are allowed' })
    const buf = Buffer.from(data.slice(comma + 1), 'base64')
    if (buf.length > 6 * 1024 * 1024) return res.status(413).json({ error: 'Image is too large (max 6 MB)' })
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
    const isPng = buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    const isWebp = buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP'
    const ext = isJpeg ? 'jpg' : isPng ? 'png' : isWebp ? 'webp' : null
    if (!ext) return res.status(400).json({ error: 'The file is not a valid image' })
    const name = `${crypto.randomUUID()}.${ext}`
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf)
    audit(req, 'upload', name)
    return res.json({ url: `/uploads/${name}` })
  })

  admin.post('/:kind', (req, res) => {
    const kind = KINDS[req.params.kind]
    if (!kind) return res.status(404).json({ error: 'Unknown section' })
    const list = db[req.params.kind]
    const item = kind.clean(req.body)
    const now = new Date().toISOString()
    const created = { slug: uniqueSlug(list, slugify(item.title.uz)), ...item, createdAt: now, updatedAt: now }
    list.push(created)
    persist(db)
    audit(req, `create-${req.params.kind}`, created.slug)
    return res.status(201).json(created)
  })

  admin.put('/:kind/:slug', (req, res) => {
    const kind = KINDS[req.params.kind]
    if (!kind) return res.status(404).json({ error: 'Unknown section' })
    const list = db[req.params.kind]
    const i = list.findIndex((x) => x.slug === req.params.slug)
    if (i < 0) return res.status(404).json({ error: 'Not found' })
    const updated = { ...list[i], ...kind.clean(req.body), slug: list[i].slug, updatedAt: new Date().toISOString() }
    list[i] = updated
    persist(db)
    pruneUploads()
    audit(req, `update-${req.params.kind}`, updated.slug)
    return res.json(updated)
  })

  admin.delete('/:kind/:slug', (req, res) => {
    if (!KINDS[req.params.kind]) return res.status(404).json({ error: 'Unknown section' })
    const list = db[req.params.kind]
    const i = list.findIndex((x) => x.slug === req.params.slug)
    if (i < 0) return res.status(404).json({ error: 'Not found' })
    const [removed] = list.splice(i, 1)
    persist(db)
    pruneUploads()
    audit(req, `delete-${req.params.kind}`, removed.slug)
    return res.json({ ok: true })
  })

  api.use('/admin', admin)
  api.use((req, res) => res.status(404).json({ error: 'Not found' }))
  // eslint-disable-next-line no-unused-vars
  api.use((err, req, res, next) => {
    if (err instanceof Invalid) return res.status(400).json({ error: err.message })
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large' })
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request' })
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  })

  app.use('/api', api)
  return app
}
