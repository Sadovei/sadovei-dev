"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./dashboard.module.css";

export type Field<T> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "textarea" | "date" | "url" | "select";
  options?: Record<string, string>;
  wide?: boolean;
  placeholder?: string;
  required?: boolean;
};

type Props<T> = {
  title: string;
  fields: Field<T>[];
  value: T | null;
  onSave: (value: T) => void;
  onDelete?: (value: T) => void;
  onClose: () => void;
};

// One modal form for every record type, driven by a field list. Uses <dialog> for focus trapping and Escape.
export function RecordDialog<T extends { id: string }>({ title, fields, value, onSave, onDelete, onClose }: Props<T>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<T | null>(value);
  const [shown, setShown] = useState<T | null>(value);

  // A new record to edit resets the draft (adjusting state during render, not in an effect)
  if (value !== shown) {
    setShown(value);
    setDraft(value);
  }

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (value && !el.open) el.showModal();
    if (!value && el.open) el.close();
  }, [value]);

  const set = (key: keyof T & string, next: string) => setDraft((current) => (current ? { ...current, [key]: next } : current));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (draft) onSave(draft);
  };

  return (
    <dialog ref={dialog} className={styles.dialog} onClose={onClose} aria-labelledby="record-title">
      {draft && (
        <form onSubmit={submit}>
          <div className={styles.dialogHead}>
            <h2 id="record-title">{title}</h2>
            <button type="button" className={styles.btnSmall} onClick={onClose} aria-label="Închide">
              ✕
            </button>
          </div>
          <div className={styles.form}>
            {fields.map((field) => {
              const current = String(draft[field.key] ?? "");
              const common = {
                id: `field-${field.key}`,
                value: current,
                required: field.required,
                placeholder: field.placeholder,
              };
              return (
                <label key={field.key} className={`${styles.field} ${field.wide || field.type === "textarea" ? styles.wide : ""}`}>
                  <span>{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea {...common} className={styles.textarea} onChange={(e) => set(field.key, e.target.value)} />
                  ) : field.type === "select" ? (
                    <select {...common} className={styles.select} onChange={(e) => set(field.key, e.target.value)}>
                      {Object.entries(field.options ?? {}).map(([option, label]) => (
                        <option key={option} value={option}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input {...common} type={field.type ?? "text"} className={styles.input} onChange={(e) => set(field.key, e.target.value)} />
                  )}
                </label>
              );
            })}
          </div>
          <div className={styles.dialogFoot}>
            {onDelete && (
              <button
                type="button"
                className={`${styles.btnGhost} ${styles.btnDanger} ${styles.left}`}
                onClick={() => {
                  if (window.confirm("Ștergi această înregistrare?")) onDelete(draft);
                }}
              >
                Șterge
              </button>
            )}
            <button type="button" className={styles.btnGhost} onClick={onClose}>
              Renunță
            </button>
            <button type="submit" className={styles.btn}>
              Salvează
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
