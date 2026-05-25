# baba pet care — marketing site

Single-page marketing website for [baba pet care](https://babapetcare.com), an
in-home, insured pet care service in Ann Arbor, Michigan. Hosted as a static
export on AWS Amplify.

## Stack

- Next.js 16 (App Router) — static export (`output: 'export'`)
- TypeScript
- Tailwind v4 (`@theme` block in `app/globals.css`; no `tailwind.config.js`)
- `next/font/google` — Caveat (display), Fredoka (rounded), Quicksand (body)
- No backend, no DB, no analytics on v1

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

Useful commands:

```bash
npm run build       # exports static site to ./out
npx serve out       # smoke-test the static export locally
npm run lint
```

## Project layout

```text
app/
  layout.tsx            # fonts, metadata, root <html>/<body>
  page.tsx              # homepage — composes section components, ships JSON-LD
  links/page.tsx        # /links — Linktree replacement, IG-bio target
  globals.css           # Tailwind v4 @theme (palette, fonts, animations)
  _lib/
    site.ts             # business constants (phone, IG, email, intake form URL)
    cn.ts               # className merge helper
  _components/          # Button, Logo, TopBar, Footer, SpeechBubble, Icons, …
  _sections/            # One file per homepage section
public/
  photos/               # drop real photos here (see "Real assets" below)
amplify.yml             # AWS Amplify build spec → uploads ./out
next.config.ts          # output: 'export' + image.unoptimized + trailingSlash
```

The `_components` / `_sections` underscore prefix excludes the folders from
App-Router routing.

## Editing copy

Most copy lives next to the markup that uses it inside `app/_sections/*.tsx`.
Business-wide values (phone, email, IG, intake form URL, neighborhoods served,
affiliates) live in `app/_lib/site.ts` — change them in one place.

## Real assets

The site ships with inline-SVG placeholders so the layout is testable
immediately. To swap in real photos:

1. Drop image files into `public/photos/` (e.g. `hero.jpg`, `tux.jpg`,
   `services-dropin.jpg`).
2. In the relevant section file, replace `<Placeholder ... />` with
   `<img src="/photos/hero.jpg" alt="…descriptive…" className="..." />` (or
   `next/image` with `unoptimized` — see `next.config.ts`).
3. Pre-resize large photos before committing (e.g. 1600w hero, 800w cards) —
   `next/image` cannot optimize at runtime under static export.

## Deploying to AWS Amplify

1. Push this repo to GitHub.
2. In the Amplify console: **Host web app** → connect the GitHub repo →
   pick the `main` branch.
3. Amplify auto-detects "Next.js — SSG"; confirm:
   - Build command: `npm run build`
   - Output directory: `out`
   - Node version: 20 (Build settings → Edit YML / Build image settings)
4. The included `amplify.yml` matches the above; commit any changes there.
5. Connect your custom domain via Amplify → Domain management.

After the first deploy:

- Update Instagram bio link to `https://your-domain.com/links`.
- Retire the existing Linktree.
- Update phone number, email, and `intakeFormUrl` in `app/_lib/site.ts`.

## Open items before launch

See the implementation plan at
`~/.claude/plans/please-help-me-to-eager-sloth.md` for the full pre-launch
checklist (real photos, phone number, insurance carrier name, FAQ copy review,
privacy/terms pages, custom domain).
