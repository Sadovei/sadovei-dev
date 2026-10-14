import type { Metadata } from "next";
import Link from "next/link";
import { WorkSceneLoader } from "@/components/lab/work-scene-loader";

export const metadata: Metadata = {
  title: "Explore my work in 3D",
  description:
    "An accessible React Three Fiber scene: keyboard and screen-reader friendly hotspots, device-based quality tiers and no wasted frames.",
  alternates: { canonical: "/lab/3d/" },
};

export default function LabPage() {
  return (
    <article className="lab container">
      <p className="case__back">
        <Link href="/#work">← All work</Link>
      </p>
      <p className="eyebrow">Lab</p>
      <h1>Explore my work in 3D</h1>
      <p className="lead">
        A small React Three Fiber scene I built to show how I approach 3D on the web: it works with a keyboard and a
        screen reader, and it adapts to the device it runs on.
      </p>

      <WorkSceneLoader />

      <section className="lab__notes" aria-labelledby="under-the-hood">
        <h2 id="under-the-hood">What&apos;s under the hood</h2>
        <ul className="case__list">
          <li>
            <strong>Accessible hotspots.</strong> Each project is a real HTML button placed over the canvas, so Tab,
            Enter and screen readers just work. Escape goes back to the overview and returns focus to where you were,
            and every selection is announced.
          </li>
          <li>
            <strong>Quality tiers.</strong> The scene starts at low, medium or high based on device hints (memory, CPU
            cores, data saver, network type, touch screen) and caps the pixel ratio to match. You can override it, and
            your choice is remembered.
          </li>
          <li>
            <strong>No wasted frames.</strong> Rendering stops completely when the scene is off screen. With reduced
            motion it renders only when something changes.
          </li>
          <li>
            <strong>Reduced motion respected.</strong> No idle animation, and the camera jumps instead of flying.
          </li>
          <li>
            <strong>Nothing to download.</strong> Every model is procedural geometry, and the 3D code is split out so
            it only loads on this page.
          </li>
        </ul>
        <p>
          The same techniques, at a much larger scale, power the 3D campaigns I built for The LEGO Group.{" "}
          <Link href="/work/lego-hero-stories">Read the case study</Link>.
        </p>
      </section>
    </article>
  );
}
