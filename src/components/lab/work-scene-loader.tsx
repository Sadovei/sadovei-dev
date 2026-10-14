"use client";

import dynamic from "next/dynamic";

// three.js only loads on this page, and only in the browser
const WorkScene = dynamic(() => import("./work-scene").then((mod) => mod.WorkScene), {
  ssr: false,
  loading: () => <div className="lab__stage lab__stage--loading">Loading the 3D scene…</div>,
});

export function WorkSceneLoader() {
  return <WorkScene />;
}
