// The content API: articles + cases, protected admin endpoints, picture uploads.
//   GET    /api/content                  public
//   POST   /api/admin/login              { password } -> { token }
//   GET    /api/admin/session            needs token
//   POST   /api/admin/upload             raw image bytes -> { url }
//   POST   /api/admin/:kind              create   (kind = articles | cases)
//   PUT    /api/admin/:kind/:slug        update
//   DELETE /api/admin/:kind/:slug        delete
import { linesToHtml } from '../src/data/body.js'
import { clearAttempts, hasPassword, isThrottled, makeToken, passwordOk, recordAttempt, verifyToken } from './auth.js'
import { cleanHtml, hasImage, htmlToText, uploadNames } from './richtext.js'
import { LANGS, existingUploads, loadContent, mutate, pruneUploads } from './storage.js'

const ARTICLE_CATS = ['analysis', 'qa', 'legislation', 'news']
const STATUSES = ['successful', 'notable']
const ART_COVERS = ['court', 'books', 'scale', 'gavel', 'desk']

const MAX_JSON = 9 * 1024 * 1024
const MAX_IMAGE = 6 * 1024 * 1024
const MAX_HTML = 400_000

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
const bad = (message) => {
  throw new HttpError(400, message)
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const clientIp = (request) => request.headers.get('CF-Connecting-IP') || 'unknown'

// Admin activity log: visible in the Cloudflare dashboard (Workers > Logs).
const audit = (request, action, detail = '') =>
  console.log(`[audit] ${clientIp(request)} ${action} ${String(detail).replace(/\s+/g, ' ').slice(0, 120)}`.trim())

async function readJson(request, limit) {
  if (Number(request.headers.get('Content-Length')) > limit) throw new HttpError(413, 'Request is too large')
  const raw = await request.text()
  if (raw.length > limit) throw new HttpError(413, 'Request is too large')
  try {
    return JSON.parse(raw)
  } catch {
    throw new HttpError(400, 'Invalid request')
  }
}

/* --------------------------------------------------------------- validation */

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

// { uz, ru, en } of string arrays (tags).
function triList(v, maxItems, maxLen) {
  const out = {}
  for (const l of LANGS) {
    const list = Array.isArray(v?.[l]) ? v[l].map((s) => text(s, maxLen)).filter(Boolean).slice(0, maxItems) : []
    if (list.length) out[l] = list
  }
  return out
}

// Article/case text: one cleaned HTML string per language (see worker/richtext.js).
// Older paragraph lists are converted to HTML first.
async function bodyHtml(env, v, label) {
  const raws = {}
  for (const l of LANGS) {
    const value = v?.[l]
    const raw = Array.isArray(value)
      ? linesToHtml(value.filter((s) => typeof s === 'string'))
      : typeof value === 'string'
        ? value
        : ''
    if (raw.length > MAX_HTML) bad(`${label}: the text is too long`)
    raws[l] = raw
  }
  const existing = await existingUploads(env, Object.values(raws).flatMap(uploadNames))
  const out = {}
  for (const l of LANGS) {
    const html = cleanHtml(raws[l], existing)
    if (htmlToText(html) || hasImage(html)) out[l] = html
  }
  // The Uzbek text must contain real words, not only pictures.
  if (!htmlToText(out.uz)) bad(`${label}: Uzbek text is required`)
  return out
}

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

async function cleanArticle(env, b) {
  if (!ARTICLE_CATS.includes(b?.category)) bad('Category is invalid')
  return {
    category: b.category,
    date: isoDate(b.date),
    title: tri(b.title, 240, 'Title', true),
    excerpt: tri(b.excerpt, 600, 'Short description', true),
    image: image(b.image),
    tags: triList(b.tags, 12, 40),
    body: await bodyHtml(env, b.body, 'Text'),
  }
}

async function cleanCase(env, b) {
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
    body: await bodyHtml(env, b.body, 'Text'),
  }
}

const KINDS = { articles: cleanArticle, cases: cleanCase }

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

const byDate = (a, b) => String(b.date).localeCompare(String(a.date)) || String(b.createdAt || '').localeCompare(String(a.createdAt || ''))

/* ------------------------------------------------------------------- routes */

async function login(request, env) {
  if (!hasPassword(env)) return json({ error: 'The admin password is not set on the server' }, 503)
  const ip = clientIp(request)
  if (await isThrottled(env, ip)) {
    audit(request, 'login-blocked')
    return json({ error: 'Too many attempts. Try again in a few minutes.' }, 429)
  }
  // Counted before the password is checked, so parallel requests cannot slip through.
  await recordAttempt(env, ip)
  const body = await readJson(request, 2048)
  const given = typeof body?.password === 'string' ? body.password.slice(0, 256) : ''
  if (!(await passwordOk(env, given))) {
    audit(request, 'login-failed')
    await sleep(600)
    return json({ error: 'Wrong password' }, 401)
  }
  await clearAttempts(env, ip)
  audit(request, 'login')
  return json({ token: await makeToken(env) })
}

async function upload(request, env) {
  if (Number(request.headers.get('Content-Length')) > MAX_IMAGE) throw new HttpError(413, 'Image is too large (max 6 MB)')
  const buf = new Uint8Array(await request.arrayBuffer())
  if (buf.length > MAX_IMAGE) throw new HttpError(413, 'Image is too large (max 6 MB)')
  const ascii = (from, to) => String.fromCharCode(...buf.subarray(from, to))
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  const isPng = buf[0] === 0x89 && ascii(1, 4) === 'PNG'
  const isWebp = ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP'
  const ext = isJpeg ? 'jpg' : isPng ? 'png' : isWebp ? 'webp' : null
  if (!ext) bad('Only JPG, PNG or WebP images are allowed')
  const type = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext]
  const name = `${crypto.randomUUID()}.${ext}`
  await env.BUCKET.put(`uploads/${name}`, buf, { httpMetadata: { contentType: type } })
  audit(request, 'upload', name)
  return json({ url: `/uploads/${name}` })
}

async function admin(request, env, ctx, parts) {
  const method = request.method
  const [, section, slugPart] = parts

  if (section === 'session') return method === 'GET' ? json({ ok: true }) : json({ error: 'Not found' }, 404)
  if (section === 'upload') return method === 'POST' ? upload(request, env) : json({ error: 'Not found' }, 404)

  const clean = KINDS[section]
  if (!clean) return json({ error: 'Unknown section' }, 404)

  if (method === 'POST' && parts.length === 2) {
    const item = await clean(env, await readJson(request, MAX_JSON))
    const now = new Date().toISOString()
    const { result, db } = await mutate(env, (data) => {
      const list = data[section]
      const created = { slug: uniqueSlug(list, slugify(item.title.uz)), ...item, createdAt: now, updatedAt: now }
      list.push(created)
      return created
    })
    ctx.waitUntil(pruneUploads(env, db))
    audit(request, `create-${section}`, result.slug)
    return json(result, 201)
  }

  if (parts.length === 3) {
    let slug
    try {
      slug = decodeURIComponent(slugPart)
    } catch {
      return json({ error: 'Not found' }, 404)
    }

    if (method === 'PUT') {
      const item = await clean(env, await readJson(request, MAX_JSON))
      const { result, db } = await mutate(env, (data) => {
        const list = data[section]
        const i = list.findIndex((x) => x.slug === slug)
        if (i < 0) throw new HttpError(404, 'Not found')
        list[i] = { ...list[i], ...item, slug: list[i].slug, updatedAt: new Date().toISOString() }
        return list[i]
      })
      ctx.waitUntil(pruneUploads(env, db))
      audit(request, `update-${section}`, result.slug)
      return json(result)
    }

    if (method === 'DELETE') {
      const { result, db } = await mutate(env, (data) => {
        const list = data[section]
        const i = list.findIndex((x) => x.slug === slug)
        if (i < 0) throw new HttpError(404, 'Not found')
        return list.splice(i, 1)[0]
      })
      ctx.waitUntil(pruneUploads(env, db))
      audit(request, `delete-${section}`, result.slug)
      return json({ ok: true })
    }
  }

  return json({ error: 'Not found' }, 404)
}

async function route(request, env, ctx) {
  const { pathname } = new URL(request.url)
  const parts = pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)

  if (parts[0] === 'content' && parts.length === 1) {
    if (request.method !== 'GET') return json({ error: 'Not found' }, 404)
    const db = await loadContent(env)
    return json({ articles: [...db.articles].sort(byDate), cases: [...db.cases].sort(byDate) })
  }

  if (parts[0] !== 'admin') return json({ error: 'Not found' }, 404)
  if (parts[1] === 'login' && parts.length === 2) {
    return request.method === 'POST' ? login(request, env) : json({ error: 'Not found' }, 404)
  }

  // Everything below needs a valid token. It is checked BEFORE the body is read.
  const header = request.headers.get('Authorization') || ''
  if (!(await verifyToken(env, header.startsWith('Bearer ') ? header.slice(7) : ''))) {
    return json({ error: 'Not signed in' }, 401)
  }
  return admin(request, env, ctx, parts)
}

// A request that was refused before its body was read (for example a missing token) still
// has to be read to the end and thrown away - nothing is kept in memory. Without this the
// connection can be left in a bad state (seen with the local development server).
async function discardBody(request) {
  if (!request.body || request.bodyUsed) return
  let seen = 0
  const sink = new WritableStream({
    write(chunk) {
      seen += chunk.byteLength
      if (seen > MAX_JSON) throw new Error('too large')
    },
  })
  await request.body.pipeTo(sink).catch(() => {})
}

export async function handleApi(request, env, ctx) {
  try {
    return await route(request, env, ctx)
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status)
    console.error(err)
    return json({ error: 'Server error' }, 500)
  } finally {
    await discardBody(request)
  }
}
