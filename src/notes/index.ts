import type { ReactElement } from "react";
import ViewerLcp from "./360-viewer-without-hurting-lcp";
import AccessibleHotspots from "./accessible-3d-hotspots";

// Article bodies by slug; titles and dates live in src/content/notes.ts
export const noteBodies: Record<string, () => Promise<ReactElement>> = {
  "accessible-3d-hotspots": AccessibleHotspots,
  "360-viewer-without-hurting-lcp": ViewerLcp,
};
