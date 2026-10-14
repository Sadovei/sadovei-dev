export const site = {
  url: "https://sadovei.dev",
  name: "Radu Sadovei",
  role: "Senior Frontend Developer",
  company: "Sadovei Software Company",
  location: "Bucharest, Romania",
  email: "contact@sadovei.dev",
  linkedin: "https://www.linkedin.com/in/radu-sadovei/",
  // Cal.com booking link, e.g. "https://cal.com/radu-sadovei/intro". Leave empty to hide the booking button.
  booking: "https://cal.com/radu-sadovei/intro",
  cv: "/Radu-Sadovei-Senior-Frontend-Developer-CV.pdf",
  // GoatCounter site code, e.g. "sadovei" for sadovei.goatcounter.com. Leave empty to turn analytics off.
  goatcounter: "sadovei",
  description:
    "Senior Frontend Developer and independent contractor. React, Next.js, React Native and TypeScript for products used by millions: The LEGO Group, SITA, RBC Capital Markets, PGL.",
};

// Sections of the homepage, in page order. Used by the header and the footer.
export const nav = [
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "approach", label: "How I work" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof nav)[number]["id"];

export const highlights = [
  { value: "73 markets", label: "kids.lego.com, 30 languages incl. RTL" },
  { value: "Millions", label: "of visitors to LEGO Hero Stories in two months" },
  { value: "65+ airlines", label: "on SITA Mission Watch" },
  { value: "2.7M+", label: "peak concurrent viewers, live esports" },
  { value: "Sports Emmy", label: "The International 10 broadcast" },
];

export const services = [
  {
    title: "Next.js product engineering",
    text: "App Router, Server Components, i18n and performance for high-traffic, multi-market products.",
  },
  {
    title: "3D and interactive web",
    text: "Three.js and React Three Fiber experiences that stay smooth on low-end phones.",
  },
  {
    title: "Accessibility and the EU Accessibility Act",
    text: "WCAG 2.2 AA work that holds up: audits, fixes, and complex UI (even 3D) usable by keyboard and screen reader.",
  },
  {
    title: "Real-time and data-heavy UIs",
    text: "Live data, WebSockets and Matrix, RxJS and AG Grid dashboards that stay responsive.",
  },
  {
    title: "React Native and PWA",
    text: "Cross-platform apps, from a first MVP to a feature customers pay for.",
  },
  {
    title: "AI-assisted engineering",
    text: "Claude Code and MCP workflows with guardrails, so teams ship faster without lowering the bar.",
  },
];

export const approach = [
  "End-to-end ownership, from Figma and requirements to tested production code.",
  "Remote from Bucharest (EET), overlapping EU and UK working hours. On-site visits on request.",
  "B2B through my own company, Sadovei Software Company, already invoicing EU and UK clients.",
  "Clients bring me back: LEGO re-engaged me without a re-interview, and SITA extended a 4-month contract after the MVP.",
];

export const clients = ["The LEGO Group", "SITA", "RBC Capital Markets", "PGL Esports", "ZentaHub"];

export const firstWeeks = [
  {
    title: "Week 1: get productive",
    text: "Access, codebase walkthrough and a first small change in production, plus a quick baseline of performance and accessibility.",
  },
  {
    title: "Week 2: first real delivery",
    text: "A feature or fix that matters to the team, shipped with tests, and a short list of the highest-value improvements I found.",
  },
  {
    title: "After that: own an area",
    text: "I take ownership of a feature area end-to-end and work directly with product, design and QA.",
  },
];

// Answers the questions recruiters and hiring managers ask first.
export const quickFacts: { label: string; value: string; href?: string; note?: string }[] = [
  { label: "Role", value: "Senior Frontend Developer: React, Next.js, React Native, TypeScript" },
  { label: "Engagement", value: "B2B contract through Sadovei Software Company, invoicing EU and UK clients" },
  { label: "Location", value: "Bucharest, Romania · remote, on-site visits on request" },
  { label: "Time zones", value: "Full overlap with UK and EU, mornings with the US East Coast" },
  { label: "Languages", value: "English (C1), Romanian (native)" },
  { label: "CV", value: "Download the PDF", href: site.cv, note: "a detailed version is available on request" },
];
