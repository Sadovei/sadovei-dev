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

The link-preview image (`public/og.png`) is rendered from `scripts/og/og.html` with `scripts/og/build.sh`.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which lints, builds and publishes `./out` to GitHub Pages.
