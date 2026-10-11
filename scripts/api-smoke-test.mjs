// Quick check of the API against a running dev server:  node scripts/api-smoke-test.mjs [baseUrl]
// Needs the admin password in the ADMIN_PASSWORD environment variable.
// It creates a test article, edits it and deletes it again.
const BASE = process.argv[2] || 'http://localhost:5174'
const PASSWORD = process.env.ADMIN_PASSWORD
if (!PASSWORD) {
  console.error('Set ADMIN_PASSWORD first.')
  process.exit(1)
}

const PNG = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),
  (c) => c.charCodeAt(0),
)

let failed = 0
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} ${ok ? '' : extra}`)
  if (!ok) failed++
}

async function call(method, url, { token, json, raw, type } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (json) headers['Content-Type'] = 'application/json'
  if (raw) headers['Content-Type'] = type
  const res = await fetch(BASE + url, { method, headers, body: json ? JSON.stringify(json) : raw })
  let data = null
  try {
    data = await res.clone().json()
  } catch {
    /* not json */
  }
  return { res, data }
}

const wrong = await call('POST', '/api/admin/login', { json: { password: 'definitely-wrong' } })
check('wrong password is rejected (401)', wrong.res.status === 401, wrong.res.status)

const noAuth = await call('POST', '/api/admin/articles', { json: {} })
check('admin route without a token is rejected (401)', noAuth.res.status === 401, noAuth.res.status)

const login = await call('POST', '/api/admin/login', { json: { password: PASSWORD } })
check('login works', login.res.ok && login.data?.token, JSON.stringify(login.data))
const token = login.data.token

const session = await call('GET', '/api/admin/session', { token })
check('session check works', session.res.ok)

const badUpload = await call('POST', '/api/admin/upload', { token, raw: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), type: 'image/png' })
check('a non-image upload is rejected (400)', badUpload.res.status === 400, badUpload.res.status)

const up = await call('POST', '/api/admin/upload', { token, raw: PNG, type: 'image/png' })
check('png upload works', up.res.ok && /^\/uploads\/[\w-]+\.png$/.test(up.data?.url || ''), JSON.stringify(up.data))
const imgUrl = up.data.url

const served = await fetch(BASE + imgUrl)
const bytes = new Uint8Array(await served.arrayBuffer())
check('uploaded picture is served', served.ok && served.headers.get('content-type') === 'image/png' && bytes.length === PNG.length, served.status)
const etag = served.headers.get('etag')
const cached = await fetch(BASE + imgUrl, { headers: { 'If-None-Match': etag } })
check('picture answers 304 for a matching ETag', cached.status === 304, cached.status)
const missing = await fetch(BASE + '/uploads/00000000-0000-0000-0000-000000000000.png')
check('missing picture gives 404', missing.status === 404, missing.status)

const evil =
  `<p>Hello <script>alert(1)</script><a href="javascript:alert(1)" onclick="x()">link</a> <strong>bold</strong></p>` +
  `<p><img src="${imgUrl}" alt="mine" data-align="left" style="width: 40%; position: fixed"></p>` +
  `<p><img src="/uploads/ffffffff-ffff-ffff-ffff-ffffffffffff.png" alt="ghost"><img src="https://evil.example/x.png"></p>`
const article = {
  category: 'news',
  date: '2026-10-11',
  title: { uz: 'Smoke test sarlavha' },
  excerpt: { uz: 'Qisqa tavsif' },
  image: imgUrl,
  tags: { uz: ['test'] },
  body: { uz: evil },
}
const created = await call('POST', '/api/admin/articles', { token, json: article })
check('article is created (201)', created.res.status === 201, JSON.stringify(created.data))
const body = created.data?.body?.uz || ''
check('script tag removed', !/script|alert/i.test(body), body)
check('javascript: link and onclick removed', !/javascript|onclick/i.test(body), body)
check('own uploaded image kept, style cleaned', body.includes(imgUrl) && /width:\s*40%/.test(body) && !/position/.test(body), body)
check('unknown and foreign images removed', !/ffffffff|evil\.example/.test(body), body)
const slug = created.data.slug

const pub = await call('GET', '/api/content')
check('public content lists the new article', pub.data?.articles?.some((a) => a.slug === slug))

const updated = await call('PUT', `/api/admin/articles/${slug}`, { token, json: { ...article, title: { uz: 'Smoke test yangilandi' } } })
check('article is updated', updated.res.ok && updated.data?.title?.uz === 'Smoke test yangilandi', JSON.stringify(updated.data))

const empty = await call('POST', '/api/admin/articles', { token, json: { ...article, body: { uz: '<p></p>' } } })
check('empty text is rejected (400)', empty.res.status === 400, empty.res.status)

const del = await call('DELETE', `/api/admin/articles/${slug}`, { token })
check('article is deleted', del.res.ok)
const again = await call('DELETE', `/api/admin/articles/${slug}`, { token })
check('deleting twice gives 404', again.res.status === 404, again.res.status)

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll checks passed')
process.exit(failed ? 1 : 0)
