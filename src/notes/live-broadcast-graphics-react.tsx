import { Code } from "@/components/code";

function BroadcastDiagram() {
  return (
    <figure className="diagram">
      <div className="diagram__scroll" tabIndex={0}>
        <svg viewBox="0 0 720 260" role="img" aria-labelledby="bc-title bc-desc">
          <title id="bc-title">Data flow for live esports broadcast graphics</title>
          <desc id="bc-desc">
            Game state from the match and data from the production team go to a Node.js server, which keeps the current
            state in Redis and pushes updates over WebSockets. The graphics are React pages loaded as browser sources in
            the vision mixer. An operator, following the show rundown, decides what is on air.
          </desc>
          <defs>
            <marker id="arrow-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" className="d-arrowhead" />
            </marker>
          </defs>

          <rect x="20" y="30" width="150" height="70" rx="10" className="d-box" />
          <text x="36" y="60" className="d-label">Game state</text>
          <text x="36" y="82" className="d-note">live match data</text>

          <rect x="20" y="150" width="150" height="70" rx="10" className="d-box" />
          <text x="36" y="180" className="d-label">Production data</text>
          <text x="36" y="202" className="d-note">brackets, schedule</text>

          <rect x="230" y="90" width="170" height="70" rx="10" className="d-box d-accent" />
          <text x="246" y="120" className="d-label">Node.js + Redis</text>
          <text x="246" y="142" className="d-note">current state, pub/sub</text>

          <rect x="520" y="30" width="180" height="70" rx="10" className="d-box" />
          <text x="536" y="60" className="d-label">React graphics</text>
          <text x="536" y="82" className="d-note">browser sources</text>

          <rect x="520" y="150" width="180" height="70" rx="10" className="d-box" />
          <text x="536" y="180" className="d-label">Operator</text>
          <text x="536" y="202" className="d-note">follows the rundown</text>

          <line x1="170" y1="65" x2="230" y2="110" className="d-flow" markerEnd="url(#arrow-b)" />
          <line x1="170" y1="185" x2="230" y2="140" className="d-flow" markerEnd="url(#arrow-b)" />
          <line x1="400" y1="110" x2="520" y2="70" className="d-flow" markerEnd="url(#arrow-b)" />
          <text x="418" y="72" className="d-note">WebSockets</text>
          <line x1="520" y1="185" x2="400" y2="140" className="d-flow" markerEnd="url(#arrow-b)" />
          <text x="424" y="190" className="d-note">commands</text>
        </svg>
      </div>
      <figcaption>Data flows in automatically. What goes on air is always a human decision.</figcaption>
    </figure>
  );
}

export default async function LiveBroadcastGraphics() {
  return (
    <>
      <p>
        For two years at PGL I built and ran the live graphics for esports world championships: The International in
        2021 and 2022, PGL Majors in Stockholm, Antwerp and Arlington, the ALGS 2022 Championship, Brawl Stars World
        Finals and more. The overlays, brackets, statistics and schedules you see on the stream were React applications,
        and I also built the multi-view feature that let viewers watch several games at once.
        The biggest broadcasts peaked at over <strong>2.7 million concurrent viewers</strong>, and the broadcast of The
        International 10 won the 2022 Sports Emmy for Outstanding Esports Championship Coverage.
      </p>
      <p>
        I was also the person running those graphics on air, following the show&apos;s rundown in real time. That changes
        how you write front-end code. There is no &quot;we&apos;ll fix it in the next deploy&quot;. If something flickers,
        millions of people see it flicker.
      </p>

      <h2>Graphics are web pages</h2>
      <p>
        Modern broadcast tools like vMix and OBS can load a web page as a layer, a &quot;browser source&quot;, with a
        transparent background, composited over the game feed. So a scoreboard is a React app rendered at exactly
        1920×1080, with no scrolling, no layout changes and nothing interactive. Everything that works for a normal
        website still applies; a few things matter much more.
      </p>
      <BroadcastDiagram />

      <h2>Rule 1: nothing moves unless you meant it to</h2>
      <p>
        A layout shift on a website is annoying. On a broadcast it&apos;s a visible glitch. So every graphic is built on a
        fixed canvas, with fixed-width slots for anything that changes: player names, scores, timers.
      </p>
      <ul>
        <li>
          <strong>Fonts and images load before the graphic goes on air.</strong> Never let the first frame show a fallback
          font or an empty logo slot.
        </li>
        <li>
          <strong>Numbers use tabular figures</strong> (<code>font-variant-numeric: tabular-nums</code>), so a timer going
          from 1:11 to 1:10 doesn&apos;t make the text jump.
        </li>
        <li>
          <strong>Animations use only <code>transform</code> and <code>opacity</code></strong>, the properties the browser
          can animate without re-laying out the page, so they stay smooth at 60 fps.
        </li>
      </ul>
      <Code title="preload.ts">{`
// Only report "ready" to the operator once everything the graphic needs is decoded
export async function preload(images: string[], fonts: string[]) {
  await Promise.all([
    ...images.map((src) => {
      const img = new Image();
      img.src = src;
      return img.decode();
    }),
    ...fonts.map((font) => document.fonts.load(font)),
  ]);
}
`}</Code>

      <h2>Rule 2: the operator always wins</h2>
      <p>
        Data arrives automatically: live game state during a match, results and brackets from the production team. But
        <strong> what is on air is a human decision</strong>, made by the operator following the rundown. On those shows,
        that was me. The graphics should make that decision easy and safe. A pattern that works well: every graphic
        listens for two kinds of messages, data updates that change what&apos;s inside it, and show and hide commands that
        take it on and off air, whether they come from the vision mixer or from your own control panel.
      </p>
      <Code title="use-graphic.ts">{`
type Message =
  | { type: "data"; graphic: string; payload: unknown }
  | { type: "show" | "hide"; graphic: string };

export function useGraphic<T>(graphic: string, socket: WebSocket) {
  const [data, setData] = useState<T | null>(null);
  const [onAir, setOnAir] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data) as Message;
      if (message.graphic !== graphic) return;
      if (message.type === "data") setData(message.payload as T);
      else setOnAir(message.type === "show");
    };
    socket.addEventListener("message", onMessage);
    return () => socket.removeEventListener("message", onMessage);
  }, [graphic, socket]);

  return { data, onAir };
}
`}</Code>

      <h2>Rule 3: stale data beats no data</h2>
      <p>
        Feeds drop. When they do, the worst thing a graphic can do is go blank. Keep the current state of everything on
        the server (Redis is a natural fit), so a graphic that reconnects, or a browser source that gets reloaded
        mid-show, gets the full picture back instantly instead of waiting for the next event. In the meantime it keeps
        showing the last good values.
      </p>
      <Code lang="ts" title="server.ts">{`
// Every update is stored as the latest state and broadcast to everyone listening
async function publish(graphic: string, payload: unknown) {
  await redis.set(\`state:\${graphic}\`, JSON.stringify(payload));
  await redis.publish("graphics", JSON.stringify({ type: "data", graphic, payload }));
}

// A new or reconnecting client gets the current state first
wss.on("connection", async (socket) => {
  for (const key of await redis.keys("state:*")) {
    const payload = JSON.parse((await redis.get(key))!);
    socket.send(JSON.stringify({ type: "data", graphic: key.slice(6), payload }));
  }
});
`}</Code>

      <h2>Rule 4: the vision mixer has a budget</h2>
      <p>
        The graphics don&apos;t run alone. They share a machine with the vision mixer, which is also decoding several video
        feeds, compositing them and encoding the stream. At one point we had graphics with assets far heavier than they
        needed to be, and the result was lag in the live output. Optimizing those assets removed the lag and unlocked
        features we had held back because of performance limits.
      </p>
      <p>
        The lesson carries straight over to the web: measure on the real target. A graphic that runs smoothly in a desktop
        browser can still be too heavy for a machine that is busy doing five other things.
      </p>

      <h2>Rule 5: make the next event cheaper than the last</h2>
      <p>
        Every championship needs its own graphics package: new branding, new layouts, sometimes a new game. Early on, a
        new package took two or three days. I turned what we kept rebuilding into a shared boilerplate, with automation
        around it. After that, a new package took less than a day, and every project from then on started from it.
      </p>
      <p>
        The same thinking applied to setup. Preparing a broadcast machine meant installing the right Node.js version,
        Redis, the graphics package and its configuration. I wrapped that into a one-click installer built with Electron, so
        a production machine could be ready without anyone having to remember a checklist on show day.
      </p>

      <h2>What I took from it</h2>
      <ul>
        <li>
          <strong>Production is a rehearsal you only get once.</strong> Rehearse with real data, real machines and the real
          rundown before the show.
        </li>
        <li>
          <strong>Manual override is a feature.</strong> Automation does the work; a person makes the call.
        </li>
        <li>
          <strong>Performance is part of correctness.</strong> A late frame on air is a bug, not a metric.
        </li>
      </ul>
      <p>
        I still use all of this on the web. It&apos;s why I care about layout shifts, preloading and real-device testing in
        the products I build today.
      </p>
    </>
  );
}
