import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container section">
      <h1>Page not found</h1>
      <p className="lead">
        This page doesn&apos;t exist. <Link href="/">Back to the homepage</Link>.
      </p>
    </section>
  );
}
