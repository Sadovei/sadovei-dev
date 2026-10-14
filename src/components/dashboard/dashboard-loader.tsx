"use client";

import dynamic from "next/dynamic";

// Browser-only: the token lives in browser storage and all data comes from the GitHub API
const Dashboard = dynamic(() => import("./dashboard").then((mod) => mod.Dashboard), { ssr: false });

export function DashboardLoader() {
  return <Dashboard />;
}
