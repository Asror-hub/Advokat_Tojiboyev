// Security headers for the responses the Worker creates itself (API and pictures).
// The website files get theirs from public/_headers - keep both lists in sync.

// The site only loads its own scripts. Google Fonts is the single external resource.
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

export function secure(response, url) {
  const res = new Response(response.body, response)
  const h = res.headers
  h.set('Content-Security-Policy', CSP)
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('X-Frame-Options', 'DENY')
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
  h.set('Cross-Origin-Opener-Policy', 'same-origin')
  h.set('Cross-Origin-Resource-Policy', 'same-origin')
  if (url.protocol === 'https:') h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  if (url.pathname.startsWith('/api/')) h.set('X-Robots-Tag', 'noindex, nofollow')
  return res
}
