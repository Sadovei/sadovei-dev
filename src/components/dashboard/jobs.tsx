"use client";

import { useMemo, useState } from "react";
import styles from "./dashboard.module.css";
import { daysAgo, pay } from "./format";
import { JOB_STATUSES, type JobMark, type JobStatus, type RadarJob } from "./types";

const BUCKETS = { "": "Toate tipurile", contract: "Contracte", full_time: "Full-time peste prag", company: "Companii țintă" } as const;

type Props = {
  jobs: RadarJob[];
  marks: JobMark[];
  onMark: (mark: JobMark) => void;
  onOutreach: (job: RadarJob) => void;
};

export function Jobs({ jobs, marks, onMark, onOutreach }: Props) {
  const [bucket, setBucket] = useState<keyof typeof BUCKETS>("");
  const [status, setStatus] = useState<"" | JobStatus | "active">("active");
  const [minScore, setMinScore] = useState(0);
  const [query, setQuery] = useState("");

  const statusOf = useMemo(() => {
    const map = new Map(marks.filter((m) => !m.deleted).map((m) => [m.id, m.status]));
    return (id: string): JobStatus => map.get(id) ?? "new";
  }, [marks]);

  const sources = useMemo(() => [...new Set(jobs.map((j) => j.source))].sort(), [jobs]);
  const [source, setSource] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const s = statusOf(job.id);
      if (status === "active" ? s === "not_interested" : status && s !== status) return false;
      if (bucket && job.bucket !== bucket) return false;
      if (source && job.source !== source) return false;
      if (job.score < minScore) return false;
      return !q || `${job.title} ${job.company} ${job.location} ${job.reasons.join(" ")}`.toLowerCase().includes(q);
    });
  }, [jobs, status, bucket, source, minScore, query, statusOf]);

  return (
    <>
      <h1 className={styles.h1}>Job-uri din radar</h1>
      <p className={styles.sub}>Tot ce a găsit radarul în ultimele 45 de zile, sortat după scor. Statusul îl alegi tu.</p>

      <div className={styles.toolbar}>
        <input className={`${styles.input} ${styles.grow}`} placeholder="Caută rol, companie, locație…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Caută" />
        <select className={styles.select} value={bucket} onChange={(e) => setBucket(e.target.value as keyof typeof BUCKETS)} aria-label="Tip">
          {Object.entries(BUCKETS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status">
          <option value="active">Fără „Nu mă interesează”</option>
          <option value="">Toate statusurile</option>
          {Object.entries(JOB_STATUSES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select className={styles.select} value={source} onChange={(e) => setSource(e.target.value)} aria-label="Sursă">
          <option value="">Toate sursele</option>
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={styles.select} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} aria-label="Scor minim">
          {[0, 4, 6, 8, 10].map((n) => (
            <option key={n} value={n}>
              {n ? `Scor ≥ ${n}` : "Orice scor"}
            </option>
          ))}
        </select>
        <span className={styles.count}>{rows.length} afișate</span>
      </div>

      <div className={styles.tableWrap}>
        {rows.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Scor</th>
                <th>Rol</th>
                <th>Locație</th>
                <th>Tip · plată</th>
                <th>Găsit</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((job) => (
                <tr key={job.id}>
                  <td>
                    <span className={styles.score}>{job.score}</span>
                  </td>
                  <td>
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      {job.title}
                    </a>
                    <div className={styles.muted}>
                      {job.company} · <span className={styles.small}>{job.source}</span>
                    </div>
                    <div className={`${styles.muted} ${styles.small}`}>{job.reasons.join(" · ")}</div>
                    {job.flags.length > 0 && <div className={`${styles.warn} ${styles.small}`}>{job.flags.join(" · ")}</div>}
                  </td>
                  <td>{job.location}</td>
                  <td className={styles.nowrap}>
                    <span className={styles.pill}>{BUCKETS[job.bucket]}</span>
                    <div className={styles.small}>{pay(job)}</div>
                  </td>
                  <td className={`${styles.nowrap} ${styles.muted}`}>{daysAgo(job.firstSeen)}</td>
                  <td>
                    <select
                      className={styles.inlineSelect}
                      value={statusOf(job.id)}
                      onChange={(e) => onMark({ id: job.id, updatedAt: "", status: e.target.value as JobStatus })}
                      aria-label={`Status pentru ${job.title}`}
                    >
                      {Object.entries(JOB_STATUSES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button type="button" className={styles.btnSmall} onClick={() => onOutreach(job)}>
                      → Outreach
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.empty}>Nimic pentru filtrele alese.</p>
        )}
      </div>
    </>
  );
}
