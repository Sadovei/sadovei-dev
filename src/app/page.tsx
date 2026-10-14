import Image from "next/image";
import Link from "next/link";
import { approach, clients, firstWeeks, highlights, quickFacts, services, site } from "@/content/site";
import { caseStudies } from "@/content/work";
import { recommendationsUrl, testimonials } from "@/content/testimonials";
import { QuoteCard } from "@/components/quote-card";

const enquiry = `mailto:${site.email}?subject=Contract%20enquiry`;
const featuredQuotes = testimonials.filter((t) => t.featured);
const moreQuotes = testimonials.filter((t) => !t.featured);

// Lets search engines show a rich result for the person and the company.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  email: `mailto:${site.email}`,
  image: `${site.url}/photo.jpg`,
  sameAs: [site.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "Bucharest", addressCountry: "RO" },
  worksFor: { "@type": "Organization", name: site.company, url: site.url },
  knowsAbout: ["React", "Next.js", "React Native", "TypeScript", "Three.js", "Web accessibility", "WCAG"],
};

function ContactActions({ place }: { place: "hero" | "contact" }) {
  return (
    <div className="actions">
      {site.booking ? (
        <>
          <a className="button" href={site.booking} rel="noopener" data-track={`book-call-${place}`}>
            Book a 20-minute intro call
          </a>
          <a className="button button--ghost" href={enquiry} data-track={`email-${place}`}>
            Email me
          </a>
        </>
      ) : (
        <a className="button" href={enquiry} data-track={`email-${place}`}>
          Start a conversation
        </a>
      )}
      <a className="button button--ghost" href={site.linkedin} rel="noopener" data-track={`linkedin-${place}`}>
        LinkedIn
      </a>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero__text">
          <p className="eyebrow">{site.role} · Independent contractor</p>
          <h1 id="hero-title">I build fast, accessible frontends for products used by millions.</h1>
          <p className="lead">
            React, Next.js, React Native and TypeScript, with 7+ years of shipping for The LEGO Group, SITA, RBC
            Capital Markets and PGL. Remote from Bucharest, working with teams in the UK, the EU and North America.
          </p>
          <ContactActions place="hero" />
        </div>
        <Image
          className="hero__photo"
          src="/photo.jpg"
          alt="Portrait of Radu Sadovei"
          width={400}
          height={400}
          preload
        />
      </section>

      <section className="container" aria-label="Highlights">
        <ul className="highlights">
          {highlights.map((item) => (
            <li key={item.value}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="work" className="section container" aria-labelledby="work-title">
        <h2 id="work-title" className="section__title">
          Selected work
        </h2>
        <ul className="cards">
          {caseStudies.map((study) => (
            <li key={study.slug} className="card">
              <p className="card__client">{study.client}</p>
              <h3 className="card__title">
                <Link href={`/work/${study.slug}`}>{study.title}</Link>
              </h3>
              <p>{study.summary}</p>
              <ul className="tags" aria-label="Stack">
                {study.stack.slice(0, 4).map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <Link href="/lab/3d" className="lab-teaser">
          <strong>Explore my work in 3D →</strong>
          <span>An accessible React Three Fiber scene that adapts to your device.</span>
        </Link>
      </section>

      <section id="recommendations" className="section container" aria-labelledby="quotes-title">
        <h2 id="quotes-title" className="section__title">
          What people I&apos;ve worked with say
        </h2>
        <ul className="quotes">
          {featuredQuotes.map((t) => (
            <li key={t.name}>
              <QuoteCard testimonial={t} />
            </li>
          ))}
        </ul>
        {moreQuotes.length > 0 && (
          <details className="quotes__more">
            <summary>Show {moreQuotes.length} more recommendations</summary>
            <ul className="quotes">
              {moreQuotes.map((t) => (
                <li key={t.name}>
                  <QuoteCard testimonial={t} />
                </li>
              ))}
            </ul>
          </details>
        )}
        <p className="quotes__source">
          Excerpts from recommendations on{" "}
          <a href={recommendationsUrl} rel="noopener">
            LinkedIn
          </a>
          .
        </p>
      </section>

      <section id="services" className="section container" aria-labelledby="services-title">
        <h2 id="services-title" className="section__title">
          What I can help with
        </h2>
        <ul className="services">
          {services.map((service) => (
            <li key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="approach" className="section container" aria-labelledby="approach-title">
        <h2 id="approach-title" className="section__title">
          How I work
        </h2>
        <ul className="approach">
          {approach.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <h3 className="subsection__title">My first two weeks on a new team</h3>
        <ol className="steps">
          {firstWeeks.map((step) => (
            <li key={step.title}>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>

        <p className="clients">
          <span>Clients and teams:</span> {clients.join(" · ")}
        </p>
      </section>

      <section id="contact" className="section container contact" aria-labelledby="contact-title">
        <div className="contact__intro">
          <h2 id="contact-title">Have a product that needs a senior frontend contractor?</h2>
          <p className="lead">
            Tell me about the team, the product and the timeline. Recruiters are welcome too: the essentials are
            below.
          </p>
          <ContactActions place="contact" />
        </div>
        <dl className="facts" aria-label="Quick facts">
          {quickFacts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>
                {fact.href ? (
                  <a href={fact.href} download data-track="download-cv">
                    {fact.value}
                  </a>
                ) : (
                  fact.value
                )}
                {fact.note && <span className="facts__note">, {fact.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
