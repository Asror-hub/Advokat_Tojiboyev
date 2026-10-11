// Cleans the HTML produced by the admin text editor before it is stored (and shown on the
// public site). Only a short list of tags, attributes and styles survives; everything
// else (scripts, event handlers, foreign images, odd styles) is removed.
import sanitizeHtml from 'sanitize-html'

const COLOR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)$/i]
const ALIGNS = ['inline', 'left', 'center', 'right']
const UPLOAD_SRC = /^\/uploads\/([\w-]+\.(?:jpg|png|webp))$/

// File names of the uploaded pictures mentioned in some HTML.
export function uploadNames(html) {
  return [...String(html || '').matchAll(/\/uploads\/([\w-]+\.(?:jpg|png|webp))/g)].map((m) => m[1])
}

// `existing` is the set of picture file names that really are in storage.
const options = (existing) => ({
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'img'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['style'],
    p: ['style'],
    h2: ['style'],
    h3: ['style'],
    blockquote: ['style'],
    img: ['src', 'alt', 'style', { name: 'data-align', values: ALIGNS }],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
      'font-size': [/^\d{1,2}(\.\d{1,2})?(px|pt|em|rem)$/],
      'font-family': [/^[A-Za-z0-9 ,"'-]{1,100}$/],
      color: COLOR,
      'background-color': COLOR,
      width: [/^\d{1,3}(\.\d{1,2})?%$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName: 'a',
      attribs: { href: attribs.href || '', target: '_blank', rel: 'noopener noreferrer' },
    }),
  },
  // Pictures must be files that were uploaded through the admin panel.
  exclusiveFilter: (frame) => {
    if (frame.tag !== 'img') return false
    const match = UPLOAD_SRC.exec(frame.attribs.src || '')
    return !(match && existing.has(match[1]))
  },
})

export function cleanHtml(html, existing = new Set()) {
  const out = sanitizeHtml(String(html || ''), options(existing)).trim()
  // Keep blank lines the author typed, but not the empty ones left at the very end.
  return out.replace(/<p([^>]*)><\/p>/g, '<p$1><br /></p>').replace(/(<p[^>]*><br \/><\/p>\s*)+$/, '')
}

// Plain text of an HTML string (for "is it empty?" checks).
export function htmlToText(html) {
  return sanitizeHtml(String(html || ''), { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const hasImage = (html) => /<img\b/i.test(html)
