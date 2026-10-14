export type Note = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  tags: string[];
};

// Newest first
export const notes: Note[] = [
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
    slug: "accessible-3d-hotspots",
    title: "Accessible 3D: keyboard hotspots over a WebGL canvas",
    description:
      "A canvas is a black box to assistive technology. The fix is not to make WebGL accessible, it's to put real HTML exactly where the interaction is.",
    date: "2026-10-14",
    readingMinutes: 9,
    tags: ["Accessibility", "React Three Fiber", "WCAG 2.2"],
  },
];

export function getNote(slug: string) {
  return notes.find((note) => note.slug === slug);
}
