"use client";

import { useState } from "react";
import styles from "./dashboard.module.css";
import { copy, newId } from "./format";
import { RecordDialog, type Field } from "./record-dialog";
import type { Template } from "./types";

const FIELDS: Field<Template>[] = [
  { key: "title", label: "Titlu", required: true },
  { key: "channel", label: "Pentru", placeholder: "Recruiter, hiring manager, broker…" },
  { key: "body", label: "Text", type: "textarea" },
];

const blank = (): Template => ({ id: newId(), updatedAt: "", title: "", channel: "", body: "" });

export function Templates({ templates, onSave }: { templates: Template[]; onSave: (t: Template, deleted?: boolean) => void }) {
  const [editing, setEditing] = useState<Template | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const rows = templates.filter((t) => !t.deleted).sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));

  return (
    <>
      <h1 className={styles.h1}>Șabloane de mesaje</h1>
      <p className={styles.sub}>Pornești de la ele, apoi le personalizezi pentru fiecare om.</p>
      <div className={styles.toolbar}>
        <button type="button" className={styles.btn} onClick={() => setEditing(blank())}>
          + Șablon
        </button>
      </div>
      {rows.length ? (
        <div className={styles.templates}>
          {rows.map((t) => (
            <article key={t.id} className={styles.card}>
              <h2>{t.title}</h2>
              {t.channel && <span className={styles.pill}>{t.channel}</span>}
              <p className={styles.templateBody}>{t.body}</p>
              <div className={styles.links}>
                <button
                  type="button"
                  className={styles.btnSmall}
                  onClick={async () => {
                    if (await copy(t.body)) setCopied(t.id);
                  }}
                >
                  {copied === t.id ? "Copiat" : "Copiază"}
                </button>
                <button type="button" className={styles.btnSmall} onClick={() => setEditing(t)}>
                  Editează
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Șabloanele le scriem împreună la pasul următor.</p>
      )}
      <RecordDialog<Template>
        title={editing?.updatedAt ? "Editează șablonul" : "Șablon nou"}
        fields={FIELDS}
        value={editing}
        onSave={(t) => {
          onSave(t);
          setEditing(null);
        }}
        onDelete={
          editing?.updatedAt
            ? (t) => {
                onSave(t, true);
                setEditing(null);
              }
            : undefined
        }
        onClose={() => setEditing(null)}
      />
    </>
  );
}
