import type { ReactElement } from "react";
import ViewerLcp from "./360-viewer-without-hurting-lcp";
import AccessibleHotspots from "./accessible-3d-hotspots";
import HeadlessReports from "./headless-puppeteer-reports";
import LiveBroadcastGraphics from "./live-broadcast-graphics-react";
import OfflineQueue from "./offline-message-queue";

// Article bodies by slug; titles and dates live in src/content/notes.ts
export const noteBodies: Record<string, () => Promise<ReactElement>> = {
  "accessible-3d-hotspots": AccessibleHotspots,
  "360-viewer-without-hurting-lcp": ViewerLcp,
  "offline-message-queue": OfflineQueue,
  "headless-puppeteer-reports": HeadlessReports,
  "live-broadcast-graphics-react": LiveBroadcastGraphics,
};
