import Link from "next/link";
import { nav, site } from "@/content/site";
import { caseStudies } from "@/content/work";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <p className="site-footer__name">{site.name}</p>
            <p>
              {site.role}: React, Next.js, React Native and TypeScript. Remote from Bucharest, working with teams in the
              UK, the EU and North America.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="site-footer__heading">Explore</h2>
            <ul>
              {nav.map((item) => (
                <li key={item.id}>
                  <Link href={`/#${item.id}`}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="site-footer__heading">Case studies</h2>
            <ul>
              {caseStudies.map((study) => (
                <li key={study.slug}>
                  <Link href={`/work/${study.slug}`}>{study.client}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="site-footer__heading">Get in touch</h2>
            <ul>
              {site.booking && (
                <li>
                  <a href={site.booking} rel="noopener">
                    Book an intro call
                  </a>
                </li>
              )}
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a href={site.linkedin} rel="noopener">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            © 2026 {site.company} · {site.location}
          </p>
          <a href="#main" className="site-footer__top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
