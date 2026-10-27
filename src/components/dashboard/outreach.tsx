"use client";

import { useMemo, useState } from "react";
import styles from "./dashboard.module.css";
import { copy, downloadCsv, formatDate, newId, refLink, today } from "./format";
import { RecordDialog, type Field } from "./record-dialog";
import { contactVisits } from "./site-data";
import { CHANNELS, ROLES, STAGES, type Contact, type SiteStats, type Stage } from "./types";

const FIELDS: Field<Contact>[] = [
  { key: "name", label: "Nume", required: true },
  { key: "company", label: "Companie" },
  { key: "role", label: "Rol", type: "select", options: ROLES },
  { key: "channel", label: "Canal", type: "select", options: CHANNELS },
  { key: "country", label: "Țară / piață", placeholder: "UK, NL, DE…" },
  { key: "industry", label: "Domeniu", placeholder: "Fintech, aviație, media…" },
  { key: "stage", label: "Etapă", type: "select", options: STAGES },
  { key: "sentAt", label: "Trimis la", type: "date" },
  { key: "nextFollowUp", label: "Următorul follow-up", type: "date" },
  { key: "rate", label: "Rată discutată", placeholder: "€450/zi" },
  { key: "url", label: "Profil LinkedIn / link", type: "url", wide: true },
  { key: "refLink", label: "Link ?ref= trimis", type: "url", wide: true, placeholder: "Se completează automat din companie" },
  { key: "message", label: "Ce ai trimis (mesaj sau șablon)", type: "textarea" },
  { key: "notes", label: "Note", type: "textarea" },
];

export const blankContact = (patch: Partial<Contact> = {}): Contact => ({
  id: newId(),
  updatedAt: "",
  name: "",
  company: "",
  role: "recruiter",
  channel: "linkedin",
  country: "",
  industry: "",
  sentAt: today(),
  message: "",
  refLink: "",
  stage: "sent",
  rate: "",
  nextFollowUp: "",
  url: "",
  notes: "",
  ...patch,
});

const CLOSED: Stage[] = ["won", "lost", "no_reply"];

// Whether this contact opened sadovei.dev through their ?ref= link (from the GoatCounter stats)
function SiteSeen({ contact, stats }: { contact: Contact; stats: SiteStats | null }) {
  const seen = contactVisits(contact, stats);
  if (seen) return <span className={styles.seen} title={`?ref=${seen.refs.join(", ")} · prima vizită ${formatDate(seen.firstDay)}`}>✓ {formatDate(seen.lastDay)} ({seen.visits})</span>;
  return <span className={styles.muted}>{stats && contact.refLink && contact.stage !== "to_contact" ? "încă nu" : "—"}</span>;
}

type Props = {
  contacts: Contact[];
  siteStats: SiteStats | null;
  onSave: (contact: Contact, deleted?: boolean) => void;
  editing: Contact | null;
  setEditing: (contact: Contact | null) => void;
};

export function Outreach({ contacts, siteStats, onSave, editing, setEditing }: Props) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<"" | Stage | "open" | "due">("open");
  const [copied, setCopied] = useState<string | null>(null);
  const now = today();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => !c.deleted)
      .filter((c) => !q || `${c.name} ${c.company} ${c.country} ${c.industry} ${c.notes}`.toLowerCase().includes(q))
      .filter((c) => {
        if (stage === "open") return !CLOSED.includes(c.stage);
        if (stage === "due") return !CLOSED.includes(c.stage) && c.nextFollowUp && c.nextFollowUp <= now;
        return !stage || c.stage === stage;
      })
      .sort((a, b) => (a.nextFollowUp || "9999").localeCompare(b.nextFollowUp || "9999") || b.sentAt.localeCompare(a.sentAt));
  }, [contacts, query, stage, now]);

  const save = (contact: Contact) => {
    onSave({ ...contact, refLink: contact.refLink || (contact.company ? refLink(contact.company) : "") });
    setEditing(null);
  };

  return (
    <>
      <h1 className={styles.h1}>Outreach</h1>
      <p className={styles.sub}>Cui ai scris, ce, pe ce canal și ce urmează. Sortat după următorul follow-up.</p>

      <div className={styles.toolbar}>
        <button type="button" className={styles.btn} onClick={() => setEditing(blankContact())}>
          + Contact nou
        </button>
        <input className={`${styles.input} ${styles.grow}`} placeholder="Caută nume, companie, țară, note…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Caută" />
        <select className={styles.select} value={stage} onChange={(e) => setStage(e.target.value as typeof stage)} aria-label="Filtru etapă">
          <option value="open">Active (fără închise)</option>
          <option value="due">Follow-up azi sau întârziat</option>
          <option value="">Toate</option>
          {Object.entries(STAGES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={() =>
            downloadCsv(
              `outreach-${now}.csv`,
              contacts
                .filter((c) => !c.deleted)
                .map((c) => ({
                  name: c.name,
                  company: c.company,
                  role: ROLES[c.role],
                  channel: CHANNELS[c.channel],
                  country: c.country,
                  industry: c.industry,
                  stage: STAGES[c.stage],
                  sentAt: c.sentAt,
                  nextFollowUp: c.nextFollowUp,
                  rate: c.rate,
                  url: c.url,
                  refLink: c.refLink,
                  message: c.message,
                  notes: c.notes,
                })),
            )
          }
        >
          Export CSV
        </button>
        <span className={styles.count}>{rows.length} afișate</span>
      </div>

      <div className={styles.tableWrap}>
        {rows.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Rol · canal</th>
                <th>Piață · domeniu</th>
                <th>Etapă</th>
                <th>Trimis</th>
                <th>Site</th>
                <th>Follow-up</th>
                <th>Rată</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer">
                        {c.name}
                      </a>
                    ) : (
                      <strong>{c.name}</strong>
                    )}
                    <div className={styles.muted}>{c.company}</div>
                  </td>
                  <td>
                    {ROLES[c.role]}
                    <div className={`${styles.muted} ${styles.small}`}>{CHANNELS[c.channel]}</div>
                  </td>
                  <td>
                    {c.country}
                    <div className={`${styles.muted} ${styles.small}`}>{c.industry}</div>
                  </td>
                  <td>
                    <select
                      className={styles.inlineSelect}
                      value={c.stage}
                      onChange={(e) => onSave({ ...c, stage: e.target.value as Stage })}
                      aria-label={`Etapă pentru ${c.name}`}
                    >
                      {Object.entries(STAGES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={styles.nowrap}>{formatDate(c.sentAt)}</td>
                  <td className={styles.nowrap}>
                    <SiteSeen contact={c} stats={siteStats} />
                  </td>
                  <td className={`${styles.nowrap} ${c.nextFollowUp && c.nextFollowUp <= now && !CLOSED.includes(c.stage) ? styles.overdue : ""}`}>
                    {formatDate(c.nextFollowUp)}
                  </td>
                  <td className={styles.nowrap}>{c.rate}</td>
                  <td className={styles.nowrap}>
                    {c.refLink && (
                      <button
                        type="button"
                        className={styles.btnSmall}
                        onClick={async () => {
                          if (await copy(c.refLink)) setCopied(c.id);
                        }}
                      >
                        {copied === c.id ? "Copiat" : "Link ?ref"}
                      </button>
                    )}{" "}
                    <button type="button" className={styles.btnSmall} onClick={() => setEditing(c)}>
                      Editează
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.empty}>Niciun contact aici încă. Adaugă primul cu „+ Contact nou”.</p>
        )}
      </div>

      <RecordDialog<Contact>
        title={editing?.updatedAt ? "Editează contactul" : "Contact nou"}
        fields={FIELDS}
        value={editing}
        onSave={save}
        onDelete={
          editing?.updatedAt
            ? (c) => {
                onSave(c, true);
                setEditing(null);
              }
            : undefined
        }
        onClose={() => setEditing(null)}
      />
    </>
  );
}
