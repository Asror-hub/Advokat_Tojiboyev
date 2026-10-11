// Thin client for the admin endpoints. The login token lives in sessionStorage,
// so it disappears when the browser tab is closed.
const KEY = 'et-admin-token'

export const getToken = () => sessionStorage.getItem(KEY)
export const clearToken = () => sessionStorage.removeItem(KEY)

export class AuthError extends Error {}

// `body` is sent as JSON, or as it is when it is a Blob (picture uploads).
async function request(method, url, body, auth = true) {
  const isBlob = body instanceof Blob
  const headers = { 'Content-Type': isBlob ? body.type : 'application/json' }
  if (auth) headers.Authorization = `Bearer ${getToken() || ''}`
  let res
  try {
    res = await fetch(url, { method, headers, body: !body ? undefined : isBlob ? body : JSON.stringify(body) })
  } catch {
    throw new Error('Server bilan aloqa yo‘q')
  }
  let json = null
  try {
    json = await res.json()
  } catch {
    /* empty body */
  }
  if (res.status === 401 && auth) {
    clearToken()
    throw new AuthError('Sessiya tugadi. Qayta kiring.')
  }
  if (!res.ok) throw new Error(json?.error || `Xatolik (${res.status})`)
  return json
}

export async function login(password) {
  const { token } = await request('POST', '/api/admin/login', { password }, false)
  sessionStorage.setItem(KEY, token)
}

export const checkSession = () => request('GET', '/api/admin/session')
export const createItem = (kind, data) => request('POST', `/api/admin/${kind}`, data)
export const updateItem = (kind, slug, data) => request('PUT', `/api/admin/${kind}/${encodeURIComponent(slug)}`, data)
export const deleteItem = (kind, slug) => request('DELETE', `/api/admin/${kind}/${encodeURIComponent(slug)}`)

// "data:image/png;base64,...." -> Blob (the picture is sent to the server as plain bytes).
function dataUrlToBlob(dataUrl) {
  const comma = dataUrl.indexOf(',')
  const type = /^data:([^;,]+)/.exec(dataUrl.slice(0, comma))?.[1] || 'application/octet-stream'
  const binary = atob(dataUrl.slice(comma + 1))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}
export const uploadImage = (dataUrl) => request('POST', '/api/admin/upload', dataUrlToBlob(dataUrl))

// Shrinks a picked image (max 1600px wide) and returns it as a JPEG data URL.
export async function prepareImage(file, max = 1600) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Faqat JPG, PNG yoki WebP rasm yuklang')
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / bmp.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  const ctx = canvas.getContext('2d')
  // Screenshots (PNG) stay PNG so the text stays sharp, unless that gets too big.
  if (file.type === 'image/png') {
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const png = canvas.toDataURL('image/png')
    if (png.length < 3_500_000) {
      bmp.close?.()
      return png
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close?.()
  return canvas.toDataURL('image/jpeg', 0.88)
}
