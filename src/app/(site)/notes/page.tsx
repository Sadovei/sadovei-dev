import type { Metadata } from "next";
import Link from "next/link";
import { NoteDate } from "@/components/note-date";
import { notes } from "@/content/notes";

export const metadata: Metadata = {
  title: "Notes",
  description: "Practical write-ups from production work: accessibility, 3D on the web, performance and real-time UIs.",
  alternates: { canonical: "/notes/" },
};

export default function NotesPage() {
  return (
    <section className="container notes-index">
      <p className="eyebrow">Notes</p>
      <h1>Notes from the work</h1>
      <p className="lead">Practical write-ups from production projects: accessibility, 3D on the web, performance and real-time UIs.</p>
      <ul className="note-list">
        {notes.map((note) => (
          <li key={note.slug}>
            <p className="note-meta">
              <NoteDate date={note.date} /> · {note.readingMinutes} min read
            </p>
            <h2>
              <Link href={`/notes/${note.slug}`}>{note.title}</Link>
            </h2>
            <p>{note.description}</p>
            <ul className="tags" aria-label="Topics">
              {note.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
