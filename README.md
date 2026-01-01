## Sig Imob Cluj (website)

This folder contains a standalone website you can push to GitHub and deploy on Vercel.

### Run locally

```bash
cd sig-imob-cluj-web
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Put on GitHub (so you can edit later in Cursor)

1) Create a new GitHub repo (example: `sig-imob-cluj`)
2) From the root of this folder:

```bash
git init
git add .
git commit -m "Initial Sig Imob Cluj website"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Deploy on Vercel

1) In Vercel: **New Project → Import** your GitHub repo → Deploy
2) Add domain in **Project → Settings → Domains**
3) Add the DNS records Vercel shows in your domain registrar

Typical records:
- `A` record: `@` → `76.76.21.21`
- `CNAME`: `www` → `cname.vercel-dns.com`

### Edit content

- Update listings in `src/lib/listings.ts`
- Update phone/email in `src/components/site-footer.tsx` and `src/app/contact/page.tsx`

### Tech

Next.js App Router + TypeScript + Tailwind.

