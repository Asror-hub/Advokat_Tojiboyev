// Article / case text is stored per language as an HTML string written in the admin editor.
// Older content was a list of paragraphs (strings); those are converted on the fly.

// Old image line:  [[img:/uploads/<file>.jpg|optional caption]]
const IMG = /^\[\[img:(\/uploads\/[\w-]+\.(?:jpg|png|webp))(?:\|([^\]]*))?\]\]$/

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function linesToHtml(lines = []) {
  return lines
    .map((line) => {
      const m = IMG.exec(line)
      if (!m) return `<p>${esc(line)}</p>`
      const cap = (m[2] || '').trim()
      const img = `<p><img src="${m[1]}" alt="${esc(cap)}" data-align="center" style="width: 100%"></p>`
      return cap ? `${img}<p style="text-align: center"><em>${esc(cap)}</em></p>` : img
    })
    .join('')
}

// HTML written by the editor always starts with a block tag.
export const isHtml = (s) => typeof s === 'string' && /^\s*<(p|h[1-6]|ul|ol|blockquote|img|hr|div)\b/i.test(s)

// Body of any shape (array of lines, plain text or HTML) -> HTML.
export function toHtml(body) {
  if (Array.isArray(body)) return linesToHtml(body)
  if (typeof body !== 'string') return ''
  return isHtml(body) ? body : linesToHtml(body.split(/\n\s*\n/).filter(Boolean))
}

// Readable text of a body (no tags, no pictures), e.g. for search and reading time.
export function bodyText(body) {
  return toHtml(body)
    .replace(/<img\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}
