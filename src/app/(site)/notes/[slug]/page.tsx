import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteDate } from "@/components/note-date";
import { getNote, notes } from "@/content/notes";
import { site } from "@/content/site";
import { noteBodies } from "@/notes";

export const dynamicParams = false;

export function generateStaticParams() {
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};
  return {
    title: note.title,
    description: note.description,
    alternates: { canonical: `/notes/${note.slug}/` },
    openGraph: {
      type: "article",
      url: `/notes/${note.slug}/`,
      title: note.title,
      description: note.description,
      publishedTime: note.date,
      authors: [site.name],
      images: [{ url: `/og/note-${note.slug}.png`, width: 1200, height: 630, alt: note.title }],
    },
  };
}

export default async function NotePage({ params }: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const note = getNote(slug);
  const Body = noteBodies[slug];
  if (!note || !Body) notFound();

  const others = notes.filter((n) => n.slug !== slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: note.title,
    description: note.description,
    datePublished: note.date,
    url: `${site.url}/notes/${note.slug}/`,
    image: `${site.url}/og/note-${note.slug}.png`,
    keywords: note.tags.join(", "),
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <article className="note container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="case__back">
        <Link href="/notes">← All notes</Link>
      </p>
      <header className="note__header">
        <p className="eyebrow">{note.tags.join(" · ")}</p>
        <h1>{note.title}</h1>
        <p className="lead">{note.description}</p>
        <p className="note-meta">
          {site.name} · <NoteDate date={note.date} /> · {note.readingMinutes} min read
        </p>
      </header>

      <div className="prose">
        <Body />
      </div>

      <aside className="author" aria-label="About the author">
        <Image src="/photo.jpg" alt="" width={72} height={72} className="author__photo" />
        <div>
          <p className="author__name">{site.name}</p>
          <p>
            {site.role} working remotely with teams in the UK, the EU and North America. I build fast, accessible
            frontends for products used by millions, for clients like The LEGO Group, SITA and RBC Capital Markets.
          </p>
          <div className="actions">
            {site.booking && (
              <a className="button" href={site.booking} rel="noopener" data-track={`book-call-note-${note.slug}`}>
                Book a 20-minute intro call
              </a>
            )}
            <Link className="button button--ghost" href="/#work">
              See my work
            </Link>
          </div>
        </div>
      </aside>

      {others.length > 0 && (
        <nav className="case__next" aria-label="More notes">
          <span>Next note</span>
          <Link href={`/notes/${others[0].slug}`}>{others[0].title}</Link>
        </nav>
      )}
    </article>
  );
}
