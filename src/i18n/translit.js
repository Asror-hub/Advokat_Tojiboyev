// Uzbek Latin -> Uzbek Cyrillic transliteration.
// The site content is written once in Uzbek (Latin); the Cyrillic version is
// produced from it so both stay in sync.

import { isHtml } from '../data/body'

const VOWELS = 'aeiouAEIOU'
const TURN = new Set(['‘', 'ʻ', "'", '`']) // o‘ / g‘ marks
const TUTUQ = new Set(['’', 'ʼ']) // ъ mark (e’lon, ma’lumot)

// Russian-origin legal terms keep their Cyrillic spelling.
const LOAN = [
  [/instansiya/gi, (m) => (m[0] === 'I' ? 'Instantsiya' : 'instantsiya')],
]

// Anything matching this is left untouched: emails, links and markup tags.
const PROTECT = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+|https?:\/\/\S+|www\.\S+|<[^>]+>)/g

const SINGLE = {
  a: 'а', b: 'б', d: 'д', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л',
  m: 'м', n: 'н', o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в',
  w: 'в', x: 'х', y: 'й', z: 'з', c: 'к', e: 'е',
}

const isUpper = (ch) => !!ch && ch !== ch.toLowerCase()
const isLetter = (ch) => !!ch && ch.toLowerCase() !== ch.toUpperCase()

function cased(result, first, next) {
  // Keep capitalization of multi-letter results: "Sh" -> "Ш", "SH" -> "Ш".
  if (!isUpper(first)) return result
  if (result.length > 1 && isUpper(next)) return result.toUpperCase()
  return result.charAt(0).toUpperCase() + result.slice(1)
}

function convertWord(text) {
  let out = ''
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const lo = ch.toLowerCase()
    const next = text[i + 1]
    const nlo = next ? next.toLowerCase() : ''
    const prev = text[i - 1]
    const atStart = !isLetter(prev) && !TURN.has(prev || '') && !TUTUQ.has(prev || '')

    if (TUTUQ.has(ch)) {
      out += isLetter(prev) ? 'ъ' : ch
      continue
    }
    if (TURN.has(ch)) {
      // stray apostrophe after a letter that is not o/g acts as tutuq
      out += isLetter(prev) ? 'ъ' : ch
      continue
    }
    if (!isLetter(ch)) {
      out += ch
      continue
    }

    // o‘ g‘
    if ((lo === 'o' || lo === 'g') && next && TURN.has(next)) {
      out += cased(lo === 'o' ? 'ў' : 'ғ', ch, ch)
      i += 1
      continue
    }
    // digraphs
    if (lo === 's' && nlo === 'h') {
      out += cased('ш', ch, next)
      i += 1
      continue
    }
    if (lo === 'c' && nlo === 'h') {
      out += cased('ч', ch, next)
      i += 1
      continue
    }
    if (lo === 't' && nlo === 's') {
      out += cased('ц', ch, next)
      i += 1
      continue
    }
    if (lo === 'y' && 'oua'.includes(nlo) && nlo) {
      // yo‘ is "й" + "ў", not "ё"
      if (nlo === 'o' && TURN.has(text[i + 2] || '')) {
        out += cased('й', ch, ch)
        continue
      }
      const map = { o: 'ё', u: 'ю', a: 'я' }
      out += cased(map[nlo], ch, next)
      i += 1
      continue
    }
    if (lo === 'y' && nlo === 'e') {
      out += cased('е', ch, next)
      i += 1
      continue
    }
    // e at the start of a word is "э"
    if (lo === 'e' && atStart) {
      out += cased('э', ch, ch)
      continue
    }

    const mapped = SINGLE[lo]
    out += mapped ? cased(mapped, ch, ch) : ch
  }
  return out
}

const cache = new Map()

export function toCyrillic(input) {
  if (typeof input !== 'string' || !input) return input
  const hit = cache.get(input)
  if (hit !== undefined) return hit
  let text = input
  LOAN.forEach(([re, fn]) => {
    text = text.replace(re, fn)
  })
  const result = text
    .split(PROTECT)
    .map((part, i) => (i % 2 === 1 ? part : convertWord(part)))
    .join('')
  cache.set(input, result)
  return result
}

// HTML text (from the admin editor): only the readable text is converted, never the
// tags, links or styles.
const htmlCache = new Map()
function htmlCyrillic(html) {
  if (htmlCache.has(html)) return htmlCache.get(html)
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) walker.currentNode.nodeValue = toCyrillic(walker.currentNode.nodeValue)
  doc.body.querySelectorAll('img[alt]').forEach((img) => img.setAttribute('alt', toCyrillic(img.alt)))
  const out = doc.body.innerHTML
  htmlCache.set(html, out)
  return out
}

// Recursively converts every string inside objects / arrays.
export function deepCyrillic(value) {
  if (typeof value === 'string') return isHtml(value) ? htmlCyrillic(value) : toCyrillic(value)
  if (Array.isArray(value)) return value.map(deepCyrillic)
  if (value && typeof value === 'object') {
    const out = {}
    Object.keys(value).forEach((k) => {
      out[k] = deepCyrillic(value[k])
    })
    return out
  }
  return value
}
