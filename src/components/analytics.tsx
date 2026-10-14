"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";

type GoatCounter = {
  count?: (vars: { path: string; title?: string; event?: boolean }) => void;
};

declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

// Cookie-free page views and click events through GoatCounter. Renders nothing while site.goatcounter is empty.
export function Analytics() {
  const pathname = usePathname();
  const firstView = useRef(true);

  // count.js records the first page view itself; client-side navigations are counted here.
  useEffect(() => {
    if (!site.goatcounter) return;
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    window.goatcounter?.count?.({ path: pathname, title: document.title });
  }, [pathname]);

  // Any element with data-track="name" is counted as an event when clicked.
  useEffect(() => {
    if (!site.goatcounter) return;
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el?.dataset.track) return;
      window.goatcounter?.count?.({ path: el.dataset.track, title: el.textContent?.trim(), event: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!site.goatcounter) return null;
  return (
    <Script
      src="https://gc.zgo.at/count.js"
      data-goatcounter={`https://${site.goatcounter}.goatcounter.com/count`}
      strategy="afterInteractive"
    />
  );
}
