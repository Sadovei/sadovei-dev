"use client";

import { useState } from "react";
import styles from "./dashboard.module.css";
import { formatDate, newId } from "./format";
import { RecordDialog, type Field } from "./record-dialog";
import type { Broker } from "./types";

const PROFILE = { no: "Fără profil", created: "Profil creat", active: "Activ, în discuții" };

const FIELDS: Field<Broker>[] = [
  { key: "name", label: "Broker / agenție", required: true },
  { key: "market", label: "Piață", placeholder: "UK, Nordice, NL, DACH…" },
  { key: "profile", label: "Profil", type: "select", options: PROFILE },
  { key: "contactPerson", label: "Persoană de contact" },
  { key: "lastContact", label: "Ultimul contact", type: "date" },
  { key: "url", label: "Link înscriere / portal", type: "url", wide: true },
  { key: "notes", label: "Note", type: "textarea" },
];

const blank = (): Broker => ({ id: newId(), updatedAt: "", name: "", market: "", url: "", profile: "no", contactPerson: "", lastContact: "", notes: "" });

export function Brokers({ brokers, onSave }: { brokers: Broker[]; onSave: (broker: Broker, deleted?: boolean) => void }) {
  const [editing, setEditing] = useState<Broker | null>(null);
  const rows = brokers.filter((b) => !b.deleted).sort((a, b) => a.market.localeCompare(b.market) || a.name.localeCompare(b.name));

  return (
    <>
      <h1 className={styles.h1}>Brokeri</h1>
      <p className={styles.sub}>Unde ai profil, cu cine vorbești și când ai vorbit ultima dată.</p>
      <div className={styles.toolbar}>
        <button type="button" className={styles.btn} onClick={() => setEditing(blank())}>
          + Broker
        </button>
        <span className={styles.count}>{rows.length} brokeri</span>
      </div>
      <div className={styles.tableWrap}>
        {rows.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Broker</th>
                <th>Piață</th>
                <th>Profil</th>
                <th>Contact</th>
                <th>Ultimul contact</th>
                <th>Note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.url ? (
                      <a href={b.url} target="_blank" rel="noopener noreferrer">
                        {b.name}
                      </a>
                    ) : (
                      <strong>{b.name}</strong>
                    )}
                  </td>
                  <td>{b.market}</td>
                  <td>
                    <select className={styles.inlineSelect} value={b.profile} onChange={(e) => onSave({ ...b, profile: e.target.value as Broker["profile"] })} aria-label={`Profil la ${b.name}`}>
                      {Object.entries(PROFILE).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{b.contactPerson}</td>
                  <td className={styles.nowrap}>{formatDate(b.lastContact)}</td>
                  <td className={`${styles.muted} ${styles.small}`}>{b.notes}</td>
                  <td>
                    <button type="button" className={styles.btnSmall} onClick={() => setEditing(b)}>
                      Editează
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.empty}>Lista de brokeri vine la pasul următor. Poți adăuga și tu oricând.</p>
        )}
      </div>
      <RecordDialog<Broker>
        title={editing?.updatedAt ? "Editează brokerul" : "Broker nou"}
        fields={FIELDS}
        value={editing}
        onSave={(b) => {
          onSave(b);
          setEditing(null);
        }}
        onDelete={
          editing?.updatedAt
            ? (b) => {
                onSave(b, true);
                setEditing(null);
              }
            : undefined
        }
        onClose={() => setEditing(null)}
      />
    </>
  );
}
