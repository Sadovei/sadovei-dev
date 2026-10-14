import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// Private tool: no site header, no analytics, and the page may only talk to GitHub's API
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <>
      <meta
        httpEquiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.github.com; base-uri 'self'; form-action 'self'"
      />
      <meta name="referrer" content="no-referrer" />
      {children}
    </>
  );
}
