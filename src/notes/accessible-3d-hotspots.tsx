import Link from "next/link";
import { Code } from "@/components/code";

function LayersDiagram() {
  return (
    <figure className="diagram">
      <div className="diagram__scroll" tabIndex={0}>
        <svg viewBox="0 0 720 320" role="img" aria-labelledby="layers-title layers-desc">
          <title id="layers-title">Two layers: a WebGL canvas for pixels, real HTML buttons for interaction</title>
          <desc id="layers-desc">
            The canvas draws the 3D scene and is ignored by assistive technology. Above it, a layer of real buttons is
            kept aligned with each 3D object. Focus, hover and pointer events all update one shared active state, and a
            live region announces changes.
          </desc>
          <defs>
            <marker id="arrow-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" className="d-arrowhead" />
            </marker>
          </defs>

          <rect x="20" y="24" width="440" height="110" rx="10" className="d-box d-accent" />
          <text x="40" y="52" className="d-label">HTML layer (real buttons)</text>
          <text x="40" y="72" className="d-note">Tab · Enter · Escape · screen readers</text>
          {[60, 190, 320].map((x, i) => (
            <g key={x}>
              <rect x={x} y="84" width="110" height="38" rx="19" className={i === 1 ? "d-pill d-pill-active" : "d-pill"} />
              <text x={x + 55} y="108" textAnchor="middle" className={i === 1 ? "d-pill-text d-pill-text-active" : "d-pill-text"}>
                {["Hotspot A", "Hotspot B", "Hotspot C"][i]}
              </text>
            </g>
          ))}

          <rect x="20" y="166" width="440" height="134" rx="10" className="d-box" />
          {[115, 245, 375].map((cx, i) => (
            <circle key={cx} cx={cx} cy="206" r={i === 1 ? 20 : 16} className={i === 1 ? "d-object d-object-active" : "d-object"} />
          ))}
          {[115, 245, 375].map((x, i) => (
            <line key={x} x1={x} y1="124" x2={x} y2={i === 1 ? 182 : 186} className="d-link" markerEnd="url(#arrow-a)" />
          ))}
          <text x="40" y="258" className="d-label">WebGL canvas (pixels only)</text>
          <text x="40" y="280" className="d-note">invisible to assistive technology</text>

          <rect x="500" y="24" width="200" height="110" rx="10" className="d-box" />
          <text x="520" y="52" className="d-label">active = &quot;B&quot;</text>
          <text x="520" y="74" className="d-note">focus · hover · pointer</text>
          <text x="520" y="94" className="d-note">all write the same state</text>
          <line x1="440" y1="104" x2="500" y2="80" className="d-flow" markerEnd="url(#arrow-a)" />

          <rect x="500" y="166" width="200" height="134" rx="10" className="d-box" />
          <text x="520" y="194" className="d-label">aria-live region</text>
          <text x="520" y="218" className="d-note">“Selected B. Press</text>
          <text x="520" y="238" className="d-note">Escape to go back.”</text>
          <line x1="600" y1="134" x2="600" y2="166" className="d-flow" markerEnd="url(#arrow-a)" />
        </svg>
      </div>
      <figcaption>The canvas only draws. Every interaction goes through real HTML that sits on top of it.</figcaption>
    </figure>
  );
}

export default async function AccessibleHotspots() {
  return (
    <>
      <p>
        On <a href="https://kids.lego.com/en-us/hero-stories">kids.lego.com</a> I build 3D scenes that children explore by
        clicking on things: an island with points of interest, a hidden-object game, product models you can turn around.
        The platform targets <strong>WCAG 2.2 AA</strong>, and since June 2025 the{" "}
        <strong>European Accessibility Act</strong> makes that a legal requirement for a lot of consumer products in the
        EU, not a nice-to-have.
      </p>
      <p>
        The problem is that a <code>&lt;canvas&gt;</code> is a black box. A screen reader sees one element with no content.
        The keyboard can&apos;t reach anything inside it. Pixels have no focus, no role and no name.
      </p>
      <p>
        The fix isn&apos;t to make WebGL accessible. It&apos;s to <strong>put real HTML exactly where the interaction is</strong>
        , and let the canvas do what it&apos;s good at: drawing.
      </p>

      <h2>The pattern: one real button per hotspot</h2>
      <p>
        Every interactive object in the scene gets a real <code>&lt;button&gt;</code>, positioned over the object and
        moved with it every frame. The button is what receives focus, clicks and screen-reader commands. The 3D object is
        just its visual.
      </p>
      <LayersDiagram />
      <p>
        In React Three Fiber, drei&apos;s <code>&lt;Html&gt;</code> component does the projection for you: it takes a 3D
        position and keeps a DOM node on top of it.
      </p>
      <Code title="hotspot.tsx">{`
import { Html } from "@react-three/drei";

type HotspotProps = {
  id: string;
  label: string;
  position: [number, number, number];
  selected: boolean;
  onSelect: (id: string) => void;
  onActive: (id: string | null) => void;
  overlay: React.RefObject<HTMLElement>;
};

export function Hotspot({ id, label, position, selected, onSelect, onActive, overlay }: HotspotProps) {
  return (
    // portal: render into a container you own (see "Pitfalls" below)
    <Html position={position} center zIndexRange={[10, 0]} portal={overlay}>
      <button
        type="button"
        className="hotspot"
        aria-pressed={selected}
        onClick={() => onSelect(id)}
        onFocus={() => onActive(id)}
        onBlur={() => onActive(null)}
        onPointerEnter={() => onActive(id)}
        onPointerLeave={() => onActive(null)}
      >
        {label}
      </button>
    </Html>
  );
}
`}</Code>
      <p>
        The button can be a visible label, as in my <Link href="/lab/3d">3D lab</Link>, or a transparent target sitting
        exactly over the object, which is what a game usually wants. If it&apos;s invisible, two things still have to be
        true: it must be at least <strong>24×24 CSS pixels</strong> (WCAG 2.5.8, Target Size) and it must show a clear
        focus ring when it&apos;s focused (2.4.7, Focus Visible).
      </p>
      <Code lang="css" title="hotspot.css">{`
.hotspot--invisible {
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

/* Two rings, so it's visible on light and dark parts of the scene */
.hotspot--invisible:focus-visible {
  outline: 3px solid #fff;
  box-shadow: 0 0 0 6px #000;
}
`}</Code>

      <h2>Focus and hover are the same thing</h2>
      <p>
        The trick that makes this feel native: <strong>keyboard focus, mouse hover and pointer-over on the mesh all write the
        same piece of state</strong>. Whatever highlight a mouse user sees when they point at an object, a keyboard user sees
        when they tab to it.
      </p>
      <Code title="scene.tsx">{`
const [active, setActive] = useState<string | null>(null);

<group
  onPointerOver={(e) => { e.stopPropagation(); setActive(id); }}
  onPointerOut={() => setActive(null)}
  onClick={() => onSelect(id)}
>
  <Model highlighted={active === id || selected === id} />
</group>
<Hotspot id={id} onActive={setActive} /* … */ />
`}</Code>

      <h2>Say what happened</h2>
      <p>
        When a selection moves the camera, a sighted user sees the change. A screen-reader user hears nothing unless you
        tell them. A visually hidden <code>aria-live</code> region fixes that, and it costs one line.
      </p>
      <Code>{`
<p className="visually-hidden" aria-live="polite">
  {selected ? \`Selected \${selected.label}. Press Escape to go back.\` : ""}
</p>
`}</Code>

      <h2>A keyboard model that makes sense</h2>
      <ul>
        <li>
          <strong>Tab order follows the DOM order</strong>, so render hotspots in the order a person would read the scene,
          not the order your models happen to load in.
        </li>
        <li>
          <strong>Escape goes back</strong> to the overview, and <strong>focus returns to the hotspot</strong> you came from.
          Losing focus to <code>&lt;body&gt;</code> after closing a view is one of the most common keyboard bugs.
        </li>
        <li>
          <strong>Arrow keys</strong> are a nice extra for stepping between objects when you&apos;re zoomed in.
        </li>
        <li>
          <strong>Never let focus land on something off screen</strong> (2.4.11, Focus Not Obscured). In my lab, focusing
          another hotspot while zoomed in flies the camera to it.
        </li>
      </ul>
      <Code title="return focus">{`
const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

function back() {
  if (selected) buttons.current[selected]?.focus();
  setSelected(null);
}

<div onKeyDown={(e) => { if (e.key === "Escape" && selected) back(); }}>…</div>
`}</Code>

      <h2>Respect reduced motion</h2>
      <p>
        Camera fly-throughs and idle animations are exactly what <code>prefers-reduced-motion</code> is for. With it on, I
        jump the camera instead of animating it and render only when something changes, which also saves battery.
      </p>
      <Code>{`
const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

<Canvas frameloop={reducedMotion ? "demand" : "always"}>
`}</Code>

      <h2>Pitfalls I ran into</h2>
      <ul>
        <li>
          <strong>z-index wars.</strong> drei&apos;s <code>&lt;Html&gt;</code> uses a huge z-index range by default, so the
          labels can end up above a sticky site header. Set <code>zIndexRange</code> explicitly.
        </li>
        <li>
          <strong>The portal target.</strong> By default <code>&lt;Html&gt;</code> picks its container lazily, and that
          container can change after the first render. With React 19 that showed up as a{" "}
          <code>removeChild</code> error and a missing first label. Rendering into a container you own (
          <code>portal={"{overlay}"}</code>) fixes it for good.
        </li>
        <li>
          <strong>Don&apos;t hide the wrong thing.</strong> <code>aria-hidden</code> on the canvas wrapper also hides the
          buttons inside it. Hide only the canvas, if anything.
        </li>
        <li>
          <strong>Touch scrolling.</strong> Orbit controls capture touch drags, which can trap people on a page they want to
          scroll. I enable orbiting for fine pointers only and let touch users tap.
        </li>
      </ul>

      <h2>Testing it</h2>
      <p>
        Automated checkers like axe still help: they see the buttons and will flag missing names and poor contrast. They
        can&apos;t see inside the canvas, though, so the core behaviour needs its own test. A keyboard-only walkthrough with
        a screen reader on (VoiceOver, NVDA) catches the rest.
      </p>
      <Code title="hotspots.spec.ts">{`
import { expect, test } from "@playwright/test";

test("hotspots work with the keyboard", async ({ page }) => {
  await page.goto("/lab/3d/");
  const hotspot = page.getByRole("button", { name: "SITA" });

  await hotspot.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[aria-live=polite]")).toContainText("Selected SITA");

  await page.keyboard.press("Escape");
  await expect(hotspot).toBeFocused();
});
`}</Code>

      <h2>Try it</h2>
      <p>
        Everything above runs in my <Link href="/lab/3d">3D lab</Link>: open it, put the mouse away and use Tab, Enter, the
        arrow keys and Escape. It&apos;s a small scene, but it&apos;s the same approach I use on production campaigns that
        reach millions of visitors.
      </p>
    </>
  );
}
