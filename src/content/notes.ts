export type Note = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  tags: string[];
};

// In reading order: the first two are featured on the homepage
export const notes: Note[] = [
  {
    slug: "accessible-3d-hotspots",
    title: "Accessible 3D: keyboard hotspots over a WebGL canvas",
    description:
      "A canvas is a black box to assistive technology. The fix is not to make WebGL accessible, it's to put real HTML exactly where the interaction is.",
    date: "2026-10-14",
    readingMinutes: 9,
    tags: ["Accessibility", "React Three Fiber", "WCAG 2.2"],
  },
  {
    slug: "360-viewer-without-hurting-lcp",
    title: "A 360° product viewer that doesn't hurt your LCP",
    description:
      "Hundreds of frames, one hero video and a slow phone: how staged, low-priority, cancellable loading keeps an image-sequence viewer out of the way.",
    date: "2026-10-14",
    readingMinutes: 8,
    tags: ["Performance", "Core Web Vitals", "React"],
  },
  {
    slug: "offline-message-queue",
    title: "An offline message queue for chat on flaky airport networks",
    description:
      "Show it at once, keep the order, never lose anything silently: the outbox pattern behind a real-time chat for airline operations.",
    date: "2026-10-14",
    readingMinutes: 7,
    tags: ["Real-time", "Offline", "TypeScript"],
  },
  {
    slug: "headless-puppeteer-reports",
    title: "Turning a daily 5-minute task into one click with headless Puppeteer",
    description:
      "Instead of rebuilding a report, run the app people already trust on the server. The pattern, the pitfalls and what matters in a bank.",
    date: "2026-10-14",
    readingMinutes: 7,
    tags: ["Node.js", "Puppeteer", "Automation"],
  },
  {
    slug: "live-broadcast-graphics-react",
    title: "Live broadcast graphics with React: what changes when millions are watching",
    description:
      "Five rules from two years of building and running on-air graphics for esports world championships, including the Sports Emmy-winning The International 10.",
    date: "2026-10-14",
    readingMinutes: 8,
    tags: ["React", "Real-time", "Live production"],
  },
];

export function getNote(slug: string) {
  return notes.find((note) => note.slug === slug);
}
