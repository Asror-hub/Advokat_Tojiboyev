// One-time import of the articles, cases and pictures from the old Node server
// (server/data/content.json and server/uploads/) into the Cloudflare R2 bucket.
//
//   npm run import:local     into the bucket used by `npm run dev`
//   npm run import:remote    into the live bucket on Cloudflare (run `npx wrangler login` first)
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const BUCKET = 'advokat-eldor'
const target = process.argv.includes('--remote') ? '--remote' : '--local'
const root = path.resolve(import.meta.dirname, '..')
const contentFile = path.join(root, 'server', 'data', 'content.json')
const uploadDir = path.join(root, 'server', 'uploads')

const TYPES = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }

function put(key, file, contentType) {
  const command = `npx wrangler r2 object put "${BUCKET}/${key}" --file "${file}" --content-type ${contentType} ${target}`
  const res = spawnSync(command, { cwd: root, stdio: 'inherit', shell: true })
  if (res.status !== 0) {
    console.error(`\nCould not upload ${key}`)
    process.exit(1)
  }
}

if (!fs.existsSync(contentFile)) {
  console.error('server/data/content.json was not found - there is nothing to import.')
  process.exit(1)
}

const pictures = fs.existsSync(uploadDir)
  ? fs.readdirSync(uploadDir).filter((name) => TYPES[path.extname(name).toLowerCase()])
  : []

console.log(`Importing ${pictures.length} picture(s) and the articles/cases (${target.slice(2)})...`)
for (const name of pictures) put(`uploads/${name}`, path.join(uploadDir, name), TYPES[path.extname(name).toLowerCase()])
put('content.json', contentFile, 'application/json')
console.log('\nDone.')
