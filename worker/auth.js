// Admin sign-in: one password (the ADMIN_PASSWORD secret), a signed 12-hour token,
// and a limit on wrong guesses. Everything uses the Web Crypto API built into Workers.
const enc = new TextEncoder()
const TOKEN_TTL = 12 * 60 * 60 * 1000

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
const toB64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

const sha256 = (text) => crypto.subtle.digest('SHA-256', enc.encode(text))

export const hasPassword = (env) => typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length > 0

// Compares two SHA-256 digests without stopping at the first difference.
function sameBytes(a, b) {
  const x = new Uint8Array(a)
  const y = new Uint8Array(b)
  if (x.length !== y.length) return false
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}

export async function passwordOk(env, given) {
  if (!hasPassword(env)) return false
  return sameBytes(await sha256(given), await sha256(env.ADMIN_PASSWORD))
}

// The signing key mixes ADMIN_SECRET with the password, so changing the password signs
// everybody out.
async function signingKey(env) {
  const material = `${env.ADMIN_SECRET || ''}:${toHex(await sha256(env.ADMIN_PASSWORD))}`
  return crypto.subtle.importKey('raw', enc.encode(material), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function makeToken(env) {
  const payload = toB64url(enc.encode(JSON.stringify({ exp: Date.now() + TOKEN_TTL })))
  const sig = await crypto.subtle.sign('HMAC', await signingKey(env), enc.encode(payload))
  return `${payload}.${toB64url(sig)}`
}

export async function verifyToken(env, token) {
  if (!hasPassword(env) || typeof token !== 'string') return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  try {
    const ok = await crypto.subtle.verify('HMAC', await signingKey(env), fromB64url(sig), enc.encode(payload))
    if (!ok) return false
    const { exp } = JSON.parse(new TextDecoder().decode(fromB64url(payload)))
    return exp > Date.now()
  } catch {
    return false
  }
}

/* ------------------------------------------------------------ login limit */

// 8 tries per 10 minutes per address. The counters live in the bucket, because a Worker
// can run in many places at once and has no memory of its own between requests.
const MAX_ATTEMPTS = 8
const WINDOW = 10 * 60 * 1000

async function counterKey(ip) {
  return `throttle/${toHex(await sha256(ip)).slice(0, 24)}`
}

async function readCounter(env, key) {
  const obj = await env.BUCKET.get(key)
  if (!obj) return null
  try {
    const rec = await obj.json()
    return rec.reset >= Date.now() ? rec : null
  } catch {
    return null
  }
}

export async function isThrottled(env, ip) {
  const rec = await readCounter(env, await counterKey(ip))
  return Boolean(rec && rec.count >= MAX_ATTEMPTS)
}

export async function recordAttempt(env, ip) {
  const key = await counterKey(ip)
  const rec = (await readCounter(env, key)) || { count: 0, reset: Date.now() + WINDOW }
  rec.count += 1
  await env.BUCKET.put(key, JSON.stringify(rec))
}

export async function clearAttempts(env, ip) {
  await env.BUCKET.delete(await counterKey(ip))
}
