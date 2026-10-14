import { Code } from "@/components/code";

function StagesDiagram() {
  const lanes = [
    { label: "Hero video (LCP)", x: 150, w: 140, cls: "d-bar d-bar-strong", note: "high priority" },
    { label: "Visible model", x: 300, w: 150, cls: "d-bar", note: "in view · 15 at a time · low priority" },
    { label: "Neighbours", x: 450, w: 120, cls: "d-bar d-bar-soft", note: "browser idle · 6 at a time" },
    { label: "Everything else", x: 570, w: 130, cls: "d-bar d-bar-faint", note: "first drag · 3 at a time" },
  ];
  return (
    <figure className="diagram">
      <div className="diagram__scroll" tabIndex={0}>
        <svg viewBox="-20 -12 750 312" role="img" aria-labelledby="stages-title stages-desc">
          <title id="stages-title">Staged loading timeline for a 360° viewer</title>
          <desc id="stages-desc">
            The hero video loads first with nothing competing. The visible model&apos;s frames start only when the viewer
            scrolls into view, at low priority and fifteen at a time. Neighbouring models load when the browser is idle,
            six at a time. Everything else waits for the first drag and loads three at a time. Leaving the page cancels
            all pending downloads.
          </desc>
          <line x1="150" y1="262" x2="700" y2="262" className="d-axis" />
          <text x="150" y="286" className="d-note">page load</text>
          <text x="700" y="286" textAnchor="end" className="d-note">time →</text>
          {lanes.map((lane, i) => {
            const y = 34 + i * 56;
            const anchorEnd = lane.x + 230 > 720;
            return (
              <g key={lane.label}>
                <text x="0" y={y + 17} className="d-label">
                  {lane.label}
                </text>
                <rect x={lane.x} y={y} width={lane.w} height="24" rx="6" className={lane.cls} />
                <text x={anchorEnd ? lane.x + lane.w : lane.x} y={y + 42} textAnchor={anchorEnd ? "end" : "start"} className="d-note">
                  {lane.note}
                </text>
              </g>
            );
          })}
          <line x1="300" y1="24" x2="300" y2="90" className="d-marker" />
          <text x="300" y="16" className="d-note">viewer scrolls into view</text>
        </svg>
      </div>
      <figcaption>Each stage waits for a real signal: visibility, idle time, or the user actually touching the viewer.</figcaption>
    </figure>
  );
}

export default async function ViewerLcp() {
  return (
    <>
      <p>
        On the vehicles page of kids.lego.com there&apos;s a carousel of LEGO models you can spin around. Each model is an
        image sequence: <strong>72 frames, one every 5°</strong>. Drag left or right and the frames swap, so it looks like
        a 3D object without any 3D on the page.
      </p>
      <p>
        It looked great and loaded terribly. The page started downloading <strong>hundreds of frames immediately</strong>,
        for every model in the carousel. On a slow connection the hero video at the top of the page didn&apos;t start
        playing, because it was queuing behind images nobody had asked for yet. On low-end phones the whole page felt
        stuck.
      </p>
      <p>
        The hero video is what the browser reports as the{" "}
        <strong>Largest Contentful Paint</strong>. The viewer isn&apos;t. So the rule I worked to was simple:{" "}
        <strong>the viewer must never compete with the LCP element</strong>. Here is how, in five steps.
      </p>

      <h2>1. Download smaller frames</h2>
      <p>
        The cheapest request is a smaller one. Every frame goes through an image optimizer that returns a modern format
        (WebP or AVIF) at the width the viewer actually renders, with the device pixel ratio capped at 2. A 3× iPhone does
        not need nine times the pixels to show a spinning car at 400px wide. I used quality 70 on mobile and 75 on
        desktop, which is plenty for frames that are each on screen for a fraction of a second.
      </p>
      <Code title="frame-url.ts">{`
// Ask the optimizer for exactly what this viewer needs: rendered width × DPR (capped at 2), at most 828px on phones
export function frameUrl(src: string, cssWidth: number, mobile: boolean) {
  const width = Math.round(cssWidth * Math.min(window.devicePixelRatio, 2));
  const capped = mobile ? Math.min(width, 828) : width;
  const quality = mobile ? 70 : 75;
  return \`/_next/image?url=\${encodeURIComponent(src)}&w=\${capped}&q=\${quality}\`;
}
`}</Code>
      <p>If the optimizer fails for any reason, the viewer falls back to the original file, so nothing ever breaks.</p>

      <h2>2. Load in stages, on real signals</h2>
      <p>Instead of &quot;load everything on mount&quot;, each batch of frames waits for a signal that it&apos;s needed:</p>
      <StagesDiagram />
      <ol>
        <li>
          <strong>Nothing</strong> until the viewer scrolls near the viewport (an <code>IntersectionObserver</code>).
        </li>
        <li>
          Then <strong>the visible model</strong>, so the first drag is smooth.
        </li>
        <li>
          When the browser is idle, <strong>the neighbours</strong>: the next and previous models in the carousel, so a
          quick swipe never lands on a model that isn&apos;t ready.
        </li>
        <li>
          <strong>Everything else</strong> only after the first real interaction. Someone who never touches the viewer
          downloads one model and its neighbours, and that&apos;s it.
        </li>
      </ol>

      <h2>3. Ask for low priority</h2>
      <p>
        Browsers let you say how important a request is. Viewer frames are explicitly <code>low</code>, so even when they
        are downloading, the hero video and the fonts go first. For <code>&lt;img&gt;</code> elements that&apos;s the{" "}
        <code>fetchpriority=&quot;low&quot;</code> attribute; for <code>fetch()</code> it&apos;s the{" "}
        <code>priority</code> option.
      </p>

      <h2>4. Limit concurrency and cache everything</h2>
      <p>
        Firing 72 requests at once is still a traffic jam, even at low priority. A tiny promise pool keeps a fixed number
        in flight, with a different limit per stage: <strong>15 for the visible model, 6 for the neighbours, 3 in the
        background</strong>. A shared cache makes sure a frame is never downloaded twice when you swipe back.
      </p>
      <Code title="queue.ts">{`
export type Enqueue = <T>(task: () => Promise<T>) => Promise<T>;

// At most \`limit\` tasks run at the same time; the rest wait their turn
export function createQueue(limit: number): Enqueue {
  let active = 0;
  const waiting: (() => void)[] = [];

  const next = () => {
    if (active >= limit) return;
    const run = waiting.shift();
    if (!run) return;
    active++;
    run();
  };

  return (task) =>
    new Promise((resolve, reject) => {
      waiting.push(() => {
        task()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      });
      next();
    });
}
`}</Code>
      <Code title="load-frame.ts">{`
const cache = new Map<string, Promise<string>>();

export function loadFrame(url: string, enqueue: Enqueue, signal: AbortSignal) {
  let frame = cache.get(url);
  if (!frame) {
    frame = enqueue(async () => {
      const res = await fetch(url, { priority: "low", signal });
      if (!res.ok) throw new Error(\`\${res.status} \${url}\`);
      return URL.createObjectURL(await res.blob());
    });
    // Aborted or failed: forget it so it can be retried later
    frame.catch(() => cache.delete(url));
    cache.set(url, frame);
  }
  return frame;
}
`}</Code>

      <h2>5. Cancel what nobody will see</h2>
      <p>
        If someone leaves the page or the viewer unmounts halfway through, the remaining downloads are wasted bandwidth on
        a phone that may be on mobile data. One <code>AbortController</code> per viewer cancels everything that&apos;s
        still queued or in flight.
      </p>
      <Code title="use-preload.ts">{`
// requestIdleCallback is missing in some browsers; a short timeout is a fine fallback
const whenIdle = (cb: () => void) =>
  "requestIdleCallback" in window ? requestIdleCallback(cb) : window.setTimeout(cb, 200);

export function usePreload(models: Model[], index: number, stage: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const controller = new AbortController();
    const visible = models[index];
    const neighbours = [models[(index + 1) % models.length], models[(index - 1 + models.length) % models.length]];
    const rest = models.filter((m) => m !== visible && !neighbours.includes(m));

    const load = (list: Model[], limit: number) => {
      const enqueue = createQueue(limit);
      return Promise.allSettled(list.flatMap((m) => m.frames.map((url) => loadFrame(url, enqueue, controller.signal))));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        load([visible], 15).then(() => whenIdle(() => load(neighbours, 6)));
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);

    const loadRest = () => load(rest, 3);
    el.addEventListener("pointerdown", loadRest, { once: true });

    return () => {
      controller.abort();
      observer.disconnect();
      el.removeEventListener("pointerdown", loadRest);
    };
  }, [models, index, stage]);
}
`}</Code>
      <p>
        The order matters as much as the limits. Loading the visible model first and its neighbours right after means the
        carousel feels instant, even though most of it hasn&apos;t been downloaded.
      </p>

      <h2>What changed</h2>
      <p>
        The page no longer downloads hundreds of images on load, and the viewer&apos;s requests no longer compete with the
        hero video. The frames that do download are a fraction of their original size.
      </p>
      <p>
        I&apos;ll be honest about one thing: we didn&apos;t have real-user monitoring wired up at the time, so I can&apos;t
        give you a before-and-after LCP number. If you build something similar, measure it from day one. The single most
        useful number is <strong>how many viewer requests start before LCP</strong>, and the target is zero.
      </p>
      <Code title="measure.ts">{`
new PerformanceObserver((list) => {
  const lcp = list.getEntries().at(-1)!.startTime;
  const early = performance
    .getEntriesByType("resource")
    .filter((r) => r.name.includes("/frames/") && r.startTime < lcp);
  console.log(\`\${early.length} viewer requests started before LCP\`);
}).observe({ type: "largest-contentful-paint", buffered: true });
`}</Code>

      <h2>The general lesson</h2>
      <p>
        Most performance problems like this aren&apos;t about one slow thing. They&apos;re about the right things arriving
        in the wrong order. Decide what the page is <em>for</em>, protect that, and make everything else wait for a reason
        to load.
      </p>
    </>
  );
}
