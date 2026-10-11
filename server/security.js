// Security headers and HTTPS handling for the production server.

// The site only loads its own scripts. Google Fonts is the single external resource.
const CSP = [
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

export function securityHeaders(req, res, next) {
  res.setHeader('Content-Security-Policy', CSP)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  // Only meaningful (and only sent) over HTTPS.
  if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  if (req.path === '/admin' || req.path.startsWith('/admin/') || req.path.startsWith('/api/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  }
  next()
}

// FORCE_HTTPS=true: send plain-http visitors to https. Needs TRUST_PROXY when behind a proxy.
export function forceHttps(req, res, next) {
  if (process.env.FORCE_HTTPS === 'true' && !req.secure) {
    return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`)
  }
  return next()
}
