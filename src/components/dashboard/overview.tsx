"use client";

import styles from "./dashboard.module.css";
import { daysAgo, daysBefore, formatDate, pay, today } from "./format";
import { STAGES, type Contact, type JobMark, type RadarJob, type RadarMeta, type Stage } from "./types";

const REPLIED: Stage[] = ["replied", "call", "interview", "offer", "won"];
const CLOSED: Stage[] = ["won", "lost", "no_reply"];

type Props = {
  jobs: RadarJob[];
  meta: RadarMeta | null;
  contacts: Contact[];
  marks: JobMark[];
  onOpenContact: (contact: Contact) => void;
  onGo: (tab: string) => void;
  onRunRadar: () => void;
  radarState: "idle" | "running" | "started" | "error";
};

const LINKS = [
  ["Ghid Sales Navigator", "https://github.com/Sadovei/job-radar/blob/main/docs/sales-navigator.md"],
  ["Rezumatele radarului", "https://github.com/Sadovei/job-radar/issues?q=label%3Aradar"],
  ["Statistici site (GoatCounter)", "https://sadovei.goatcounter.com/"],
  ["Programări (Cal.com)", "https://app.cal.com/bookings/upcoming"],
  ["Sales Navigator", "https://www.linkedin.com/sales/home"],
  ["Site", "https://sadovei.dev/"],
] as const;

export function Overview({ jobs, meta, contacts, marks, onOpenContact, onGo, onRunRadar, radarState }: Props) {
  const now = today();
  const week = daysBefore(7);
  const live = contacts.filter((c) => !c.deleted);
  const contacted = live.filter((c) => c.stage !== "to_contact");
  const replied = live.filter((c) => REPLIED.includes(c.stage));
  const due = live
    .filter((c) => !CLOSED.includes(c.stage) && c.nextFollowUp && c.nextFollowUp <= now)
    .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp));
  const hidden = new Set(marks.filter((m) => !m.deleted && m.status === "not_interested").map((m) => m.id));
  const newJobs = jobs.filter((j) => j.firstSeen >= week && !hidden.has(j.id));
  const topContracts = jobs.filter((j) => j.bucket === "contract" && !hidden.has(j.id)).slice(0, 6);
  const stageCounts = Object.keys(STAGES).map((stage) => ({ stage: stage as Stage, count: live.filter((c) => c.stage === stage).length }));
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.count));

  return (
    <>
      <h1 className={styles.h1}>Overview</h1>
      <p className={styles.sub}>
        {meta ? `Radarul a rulat ${daysAgo(meta.lastRun)} (${new Date(meta.lastRun).toLocaleString("ro-RO")}).` : "Radarul n-a rulat încă."}
      </p>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <strong>{newJobs.length}</strong>
          <span>job-uri noi în ultimele 7 zile</span>
        </div>
        <div className={styles.kpi}>
          <strong>{contacted.length}</strong>
          <span>persoane contactate</span>
        </div>
        <div className={styles.kpi}>
          <strong>{contacted.length ? Math.round((replied.length / contacted.length) * 100) : 0}%</strong>
          <span>rată de răspuns ({replied.length})</span>
        </div>
        <div className={styles.kpi}>
          <strong>{live.filter((c) => c.stage === "call" || c.stage === "interview").length}</strong>
          <span>call-uri și interviuri</span>
        </div>
        <div className={styles.kpi}>
          <strong>{live.filter((c) => c.stage === "offer" || c.stage === "won").length}</strong>
          <span>oferte</span>
        </div>
        <div className={styles.kpi}>
          <strong className={due.length ? styles.overdue : undefined}>{due.length}</strong>
          <span>follow-up-uri de făcut</span>
        </div>
      </div>

      <div className={styles.grid2}>
        <section className={styles.card}>
          <h2>Follow-up azi sau întârziat</h2>
          {due.length ? (
            <ul className={styles.list}>
              {due.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <button type="button" className={styles.btnSmall} onClick={() => onOpenContact(c)}>
                    Deschide
                  </button>{" "}
                  <strong>{c.name}</strong> <span className={styles.muted}>· {c.company}</span>{" "}
                  <span className={c.nextFollowUp < now ? styles.overdue : styles.muted}>· {formatDate(c.nextFollowUp)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>Nimic de făcut azi.</p>
          )}
        </section>

        <section className={styles.card}>
          <h2>Pipeline</h2>
          <ul className={styles.list}>
            {stageCounts.map(({ stage, count }) => (
              <li key={stage} className={styles.funnelRow}>
                <span>{STAGES[stage]}</span>
                <span className={styles.funnelBar} style={{ width: `${(count / maxStage) * 100}%`, opacity: count ? 1 : 0.15 }} />
                <span className={styles.muted}>{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card}>
          <h2>Cele mai bune contracte din radar</h2>
          {topContracts.length ? (
            <ul className={styles.list}>
              {topContracts.map((j) => (
                <li key={j.id}>
                  <span className={styles.score}>{j.score}</span>{" "}
                  <a href={j.url} target="_blank" rel="noopener noreferrer">
                    {j.title}
                  </a>{" "}
                  <span className={styles.muted}>
                    · {j.company} · {j.location} {pay(j) && `· ${pay(j)}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>Niciun contract momentan.</p>
          )}
          <p>
            <button type="button" className={styles.btnSmall} onClick={() => onGo("jobs")}>
              Vezi toate job-urile →
            </button>
          </p>
        </section>

        <section className={styles.card}>
          <h2>Radar și linkuri</h2>
          {meta && (
            <ul className={styles.list}>
              {meta.sources.map((s) => (
                <li key={s.name}>
                  {s.error ? <span className={styles.overdue}>✕</span> : "✓"} {s.name}{" "}
                  <span className={styles.muted}>{s.error ? `· ${s.error.slice(0, 80)}` : `· ${s.jobs} anunțuri`}</span>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.links} style={{ marginTop: 14 }}>
            <button type="button" className={styles.btnSmall} onClick={onRunRadar} disabled={radarState === "running"}>
              {radarState === "running" ? "Pornesc…" : radarState === "started" ? "Pornit, gata în ~1 min" : radarState === "error" ? "Eroare, încearcă iar" : "Rulează radarul acum"}
            </button>
            {LINKS.map(([label, href]) => (
              <a key={href} className={styles.btnSmall} href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </p>
        </section>
      </div>
    </>
  );
}
