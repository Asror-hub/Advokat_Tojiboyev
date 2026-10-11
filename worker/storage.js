// Where the content lives: one R2 bucket.
//   content.json     all articles and cases
//   uploads/<name>   pictures uploaded through the admin panel
import { ARTICLES } from '../src/data/articles.js'
import { CASES } from '../src/data/cases.js'
import { linesToHtml } from '../src/data/body.js'
import { cleanHtml, uploadNames } from './richtext.js'

export const LANGS = ['uz', 'ru', 'en']
const CONTENT = 'content.json'
const JSON_TYPE = { httpMetadata: { contentType: 'application/json' } }

// Which of these picture names are really in storage?
export async function existingUploads(env, names) {
  const unique = [...new Set(names)]
  const found = await Promise.all(unique.map(async (n) => ((await env.BUCKET.head(`uploads/${n}`)) ? n : null)))
  return new Set(found.filter(Boolean))
}

// Older versions stored the text as lists of paragraphs; the editor now stores HTML.
const hasOldBodies = (db) =>
  [...db.articles, ...db.cases].some((item) => LANGS.some((l) => Array.isArray(item.body?.[l])))

async function migrate(env, db) {
  const items = [...db.articles, ...db.cases]
  const names = items.flatMap((item) => LANGS.flatMap((l) => (Array.isArray(item.body?.[l]) ? uploadNames(item.body[l].join('\n')) : [])))
  const existing = await existingUploads(env, names)
  for (const item of items) {
    for (const l of LANGS) {
      if (Array.isArray(item.body?.[l])) item.body[l] = cleanHtml(linesToHtml(item.body[l]), existing)
    }
  }
}

// Reads the content. On the very first run it is created from the content that ships
// with the site (src/data). `etag` is used to detect two saves happening at once.
async function read(env) {
  let obj = await env.BUCKET.get(CONTENT)
  if (!obj) {
    const seed = { articles: structuredClone(ARTICLES), cases: structuredClone(CASES) }
    await migrate(env, seed)
    // "etagDoesNotMatch: *" = only write if nothing exists yet.
    await env.BUCKET.put(CONTENT, JSON.stringify(seed), { ...JSON_TYPE, onlyIf: { etagDoesNotMatch: '*' } })
    obj = await env.BUCKET.get(CONTENT)
  }
  const db = await obj.json()
  return { db, etag: obj.etag }
}

export async function loadContent(env) {
  const { db, etag } = await read(env)
  if (!hasOldBodies(db)) return db
  await migrate(env, db)
  await env.BUCKET.put(CONTENT, JSON.stringify(db), { ...JSON_TYPE, onlyIf: { etagMatches: etag } })
  return db
}

// Changes the content: `change(db)` edits it and may return a value. If somebody else
// saved in the meantime, the change is applied again to the fresh content.
export async function mutate(env, change) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { db, etag } = await read(env)
    if (hasOldBodies(db)) await migrate(env, db)
    const result = await change(db)
    const saved = await env.BUCKET.put(CONTENT, JSON.stringify(db), { ...JSON_TYPE, onlyIf: { etagMatches: etag } })
    if (saved) return { result, db }
  }
  throw new Error('Could not save, please try again')
}

// Removes pictures that no article or case uses any more (only files older than an hour,
// so a picture that was just uploaded but not saved yet is safe).
export async function pruneUploads(env, db) {
  const content = JSON.stringify([db.articles, db.cases])
  const stale = []
  let cursor
  do {
    const page = await env.BUCKET.list({ prefix: 'uploads/', cursor })
    for (const obj of page.objects) {
      const name = obj.key.slice('uploads/'.length)
      if (!content.includes(`/uploads/${name}`) && Date.now() - obj.uploaded.getTime() > 60 * 60 * 1000) stale.push(obj.key)
    }
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  for (let i = 0; i < stale.length; i += 500) await env.BUCKET.delete(stale.slice(i, i + 500))
}
