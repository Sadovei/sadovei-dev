"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site, type SectionId } from "@/content/site";

// Continuous scroll distance needed before the header reacts, so jitter never makes it flicker.
const HIDE_AFTER = 16;
const SHOW_AFTER = 8;

// A section counts as current once its top passes this fraction of the viewport.
const SPY_LINE = 0.35;

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [section, setSection] = useState<SectionId | null>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;

    const sections = isHome
      ? nav.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null)
      : [];

    let lastY = Math.max(window.scrollY, 0);
    let travel = 0;
    let frame = 0;
    let current: SectionId | null = null;

    const setState = (state: "top" | "shown" | "hidden") => {
      if (header.dataset.state !== state) header.dataset.state = state;
    };

    const spy = () => {
      if (!isHome) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let next: SectionId | null = null;
      if (atBottom && sections.length) {
        next = sections[sections.length - 1].id as SectionId;
      } else {
        for (const el of sections) {
          if (el.getBoundingClientRect().top <= window.innerHeight * SPY_LINE) next = el.id as SectionId;
        }
      }
      if (next !== current) {
        current = next;
        setSection(next);
      }
    };

    const update = () => {
      frame = 0;
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastY;
      lastY = y;

      if (delta !== 0) {
        // Restart the count whenever the direction changes
        if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
        travel += delta;
      }

      if (y <= header.offsetHeight) setState("top");
      else if (travel > HIDE_AFTER) setState("hidden");
      else if (travel < -SHOW_AFTER) setState("shown");

      spy();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    setState(lastY <= header.offsetHeight ? "top" : "shown");
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [isHome]);

  // Case studies and the 3D lab live under "Work"
  const underWork = pathname.startsWith("/work") || pathname.startsWith("/lab");
  const active: SectionId | null = isHome ? section : underWork ? "work" : null;

  return (
    <header ref={ref} className="site-header" data-state="top">
      <div className="container site-header__inner">
        <Link href="/" className="site-header__name">
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="site-nav">
            {nav.map((item) => (
              <li key={item.id}>
                <Link href={`/#${item.id}`} aria-current={active === item.id ? "true" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
