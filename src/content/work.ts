export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  summary: string;
  role: string;
  context: string;
  challenge?: string;
  work: string[];
  outcome: string[];
  stack: string[];
  link?: { href: string; label: string };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "lego-hero-stories",
    client: "The LEGO Group",
    title: "Hero Stories and 3D on kids.lego.com",
    summary:
      "A new 3D navigation concept for a global kids' platform: built end-to-end, fast on low-end phones and usable by every child.",
    role: "Senior React/Next.js Developer (contract)",
    context:
      "kids.lego.com is LEGO's platform for children, live in 73 markets and 30 languages, including right-to-left scripts. Campaigns for Disney, Marvel, Star Wars, Ninjago, F1 and the World Cup ship on it all year, built by a team of 11 developers and 10 designers.",
    challenge:
      "Hero Stories introduced a new way to move through a campaign: 3D elements and rich animation instead of a classic page. It had to feel magical on a cheap Android phone as much as on a new iPhone, and it had to work for children using a keyboard or a screen reader.",
    work: [
      "Built the entire Hero Stories page myself, as the first implementation of the new navigation concept.",
      "Built 3D scenes in React Three Fiber, including Find the Frogs, a three-level hidden-object game on GLB scenes with interactive meshes.",
      "Made 3D affordable on low-end devices: a GLB build pipeline (GPU instancing, KTX2 textures, meshopt compression), device-based quality tiers that adjust pixel ratio and antialiasing, and scenes that load only when needed.",
      "Rebuilt the loading of the 360° vehicle viewer so it no longer downloads hundreds of images upfront: frames load in stages (in view, then idle, then on interaction), at low priority, with concurrency limits and cancellation.",
      "Made the 3D accessible: every hotspot has a real, focusable button behind the canvas, and scene changes are announced to screen readers, as part of the platform's WCAG 2.2 AA work under the EU Accessibility Act.",
    ],
    outcome: [
      "Hero Stories reached millions of visitors in its first two months.",
      "LEGO promoted the campaign in its stores, online and on the giant cube at LEGO HQ in Billund.",
    ],
    stack: ["Next.js", "React Three Fiber", "Three.js", "TypeScript", "ContentStack", "Playwright"],
    link: { href: "https://kids.lego.com/en-us/hero-stories", label: "See Hero Stories live" },
  },
  {
    slug: "sita-mission-watch",
    client: "SITA",
    title: "From a 3-month MVP to part of Mission Watch",
    summary:
      "A real-time communication app for airline operations that started as a short contract and became part of SITA's flagship platform.",
    role: "Senior Web Engineer (contract)",
    context:
      "SITA is the IT and communications backbone of the air transport industry. Mission Watch, its flight-tracking and dispatch platform, is used by 65+ airlines and 3,500+ dispatchers.",
    challenge:
      "Airline operations teams needed to talk to each other in real time, in the context of a specific flight, on networks that drop constantly inside airports.",
    work: [
      "Architected and delivered the MVP in 3 months in a team of three: chat plus WebRTC audio and video calls on Matrix, with a self-hosted Synapse server, first as a React Native app, then demoed to the pilot airline's leadership.",
      "After the MVP's success, rebuilt it as an Angular PWA and integrated it into Mission Watch: selecting a flight on the map opens its conversation, and flight alerts appear as automatic messages.",
      "Built an offline send queue for unstable airport networks: messages show a “sending…” state and go out in their original order when the connection returns.",
      "Built other Mission Watch features in a 20+ person team: a virtualized flight weather table, flight replay on the map (position, trajectory and fuel at any moment) and diversion management.",
      "Changed how dev and QA worked together: short review calls instead of ticket ping-pong, and a 95% test-coverage gate on every PR, backed by AI-assisted Playwright tests.",
    ],
    outcome: [
      "A 4-month engagement became a long-term one.",
      "The communication app is now offered to airlines as part of Mission Watch.",
    ],
    stack: ["React Native", "Angular", "PWA", "Matrix SDK", "Synapse", "WebRTC", "Jest", "Playwright"],
  },
  {
    slug: "rbc-riskhub",
    client: "RBC Capital Markets",
    title: "Automation and data-heavy dashboards for an enterprise risk platform",
    summary:
      "Turning a daily manual task into one click, and keeping dozens of live tables and charts responsive.",
    role: "Senior React Developer (contract)",
    context:
      "RiskHub is RBC Capital Markets' internal enterprise risk platform. Its users keep dozens of tables and charts open at once, several of them on live data.",
    work: [
      "Built a headless Node.js service with Puppeteer that runs the application on the server and replays each broker's configured interaction to send scheduled email reports.",
      "Halved the steps in a key configuration workflow by persisting UI state and removing redundant steps.",
      "Kept dashboards responsive with dozens of AG Grid tables and Plotly charts: batched live streams with RxJS, cancelled stale requests, moved grids to delta updates and split re-render-heavy React context.",
      "Grew from bug fixing to owning an area of the platform and its roadmap with business stakeholders.",
    ],
    outcome: [
      "A 4–5 minute manual task, done daily by dozens of brokers, became a single click.",
      "Fewer clicks and waits in one of the platform's most used workflows.",
    ],
    stack: ["React", "TypeScript", "Redux", "redux-observable", "RxJS", "AG Grid", "Plotly", "Node.js", "Puppeteer"],
  },
  {
    slug: "pgl-live-graphics",
    client: "PGL Esports",
    title: "Live graphics for esports world championships",
    summary:
      "Real-time broadcast graphics for audiences of up to 2.7M concurrent viewers, including the Sports Emmy-winning The International 10.",
    role: "React Developer, then Senior React Developer",
    context:
      "PGL produces some of the biggest esports events in the world. Every overlay, bracket and statistic on screen is live software that cannot fail on air.",
    work: [
      "Took over a business-critical live-graphics project after its only React developer left, rewrote it to modern React with hooks while shipping new features, then led React across all PGL projects.",
      "Built and operated complete graphics packages for 10+ world championships: The International 2021 and 2022, PGL Majors Stockholm, Antwerp and Arlington, the ALGS 2022 Championship, Brawl Stars World Finals and FIFA Global Series.",
      "Built real-time in-game overlays fed by live match data, plus brackets, statistics, schedules and the multi-view live feature.",
      "Ran on-air graphics as live broadcast technical engineer, following the show rundown in real time.",
      "Optimized graphics assets for vMix, removing real-time lag on air and unlocking features that performance limits had blocked.",
      "Built a boilerplate used by every project after it, and an Electron one-click installer that set up the full production environment on broadcast machines.",
    ],
    outcome: [
      "A new graphics package went from 2–3 days of work to under one day.",
      "Broadcasts peaked at 2.7M+ concurrent viewers.",
      "The International 10 broadcast won the 2022 Sports Emmy for Outstanding Esports Championship Coverage.",
    ],
    stack: ["React", "Next.js", "Node.js", "WebSockets", "Redis", "MongoDB", "GraphQL", "Electron", "vMix"],
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
