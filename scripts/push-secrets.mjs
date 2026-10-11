// Sends the values from .dev.vars (ADMIN_PASSWORD, ADMIN_SECRET) to Cloudflare as secrets:
//   node scripts/push-secrets.mjs
// The values never touch git. A temporary file is used for the upload and deleted at once.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const lines = fs.readFileSync(path.join(root, '.dev.vars'), 'utf8').split(/\r?\n/)
const secrets = {}
for (const line of lines) {
  const m = /^(ADMIN_PASSWORD|ADMIN_SECRET)=(.+)$/.exec(line.trim())
  if (m) secrets[m[1]] = m[2]
}
if (!secrets.ADMIN_PASSWORD || !secrets.ADMIN_SECRET) {
  console.error('.dev.vars must contain ADMIN_PASSWORD and ADMIN_SECRET.')
  process.exit(1)
}

const tmp = path.join(os.tmpdir(), `secrets-${process.pid}.json`)
fs.writeFileSync(tmp, JSON.stringify(secrets), { mode: 0o600 })
const res = spawnSync(`npx wrangler secret bulk "${tmp}"`, { cwd: root, stdio: 'inherit', shell: true })
fs.rmSync(tmp, { force: true })
process.exit(res.status ?? 1)
