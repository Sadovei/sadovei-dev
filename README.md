# sadovei.dev

Personal site of Radu Sadovei, Senior Frontend Developer (React, Next.js, React Native, TypeScript).

Built with Next.js 16 as a fully static export and deployed to GitHub Pages.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static site in ./out
```

## Content

All copy lives in `src/content/`:

- `site.ts`: profile, highlights, services, quick facts and the booking link
- `work.ts`: case studies, one page each under `/work/[slug]/`

Link-preview images:

- `public/og.png` (homepage): `scripts/og/build.sh`
- `public/og/<slug>.png` (case studies and the 3D lab, generated from `src/content/work.ts`): `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/og/build-pages.mjs`

Re-run them after changing a title.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which lints, builds and publishes `./out` to GitHub Pages.

## Dashboard

`/dashboard/` is a private tool (not linked, `noindex`, no analytics). The page holds no data: it signs in with a fine-grained GitHub token scoped to the private `Sadovei/job-radar` repo and reads and writes everything there through the GitHub API (`data/` from the radar, `tracker/tracker.json` for outreach, brokers and templates). A Content Security Policy only allows requests to `api.github.com`.

## Diagram QA

`scripts/qa/diagram-check.js` checks every `.diagram` SVG on a page for text that spills out of its box, sits too close to an edge, overlaps other text or has a line drawn across it. Paste it into the browser console on a note page (or `page.evaluate` it in Playwright); an empty array means the layout is clean.
