// Renders one 1200x630 link-preview image per case study (and the 3D lab) into public/og/.
// Run with: node scripts/og/build-pages.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { caseStudies } from "../../src/content/work.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../public/og");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(outDir, { recursive: true });

const pages = [
  ...caseStudies.map((study) => ({ slug: study.slug, eyebrow: `Case study · ${study.client}`, title: study.title })),
  { slug: "lab-3d", eyebrow: "Lab · React Three Fiber", title: "Explore my work in 3D" },
];

for (const page of pages) {
  const url = pathToFileURL(join(here, "og-page.html"));
  url.search = new URLSearchParams({ eyebrow: page.eyebrow, title: page.title }).toString();
  const out = join(outDir, `${page.slug}.png`);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1200,630",
    "--virtual-time-budget=3000",
    `--screenshot=${out}`,
    url.href,
  ], { stdio: "ignore" });
  console.log(`public/og/${page.slug}.png`);
}
