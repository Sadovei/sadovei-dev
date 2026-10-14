import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/content/work";
import { testimonials } from "@/content/testimonials";
import { QuoteCard } from "@/components/quote-card";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  const title = `${study.title} (${study.client})`;
  return {
    title,
    description: study.summary,
    alternates: { canonical: `/work/${study.slug}/` },
    openGraph: {
      type: "article",
      url: `/work/${study.slug}/`,
      title,
      description: study.summary,
      images: [{ url: `/og/${study.slug}.png`, width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const quotes = testimonials.filter((t) => t.caseStudy === study.slug);
  const index = caseStudies.indexOf(study);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <article className="case container">
      <p className="case__back">
        <Link href="/#work">← All work</Link>
      </p>
      <p className="eyebrow">{study.client}</p>
      <h1>{study.title}</h1>
      <p className="lead">{study.summary}</p>

      <dl className="case__meta">
        <div>
          <dt>Role</dt>
          <dd>{study.role}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>{study.stack.join(", ")}</dd>
        </div>
      </dl>

      <section aria-labelledby="context">
        <h2 id="context">Context</h2>
        <p>{study.context}</p>
        {study.challenge && <p>{study.challenge}</p>}
      </section>

      <section aria-labelledby="work">
        <h2 id="work">What I did</h2>
        <ul className="case__list">
          {study.work.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="outcome">
        <h2 id="outcome">Outcome</h2>
        <ul className="case__list case__list--outcome">
          {study.outcome.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {quotes.length > 0 && (
        <section aria-labelledby="team-said">
          <h2 id="team-said">What the team said</h2>
          <ul className="quotes quotes--stack">
            {quotes.map((t) => (
              <li key={t.name}>
                <QuoteCard testimonial={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {study.link && (
        <p>
          <a className="button button--ghost" href={study.link.href} rel="noopener" data-track={`live-${study.slug}`}>
            {study.link.label}
          </a>
        </p>
      )}

      <nav className="case__next" aria-label="Next case study">
        <span>Next</span>
        <Link href={`/work/${next.slug}`}>
          {next.client}: {next.title}
        </Link>
      </nav>
    </article>
  );
}
