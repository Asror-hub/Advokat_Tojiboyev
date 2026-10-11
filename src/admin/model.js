// Converts between stored content items and the flat text-based form state.
import { bodyText, toHtml } from '../data/body'

export const LANG_TABS = [
  { id: 'uz', label: 'O‘zbekcha (lotin)' },
  { id: 'ru', label: 'Русский' },
  { id: 'en', label: 'English' },
]
export const LANGS = LANG_TABS.map((l) => l.id)
export const ART_COVERS = ['court', 'books', 'scale', 'gavel', 'desk']
export const ARTICLE_CATS = ['analysis', 'qa', 'legislation', 'news']

const today = () => new Date().toISOString().slice(0, 10)
const triEmpty = () => ({ uz: '', ru: '', en: '' })

// { uz, ru, en } -> text. A plain string (e.g. "80%") is treated as the Uzbek text.
const triText = (v) => {
  if (v == null) return triEmpty()
  if (typeof v === 'string') return { uz: v, ru: '', en: '' }
  return { uz: v.uz || '', ru: v.ru || '', en: v.en || '' }
}
const triJoin = (v, sep) => {
  const out = triEmpty()
  for (const l of LANGS) out[l] = Array.isArray(v?.[l]) ? v[l].join(sep) : ''
  return out
}

const tagList = (s) =>
  s
    .split(',')
    .map((x) => x.trim().replace(/^#/, ''))
    .filter(Boolean)
// The body of every language is an HTML string written in the rich text editor.
const bodyOf = (obj) => Object.fromEntries(LANGS.map((l) => [l, toHtml(obj?.[l])]))

const mapLangs = (obj, fn) => Object.fromEntries(LANGS.map((l) => [l, fn(obj[l] || '')]))

export function emptyForm(kind) {
  const base = {
    date: today(),
    image: 'art:court',
    title: triEmpty(),
    excerpt: triEmpty(),
    body: triEmpty(),
  }
  if (kind === 'articles') return { ...base, category: 'analysis', tags: triEmpty() }
  return {
    ...base,
    status: 'successful',
    category: triEmpty(),
    court: triEmpty(),
    amount: triEmpty(),
    timeline: [],
  }
}

export function toForm(kind, item) {
  const base = {
    date: item.date,
    image: item.image || 'art:court',
    title: triText(item.title),
    excerpt: triText(item.excerpt),
    body: bodyOf(item.body),
  }
  if (kind === 'articles') return { ...base, category: item.category, tags: triJoin(item.tags, ', ') }
  return {
    ...base,
    status: item.status,
    category: triText(item.category),
    court: triText(item.court),
    amount: triText(item.amount),
    timeline: (item.timeline || []).map((s) => ({ date: s.date, uz: s.uz || '', ru: s.ru || '', en: s.en || '' })),
  }
}

export function fromForm(kind, f) {
  const base = {
    date: f.date,
    image: f.image,
    title: f.title,
    excerpt: f.excerpt,
    body: f.body,
  }
  if (kind === 'articles') return { ...base, category: f.category, tags: mapLangs(f.tags, tagList) }
  return {
    ...base,
    status: f.status,
    category: f.category,
    court: f.court,
    amount: f.amount,
    timeline: f.timeline,
  }
}

// Returns an error message (Uzbek) or '' when the form can be saved.
export function check(kind, f) {
  if (!f.title.uz.trim()) return 'Sarlavhani (o‘zbekcha) kiriting'
  if (!f.excerpt.uz.trim()) return 'Qisqa tavsifni (o‘zbekcha) kiriting'
  if (!bodyText(f.body.uz)) return 'Matnni (o‘zbekcha) kiriting'
  if (!f.date) return 'Sanani tanlang'
  if (kind === 'cases') {
    if (!f.category.uz.trim()) return 'Ish turini (o‘zbekcha) kiriting'
    if (!f.court.uz.trim()) return 'Sud nomini (o‘zbekcha) kiriting'
  }
  return ''
}
