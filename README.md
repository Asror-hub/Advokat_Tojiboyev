# Advokat Tojiboyev Eldor - website

Website of a criminal defense lawyer (Uzbekistan). Languages: Uzbek Cyrillic (default), Uzbek
Latin, Russian, English. React + Vite on the front end; a Cloudflare Worker provides the
content API, the admin panel at `/admin` and picture uploads, with an R2 bucket for storage.

```bash
npm install
cp .dev.vars.example .dev.vars   # then set ADMIN_PASSWORD and ADMIN_SECRET
npm run dev
```

- Site: <http://localhost:5173>, admin panel: <http://localhost:5173/admin>
- Put it online: see [DEPLOY.md](DEPLOY.md)

Folders: `src/` the website, `worker/` the Cloudflare Worker (API, login, uploads),
`public/_headers` security headers, `wrangler.jsonc` Cloudflare settings,
`scripts/` import and test helpers.
