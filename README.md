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
