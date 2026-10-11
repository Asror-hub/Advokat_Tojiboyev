# Putting the site on Cloudflare

The whole site runs on Cloudflare: the pages, the admin panel (`/admin`), the articles and the
uploaded pictures. One Worker serves everything, and one R2 bucket stores the articles, cases
and pictures. Nothing else is needed.

You need: a free Cloudflare account, Node.js on your computer, and this project on GitHub.

## 1. One-time setup

```bash
npm install
npx wrangler login                      # opens the browser, click "Allow"
npx wrangler r2 bucket create advokat-eldor
```

> R2 may ask you to add a payment card the first time. The free allowance (10 GB, millions of
> requests) is far more than this site needs, so nothing is charged.

## 2. First deploy

```bash
npm run deploy
```

It builds the site and uploads it. At the end it prints the address, like
`https://advokat-eldor.<your-name>.workers.dev`.

## 3. Set the admin password

```bash
npx wrangler secret put ADMIN_PASSWORD   # type the password you want, 12+ characters
npx wrangler secret put ADMIN_SECRET     # type any long random text (40+ characters)
```

Secrets are stored encrypted by Cloudflare. They are not in the code or on GitHub.
Changing `ADMIN_PASSWORD` later signs everybody out. Then open `/admin` and log in.

## 4. Bring over the existing articles and pictures (optional)

If you wrote articles on your computer (`server/data` and `server/uploads` exist):

```bash
npm run import:remote
```

If you skip it, the live site starts with the sample articles that come with the project.

## 5. Update the site automatically from GitHub

In the Cloudflare dashboard: **Workers & Pages -> advokat-eldor -> Settings -> Builds ->
Connect** and pick the GitHub repository. Use:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

From then on every push to GitHub updates the live site. Articles written in the admin panel
are not touched by updates, because they live in the R2 bucket, not in the code.

## 6. Your own domain

The domain must use Cloudflare DNS. Then: **Workers & Pages -> advokat-eldor -> Settings ->
Domains & Routes -> Add -> Custom domain** and type the domain (for example
`advokat-eldor.uz`). HTTPS is set up automatically.

In **SSL/TLS -> Edge Certificates** switch on **Always Use HTTPS**.

## Working on your computer

```bash
npm run dev            # site + admin on http://localhost:5173
npm run preview        # same, but the built version
npm run import:local   # copy server/data + server/uploads into the local test bucket
```

Local passwords live in `.dev.vars` (copy `.dev.vars.example`). The local test articles and
pictures are kept in the `.wrangler` folder and are separate from the live site.

## Good to know

- **Backups:** the live content is the bucket `advokat-eldor` (R2 -> Buckets). `content.json`
  holds every article and case; `uploads/` holds the pictures.
- **Activity log:** every login, save and delete is written to the Worker logs (Cloudflare
  dashboard -> Workers & Pages -> advokat-eldor -> Logs).
- **Wrong passwords:** 8 wrong tries from one address block that address for 10 minutes.
- **Free plan limit:** a Worker may use about 10 ms of processor time per request. Normal
  pages and typical articles are well below that. If saving a very large article ever fails
  with "Error 1102", upgrading to the $5/month Workers plan removes the limit.
- **Extra protection for `/admin`:** Cloudflare Zero Trust -> Access lets you require an
  e-mail code before the admin page even loads (free for up to 50 people).
