import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container section">
        <h1>Page not found</h1>
        <p className="lead">
          This page doesn&apos;t exist. <Link href="/">Back to the homepage</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
