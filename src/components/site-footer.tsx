import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          © 2026 {site.company} · {site.location}
        </p>
        <p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <span aria-hidden="true"> · </span>
          <a href={site.linkedin} rel="noopener">
            LinkedIn
          </a>
        </p>
      </div>
    </footer>
  );
}
